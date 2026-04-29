"""
render_mount_tilt_cad.py — CAD tilt mount with TWO INDEPENDENT pivots per
side, mirroring build_clean_mount() / keyframe_swivel() in render_mount_zeel.py.

Per side:
  TopPivot  (analog of WallPiv) — rotates around X at plate's top edge
    ├── HookKnuckle (visible cylinder pin)
    ├── Hook (slab)
    ├── UpperRail (top half of rail)
    └── KneePivot  (analog of ElbowPiv, child of TopPivot)
        ├── KneeKnuckle
        ├── LowerRail (bottom half of rail)
        ├── Knobs (3 cylindrical pins)
        ├── PullString (thin cylinder)
        └── PullTag

Each pivot has its OWN keyframed rotation_euler[0] (X axis tilt).
Animation:
  θ_top  = AMP_TOP  * sin(2π * t)             — main tilt
  θ_knee = AMP_KNEE * sin(2π * t + π/3)       — slight phase-shifted flex
Both pivots animate independently; downstream parts inherit naturally.

Wall plate is fully static. Both sides synchronized.
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
    """Two-pivot articulating tilt mount per side (TopPivot + KneePivot).
    Mirrors build_clean_mount() architecture."""
    mat = black_metal_mat()

    PLATE_W, PLATE_H, PLATE_T = 1.20, 0.55, 0.045
    RAIL_W, RAIL_T            = 0.07, 0.045
    UPPER_H                   = 0.30   # upper rail height
    LOWER_H                   = 0.35   # lower rail height
    HOOK_T                    = 0.045
    GAP                       = 0.05
    RAIL_X                    = 0.40
    Z_BASE                    = 1.00

    plate_y_min = -PLATE_T / 2
    plate_y_max = +PLATE_T / 2
    plate_z_top = Z_BASE + PLATE_H / 2

    # Wall plate (static)
    plate = make_box("WallPlate",
        (0, 0, Z_BASE), (PLATE_W, PLATE_T, PLATE_H), mat)

    pivots = {}
    for side, sign in (("L", -1), ("R", +1)):
        rail_x = sign * RAIL_X
        rail_y_ctr = plate_y_min - GAP - RAIL_T / 2

        # Heights
        upper_z_top = plate_z_top + 0.05
        upper_z_bot = upper_z_top - UPPER_H
        upper_z_ctr = (upper_z_top + upper_z_bot) / 2
        lower_z_top = upper_z_bot
        lower_z_bot = lower_z_top - LOWER_H
        lower_z_ctr = (lower_z_top + lower_z_bot) / 2

        # ── TopPivot at plate's top-near edge ────────────────────
        bpy.ops.object.empty_add(type='PLAIN_AXES',
            location=(rail_x, plate_y_min, plate_z_top))
        top_piv = bpy.context.object; top_piv.name = f"TopPiv_{side}"

        # Hook (slab over plate top, parented to TopPivot)
        hook_y_start = rail_y_ctr + RAIL_T/2
        hook_y_end   = plate_y_max + 0.04
        hook_y_len   = hook_y_end - hook_y_start
        hook = make_box(f"Hook_{side}",
            (rail_x, (hook_y_start+hook_y_end)/2,
             upper_z_top + HOOK_T/2 + 0.003),
            (RAIL_W * 1.15, hook_y_len, HOOK_T), mat)
        reparent(hook, top_piv)

        # Hook knuckle (visible pin at TopPivot)
        hook_kn = make_cylinder(f"HookKnuckle_{side}",
            (rail_x, plate_y_min, plate_z_top),
            radius=0.018, depth=RAIL_W + 0.04, mat=mat, axis='X')
        reparent(hook_kn, top_piv)

        # Upper rail (parented to TopPivot)
        upper = make_box(f"UpperRail_{side}",
            (rail_x, rail_y_ctr, upper_z_ctr),
            (RAIL_W, RAIL_T, UPPER_H), mat)
        reparent(upper, top_piv)

        # ── KneePivot at upper-rail bottom (child of TopPivot) ───
        bpy.ops.object.empty_add(type='PLAIN_AXES',
            location=(rail_x, rail_y_ctr, upper_z_bot))
        knee_piv = bpy.context.object; knee_piv.name = f"KneePiv_{side}"
        reparent(knee_piv, top_piv)

        # Knee knuckle (visible)
        knee_kn = make_cylinder(f"KneeKnuckle_{side}",
            (rail_x, rail_y_ctr, upper_z_bot),
            radius=0.014, depth=RAIL_W + 0.025, mat=mat, axis='X')
        reparent(knee_kn, knee_piv)

        # Lower rail (parented to KneePivot)
        lower = make_box(f"LowerRail_{side}",
            (rail_x, rail_y_ctr, lower_z_ctr),
            (RAIL_W, RAIL_T, LOWER_H), mat)
        reparent(lower, knee_piv)

        # Knobs (3) on lower rail, parented to KneePivot
        knob_y = rail_y_ctr - RAIL_T/2 - 0.015
        for i, dz in enumerate([+0.10, +0.00, -0.10]):
            kn = make_cylinder(f"Knob_{side}_{i}",
                (rail_x, knob_y, lower_z_ctr + dz),
                radius=0.014, depth=0.04, mat=mat, axis='Y')
            reparent(kn, knee_piv)

        # Pull string + tag, parented to KneePivot
        pull = make_cylinder(f"PullString_{side}",
            (rail_x, rail_y_ctr, lower_z_bot - 0.12),
            radius=0.0035, depth=0.20, mat=mat, axis='Z')
        reparent(pull, knee_piv)
        tag = make_box(f"PullTag_{side}",
            (rail_x, rail_y_ctr, lower_z_bot - 0.245),
            (0.025, 0.012, 0.022), mat)
        reparent(tag, knee_piv)

        pivots[side] = {"top": top_piv, "knee": knee_piv}

    return pivots, plate


def keyframe_tilt(pivots):
    """TopPivot does the main tilt; KneePivot adds a phase-shifted flex —
    independent rotations create articulation across the rail length."""
    AMP_TOP  = math.radians(15)
    AMP_KNEE = math.radians(4)
    for f in range(1, FRAMES + 1):
        t = (f - 1) / FRAMES
        bpy.context.scene.frame_set(f)
        theta_top  = AMP_TOP  * math.sin(2 * math.pi * t)
        theta_knee = AMP_KNEE * math.sin(2 * math.pi * t + math.pi / 3)
        for side, p in pivots.items():
            p["top"].rotation_euler[0] = theta_top
            p["top"].keyframe_insert("rotation_euler", index=0, frame=f)
            p["knee"].rotation_euler[0] = theta_knee
            p["knee"].keyframe_insert("rotation_euler", index=0, frame=f)


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
