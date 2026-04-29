"""
render_mount_tilt_cad.py — Sketchfab-bracket tilt mount with rounded arms:
  * Wall plate (Object_4) + hook bracket (Object_6) + clamps (Object_10) from
    sketchfab_mount_fixed.glb — all STATIONARY, locked to the wall.
  * Round tilt-housings stick forward from Object_6 at each arm's X
    position (the round black piece between bracket and arm).
  * Two heavily-beveled rounded vertical arms (full-motion-mount profile)
    with VESA holes drilled through. Centered Z = housing center, so the
    arm pivots around its own middle.
"""
import bpy, math, os, subprocess, shutil
from mathutils import Vector

HERE     = os.path.dirname(__file__)
PROJECT  = os.path.join(HERE, "..")
MODELS   = os.path.join(HERE, "models")
OUT_DIR  = os.path.join(PROJECT, "public", "assets", "renders")
ANIM_TMP = os.path.join(OUT_DIR, "anim_tilt_cad")
FFMPEG   = "/Library/Frameworks/Python.framework/Versions/3.12/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1"

PLATE_GLB = os.path.join(MODELS, "sketchfab_mount_fixed.glb")

W, H    = 480, 780
FRAMES  = int(os.environ.get("LEVL_FRAMES", "144"))
FPS     = 24
SAMPLES = int(os.environ.get("LEVL_SAMPLES", "96"))


def reset():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for col in [bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras]:
        for b in list(col):
            try: col.remove(b)
            except Exception: pass


def setup_render(frame_dir):
    s = bpy.context.scene
    s.unit_settings.system = 'METRIC'
    s.render.engine = 'CYCLES'
    s.cycles.samples = SAMPLES
    s.cycles.use_denoising = True
    try: s.cycles.denoiser = 'OPENIMAGEDENOISE'
    except Exception: pass
    s.render.resolution_x = W
    s.render.resolution_y = H
    s.render.resolution_percentage = 100
    s.render.film_transparent = True
    s.view_settings.view_transform = 'AgX'
    s.view_settings.look = 'AgX - Medium High Contrast'
    s.frame_start = 1
    s.frame_end = FRAMES
    s.render.fps = FPS
    s.render.image_settings.file_format = 'PNG'
    s.render.image_settings.color_mode = 'RGBA'
    s.render.filepath = os.path.join(frame_dir, "frame_")
    s.cycles.device = 'CPU'
    try:
        cp = bpy.context.preferences.addons['cycles'].preferences
        for d in ('METAL','OPTIX','CUDA'):
            try:
                cp.compute_device_type = d; cp.get_devices()
                s.cycles.device = 'GPU'; break
            except Exception: pass
    except Exception: pass


def setup_world():
    world = bpy.data.worlds.get("World") or bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    bg = nt.nodes.new('ShaderNodeBackground')
    bg.inputs['Color'].default_value = (0.85, 0.80, 0.95, 1.0)
    bg.inputs['Strength'].default_value = 0.35
    out = nt.nodes.new('ShaderNodeOutputWorld')
    nt.links.new(bg.outputs['Background'], out.inputs['Surface'])


def add_camera(fov_deg=42, cam_pos=(2.05, -1.78, 1.10), look_at=(0, 0, 1.00)):
    cd = bpy.data.cameras.new('Camera')
    cd.lens_unit = 'FOV'; cd.angle = math.radians(fov_deg)
    cd.clip_start = 0.01; cd.clip_end = 50.0
    co = bpy.data.objects.new('Camera', cd)
    bpy.context.collection.objects.link(co)
    bpy.context.scene.camera = co
    co.location = Vector(cam_pos)
    co.rotation_euler = (Vector(look_at) - Vector(cam_pos)).to_track_quat('-Z', 'Y').to_euler()


def add_lights():
    for name, loc, energy in [
        ("RakeKey", (-4.5, -1.5, 4.5), 380),
        ("Fill",    ( 4.0, -2.0, 3.0),  80),
        ("Rim",     ( 0.0, -0.8, 6.0),  45),
    ]:
        ld = bpy.data.lights.new(name, type='AREA')
        ld.size = 2.5
        ld.energy = energy
        lo = bpy.data.objects.new(name, ld)
        bpy.context.collection.objects.link(lo)
        lo.location = loc
        lo.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()


def add_shadow_catcher():
    bpy.ops.mesh.primitive_plane_add(size=14, location=(0, 0, 0))
    bpy.context.object.is_shadow_catcher = True


def black_metal_mat():
    mat = bpy.data.materials.new("BlackMetal")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.045, 0.045, 0.05, 1.0)
    if "Metallic"  in bsdf.inputs: bsdf.inputs["Metallic"].default_value  = 0.65
    if "Roughness" in bsdf.inputs: bsdf.inputs["Roughness"].default_value = 0.28
    return mat


def reparent(o, p):
    old = o.matrix_world.copy()
    o.parent = p
    o.matrix_parent_inverse = p.matrix_world.inverted()
    o.matrix_world = old


def make_box(name, location, size, mat, bevel_w=0.003, bevel_segments=2):
    """Beveled cube primitive — heavy bevel makes the box read as a rounded
    rod (full-motion-arm profile)."""
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    o = bpy.context.object; o.name = name; o.scale = size
    bpy.context.view_layer.update()
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bev = o.modifiers.new("Bevel", 'BEVEL')
    bev.width = bevel_w
    bev.segments = bevel_segments
    o.data.materials.clear(); o.data.materials.append(mat)
    return o


def make_cylinder_y(name, location, radius, depth, mat, segments=32, bevel_w=0.003):
    """Cylinder oriented with axis along Y — appears as a circle from the
    front camera (which looks along +Y). Used for the round tilt-housing
    that pokes forward from Object_6."""
    bpy.ops.mesh.primitive_cylinder_add(
        radius=radius, depth=depth, vertices=segments,
        location=location,
        rotation=(math.radians(90), 0, 0),
    )
    o = bpy.context.object; o.name = name
    bpy.context.view_layer.update()
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bev = o.modifiers.new("Bevel", 'BEVEL'); bev.width = bevel_w; bev.segments = 2
    o.data.materials.clear(); o.data.materials.append(mat)
    return o


def _world_bbox(o):
    mins = [float('inf')]*3; maxs = [float('-inf')]*3
    for c in o.bound_box:
        w = o.matrix_world @ Vector(c)
        for i in range(3):
            mins[i] = min(mins[i], w[i]); maxs[i] = max(maxs[i], w[i])
    return mins, maxs


def import_assembly(mat):
    """Import Object_4 (plate), Object_6 (TV-side hook bracket — two rails +
    hooks at top), Object_10 (clamp tabs). Scale ALL three uniformly by the
    same factor (plate target width = 1.20m), then translate as a group so
    plate is centered at X=0/Y=0 with vertical center at Z=1.00. Returns
    (plate, bracket, clamps)."""
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=PLATE_GLB)
    new_objs = [o for o in bpy.context.scene.objects if o not in before]
    plate   = bpy.data.objects.get("Object_4")
    bracket = bpy.data.objects.get("Object_6")
    clamps  = bpy.data.objects.get("Object_10")
    keep = {plate, bracket, clamps}
    for o in new_objs:
        if o not in keep:
            bpy.data.objects.remove(o, do_unlink=True)
    if plate is None or bracket is None:
        return None, None, None
    for o in (plate, bracket, clamps):
        if o is None: continue
        o.data.materials.clear()
        o.data.materials.append(mat)

    # Scale all three by plate-width factor
    bpy.context.view_layer.update()
    pmins, pmaxs = _world_bbox(plate)
    sc = 1.20 / max(pmaxs[0] - pmins[0], 0.001)
    for o in (plate, bracket, clamps):
        if o is None: continue
        o.scale = (sc * o.scale[0], sc * o.scale[1], sc * o.scale[2])
    bpy.context.view_layer.update()

    # Translate group so plate is centered at (0,0) in X/Y and Z-mid = 1.00
    pmins, pmaxs = _world_bbox(plate)
    cx = (pmins[0] + pmaxs[0]) / 2
    cy = (pmins[1] + pmaxs[1]) / 2
    cz = (pmins[2] + pmaxs[2]) / 2
    dx, dy, dz = -cx, -cy, (1.00 - cz)
    for o in (plate, bracket, clamps):
        if o is None: continue
        o.location.x += dx
        o.location.y += dy
        o.location.z += dz
    bpy.context.view_layer.update()
    return plate, bracket, clamps


def _drill_holes(arm, world_x, world_y_ctr, z_bot, z_top, post_d,
                 n_holes=10, hole_radius=0.006):
    """Punch round VESA-style holes down the arm (matches the reference
    photo's hole-pattern slat). Boolean DIFFERENCE on small cylinders
    rotated to point along Y (through the arm's depth), then applied so
    the geometry is baked in for fast rendering."""
    H = z_top - z_bot
    margin_top = 0.025
    margin_bot = 0.020
    span = H - margin_top - margin_bot
    cutters = []
    for i in range(n_holes):
        z = z_bot + margin_bot + i * span / max(n_holes - 1, 1)
        bpy.ops.mesh.primitive_cylinder_add(
            radius=hole_radius,
            depth=post_d * 4,    # well past the arm depth
            vertices=14,
            location=(world_x, world_y_ctr, z),
            rotation=(math.radians(90), 0, 0),
        )
        cutter = bpy.context.object
        cutter.name = f"_hole_cut_{i}"
        cutters.append(cutter)

    for i, cutter in enumerate(cutters):
        m = arm.modifiers.new(f"hole_{i}", 'BOOLEAN')
        m.operation = 'DIFFERENCE'
        m.object = cutter

    bpy.ops.object.select_all(action='DESELECT')
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    for mod in list(arm.modifiers):
        if mod.type == 'BOOLEAN':
            bpy.ops.object.modifier_apply(modifier=mod.name)

    for cutter in cutters:
        bpy.data.objects.remove(cutter, do_unlink=True)


def build_housings(mat, bracket_y_front, bracket_z_ctr, post_dx, depth):
    """Round tilt-housings — STATIONARY cylinders (axis along Y) that poke
    forward from Object_6's front face at each arm's X position. From the
    front camera they read as filled circles. The arm pivots on the
    housing's front face center (where the pivot pin would be). Returns
    (housings, pivot_y) where pivot_y is the front face of the housings."""
    HOUSING_R = 0.058               # ~12 cm diameter housing
    h_y_back  = bracket_y_front
    h_y_front = bracket_y_front - depth
    h_y_ctr   = (h_y_back + h_y_front) / 2
    housings = []
    for sx in (-post_dx, +post_dx):
        h = make_cylinder_y(f"housing_{'L' if sx < 0 else 'R'}",
                            (sx, h_y_ctr, bracket_z_ctr),
                            HOUSING_R, depth, mat, segments=40, bevel_w=0.003)
        housings.append(h)
    return housings, h_y_front


def build_arms(tilt, mat, pivot_y, bracket_z_ctr, post_dx):
    """Two heavily-beveled rounded vertical arms (full-motion-mount profile)
    with VESA holes. CENTERED on bracket_z_ctr so the arm pivots around
    its own middle = the housing's middle. Sits entirely in front of
    everything (no clipping)."""
    POST_T       = 0.052          # arm width (X)
    POST_D       = 0.038          # arm depth (Y) — thicker for rod-like profile
    H            = 0.85           # total arm height — symmetric around center
    BEVEL        = 0.014          # heavy bevel → rounded rod look

    Z_CTR     = bracket_z_ctr     # center of arm = center of housing
    arm_z_top = Z_CTR + H / 2
    arm_z_bot = Z_CTR - H / 2
    Y_CTR     = pivot_y - POST_D / 2

    posts = []
    for sx in (-post_dx, +post_dx):
        p = make_box(f"arm_{'L' if sx < 0 else 'R'}",
                     (sx, Y_CTR, Z_CTR),
                     (POST_T, POST_D, H), mat,
                     bevel_w=BEVEL, bevel_segments=5)
        _drill_holes(p, sx, Y_CTR, arm_z_bot, arm_z_top, POST_D)
        reparent(p, tilt)
        posts.append(p)

    return Y_CTR, posts


def build_tilt_mount():
    mat = black_metal_mat()
    plate, bracket, clamps = import_assembly(mat)
    if plate is None or bracket is None:
        return None, plate

    # Plate + Object_6 + Object_10 are STATIONARY (locked to wall).
    bpy.context.view_layer.update()
    bmins, bmaxs = _world_bbox(bracket)

    bracket_y_front = bmins[1]                  # front face of Object_6
    bracket_z_top   = bmaxs[2]
    bracket_z_bot   = bmins[2]
    bracket_z_ctr   = (bracket_z_top + bracket_z_bot) / 2
    # Vertical-arm X centers mirror Object_6's two-rail positions
    post_dx = (bmaxs[0] - bmins[0]) * 0.44

    # Stationary round tilt-housings sticking forward from Object_6 at the
    # MIDDLE of the assembly. Arms pivot on the housing front face.
    HOUSING_DEPTH = 0.045
    _housings, pivot_y = build_housings(
        mat, bracket_y_front, bracket_z_ctr, post_dx, HOUSING_DEPTH)

    # TiltPivot at the MIDDLE Z (housing center) and forward at the housing
    # front face — the real-world pivot pin location.
    bpy.ops.object.empty_add(type='PLAIN_AXES',
        location=(0, pivot_y, bracket_z_ctr))
    tilt = bpy.context.object
    tilt.name = "TiltPivot"

    build_arms(
        tilt, mat,
        pivot_y=pivot_y,
        bracket_z_ctr=bracket_z_ctr,
        post_dx=post_dx,
    )
    return tilt, plate


def keyframe_tilt(tilt):
    """Arms rock ±8° around X at the middle detent pivot — top swings back
    toward the wall, bottom swings out forward (real tilt-mount motion).
    Cord physics is handled by the cloth solver — no string keyframes."""
    AMP = math.radians(8)
    for f in range(1, FRAMES + 1):
        t = (f - 1) / FRAMES
        tilt.rotation_euler[0] = AMP * math.sin(2 * math.pi * t)
        tilt.keyframe_insert("rotation_euler", index=0, frame=f)


def main():
    if os.path.exists(ANIM_TMP): shutil.rmtree(ANIM_TMP)
    os.makedirs(ANIM_TMP, exist_ok=True)

    reset()
    setup_render(ANIM_TMP)
    setup_world()
    add_camera()
    add_lights()
    add_shadow_catcher()
    tilt, plate = build_tilt_mount()
    if tilt is None:
        print("[ERR] assembly import failed"); return
    keyframe_tilt(tilt)

    bpy.ops.render.render(animation=True)

    out_webm = os.path.join(OUT_DIR, "mount-tilting.webm")
    if os.path.exists(out_webm): os.remove(out_webm)
    cmd = [FFMPEG, "-y", "-framerate", str(FPS),
           "-i", os.path.join(ANIM_TMP, "frame_%04d.png"),
           "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p",
           "-b:v", "0", "-crf", "32", "-an", out_webm]
    subprocess.run(cmd, check=True)
    print(f"DONE -> {out_webm}")
    shutil.rmtree(ANIM_TMP, ignore_errors=True)


if __name__ == "__main__":
    main()
