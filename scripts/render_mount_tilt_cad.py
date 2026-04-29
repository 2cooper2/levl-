"""
render_mount_tilt_cad.py — fully procedural CAD tilt mount, modeled after
build_clean_mount() in render_mount_zeel.py.

Per side (LEFT, RIGHT) — all parts rigidly grouped under TiltPivot_{side}:
  * Vertical rail (tall rectangular bar)
  * Hook (horizontal slab at top extending over plate top edge)
  * Knobs (3 small cylindrical pins on rail face)
  * Pull string (thin cylinder hanging below rail)
Both TiltPivots rotate the SAME angle around X axis — synchronized symmetric
tilt motion, all parts of each side move together as one rigid assembly.
Wall plate is static.
"""
import bpy, math, os, subprocess, shutil
from mathutils import Vector

HERE     = os.path.dirname(__file__)
PROJECT  = os.path.join(HERE, "..")
OUT_DIR  = os.path.join(PROJECT, "public", "assets", "renders")
ANIM_TMP = os.path.join(OUT_DIR, "anim_tilt_cad")
FFMPEG   = "/Library/Frameworks/Python.framework/Versions/3.12/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1"

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


def make_box(name, location, scale, mat, bevel_w=0.005):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    o = bpy.context.object; o.name = name; o.scale = scale
    bpy.context.view_layer.update()
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bev = o.modifiers.new("Bevel", 'BEVEL'); bev.width = bevel_w; bev.segments = 2
    if mat:
        o.data.materials.clear(); o.data.materials.append(mat)
    return o


def make_cylinder(name, location, radius, depth, mat, axis='Z'):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, location=location)
    o = bpy.context.object; o.name = name
    if axis == 'X':
        o.rotation_euler[1] = math.radians(90)
    elif axis == 'Y':
        o.rotation_euler[0] = math.radians(90)
    bpy.context.view_layer.update()
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bev = o.modifiers.new("Bevel", 'BEVEL'); bev.width = 0.002; bev.segments = 2
    if mat:
        o.data.materials.clear(); o.data.materials.append(mat)
    return o


def reparent(o, p):
    old = o.matrix_world.copy()
    o.parent = p
    o.matrix_parent_inverse = p.matrix_world.inverted()
    o.matrix_world = old


def build_tilt_mount():
    """CAD tilt mount, modeled on build_clean_mount() pattern. Returns list
    of TiltPivot empties (one per side) for keyframing."""
    mat = black_metal_mat()

    # ── Dimensions (meters) ─────────────────────────────────────
    PLATE_W, PLATE_H, PLATE_T = 1.20, 0.55, 0.045
    RAIL_W, RAIL_H, RAIL_T   = 0.07, 0.70, 0.045
    HOOK_T                   = 0.045
    GAP                      = 0.05    # rail-to-plate Y gap
    RAIL_X                   = 0.40    # rail X offset from center
    Z_BASE                   = 1.00    # plate center Z

    plate_y_min = -PLATE_T / 2
    plate_y_max = +PLATE_T / 2
    plate_z_top = Z_BASE + PLATE_H / 2

    # ── Wall plate (static) ─────────────────────────────────────
    plate = make_box("WallPlate",
        (0, 0, Z_BASE), (PLATE_W, PLATE_T, PLATE_H), mat)

    pivots = []
    for side, sign in (("L", -1), ("R", +1)):
        rail_x = sign * RAIL_X
        rail_y = plate_y_min - GAP - RAIL_T / 2          # rail center Y
        rail_z_top = plate_z_top + 0.05                   # extends slightly above plate top
        rail_z_bot = rail_z_top - RAIL_H
        rail_z_center = (rail_z_top + rail_z_bot) / 2

        # Rail
        rail = make_box(f"Rail_{side}",
            (rail_x, rail_y, rail_z_center),
            (RAIL_W, RAIL_T, RAIL_H), mat)

        # Hook: horizontal slab at top of rail extending backward over plate top
        hook_y_start = rail_y + RAIL_T / 2                # rail's back face
        hook_y_end   = plate_y_max + 0.04                 # 4cm past plate's far face
        hook_y_len   = hook_y_end - hook_y_start
        hook_y_ctr   = (hook_y_start + hook_y_end) / 2
        hook_z_ctr   = rail_z_top + HOOK_T / 2 + 0.003
        hook = make_box(f"Hook_{side}",
            (rail_x, hook_y_ctr, hook_z_ctr),
            (RAIL_W * 1.15, hook_y_len, HOOK_T), mat)

        # Knobs: 3 small cylindrical pins on rail front face (visible adjustment knobs)
        knobs = []
        knob_y = rail_y - RAIL_T / 2 - 0.015              # slightly in front of rail
        for i, dz in enumerate([+0.20, +0.05, -0.10]):
            kn = make_cylinder(f"Knob_{side}_{i}",
                (rail_x, knob_y, rail_z_center + dz),
                radius=0.014, depth=0.04, mat=mat, axis='Y')
            knobs.append(kn)

        # Pull string: thin cylinder hanging below rail bottom
        pull_z_ctr = rail_z_bot - 0.12
        pull = make_cylinder(f"PullString_{side}",
            (rail_x, rail_y, pull_z_ctr),
            radius=0.0035, depth=0.20, mat=mat, axis='Z')

        # Pull tag (small block at end of string)
        tag = make_box(f"PullTag_{side}",
            (rail_x, rail_y, pull_z_ctr - 0.10 - 0.012),
            (0.025, 0.012, 0.024), mat)

        # TiltPivot at top of hook (where hook contacts plate top edge)
        pivot_y = plate_y_min                              # plate's near face
        pivot_z = plate_z_top                              # plate top edge
        bpy.ops.object.empty_add(type='PLAIN_AXES',
            location=(rail_x, pivot_y, pivot_z))
        tilt = bpy.context.object
        tilt.name = f"TiltPivot_{side}"

        # Parent ALL side parts rigidly to TiltPivot
        for o in [rail, hook] + knobs + [pull, tag]:
            reparent(o, tilt)

        pivots.append(tilt)

    return pivots, plate


def keyframe_tilt(pivots):
    """Both pivots rotate the SAME angle synchronously — symmetric tilt motion.
    Sine wave ±15° around X axis."""
    amp = math.radians(15)
    for f in range(1, FRAMES + 1):
        t = (f - 1) / FRAMES
        bpy.context.scene.frame_set(f)
        angle = math.sin(t * 2 * math.pi) * amp
        for p in pivots:
            p.rotation_euler[0] = angle
            p.keyframe_insert("rotation_euler", index=0, frame=f)


def main():
    if os.path.exists(ANIM_TMP): shutil.rmtree(ANIM_TMP)
    os.makedirs(ANIM_TMP, exist_ok=True)

    reset()
    setup_render(ANIM_TMP)
    setup_world()
    add_camera()
    add_lights()
    add_shadow_catcher()
    pivots, plate = build_tilt_mount()
    keyframe_tilt(pivots)

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
