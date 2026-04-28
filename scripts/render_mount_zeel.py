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


def add_camera(fov_deg=65, cam_pos=(1.80, -3.20, 1.20), look_at=(0, 0, 1.00)):
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
def import_and_attach_tv(parts):
    """Import the existing sketchfab_tv.glb, scale + position it in front of
    the VESA bracket (Rectangle201), and parent it to Main_controller so it
    follows the bracket's motion. The TV's body hides the bolt-through
    cylinder geometry behind the front plate (which is intentional design
    detail in the Zeel FBX, not a rendering bug)."""
    tv_glb = os.path.join(MODELS, "sketchfab_tv.glb")
    if not os.path.exists(tv_glb):
        print("[skip] no sketchfab_tv.glb — bolt-through will be visible")
        return
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=tv_glb)
    tv_objs = [o for o in bpy.context.scene.objects if o not in before and o.type == 'MESH']
    if not tv_objs:
        return
    # Compute TV bbox + scale to ~1.4m (TV ≈ 65" diagonal)
    mins = [float('inf')] * 3; maxs = [float('-inf')] * 3
    for o in tv_objs:
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            for i in range(3):
                mins[i] = min(mins[i], w[i]); maxs[i] = max(maxs[i], w[i])
    biggest = max(maxs[i] - mins[i] for i in range(3))
    sc = 1.4 / max(biggest, 0.001)
    cx = (mins[0]+maxs[0])/2; cy = (mins[1]+maxs[1])/2; cz = (mins[2]+maxs[2])/2
    # Wrap TV under an empty placed in front of the VESA bracket
    rect201 = bpy.data.objects.get("Rectangle201")
    tv_root = parts.get("tv_root")
    if not (rect201 and tv_root): return
    # World position of the front-face of the VESA plate (lowest Y of rect201)
    r_mins = [float('inf')] * 3; r_maxs = [float('-inf')] * 3
    for c in rect201.bound_box:
        w = rect201.matrix_world @ Vector(c)
        for i in range(3):
            r_mins[i] = min(r_mins[i], w[i]); r_maxs[i] = max(r_maxs[i], w[i])
    target_pos = (
        (r_mins[0] + r_maxs[0]) / 2,
        r_mins[1] - 0.05,   # 5cm in front of VESA plate
        (r_mins[2] + r_maxs[2]) / 2,
    )
    # Position TV objects: scale and translate to target_pos
    M = mathutils.Matrix.Translation(target_pos) @ mathutils.Matrix.Scale(sc, 4) @ mathutils.Matrix.Translation((-cx, -cy, -cz))
    for o in tv_objs:
        if o.parent is None:
            o.matrix_world = M @ o.matrix_world
    # Parent each top-level TV mesh to Main_controller so they follow its motion
    for o in tv_objs:
        if o.parent is None:
            old_world = o.matrix_world.copy()
            o.parent = tv_root
            o.matrix_parent_inverse = tv_root.matrix_world.inverted()
            o.matrix_world = old_world


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
    # +0.6 in Z so the mount sits up off the floor at typical wall-mount
    # height (TV mounts aren't installed at floor level on the actual wall).
    root.location = (-sc * cx, -sc * cy, -sc * cz_min + 0.6)
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
    # Use Child Of constraint with location-only — TV bracket TRANSLATES
    # with the arm endpoint while staying upright (parallelogram linkage).
    # Use Blender's `childof_set_inverse` operator to properly bind the
    # inverse matrix at current state.
    for c in list(tv_root.constraints):
        tv_root.constraints.remove(c)
    bpy.context.view_layer.objects.active = tv_root
    con = tv_root.constraints.new('CHILD_OF')
    con.target = arm_a_end
    con.use_rotation_x = False
    con.use_rotation_y = False
    con.use_rotation_z = False
    con.use_scale_x = False
    con.use_scale_y = False
    con.use_scale_z = False
    bpy.ops.constraint.childof_set_inverse(constraint=con.name, owner='OBJECT')
    # Wrap shoulders in world-aligned pivot empties
    parts["pivot_a"] = wrap_shoulder_pivot(parts.get("shoulder_a"), root)
    parts["pivot_b"] = wrap_shoulder_pivot(parts.get("shoulder_b"), root)


# ── Arm bars (Zeel FBX is missing the visible arm geometry between hinges) ──
def add_arm_bars():
    """The Zeel FBX has only short cylinder hinge stubs at each end of each
    arm — no visible long bar geometry between them. Spawn one rectangular
    bar per arm, positioned between the wall hinge and front hinge, parented
    to the wall hinge so it inherits the rotation chain. Two arms total."""
    bar_mat = bpy.data.materials.get("BlackMetal")
    pairs = [
        ("Cylinder042", "Cylinder045"),  # right side: wall hinge → front hinge
        ("Cylinder043", "Cylinder040"),  # left side
    ]
    bpy.context.view_layer.update()
    bars = []
    for wall_name, front_name in pairs:
        wall = bpy.data.objects.get(wall_name)
        front = bpy.data.objects.get(front_name)
        if not (wall and front): continue
        wall_c  = wall.matrix_world.translation.copy()
        front_c = front.matrix_world.translation.copy()
        midpoint  = (wall_c + front_c) / 2
        direction = front_c - wall_c
        length = direction.length
        if length < 0.01: continue
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=midpoint)
        bar = bpy.context.object
        bar.name = f"ArmBar_{wall_name}"
        up = mathutils.Vector((0.0, 1.0, 0.0))
        bar.rotation_euler = up.rotation_difference(direction.normalized()).to_euler()
        bar.scale = (0.022, length / 2.0 * 0.95, 0.030)
        bpy.context.view_layer.update()
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        bev = bar.modifiers.new("Bevel", 'BEVEL')
        bev.width = 0.004; bev.segments = 2
        if bar_mat:
            bar.data.materials.clear()
            bar.data.materials.append(bar_mat)
        old_world = bar.matrix_world.copy()
        bar.parent = wall
        bar.matrix_parent_inverse = wall.matrix_world.inverted()
        bar.matrix_world = old_world
        bars.append(bar)
    return bars


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


def keyframe_articulate(parts, root):
    """Full-motion product demo: arms swing through their full articulation
    range to show the mount coming off the wall and swiveling. Both wall
    pivots rotate by the SAME angle (parallelogram-style), and Main_controller
    is keyframed each frame to the MIDPOINT of both arm tips so the front
    plate stays attached to BOTH arms — no diverging, no detached arms."""
    parts["pivot_a"] = wrap_shoulder_pivot(parts.get("shoulder_a"), root)
    parts["pivot_b"] = wrap_shoulder_pivot(parts.get("shoulder_b"), root)
    pa = parts["pivot_a"]; pb = parts["pivot_b"]
    tv_root   = parts.get("tv_root")
    arm_a_end = parts.get("arm_a_end")
    arm_b_end = parts.get("arm_b_end")
    if not (pa and pb and tv_root and arm_a_end and arm_b_end):
        return
    for c in list(tv_root.constraints):
        tv_root.constraints.remove(c)

    bpy.context.view_layer.update()
    rest_mid  = (arm_a_end.matrix_world.translation
                 + arm_b_end.matrix_world.translation) / 2
    rest_main = tv_root.location.copy()

    AMP = math.radians(38)
    try:
        bpy.context.preferences.edit.keyframe_new_interpolation_type = 'BEZIER'
    except Exception:
        pass

    for f in range(1, FRAMES + 1):
        t = (f - 1) / FRAMES
        angle = math.sin(t * 2 * math.pi) * AMP
        bpy.context.scene.frame_set(f)
        for piv in (pa, pb):
            piv.rotation_euler[2] = angle
            piv.keyframe_insert("rotation_euler", index=2, frame=f)
        bpy.context.view_layer.update()
        cur_mid = (arm_a_end.matrix_world.translation
                   + arm_b_end.matrix_world.translation) / 2
        delta = cur_mid - rest_mid
        tv_root.location = rest_main + delta
        tv_root.keyframe_insert("location", frame=f)


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
    add_camera(fov_deg=65)
    add_lights()
    add_shadow_catcher()

    new_objs, root = import_zeel()
    parts = get_zeel_parts()
    add_arm_bars()

    if key == "tilting":
        keyframe_tilt(parts)
    elif key == "fullmotion":
        keyframe_articulate(parts, root)

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
