"""
render_mount_zeel.py — render the Zeel Project Swivel TV Mount (purchased
FBX) with two animation variants: tilting and full-motion. Uses the same
wall-types AgX rig (lights + tone-map + film_transparent) as the static
mount-fixed.webp / mount-tilting.webp so the look matches.

The Zeel FBX has its parts organised as a parented mesh hierarchy (no
skeletal armature — the "rigging" claim is achieved via 3ds Max
parenting). We collect the top-level objects, parent them under a single
ROOT empty for transform, then identify the articulating arm pieces by
their X-position (wall side at min X, VESA side at max X) and animate
those.

Run:
    /Applications/Blender.app/Contents/MacOS/Blender --background \\
        --python scripts/render_mount_zeel.py -- tilting fullmotion
"""
import bpy, math, mathutils, os, sys, subprocess, shutil
from mathutils import Vector

HERE     = os.path.dirname(__file__)
PROJECT  = os.path.join(HERE, "..")
MODELS   = os.path.join(HERE, "models")
OUT_DIR  = os.path.join(PROJECT, "public", "assets", "renders")
ANIM_TMP = os.path.join(OUT_DIR, "anim_zeel")

FBX = os.path.join(MODELS, "zeel_swivel_tv_mount.fbx")
FFMPEG = "/Library/Frameworks/Python.framework/Versions/3.12/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1"

W_RENDER, H_RENDER = 480, 620
FRAMES  = int(os.environ.get("LEVL_FRAMES",  "96"))
FPS     = 24
SAMPLES = int(os.environ.get("LEVL_SAMPLES", "96"))


# ── Wall-types rig (same look as static mount webps) ────────────────────────
def reset():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for col in [bpy.data.meshes, bpy.data.materials, bpy.data.lights,
                bpy.data.cameras, bpy.data.images, bpy.data.armatures]:
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
    s.cycles.device = 'CPU'
    try:
        cp = bpy.context.preferences.addons['cycles'].preferences
        for d in ('METAL', 'OPTIX', 'CUDA'):
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


def add_camera(fov_deg=55, cam_pos=(2.60, -4.50, 1.20), look_at=(0, 0, 1.00)):
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


def black_metal_mat():
    """Override material — matte black powder-coat to match the other mount
    icons. The FBX ships with V-Ray materials that don't translate to Cycles."""
    mat = bpy.data.materials.new("BlackMetal")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.045, 0.045, 0.05, 1.0)
    if "Metallic"  in bsdf.inputs: bsdf.inputs["Metallic"].default_value  = 0.6
    if "Roughness" in bsdf.inputs: bsdf.inputs["Roughness"].default_value = 0.42
    return mat


# ── Import + setup ──────────────────────────────────────────────────────────
def import_zeel():
    """Import the Zeel mount FBX. Apply matte-black material, then bake a
    transform onto every top-level object that centers the model on origin
    and scales it to 2m. Returns the list of top-level objects."""
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.fbx(filepath=FBX)
    new_objs = [o for o in bpy.context.scene.objects if o not in before]

    # Apply matte-black material override across all meshes
    mat = black_metal_mat()
    for o in new_objs:
        if o.type == 'MESH':
            o.data.materials.clear()
            o.data.materials.append(mat)

    # Compute world bbox of imported meshes
    mins = [float('inf')] * 3; maxs = [float('-inf')] * 3
    for o in new_objs:
        if o.type != 'MESH': continue
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            for i in range(3):
                mins[i] = min(mins[i], w[i]); maxs[i] = max(maxs[i], w[i])
    cx = (mins[0] + maxs[0]) / 2
    cy = (mins[1] + maxs[1]) / 2
    cz_min = mins[2]
    biggest = max(maxs[i] - mins[i] for i in range(3))
    target = 2.0
    sc = target / max(biggest, 0.001)

    # Apply Scale@origin first then Translation. Bake into matrix_world of
    # every TOP-LEVEL object (parented chains follow naturally).
    S = mathutils.Matrix.Scale(sc, 4)
    T = mathutils.Matrix.Translation((-cx * sc, -cy * sc, -cz_min * sc))
    M = T @ S
    for o in new_objs:
        if o.parent is None:
            o.matrix_world = M @ o.matrix_world

    bpy.ops.object.select_all(action='DESELECT')
    for o in new_objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = new_objs[0]
    try: bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    except RuntimeError: pass
    bpy.context.view_layer.update()

    return new_objs


# ── Identify articulating parts by spatial position ──────────────────────────
def classify_parts(new_objs):
    """Find the wall-side parts vs the TV-side / arm parts by their X-position
    after import. Returns (wall_parts, arm_parts) lists of TOP-LEVEL objects."""
    bpy.context.view_layer.update()
    tops = [o for o in new_objs if o.parent is None]
    def center_x(o):
        if o.type != 'MESH':
            xs = []
            for c in o.children_recursive:
                if c.type == 'MESH':
                    for cc in c.bound_box:
                        xs.append((c.matrix_world @ Vector(cc)).x)
            return sum(xs) / len(xs) if xs else 0
        xs = [(o.matrix_world @ Vector(c)).x for c in o.bound_box]
        return sum(xs) / len(xs)
    tops_sorted = sorted(tops, key=center_x)
    if not tops_sorted: return [], []
    n = len(tops_sorted)
    cut = max(1, n // 3)
    wall_parts = tops_sorted[:cut]
    arm_parts  = tops_sorted[cut:]
    return wall_parts, arm_parts


def add_arm_pivot(arm_parts):
    """Re-parent the arm parts under a new empty pivot positioned at the
    wall-side edge of the arm group. The pivot's rotation is what we keyframe."""
    bpy.context.view_layer.update()
    mins = [float('inf')] * 3; maxs = [float('-inf')] * 3
    for o in arm_parts:
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            for i in range(3):
                mins[i] = min(mins[i], w[i]); maxs[i] = max(maxs[i], w[i])
    pivot_loc = (mins[0], (mins[1] + maxs[1]) / 2, (mins[2] + maxs[2]) / 2)
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=pivot_loc)
    pivot = bpy.context.object
    pivot.name = "ArmPivot"
    # Re-parent without changing world position
    for o in arm_parts:
        old_world = o.matrix_world.copy()
        o.parent = pivot
        o.matrix_parent_inverse = pivot.matrix_world.inverted()
        o.matrix_world = old_world
    return pivot


# ── Animation keyframes ──────────────────────────────────────────────────────
def keyframe_tilt(pivot):
    """Tilt the entire arm assembly forward/back ±15° around X axis."""
    amp = math.radians(15)
    for f in range(1, FRAMES + 1):
        t = (f - 1) / FRAMES
        bpy.context.scene.frame_set(f)
        pivot.rotation_euler[0] = math.sin(t * 2 * math.pi) * amp
        pivot.keyframe_insert("rotation_euler", index=0, frame=f)


def keyframe_swivel(pivot):
    """Swing the entire arm assembly side-to-side ±35° around vertical Z."""
    amp = math.radians(35)
    for f in range(1, FRAMES + 1):
        t = (f - 1) / FRAMES
        bpy.context.scene.frame_set(f)
        pivot.rotation_euler[2] = math.sin(t * 2 * math.pi) * amp
        pivot.keyframe_insert("rotation_euler", index=2, frame=f)


# ── Driver ───────────────────────────────────────────────────────────────────
def render_one(key):
    if not os.path.exists(FBX):
        print(f"[ERR] missing {FBX}"); return
    frame_dir = os.path.join(ANIM_TMP, key)
    if os.path.exists(frame_dir): shutil.rmtree(frame_dir)
    os.makedirs(frame_dir, exist_ok=True)

    reset()
    setup_render(frame_dir)
    setup_world()
    add_camera(fov_deg=55)
    add_lights()
    add_shadow_catcher()

    new_objs = import_zeel()
    wall_parts, arm_parts = classify_parts(new_objs)
    pivot = add_arm_pivot(arm_parts)

    if key == "tilting":
        keyframe_tilt(pivot)
    elif key == "fullmotion":
        keyframe_swivel(pivot)

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
    for key in args:
        if key in ("tilting", "fullmotion"):
            render_one(key)
        else:
            print(f"[skip] unknown {key}")
    print("ALL DONE")
