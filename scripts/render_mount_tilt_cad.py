"""
render_mount_tilt_cad.py — Sketchfab-bracket tilt mount with cloth-sim strings:
  * Wall plate from Sketchfab fixed-mount GLB (Object_4)
  * TV-side bracket = Object_6 (real two-rail hook bracket from same GLB) +
    Object_10 (the clamp tabs). These tilt as one rigid assembly.
  * Tilt pivot at PLATE TOP front edge — where the hooks engage. When the
    bracket tilts forward, top stays anchored at hook line, bottom swings out.
  * Pull strings hang from each rail bottom — REAL Blender cloth simulation
    (pinned top, free bottom, gravity + air damping). Bake before render.
"""
import bpy, bmesh, math, os, subprocess, shutil
from mathutils import Vector, Matrix

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


def add_camera(fov_deg=42, cam_pos=(2.40, -2.10, 1.15), look_at=(0, 0, 1.00)):
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


def make_cloth_string(name, world_top, mat, length=0.30, radius=0.012,
                      segments=24, sides=10):
    """Subdivided cylinder mesh with Cloth modifier. Top ring is in 'Pin'
    vertex group with weight 1.0 → the cloth solver clamps those verts to
    their object-local origin position. Object is parented to anchor empty,
    so when the anchor moves with the rail, the pinned top moves in WORLD,
    and gravity + bending make the rest swing physically."""
    mesh = bpy.data.meshes.new(name + "_mesh")
    obj  = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    bm = bmesh.new()
    rings = []
    for i in range(segments + 1):
        z = -i * (length / segments)         # local: top at z=0
        ring = []
        for j in range(sides):
            ang = 2 * math.pi * j / sides
            ring.append(bm.verts.new((radius * math.cos(ang),
                                      radius * math.sin(ang), z)))
        rings.append(ring)
    bm.verts.ensure_lookup_table()
    for i in range(segments):
        for j in range(sides):
            j2 = (j + 1) % sides
            bm.faces.new([rings[i][j], rings[i][j2],
                          rings[i+1][j2], rings[i+1][j]])
    bm.faces.new(rings[0])                       # top cap
    bm.faces.new(list(reversed(rings[segments]))) # bottom cap
    bm.to_mesh(mesh); bm.free()
    obj.data.materials.append(mat)

    # Place object so its origin (z=0 local) sits at world_top — set the
    # matrix directly so the world transform is committed *before* reparent
    # reads matrix_world.
    obj.matrix_world = Matrix.Translation(Vector(world_top))
    bpy.context.view_layer.update()

    # Pin group — top ring (vertices with z >= -1e-4)
    vg = obj.vertex_groups.new(name="Pin")
    top_idxs = [v.index for v in obj.data.vertices if v.co.z > -1e-4]
    vg.add(top_idxs, 1.0, 'REPLACE')

    cloth = obj.modifiers.new("Cloth", 'CLOTH')
    cs = cloth.settings
    cs.vertex_group_mass     = "Pin"
    cs.pin_stiffness         = 1.0
    cs.mass                  = 0.012          # 12g per cord — light pull cord
    cs.tension_stiffness     = 35             # rigid in length
    cs.compression_stiffness = 35
    cs.shear_stiffness       = 35
    cs.bending_stiffness     = 0.04           # very floppy → swings
    cs.bending_damping       = 0.4
    cs.air_damping           = 1.8            # natural settle
    cs.tension_damping       = 5
    cs.compression_damping   = 5
    cs.shear_damping         = 5
    cloth.collision_settings.use_collision      = False
    cloth.collision_settings.use_self_collision = False
    return obj


def build_tilt_mount():
    mat = black_metal_mat()
    plate, bracket, clamps = import_assembly(mat)
    if plate is None or bracket is None:
        return None, [], None

    bpy.context.view_layer.update()
    pmins, pmaxs = _world_bbox(plate)
    bmins, bmaxs = _world_bbox(bracket)

    plate_y_front = pmins[1]                    # front face of plate
    plate_z_top   = pmaxs[2]                    # top edge of plate
    bracket_z_bot = bmins[2]                    # bottom of bracket (string anchor)
    bracket_y_ctr = (bmins[1] + bmaxs[1]) / 2

    # Per-side rail X centers — Object_6 has two clusters at native ±0.15;
    # after the assembly's uniform scale these land at the bracket's outer
    # peaks. Pull strings hang from each rail bottom.
    rail_dx = (bmaxs[0] - bmins[0]) * 0.44      # approx ±44% of bracket width
    rail_xs = (-rail_dx, +rail_dx)

    # Single TiltPivot empty at plate top FRONT edge — where Object_6's
    # hooks engage the plate. The whole TV-side bracket rocks on this line.
    bpy.ops.object.empty_add(type='PLAIN_AXES',
        location=(0, plate_y_front, plate_z_top))
    tilt = bpy.context.object
    tilt.name = "TiltPivot"

    reparent(bracket, tilt)
    if clamps is not None:
        reparent(clamps, tilt)

    # String anchors + cloth strings — anchors parented to TiltPivot so
    # their world position follows the bracket bottom as it tilts; cloth
    # solver sees the moving pinned-top and lets the rest swing freely.
    strings = []
    for side, rail_x in zip(("L", "R"), rail_xs):
        anchor_pos = (rail_x, bracket_y_ctr, bracket_z_bot)
        bpy.ops.object.empty_add(type='PLAIN_AXES', location=anchor_pos)
        anchor = bpy.context.object
        anchor.name = f"StringAnchor_{side}"
        reparent(anchor, tilt)
        cord = make_cloth_string(f"PullString_{side}", anchor_pos, mat)
        reparent(cord, anchor)
        strings.append({"anchor": anchor, "cord": cord})

    return tilt, strings, plate


def keyframe_tilt(tilt):
    """Single TiltPivot rocks ±14° around X. Bracket top stays anchored at
    plate top edge (the hook line); bottom swings forward then back. The
    cord physics is handled by the cloth solver — no keyframes needed."""
    AMP = math.radians(14)
    for f in range(1, FRAMES + 1):
        t = (f - 1) / FRAMES
        tilt.rotation_euler[0] = AMP * math.sin(2 * math.pi * t)
        tilt.keyframe_insert("rotation_euler", index=0, frame=f)


def bake_cloth():
    """Set cloth point-cache range = scene range, then bake all caches."""
    s = bpy.context.scene
    for obj in bpy.data.objects:
        for mod in obj.modifiers:
            if mod.type == 'CLOTH':
                pc = mod.point_cache
                pc.frame_start = s.frame_start
                pc.frame_end   = s.frame_end
    s.frame_set(s.frame_start)
    bpy.ops.ptcache.bake_all(bake=True)


def main():
    if os.path.exists(ANIM_TMP): shutil.rmtree(ANIM_TMP)
    os.makedirs(ANIM_TMP, exist_ok=True)

    reset()
    setup_render(ANIM_TMP)
    setup_world()
    add_camera()
    add_lights()
    add_shadow_catcher()
    tilt, strings, plate = build_tilt_mount()
    if tilt is None:
        print("[ERR] assembly import failed"); return
    keyframe_tilt(tilt)
    bake_cloth()

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
