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


def add_camera(fov_deg=55, cam_pos=(1.80, -3.20, 1.20), look_at=(0, 0, 1.00)):
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
    """Import the Zeel mount FBX. Wrap all top-level imported objects under
    a single ROOT empty, then scale + translate ONLY the root — children's
    parent-relative offsets are preserved through their existing FBX
    parenting (Cylinder043→Cylinder040→Dummy002, etc.). NO transform_apply,
    so the parented shoulder→arm→endpoint chain stays intact for animation.
    Returns (new_objs, root_empty)."""
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.fbx(filepath=FBX)
    new_objs = [o for o in bpy.context.scene.objects if o not in before]

    # Apply matte-black material override across all meshes
    mat = black_metal_mat()
    for o in new_objs:
        if o.type == 'MESH':
            o.data.materials.clear()
            o.data.materials.append(mat)

    # World bbox of all imported meshes (BEFORE any transformation)
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
    sc = 2.0 / max(biggest, 0.001)

    # Create root empty at origin (identity transform initially)
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    root = bpy.context.object
    root.name = "ZeelRoot"

    # Parent every top-level imported object to root, preserving world pos.
    # The FBX child hierarchies (Cyl→Cyl→Dummy etc.) survive intact.
    for o in list(new_objs):
        if o is root: continue
        if o.parent is None:
            old_world = o.matrix_world.copy()
            o.parent = root
            o.matrix_parent_inverse = root.matrix_world.inverted()
            o.matrix_world = old_world

    bpy.context.view_layer.update()

    # Now scale + translate the root. Children inherit the transform via
    # parenting, so the entire FBX hierarchy moves/scales as one unit.
    # Root.location chosen so the model's bbox center lands at world (0,0,*)
    # and bottom at z=0.
    root.scale = (sc, sc, sc)
    root.location = (-sc * cx, -sc * cy, -sc * cz_min)
    bpy.context.view_layer.update()

    return new_objs, root


def get_zeel_parts():
    """Look up the named parts of the Zeel mount FBX after import.
    The model uses these named parts:
      Rectangle200       — wall plate (FIXED)
      Cylinder043/040    — arm chain A (Dummy002 = TV-end)
      Cylinder042/045    — arm chain B (Dummy001 = TV-end)
      Main_controller    — group root for the TV-side bracket
        ├─ Rectangle201  (VESA back plate)
        ├─ Rectangle203  (left TV-side rail)
        ├─ Rectangle208  (right TV-side rail)
        └─ Arc014/020    (tilt arms)
    Returns dict with the key handles."""
    g = bpy.data.objects.get
    return {
        "wall_plate":   g("Rectangle200"),
        "shoulder_a":   g("Cylinder043"),
        "shoulder_b":   g("Cylinder042"),
        "arm_a_end":    g("Dummy002"),
        "arm_b_end":    g("Dummy001"),
        "tv_root":      g("Main_controller"),
    }


def wrap_shoulder_pivot(shoulder, root):
    """Insert a world-axis-aligned pivot empty between root and the shoulder
    cylinder, located at the wall-side end of the cylinder. Rotating the
    pivot's Z gives a clean vertical swivel around the wall mount point."""
    if shoulder is None: return None
    bpy.context.view_layer.update()
    mins = [float('inf')] * 3; maxs = [float('-inf')] * 3
    for c in shoulder.bound_box:
        w = shoulder.matrix_world @ Vector(c)
        for i in range(3):
            mins[i] = min(mins[i], w[i]); maxs[i] = max(maxs[i], w[i])
    pivot_loc = (
        (mins[0] + maxs[0]) / 2,
        maxs[1],   # WALL-SIDE end of cylinder
        (mins[2] + maxs[2]) / 2,
    )
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=pivot_loc, radius=0.05)
    pivot = bpy.context.object
    pivot.name = f"Pivot_{shoulder.name}"
    # Insert pivot between root and shoulder: root → pivot → shoulder
    old_pivot_world = pivot.matrix_world.copy()
    pivot.parent = root
    pivot.matrix_parent_inverse = root.matrix_world.inverted()
    pivot.matrix_world = old_pivot_world
    old_shoulder_world = shoulder.matrix_world.copy()
    shoulder.parent = pivot
    shoulder.matrix_parent_inverse = pivot.matrix_world.inverted()
    shoulder.matrix_world = old_shoulder_world
    return pivot


def attach_tv_bracket_to_arm(parts, root):
    """Hard-parent the TV-side bracket (Main_controller + its children —
    VESA plate, vertical rails, tilt arms) to the arm endpoint (Dummy002)
    so the WHOLE TV assembly moves rigidly with the swinging arm. Wall
    plate (Rectangle200) stays unparented = fixed.
    Also wraps both shoulders in world-axis pivot empties and stores them
    on `parts` so the keyframer can drive them directly around world Z."""
    tv_root = parts["tv_root"]
    arm_a_end = parts["arm_a_end"]
    if not (tv_root and arm_a_end):
        return
    # Use Copy Location (not hard-parent) so the TV bracket TRANSLATES with
    # the arm endpoint but DOESN'T inherit its rotation — mimics the
    # parallelogram linkage of a real full-motion mount, keeping the front
    # plate visually upright instead of tumbling.
    for c in list(tv_root.constraints):
        tv_root.constraints.remove(c)
    con = tv_root.constraints.new('COPY_LOCATION')
    con.target = arm_a_end
    con.use_offset = True
    # Wrap shoulders in world-aligned pivot empties
    parts["pivot_a"] = wrap_shoulder_pivot(parts.get("shoulder_a"), root)
    parts["pivot_b"] = wrap_shoulder_pivot(parts.get("shoulder_b"), root)


# ── Animation keyframes ──────────────────────────────────────────────────────
def keyframe_tilt(parts):
    """Tilt: rotate Rectangle201 (the VESA plate with tilt arms attached)
    ±15° around X axis. Arms + wall plate stay fixed, only the TV plate
    pitches forward/back. This needs the Main_controller hard-parenting
    UNDONE first (it would lock everything together), so unparent before
    keyframing."""
    tv_root = parts["tv_root"]
    if tv_root and tv_root.parent is not None:
        old_world = tv_root.matrix_world.copy()
        tv_root.parent = None
        tv_root.matrix_world = old_world
    rect201 = bpy.data.objects.get("Rectangle201")
    target = rect201 or tv_root
    if not target: return
    amp = math.radians(15)
    for f in range(1, FRAMES + 1):
        t = (f - 1) / FRAMES
        bpy.context.scene.frame_set(f)
        target.rotation_euler[0] = math.sin(t * 2 * math.pi) * amp
        target.keyframe_insert("rotation_euler", index=0, frame=f)


def keyframe_swivel(parts):
    """Full-motion swivel: rotate the world-axis pivot empties wrapping the
    two shoulders. Both rotate identically (parallelogram). Arms (children)
    swing with them; TV bracket parented to Dummy002 follows the arm
    endpoint. Wall plate stays unparented = fixed."""
    pa = parts.get("pivot_a")
    pb = parts.get("pivot_b")
    if not (pa and pb):
        return
    amp = math.radians(40)
    for f in range(1, FRAMES + 1):
        t = (f - 1) / FRAMES
        angle = math.sin(t * 2 * math.pi) * amp
        bpy.context.scene.frame_set(f)
        for piv in (pa, pb):
            piv.rotation_euler[2] = angle
            piv.keyframe_insert("rotation_euler", index=2, frame=f)


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

    new_objs, root = import_zeel()
    parts = get_zeel_parts()
    attach_tv_bracket_to_arm(parts, root)

    if key == "tilting":
        keyframe_tilt(parts)
    elif key == "fullmotion":
        keyframe_swivel(parts)

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
