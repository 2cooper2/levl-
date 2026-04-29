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

W_RENDER, H_RENDER = 480, 780
FRAMES  = int(os.environ.get("LEVL_FRAMES",  "144"))
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
    if "Metallic"  in bsdf.inputs: bsdf.inputs["Metallic"].default_value  = 0.65
    if "Roughness" in bsdf.inputs: bsdf.inputs["Roughness"].default_value = 0.28
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
    # Elbow pivots — sit between wall hinge (Cyl043/042) and front hinge
    # (Cyl040/045). Allows the elbow to rotate INDEPENDENTLY of the wall
    # hinge so the linkage actually flexes (not rigid).
    parts["pivot_elbow_a"] = wrap_elbow_pivot(
        bpy.data.objects.get("Cylinder040"), parts.get("shoulder_a"))
    parts["pivot_elbow_b"] = wrap_elbow_pivot(
        bpy.data.objects.get("Cylinder045"), parts.get("shoulder_b"))


def wrap_elbow_pivot(elbow_cyl, wall_hinge):
    """Insert a pivot empty AT the elbow cylinder so the elbow can rotate
    independently around its own Z axis. Parented to the wall hinge so the
    elbow position follows the wall swivel, but its own Z rotation is free."""
    if not (elbow_cyl and wall_hinge): return None
    bpy.context.view_layer.update()
    pivot_loc = elbow_cyl.matrix_world.translation.copy()
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=pivot_loc, radius=0.05)
    pivot = bpy.context.object
    pivot.name = f"PivotElbow_{elbow_cyl.name}"
    old_pivot_world = pivot.matrix_world.copy()
    pivot.parent = wall_hinge
    pivot.matrix_parent_inverse = wall_hinge.matrix_world.inverted()
    pivot.matrix_world = old_pivot_world
    old_world = elbow_cyl.matrix_world.copy()
    elbow_cyl.parent = pivot
    elbow_cyl.matrix_parent_inverse = pivot.matrix_world.inverted()
    elbow_cyl.matrix_world = old_world
    return pivot


# ── Clean parametric kinematic chain (replaces FBX-based pivots) ────────────
def build_clean_mount(root):
    """Build clean kinematic chain with pivots at GEOMETRIC joint positions:
    WallPivot at wall plate back face, ElbowPivot at midpoint, FrontEmpty at
    front plate back face. Each pivot rotates around the visible knuckle.
    Bars connect pivot-to-pivot. Knuckles are visible at every joint.

    Returns dict {side: {wall, elbow, front}} with the pivot empties.
    """
    bpy.context.view_layer.update()
    bar_mat = bpy.data.materials.get("BlackMetal")

    wall_plate  = bpy.data.objects.get("Rectangle200")
    front_plate = bpy.data.objects.get("Rectangle201")
    main_ctrl   = bpy.data.objects.get("Main_controller")
    if not (wall_plate and front_plate and main_ctrl): return None

    def y_range(o):
        mins=[float('inf')]*3; maxs=[float('-inf')]*3
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            for i in range(3):
                mins[i]=min(mins[i],w[i]); maxs[i]=max(maxs[i],w[i])
        return mins[1], maxs[1]

    _, wall_attach_y  = y_range(wall_plate)   # wall plate back face (further from camera)
    _, front_attach_y = y_range(front_plate)  # front plate back face
    elbow_y = (wall_attach_y + front_attach_y) / 2

    hinge_z   = 1.220   # centered on both plates (wall ≈1.22, VESA ≈1.22)
    bar_z_off = 0.18
    sides_x   = {"L": -0.357, "R": 0.335}

    for c in list(main_ctrl.constraints):
        main_ctrl.constraints.remove(c)

    def reparent(o, p):
        old = o.matrix_world.copy()
        o.parent = p
        o.matrix_parent_inverse = p.matrix_world.inverted()
        o.matrix_world = old

    pivots = {}
    for side, x in sides_x.items():
        bpy.ops.object.empty_add(type='PLAIN_AXES', location=Vector((x, wall_attach_y, hinge_z)))
        wp = bpy.context.object; wp.name = f"WallPiv_{side}"
        reparent(wp, root)

        bpy.ops.object.empty_add(type='PLAIN_AXES', location=Vector((x, elbow_y, hinge_z)))
        ep = bpy.context.object; ep.name = f"ElbowPiv_{side}"
        reparent(ep, wp)

        bpy.ops.object.empty_add(type='PLAIN_AXES', location=Vector((x, front_attach_y, hinge_z)))
        fe = bpy.context.object; fe.name = f"FrontEmpty_{side}"
        reparent(fe, ep)

        pivots[side] = {"wall": wp, "elbow": ep, "front": fe}

    # Front plate follows FrontEmpty_L via location-only Child Of
    fel = pivots["L"]["front"]
    bpy.context.view_layer.objects.active = main_ctrl
    con = main_ctrl.constraints.new('CHILD_OF')
    con.target = fel
    con.use_rotation_x = False; con.use_rotation_y = False; con.use_rotation_z = False
    con.use_scale_x = False; con.use_scale_y = False; con.use_scale_z = False
    bpy.ops.constraint.childof_set_inverse(constraint=con.name, owner='OBJECT')

    # FrontSwivel empty at plate center — front plate components reparented
    # under it so it can rotate the plate around its own center (for the
    # ±90° swivel demo) without affecting position or chain motion.
    bpy.context.view_layer.update()
    rect201 = bpy.data.objects.get("Rectangle201")
    fp_mins = [float('inf')]*3; fp_maxs = [float('-inf')]*3
    for c in rect201.bound_box:
        w = rect201.matrix_world @ Vector(c)
        for i in range(3):
            fp_mins[i] = min(fp_mins[i], w[i]); fp_maxs[i] = max(fp_maxs[i], w[i])
    fp_center = Vector(((fp_mins[0]+fp_maxs[0])/2,
                        (fp_mins[1]+fp_maxs[1])/2,
                        (fp_mins[2]+fp_maxs[2])/2))
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=fp_center)
    fs = bpy.context.object; fs.name = "FrontSwivel"
    reparent(fs, main_ctrl)
    # Reparent visible front plate parts so they rotate with FrontSwivel
    for nm in ("Rectangle201", "Rectangle203", "Rectangle208"):
        o = bpy.data.objects.get(nm)
        if o and o.parent is main_ctrl:
            reparent(o, fs)
    pivots["swivel"] = fs

    def make_box(name, midpoint, scale, parent):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=midpoint)
        o = bpy.context.object; o.name = name; o.scale = scale
        bpy.context.view_layer.update()
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        bev = o.modifiers.new("Bevel", 'BEVEL'); bev.width = 0.004; bev.segments = 2
        if bar_mat: o.data.materials.clear(); o.data.materials.append(bar_mat)
        reparent(o, parent)
        return o

    def make_pin(name, location, parent, radius=0.025, depth=0.18):
        bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, location=location)
        o = bpy.context.object; o.name = name
        bpy.context.view_layer.update()
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        bev = o.modifiers.new("Bevel", 'BEVEL'); bev.width = 0.003; bev.segments = 2
        if bar_mat: o.data.materials.clear(); o.data.materials.append(bar_mat)
        reparent(o, parent)
        return o

    seg_a_len   = (wall_attach_y - elbow_y) * 1.05
    seg_b_len   = (elbow_y - front_attach_y) * 1.05
    seg_a_mid_y = (wall_attach_y + elbow_y) / 2
    seg_b_mid_y = (elbow_y + front_attach_y) / 2

    for side, x in sides_x.items():
        wp = pivots[side]["wall"]; ep = pivots[side]["elbow"]; fe = pivots[side]["front"]
        for dz, tag in [(bar_z_off, "top"), (-bar_z_off, "bot")]:
            bar_z = hinge_z + dz
            make_box(f"BarA_{side}_{tag}",
                     Vector((x, seg_a_mid_y, bar_z)),
                     (0.060, seg_a_len, 0.090), wp)
            make_box(f"BarB_{side}_{tag}",
                     Vector((x, seg_b_mid_y, bar_z)),
                     (0.060, seg_b_len, 0.090), ep)
            make_pin(f"WallKnuckle_{side}_{tag}",
                     Vector((x, wall_attach_y, bar_z)), wp)
            make_pin(f"ElbowKnuckle_{side}_{tag}",
                     Vector((x, elbow_y, bar_z)), ep)
            make_pin(f"FrontKnuckle_{side}_{tag}",
                     Vector((x, front_attach_y, bar_z)), fe)

    return pivots


# ── Old FBX-based arm bars (legacy, no longer used) ─────────────────────────
def add_arm_bars():
    """Build articulating arm linkage: wall plate → first bar → elbow pivot
    → second bar → front plate. 4 elbows (top+bot × left+right). Each chain
    parented to the wall hinge so the whole linkage rotates as one rigid
    unit during swivel."""
    bar_mat = bpy.data.materials.get("BlackMetal")
    bpy.context.view_layer.update()

    wall_plate  = bpy.data.objects.get("Rectangle200")
    front_plate = bpy.data.objects.get("Rectangle201")
    if not (wall_plate and front_plate): return []

    def y_range(obj):
        mins=[float('inf')]*3; maxs=[float('-inf')]*3
        for c in obj.bound_box:
            w = obj.matrix_world @ Vector(c)
            for i in range(3):
                mins[i]=min(mins[i],w[i]); maxs[i]=max(maxs[i],w[i])
        return mins[1], maxs[1]

    # Bar A starts at the wall HINGE's front face (the visible articulation
    # point), not at the wall plate. The wall plate sits flush behind the
    # hinges (after the wall-plate forward-shift in render_one).
    wall_hinge = bpy.data.objects.get("Cylinder043") or bpy.data.objects.get("Cylinder042")
    if not wall_hinge: return []
    hinge_y_min, _  = y_range(wall_hinge)
    _, front_y_max  = y_range(front_plate)
    wall_y_min      = hinge_y_min
    elbow_y         = (wall_y_min + front_y_max) / 2  # mid-arm pivot location

    seg_a_y_len  = (wall_y_min - elbow_y) * 1.05
    seg_b_y_len  = (elbow_y - front_y_max) * 1.05
    seg_a_mid_y  = (wall_y_min + elbow_y) / 2
    seg_b_mid_y  = (elbow_y + front_y_max) / 2

    z_offsets = [0.20, -0.20]
    sides = [
        (bpy.data.objects.get("Cylinder042"), bpy.data.objects.get("PivotElbow_Cylinder045")),
        (bpy.data.objects.get("Cylinder043"), bpy.data.objects.get("PivotElbow_Cylinder040")),
    ]

    def make_box(name, midpoint, scale, parent):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=midpoint)
        o = bpy.context.object
        o.name = name
        o.scale = scale
        bpy.context.view_layer.update()
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        bev = o.modifiers.new("Bevel", 'BEVEL'); bev.width = 0.004; bev.segments = 2
        if bar_mat:
            o.data.materials.clear(); o.data.materials.append(bar_mat)
        old_world = o.matrix_world.copy()
        o.parent = parent
        o.matrix_parent_inverse = parent.matrix_world.inverted()
        o.matrix_world = old_world
        return o

    parts = []
    for wall, elbow_pivot in sides:
        if not (wall and elbow_pivot): continue
        wall_x  = wall.matrix_world.translation.x
        hinge_z = wall.matrix_world.translation.z
        for dz in z_offsets:
            bar_z = hinge_z + dz
            tag = "top" if dz > 0 else "bot"

            # First bar: wall hinge → elbow (parented to wall hinge — rotates with wall swivel)
            parts.append(make_box(
                f"ArmBar_A_{wall.name}_{tag}",
                Vector((wall_x, seg_a_mid_y, bar_z)),
                (0.060, seg_a_y_len, 0.090),
                wall))

            # Elbow pivot pin — small hinge knuckle, vertical Z axis
            bpy.ops.mesh.primitive_cylinder_add(
                radius=0.020, depth=0.10,
                location=Vector((wall_x, elbow_y, bar_z)))
            elbow_mesh = bpy.context.object
            elbow_mesh.name = f"Elbow_{wall.name}_{tag}"
            bpy.context.view_layer.update()
            bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
            bev = elbow_mesh.modifiers.new("Bevel", 'BEVEL'); bev.width = 0.003; bev.segments = 2
            if bar_mat:
                elbow_mesh.data.materials.clear(); elbow_mesh.data.materials.append(bar_mat)
            old_world = elbow_mesh.matrix_world.copy()
            elbow_mesh.parent = elbow_pivot
            elbow_mesh.matrix_parent_inverse = elbow_pivot.matrix_world.inverted()
            elbow_mesh.matrix_world = old_world
            parts.append(elbow_mesh)

            # Second bar: elbow → front plate (parented to ELBOW pivot — flexes independently)
            parts.append(make_box(
                f"ArmBar_B_{wall.name}_{tag}",
                Vector((wall_x, seg_b_mid_y, bar_z)),
                (0.060, seg_b_y_len, 0.090),
                elbow_pivot))
    return parts


# ── Animation keyframes ──────────────────────────────────────────────────────
def keyframe_tilt(parts):
    """Tilt motion: VESA front plate stays still. The vertical TV-side
    rails (Rectangle203, 208) + hooks (Arc014, 020) tilt around an X axis
    at the TOP of the rails (where they hook onto the VESA plate).
    Simulates a TV being tilted on a hooked mount."""
    main_ctrl = parts.get("tv_root")
    rails = [bpy.data.objects.get(n) for n in ("Rectangle203", "Rectangle208")]
    movers = [o for o in rails if o]
    if not (movers and main_ctrl):
        return

    # Shift rails far forward (toward camera) so they're clearly in front
    # of the plate's near face — far enough that even the VESA slots don't
    # show the rails behind them.
    for o in movers:
        o.location.y -= 0.35
    bpy.context.view_layer.update()

    bpy.context.view_layer.update()
    top_z = float('-inf'); xs = []; ys = []
    for r in rails:
        if r is None: continue
        for c in r.bound_box:
            w = r.matrix_world @ Vector(c)
            top_z = max(top_z, w.z)
        xs.append(r.matrix_world.translation.x)
        ys.append(r.matrix_world.translation.y)
    pivot_loc = Vector((sum(xs)/len(xs), sum(ys)/len(ys), top_z))

    bpy.ops.object.empty_add(type='PLAIN_AXES', location=pivot_loc)
    tilt = bpy.context.object; tilt.name = "TiltPivot"
    old = tilt.matrix_world.copy()
    tilt.parent = main_ctrl
    tilt.matrix_parent_inverse = main_ctrl.matrix_world.inverted()
    tilt.matrix_world = old
    for o in movers:
        old = o.matrix_world.copy()
        o.parent = tilt
        o.matrix_parent_inverse = tilt.matrix_world.inverted()
        o.matrix_world = old

    amp = math.radians(15)
    for f in range(1, FRAMES + 1):
        t = (f - 1) / FRAMES
        bpy.context.scene.frame_set(f)
        tilt.rotation_euler[0] = math.sin(t * 2 * math.pi) * amp
        tilt.keyframe_insert("rotation_euler", index=0, frame=f)


def keyframe_swivel(pivots):
    """Sequence: smooth sinusoidal circle sweep → mirror-symmetric outward
    fold (both wall hinges rotate opposite directions, elbows counter-rotate
    so the chain folds in a parallelogram-style V, front plate translates
    flush to wall) → extend back → seamless loop. Sine easing throughout."""
    if not pivots: return
    pw_l = pivots["L"]["wall"];  pw_r = pivots["R"]["wall"]
    pe_l = pivots["L"]["elbow"]; pe_r = pivots["R"]["elbow"]
    if not (pw_l and pw_r and pe_l and pe_r):
        return

    SWING      = math.radians(48)   # peak ~34° after envelope
    FOLD_W     = math.radians(-85)
    FOLD_E     = math.radians(170)

    # Quintic smoothstep — smoother acceleration than cubic
    def ease(t): return t * t * t * (t * (6 * t - 15) + 10)

    F_CIRCLE = int(FRAMES * 0.45)   # circle sweep
    F_FOLD   = int(FRAMES * 0.72)   # outward fold to flush
    F_HOLD   = int(FRAMES * 0.80)   # hold flush against wall
    F_EXTEND = int(FRAMES * 0.95)   # extend back out

    for f in range(1, FRAMES + 1):
        bpy.context.scene.frame_set(f)
        if f <= F_CIRCLE:
            t = (f - 1) / F_CIRCLE
            envelope = math.sin(math.pi * t)
            θ_swing = SWING * math.sin(2 * math.pi * t) * envelope
            θ_w_l = θ_swing;   θ_w_r = θ_swing
            θ_e_l = 0;         θ_e_r = 0
        elif f <= F_FOLD:
            t = ease((f - F_CIRCLE) / (F_FOLD - F_CIRCLE))
            θ_w_l = FOLD_W * t;  θ_w_r = -FOLD_W * t
            θ_e_l = FOLD_E * t;  θ_e_r = -FOLD_E * t
        elif f <= F_HOLD:
            θ_w_l = FOLD_W;  θ_w_r = -FOLD_W
            θ_e_l = FOLD_E;  θ_e_r = -FOLD_E
        elif f <= F_EXTEND:
            t = ease((f - F_HOLD) / (F_EXTEND - F_HOLD))
            θ_w_l = FOLD_W * (1 - t);  θ_w_r = -FOLD_W * (1 - t)
            θ_e_l = FOLD_E * (1 - t);  θ_e_r = -FOLD_E * (1 - t)
        else:
            θ_w_l = 0; θ_w_r = 0; θ_e_l = 0; θ_e_r = 0

        pw_l.rotation_euler[2] = θ_w_l; pw_l.keyframe_insert("rotation_euler", index=2, frame=f)
        pw_r.rotation_euler[2] = θ_w_r; pw_r.keyframe_insert("rotation_euler", index=2, frame=f)
        pe_l.rotation_euler[2] = θ_e_l; pe_l.keyframe_insert("rotation_euler", index=2, frame=f)
        pe_r.rotation_euler[2] = θ_e_r; pe_r.keyframe_insert("rotation_euler", index=2, frame=f)


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
    # Per-render camera framing
    if key == "fullmotion":
        look_at = (-0.30, 0, 1.00)
    elif key == "tilting":
        look_at = (0.009, -0.671, 1.22)   # center on front plate
    else:
        look_at = (0, 0, 1.00)
    add_camera(fov_deg=55, cam_pos=(3.20, -2.00, 1.40), look_at=look_at)
    add_lights()
    add_shadow_catcher()

    new_objs, root = import_zeel()
    parts = get_zeel_parts()
    attach_tv_bracket_to_arm(parts, root)

    tv_root = parts.get("tv_root")
    if tv_root:
        tv_root.location.y -= 0.15
    wall_plate = bpy.data.objects.get("Rectangle200")
    if wall_plate:
        wall_plate.location.y -= 0.21

    # Build clean parametric kinematic chain (replaces FBX-based pivots) —
    # only needed for the full-motion render. Tilting uses just the rails.
    clean_pivots = build_clean_mount(root) if key == "fullmotion" else None

    if key == "fullmotion":
        for nm in ("Cylinder040", "Cylinder045", "Cylinder042", "Cylinder043"):
            cyl = bpy.data.objects.get(nm)
            if cyl:
                cyl.hide_viewport = True
                cyl.hide_render = True

    if key == "tilting":
        # Tilting mount: DELETE wall plate, all horizontal hinge cylinders,
        # dummies, and the Pivot empties. Strip Main_controller's Child Of
        # constraint (it depended on Dummy002). Only static VESA + rails +
        # arcs/hooks remain.
        main_ctrl = bpy.data.objects.get("Main_controller")
        if main_ctrl:
            for c in list(main_ctrl.constraints):
                main_ctrl.constraints.remove(c)
        for nm in ("Rectangle200", "Cylinder040", "Cylinder045",
                   "Cylinder042", "Cylinder043", "Dummy001", "Dummy002",
                   "Pivot_Cylinder042", "Pivot_Cylinder043",
                   "Arc014", "Arc020"):
            o = bpy.data.objects.get(nm)
            if o: bpy.data.objects.remove(o, do_unlink=True)
        keyframe_tilt(parts)
    elif key == "fullmotion":
        keyframe_swivel(clean_pivots)

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
