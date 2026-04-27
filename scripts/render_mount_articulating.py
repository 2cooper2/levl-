"""
render_mount_articulating.py — TRUE articulating mount animations rendered
through the wall-types AgX rig (same look as the static mount-fixed.webp /
mount-tilting.webp etc.).

Each mount is built procedurally with a RIGGED HIERARCHY:
  - Empties at every joint (hinge / shoulder / elbow / wrist)
  - Mesh parts parented under those empties
  - Animation = keyframe the empty rotation_euler — bones move parts.

Materials = matte-black powder-coat (PBR Principled BSDF, metallic 0.6,
roughness 0.42) with bevels — same as _build_procedural_mounts.py.
Lights / camera / tone-map = wall-types rig (3-point area + AgX
Medium-High-Contrast + lavender world + film_transparent).

Output: public/assets/renders/mount-tilting.webm + mount-fullmotion.webm
"""
import bpy, math, os, sys, subprocess, shutil
from mathutils import Vector

HERE     = os.path.dirname(__file__)
PROJECT  = os.path.join(HERE, "..")
OUT_DIR  = os.path.join(PROJECT, "public", "assets", "renders")
ANIM_TMP = os.path.join(OUT_DIR, "anim_articulating")

FFMPEG = "/Library/Frameworks/Python.framework/Versions/3.12/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1"

W_RENDER, H_RENDER = 480, 620
FRAMES  = int(os.environ.get("LEVL_FRAMES",  "48"))
FPS     = 24
SAMPLES = int(os.environ.get("LEVL_SAMPLES", "96"))


# ── Material ──────────────────────────────────────────────────────────────────
def black_metal_mat():
    mat = bpy.data.materials.new("BlackMetal")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.045, 0.045, 0.05, 1.0)
    if "Metallic"  in bsdf.inputs: bsdf.inputs["Metallic"].default_value  = 0.6
    if "Roughness" in bsdf.inputs: bsdf.inputs["Roughness"].default_value = 0.42
    return mat


# ── Wall-types rig (matches static-mount renders) ─────────────────────────────
def reset():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for col in [bpy.data.meshes, bpy.data.materials, bpy.data.lights,
                bpy.data.cameras, bpy.data.images]:
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
    s.render.resolution_x = W_RENDER
    s.render.resolution_y = H_RENDER
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
    # GPU
    s.cycles.device = 'CPU'
    try:
        cp = bpy.context.preferences.addons['cycles'].preferences
        for d in ('METAL','OPTIX','CUDA'):
            try:
                cp.compute_device_type = d
                cp.get_devices()
                s.cycles.device = 'GPU'
                break
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


def add_camera(fov_deg=60, cam_pos=(2.60, -4.50, 0.97), look_at=(0, 0, 0.28)):
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
    p = bpy.context.object
    p.is_shadow_catcher = True


# ── Geometry helpers (parented + bevelled) ────────────────────────────────────
def add_box(name, size, location, parent=None, mat=None):
    bpy.ops.mesh.primitive_cube_add(size=2.0, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    m = obj.modifiers.new("Bevel", "BEVEL")
    m.width = 0.004; m.segments = 3; m.limit_method = 'ANGLE'
    if parent:
        obj.parent = parent
        obj.matrix_parent_inverse = parent.matrix_world.inverted()
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return obj


def add_cyl(name, radius, depth, location, axis='Z', parent=None, mat=None):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth,
                                        location=location, vertices=32)
    obj = bpy.context.object
    obj.name = name
    if axis == 'X':
        obj.rotation_euler = (0, math.radians(90), 0)
    elif axis == 'Y':
        obj.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    m = obj.modifiers.new("Bevel", "BEVEL")
    m.width = 0.003; m.segments = 2; m.limit_method = 'ANGLE'
    if parent:
        obj.parent = parent
        obj.matrix_parent_inverse = parent.matrix_world.inverted()
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return obj


def add_empty(name, location, parent=None):
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=location, radius=0.1)
    e = bpy.context.object
    e.name = name
    if parent:
        e.parent = parent
        e.matrix_parent_inverse = parent.matrix_world.inverted()
    return e


# ════════════════════════════════════════════════════════════════════════════
# TILTING — wall plate (fixed) + hinge axis (rotates X) + tilt frame
# ════════════════════════════════════════════════════════════════════════════
def build_tilting_rig():
    mat = black_metal_mat()
    # Wall plate (fixed) — 4cm thick × 8cm wide × 1m tall
    add_box("WallPlate",       (0.040, 0.040, 0.500),  (-0.55, 0.000,  0.000), mat=mat)
    add_box("WallPlateInner",  (0.020, 0.060, 0.420),  (-0.55, 0.020,  0.000), mat=mat)

    # Hinge empty at the back-mid of the wall plate (the tilt pivot axis is X)
    hinge = add_empty("TiltHinge", (-0.50, 0.040, 0.000))

    # Tilt frame (everything that pivots) — parented to hinge.
    # Long vertical rails on the back of the VESA plate
    add_box("LeftRail",   (0.025, 0.025, 0.350),  (-0.30, 0.080,  0.000), parent=hinge, mat=mat)
    add_box("RightRail",  (0.025, 0.025, 0.350),  ( 0.30, 0.080,  0.000), parent=hinge, mat=mat)
    # VESA back plate + middle thicker section
    add_box("VESABack",     (0.020, 0.020, 0.220), (0.30, 0.130, 0.000),  parent=hinge, mat=mat)
    add_box("VESABackMid",  (0.130, 0.018, 0.140), (0.30, 0.120, 0.000),  parent=hinge, mat=mat)
    # Horizontal cross-rails behind TV (top + bottom)
    add_box("TopRail",      (0.450, 0.030, 0.030), (0.30, 0.170, 0.180),  parent=hinge, mat=mat)
    add_box("BotRail",      (0.450, 0.030, 0.030), (0.30, 0.170, -0.180), parent=hinge, mat=mat)
    # Side hooks gripping TV edges
    add_box("HookL",        (0.030, 0.040, 0.260), (-0.13, 0.200, 0.000), parent=hinge, mat=mat)
    add_box("HookL_Tab",    (0.030, 0.060, 0.030), (-0.13, 0.230, -0.250), parent=hinge, mat=mat)
    add_box("HookR",        (0.030, 0.040, 0.260), ( 0.73, 0.200, 0.000), parent=hinge, mat=mat)
    add_box("HookR_Tab",    (0.030, 0.060, 0.030), ( 0.73, 0.230, -0.250), parent=hinge, mat=mat)

    return hinge


def keyframe_tilting(hinge):
    """±15° tilt around the hinge X axis, full sine cycle over FRAMES."""
    amp = math.radians(15)
    for f in range(1, FRAMES + 1):
        t = (f - 1) / FRAMES
        bpy.context.scene.frame_set(f)
        hinge.rotation_euler[0] = math.sin(t * 2 * math.pi) * amp
        hinge.keyframe_insert("rotation_euler", index=0, frame=f)


# ════════════════════════════════════════════════════════════════════════════
# FULL-MOTION — wall plate + 2 parallel arm chains (shoulder→elbow→wrist)
# Both chains receive identical keyframes; VESA is parented to the upper wrist.
# ════════════════════════════════════════════════════════════════════════════
def build_arm_chain(suffix, z, mat, anchor_to=None):
    """Build one arm chain at world Z=z. Returns (shoulder, elbow, wrist)."""
    # Shoulder empty mounted on the wall plate
    shoulder = add_empty(f"Shoulder_{suffix}", (-0.50, 0.040, z))
    add_cyl(f"ShoulderKnuckle_{suffix}", 0.045, 0.10, (0, 0, 0),
            axis='Z', parent=shoulder, mat=mat)
    # Upper arm — its CENTER is forward of shoulder by 0.090 along the arm axis
    add_box(f"UpperArm_{suffix}", (0.180, 0.025, 0.022), (0.180, 0.05, 0),
            parent=shoulder, mat=mat)

    # Elbow empty at end of upper arm — placed in shoulder's LOCAL frame
    elbow = add_empty(f"Elbow_{suffix}", (0.360, 0.05, 0))
    elbow.parent = shoulder
    elbow.matrix_parent_inverse = shoulder.matrix_world.inverted()
    add_cyl(f"ElbowKnuckle_{suffix}", 0.045, 0.10, (0, 0, 0),
            axis='Z', parent=elbow, mat=mat)
    # Forearm
    add_box(f"Forearm_{suffix}", (0.180, 0.025, 0.022), (0.180, 0.04, 0),
            parent=elbow, mat=mat)

    # Wrist empty at end of forearm
    wrist = add_empty(f"Wrist_{suffix}", (0.360, 0.04, 0))
    wrist.parent = elbow
    wrist.matrix_parent_inverse = elbow.matrix_world.inverted()
    add_cyl(f"WristKnuckle_{suffix}", 0.045, 0.10, (0, 0, 0),
            axis='Z', parent=wrist, mat=mat)

    return shoulder, elbow, wrist


def build_fullmotion_rig():
    mat = black_metal_mat()
    # Wall plate (fixed)
    add_box("WallPlate",       (0.040, 0.040, 0.500),  (-0.55, 0.000,  0.000), mat=mat)
    add_box("WallPlateInner",  (0.020, 0.060, 0.420),  (-0.55, 0.020,  0.000), mat=mat)

    # TWO parallel arm chains
    sT, eT, wT = build_arm_chain("T",  0.150, mat)
    sB, eB, wB = build_arm_chain("B", -0.150, mat)

    # VESA back plate + cross-rails + hooks parented to TOP wrist
    # In wT's local frame: positions chosen so VESA hangs off the wrist
    add_box("VESABack",     (0.020, 0.020, 0.220), (0.07, 0.040, -0.150), parent=wT, mat=mat)
    add_box("VESABackMid",  (0.130, 0.018, 0.140), (0.07, 0.030, -0.150), parent=wT, mat=mat)
    add_box("TopRail",      (0.450, 0.030, 0.030), (0.07, 0.080,  0.030), parent=wT, mat=mat)
    add_box("BotRail",      (0.450, 0.030, 0.030), (0.07, 0.080, -0.330), parent=wT, mat=mat)
    add_box("HookL",        (0.030, 0.040, 0.260), (-0.36, 0.110, -0.150), parent=wT, mat=mat)
    add_box("HookL_Tab",    (0.030, 0.060, 0.030), (-0.36, 0.140, -0.400), parent=wT, mat=mat)
    add_box("HookR",        (0.030, 0.040, 0.260), ( 0.50, 0.110, -0.150), parent=wT, mat=mat)
    add_box("HookR_Tab",    (0.030, 0.060, 0.030), ( 0.50, 0.140, -0.400), parent=wT, mat=mat)

    return (sT, eT), (sB, eB)


def keyframe_fullmotion(top, bot):
    """Both arm chains get identical animation: shoulder + elbow rotate
       sinusoidally so the arm folds toward the wall at one end of the
       cycle and extends fully at the other."""
    sT, eT = top
    sB, eB = bot
    SHOULDER_FOLD = math.radians(40)    # how much it angles back toward wall
    SHOULDER_EXT  = math.radians(-10)   # extended (slightly forward of the X axis)
    ELBOW_FOLD    = math.radians(-90)   # bent at right angle when folded
    ELBOW_EXT     = math.radians(0)     # straight when extended

    for f in range(1, FRAMES + 1):
        t = (f - 1) / FRAMES
        # Triangle wave: 0 → 1 → 0 over the loop. Smooth out with cosine.
        fold_t = (1 - math.cos(t * 2 * math.pi)) / 2  # 0 at t=0/1, 1 at t=0.5
        sh_z = SHOULDER_FOLD + (SHOULDER_EXT - SHOULDER_FOLD) * fold_t
        el_z = ELBOW_FOLD    + (ELBOW_EXT    - ELBOW_FOLD)    * fold_t

        bpy.context.scene.frame_set(f)
        for s in (sT, sB):
            s.rotation_euler[2] = sh_z
            s.keyframe_insert("rotation_euler", index=2, frame=f)
        for e in (eT, eB):
            e.rotation_euler[2] = el_z
            e.keyframe_insert("rotation_euler", index=2, frame=f)


# ════════════════════════════════════════════════════════════════════════════
# Render driver
# ════════════════════════════════════════════════════════════════════════════
def render_one(key, build_fn, keyframe_fn):
    frame_dir = os.path.join(ANIM_TMP, key)
    if os.path.exists(frame_dir): shutil.rmtree(frame_dir)
    os.makedirs(frame_dir, exist_ok=True)

    reset()
    setup_render(frame_dir)
    setup_world()
    add_camera(fov_deg=60)
    add_lights()
    add_shadow_catcher()

    rig = build_fn()
    keyframe_fn(rig) if not isinstance(rig, tuple) else keyframe_fn(*rig)

    # Scale the entire rig to match the visual size of the static webps
    # (which use target_h=1.8 in render_mount_objects_v2.py). Joint rotations
    # are unaffected by this since they're local-space.
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    root = bpy.context.object
    root.name = "RootScale"
    for o in list(bpy.context.scene.objects):
        if o is root or o.parent is not None:
            continue
        if o.type in ('CAMERA', 'LIGHT'):
            continue
        if o.name.startswith('Plane'):  # shadow catcher
            continue
        o.parent = root
        o.matrix_parent_inverse = root.matrix_world.inverted()
    # 2.5× brings the rig to roughly the same on-screen size as the static
    # mount-fullmotion.webp (which used target_h=1.8 with the locked camera).
    root.scale = (2.5, 2.5, 2.5)

    bpy.ops.render.render(animation=True)

    out_webm = os.path.join(OUT_DIR, f"mount-{key}.webm")
    if os.path.exists(out_webm): os.remove(out_webm)
    cmd = [
        FFMPEG, "-y",
        "-framerate", str(FPS),
        "-i", os.path.join(frame_dir, "frame_%04d.png"),
        "-c:v", "libvpx-vp9",
        "-pix_fmt", "yuva420p",
        "-b:v", "0", "-crf", "32",
        "-an",
        out_webm,
    ]
    subprocess.run(cmd, check=True)
    print(f"DONE {key} -> {out_webm}")
    shutil.rmtree(frame_dir, ignore_errors=True)


if __name__ == "__main__":
    args = sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else ["tilting", "fullmotion"]
    if "tilting" in args:
        render_one("tilting", build_tilting_rig, keyframe_tilting)
    if "fullmotion" in args:
        render_one("fullmotion", build_fullmotion_rig, keyframe_fullmotion)
    print("ALL DONE")
