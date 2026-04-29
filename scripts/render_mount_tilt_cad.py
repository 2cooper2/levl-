"""
render_mount_tilt_cad.py — CAD tilt mount with proper mechanics:
  * Wall plate from Sketchfab fixed-mount GLB (Object_4 — has bolt slots)
  * Per side: CAD rail + hook (top) + pivot bolt (middle) + pull string (bottom)
  * Tilt pivot at MID-RAIL (where bolt connects rail to plate) — when rail
    tilts forward, top swings BACK toward wall, bottom swings FORWARD.
    Matches real tilt-mount physics.
  * Two pivots per side (both at mid-rail, one per side) animate synchronously.
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


def import_wall_plate(mat):
    """Import sketchfab_mount_fixed.glb, keep only Object_4 (the wall plate
    with bolt slots), apply BlackMetal, scale to ~1.2m wide, center at origin."""
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=PLATE_GLB)
    new_objs = [o for o in bpy.context.scene.objects if o not in before]
    plate = bpy.data.objects.get("Object_4")
    for o in new_objs:
        if o is plate: continue
        bpy.data.objects.remove(o, do_unlink=True)
    if not plate: return None
    plate.data.materials.clear()
    plate.data.materials.append(mat)

    # Scale to target width (1.2m) and center at origin
    bpy.context.view_layer.update()
    mins = [float('inf')]*3; maxs = [float('-inf')]*3
    for c in plate.bound_box:
        w = plate.matrix_world @ Vector(c)
        for i in range(3):
            mins[i] = min(mins[i], w[i]); maxs[i] = max(maxs[i], w[i])
    width = maxs[0] - mins[0]
    sc = 1.20 / max(width, 0.001)
    plate.scale = (sc, sc, sc)
    bpy.context.view_layer.update()
    mins2 = [float('inf')]*3; maxs2 = [float('-inf')]*3
    for c in plate.bound_box:
        w = plate.matrix_world @ Vector(c)
        for i in range(3):
            mins2[i] = min(mins2[i], w[i]); maxs2[i] = max(maxs2[i], w[i])
    cx = (mins2[0] + maxs2[0]) / 2
    cy = (mins2[1] + maxs2[1]) / 2
    cz = (mins2[2] + maxs2[2]) / 2
    plate.location.x -= cx
    plate.location.y -= cy
    plate.location.z += (1.00 - cz)   # center vertically at Z=1.00
    bpy.context.view_layer.update()
    return plate


def build_tilt_mount():
    mat = black_metal_mat()
    plate = import_wall_plate(mat)
    if plate is None:
        return [], None

    # Get plate world bbox after positioning
    bpy.context.view_layer.update()
    pmins = [float('inf')]*3; pmaxs = [float('-inf')]*3
    for c in plate.bound_box:
        w = plate.matrix_world @ Vector(c)
        for i in range(3):
            pmins[i] = min(pmins[i], w[i]); pmaxs[i] = max(pmaxs[i], w[i])
    plate_y_min, plate_y_max = pmins[1], pmaxs[1]
    plate_z_top = pmaxs[2]
    plate_z_bot = pmins[2]
    plate_z_ctr = (plate_z_top + plate_z_bot) / 2
    plate_h = plate_z_top - plate_z_bot

    # Rail dimensions
    RAIL_W   = 0.07
    RAIL_T   = 0.04
    RAIL_EXT = 0.18           # how far rail extends above/below plate
    GAP      = 0.04
    RAIL_X   = 0.42

    rail_y_ctr = plate_y_min - GAP - RAIL_T / 2
    rail_z_top = plate_z_top + RAIL_EXT
    rail_z_bot = plate_z_bot - RAIL_EXT
    rail_z_ctr = (rail_z_top + rail_z_bot) / 2
    rail_h     = rail_z_top - rail_z_bot
    pivot_z    = plate_z_ctr               # tilt pivot at MID-rail/plate-mid

    pivots = []
    for side, sign in (("L", -1), ("R", +1)):
        rail_x = sign * RAIL_X

        # ── Rail ──────────────────────────────────────────────
        rail = make_box(f"Rail_{side}",
            (rail_x, rail_y_ctr, rail_z_ctr),
            (RAIL_W, RAIL_T, rail_h), mat)

        # ── L-shape hook: horizontal over plate top + vertical down back side ──
        hook_h_y_start = rail_y_ctr + RAIL_T/2
        hook_h_y_end   = plate_y_max + 0.04
        hook_h = make_box(f"HookH_{side}",
            (rail_x, (hook_h_y_start + hook_h_y_end)/2,
             rail_z_top - 0.025),
            (RAIL_W * 1.10, hook_h_y_end - hook_h_y_start, 0.045), mat)
        hook_v = make_box(f"HookV_{side}",
            (rail_x, plate_y_max + 0.02,
             rail_z_top - 0.025 - 0.04),     # drops down 8cm on plate's far side
            (RAIL_W * 1.10, 0.04, 0.08), mat)

        # ── Pivot bolt at MID — visible knuckle bridging rail and plate ──
        bolt_y_start = rail_y_ctr + RAIL_T/2
        bolt_y_end   = plate_y_min - 0.005
        bolt = make_box(f"PivotBolt_{side}",
            (rail_x, (bolt_y_start + bolt_y_end)/2, pivot_z),
            (0.045, bolt_y_end - bolt_y_start, 0.045), mat)
        bolt_head = make_cylinder(f"BoltHead_{side}",
            (rail_x, rail_y_ctr - RAIL_T/2 - 0.012, pivot_z),
            radius=0.022, depth=0.025, mat=mat, axis='Y')

        # ── String anchor (empty at rail bottom — parented to TiltPivot) ──
        bpy.ops.object.empty_add(type='PLAIN_AXES',
            location=(rail_x, rail_y_ctr, rail_z_bot))
        anchor = bpy.context.object
        anchor.name = f"StringAnchor_{side}"

        # ── Pull string + tag — parented to ANCHOR, hang from rail bottom ──
        pull = make_cylinder(f"PullString_{side}",
            (rail_x, rail_y_ctr, rail_z_bot - 0.10),    # top at rail bottom (no gap)
            radius=0.0035, depth=0.20, mat=mat, axis='Z')
        tag = make_box(f"PullTag_{side}",
            (rail_x, rail_y_ctr, rail_z_bot - 0.225),
            (0.025, 0.012, 0.022), mat)

        # ── TiltPivot at MID-rail ──
        bpy.ops.object.empty_add(type='PLAIN_AXES',
            location=(rail_x, plate_y_min, pivot_z))
        tilt = bpy.context.object
        tilt.name = f"TiltPivot_{side}"

        # Rail + hooks + bolt rigidly tilt with TiltPivot
        for o in [rail, hook_h, hook_v, bolt, bolt_head]:
            reparent(o, tilt)
        # Anchor follows TiltPivot (so its position tracks rail bottom),
        # but its rotation is keyframed independently for pendulum sway
        reparent(anchor, tilt)
        # String + tag parented to ANCHOR — they swing with anchor's rotation
        reparent(pull, anchor)
        reparent(tag, anchor)

        pivots.append({"tilt": tilt, "anchor": anchor})

    return pivots, plate


def keyframe_tilt(pivots):
    """TiltPivots rotate ±15° around X (top swings back, bottom swings forward).
    String anchors get a SEPARATE keyframed rotation that lags the rail tilt
    and uses smaller amplitude — simulates pendulum-like swing/inertia."""
    AMP_RAIL  = math.radians(15)
    AMP_STR   = math.radians(8)        # string sways less than rail
    PHASE_LAG = 0.08                   # ~8% cycle lag (~12 frames)
    for f in range(1, FRAMES + 1):
        t = (f - 1) / FRAMES
        bpy.context.scene.frame_set(f)
        rail_angle = AMP_RAIL * math.sin(2 * math.pi * t)
        # Desired string WORLD angle (lagged sine, smaller amplitude)
        str_world_angle = AMP_STR * math.sin(2 * math.pi * (t - PHASE_LAG))
        # Anchor LOCAL angle = world target − parent (TiltPivot) angle,
        # so the anchor's resulting world rotation = string sway angle.
        anchor_local_angle = str_world_angle - rail_angle
        for p in pivots:
            p["tilt"].rotation_euler[0] = rail_angle
            p["tilt"].keyframe_insert("rotation_euler", index=0, frame=f)
            p["anchor"].rotation_euler[0] = anchor_local_angle
            p["anchor"].keyframe_insert("rotation_euler", index=0, frame=f)


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
