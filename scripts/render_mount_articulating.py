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
FRAMES  = int(os.environ.get("LEVL_FRAMES",  "96"))
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
# TILTING — modeled from the Starburst SB-3270WMT reference photo:
#   Two tall vertical wall rails (FIXED) on left + right.
#   A horizontal tilt frame between them that pivots forward/back around a
#   horizontal X axis at the top where rails meet frame.
# ════════════════════════════════════════════════════════════════════════════
def build_tilting_rig():
    mat = black_metal_mat()

    # ── FIXED: two tall vertical wall rails with mounting-slot silhouette ──
    # Left rail
    add_box("WallRail_L",      (0.040, 0.030, 0.500),  (-0.45, 0.000, 0.000), mat=mat)
    add_box("WallRail_L_Tab",  (0.060, 0.030, 0.040),  (-0.45, 0.000, 0.470), mat=mat)
    # Right rail
    add_box("WallRail_R",      (0.040, 0.030, 0.500),  ( 0.45, 0.000, 0.000), mat=mat)
    add_box("WallRail_R_Tab",  (0.060, 0.030, 0.040),  ( 0.45, 0.000, 0.470), mat=mat)

    # ── Hinge: a horizontal X axis empty at the TOP-FRONT of the rails ──
    hinge = add_empty("TiltHinge", (0.000, 0.040, 0.380))

    # ── PIVOTING tilt frame (parented to hinge) ──
    # Top horizontal cross-bar (at the hinge axis line)
    add_box("TF_TopBar",   (0.470, 0.030, 0.030), (0.000, 0.040, 0.000), parent=hinge, mat=mat)
    # Two thick vertical side rails of the tilt frame, hanging DOWN from
    # the top bar (when not tilted) — these are the "arms" that move.
    add_box("TF_LeftSide", (0.030, 0.030, 0.380), (-0.420, 0.060, -0.190), parent=hinge, mat=mat)
    add_box("TF_RightSide",(0.030, 0.030, 0.380), ( 0.420, 0.060, -0.190), parent=hinge, mat=mat)
    # Bottom horizontal cross-bar
    add_box("TF_BotBar",   (0.470, 0.030, 0.030), (0.000, 0.060, -0.380), parent=hinge, mat=mat)
    # Horizontal mid-bar stiffener (where TV's VESA bracket sits)
    add_box("TF_MidBar",   (0.430, 0.030, 0.030), (0.000, 0.080, -0.180), parent=hinge, mat=mat)
    # VESA mounting plate in the middle
    add_box("TF_VESAPlate",(0.140, 0.020, 0.110), (0.000, 0.090, -0.180), parent=hinge, mat=mat)

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
def build_arm_chain(suffix, z, mat):
    """One arm chain: shoulder → THICK upper arm → elbow → THICK forearm → wrist.
       Arm cross-section is 0.08×0.08 (thick visible bars, not thin rods).
       Total arm length = 4× UPPER_LEN = 1.0m before scaling."""
    ARM_T = 0.040          # arm half-thickness (cross-section 0.08)
    UPPER_LEN = 0.25       # upper arm half-length (full = 0.50)
    LOWER_LEN = 0.25       # forearm half-length

    # Shoulder empty mounted on the wall plate
    shoulder = add_empty(f"Shoulder_{suffix}", (-0.50, 0.040, z))
    add_cyl(f"ShoulderKnuckle_{suffix}", 0.045, 0.10, (0, 0, 0),
            axis='Z', parent=shoulder, mat=mat)
    # Upper arm — thick bar, runs out from shoulder along +X (its local axis).
    # Center is at half-length along +X.
    add_box(f"UpperArm_{suffix}", (UPPER_LEN, ARM_T, ARM_T),
            (UPPER_LEN, 0, 0), parent=shoulder, mat=mat)

    # Elbow empty at end of upper arm (local x=2*UPPER_LEN of shoulder)
    elbow = add_empty(f"Elbow_{suffix}", (UPPER_LEN * 2, 0, 0))
    elbow.parent = shoulder
    elbow.matrix_parent_inverse = shoulder.matrix_world.inverted()
    add_cyl(f"ElbowKnuckle_{suffix}", 0.045, 0.10, (0, 0, 0),
            axis='Z', parent=elbow, mat=mat)
    # Forearm — thick bar
    add_box(f"Forearm_{suffix}", (LOWER_LEN, ARM_T, ARM_T),
            (LOWER_LEN, 0, 0), parent=elbow, mat=mat)

    # Wrist empty at end of forearm
    wrist = add_empty(f"Wrist_{suffix}", (LOWER_LEN * 2, 0, 0))
    wrist.parent = elbow
    wrist.matrix_parent_inverse = elbow.matrix_world.inverted()
    add_cyl(f"WristKnuckle_{suffix}", 0.045, 0.10, (0, 0, 0),
            axis='Z', parent=wrist, mat=mat)

    return shoulder, elbow, wrist


def build_fullmotion_rig():
    """Modeled from the Mounting Dream full-motion reference:
         - Tall wall plate on the left (FIXED)
         - Dual parallelogram arm chain (upper + lower arms) extending
           forward — the visible 'arms' that fold + extend
         - TV-side bracket: vertical rails connected by horizontal frame
       Arms are THICK (0.05m × 0.05m) so they read clearly as articulating
       elements, not thin rods."""
    mat = black_metal_mat()
    # Wall plate (FIXED) — TWO vertical rails spaced apart in X (left-right
    # in camera view) so they read as two distinct rails, connected by
    # horizontal cross-bars top/mid/bottom to form a frame. Matches the
    # Mounting Dream reference's 2-rail wall mount.
    # Inner rail (closer to arm pivot — shoulders attach here)
    add_box("WallRail_Inner",   (0.030, 0.030, 0.520),  (-0.55,  0.000, 0.000), mat=mat)
    # Outer rail (further from arm pivot, parallel)
    add_box("WallRail_Outer",   (0.030, 0.030, 0.520),  (-0.85,  0.000, 0.000), mat=mat)
    # Top horizontal cross-bar bridging the two rails
    add_box("WallPlate_Top",    (0.180, 0.030, 0.030),  (-0.70,  0.000, 0.490), mat=mat)
    # Bottom horizontal cross-bar
    add_box("WallPlate_Bot",    (0.180, 0.030, 0.030),  (-0.70,  0.000, -0.490), mat=mat)
    # Mid horizontal stiffener
    add_box("WallPlate_Mid",    (0.180, 0.030, 0.030),  (-0.70,  0.000, 0.000), mat=mat)

    # TWO parallel arm chains (parallelogram linkage — both move identically).
    # Shoulders sit on the INNER rail (x=-0.50, where build_arm_chain places them).
    sT, eT, wT = build_arm_chain("T",  0.150, mat)
    sB, eB, wB = build_arm_chain("B", -0.150, mat)

    # TV-side bracket parented to TOP wrist — vertical rails + horizontal
    # connectors. Positions are in wT's LOCAL frame (X = arm forward axis).
    # When arm rotates, this whole bracket follows.
    # Vertical TV rails (the "side bars" of the TV-side bracket)
    add_box("TVRail_L",     (0.030, 0.030, 0.220), ( 0.040, -0.240, -0.140), parent=wT, mat=mat)
    add_box("TVRail_R",     (0.030, 0.030, 0.220), ( 0.040,  0.240, -0.140), parent=wT, mat=mat)
    # Horizontal cross-bars connecting the rails (top + bottom)
    add_box("TV_TopBar",    (0.030, 0.270, 0.030), ( 0.040,  0.000,  0.060), parent=wT, mat=mat)
    add_box("TV_BotBar",    (0.030, 0.270, 0.030), ( 0.040,  0.000, -0.340), parent=wT, mat=mat)
    # VESA mounting plate in the middle
    add_box("TV_VESAPlate", (0.020, 0.130, 0.110), ( 0.040,  0.000, -0.140), parent=wT, mat=mat)
    # Tabs at top and bottom of each rail
    add_box("TVRail_L_Tab", (0.030, 0.060, 0.030), ( 0.040, -0.240,  0.080), parent=wT, mat=mat)
    add_box("TVRail_L_Bot", (0.030, 0.060, 0.030), ( 0.040, -0.240, -0.360), parent=wT, mat=mat)
    add_box("TVRail_R_Tab", (0.030, 0.060, 0.030), ( 0.040,  0.240,  0.080), parent=wT, mat=mat)
    add_box("TVRail_R_Bot", (0.030, 0.060, 0.030), ( 0.040,  0.240, -0.360), parent=wT, mat=mat)

    return (sT, eT), (sB, eB)


def keyframe_fullmotion(top, bot):
    """Fold + extend + lateral sweep — matches the original WebGL motion.
       phase=0 (loop start): arms folded against the wall plate.
       phase=π (mid-loop):    arms fully extended straight out.
       Lateral sweep ±20° overlays so the TV swings side-to-side too.
       Both arm chains receive identical keyframes — parallelogram linkage."""
    sT, eT = top
    sB, eB = bot

    # Reduced fold angles so the arms stay clearly visible throughout the
    # whole loop instead of disappearing flat against the wall.
    SHOULDER_FOLD = math.radians( 30)   # mild angle back
    SHOULDER_EXT  = math.radians( -5)   # straight out
    ELBOW_FOLD    = math.radians(-50)   # bent at the elbow but not collapsed
    ELBOW_EXT     = math.radians(  0)   # straight
    SWEEP_AMP     = math.radians( 20)   # lateral sweep amplitude

    for f in range(1, FRAMES + 1):
        t = (f - 1) / FRAMES
        phase = t * 2 * math.pi
        # fold_t: 1 = fully folded, 0 = fully extended.
        # cos(phase) is 1 at phase=0 (folded) and -1 at phase=π (extended).
        fold_t = (1 + math.cos(phase)) / 2
        # Sweep: sin(phase) gives ±1 oscillation across the loop.
        sweep = math.sin(phase)

        sh_z = SHOULDER_FOLD * fold_t + SHOULDER_EXT * (1 - fold_t) + SWEEP_AMP * sweep
        el_z = ELBOW_FOLD    * fold_t + ELBOW_EXT    * (1 - fold_t)

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
    # Lift so the bottom of the wall plate sits on the floor (z=0).
    # Wall plate's half-height in builder coords is 0.5; after 2.5× scale
    # that's 1.25m, so root.z=1.25 puts the wall-plate bottom on z=0.
    root.location = (0, 0, 1.25)

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
