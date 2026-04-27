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
def build_fullmotion_rig():
    """Modeled from the AlfaShop full-motion mount reference:
         - 2-rail wall plate (FIXED) with horizontal cross-bars
         - 4 angled trusses forming a trapezoidal arm frame (these are the
           "arms") that rotate as a unit around a vertical wall-side pivot
         - Central vertical pivot column at the apex of the trusses
         - Horizontal swing arm from central column to the TV-side bracket
         - 2-rail TV-side bracket with VESA mounting plate

       Animation: trapezoidal truss rotates around wall-side Z axis to
       extend the TV bracket out, plus the TV bracket pivots on the central
       column for the lateral swivel. Returns (PivotWall, PivotCenter)."""
    mat = black_metal_mat()

    # ── FIXED 2-rail wall plate ──────────────────────────────────────────
    # 2 vertical rails spaced 0.30m apart in X (camera-left/right) so they
    # read as separate rails from the locked camera angle.
    add_box("WallRail_L",       (0.030, 0.030, 0.520), (-0.85, 0.000,  0.000), mat=mat)
    add_box("WallRail_R",       (0.030, 0.030, 0.520), (-0.55, 0.000,  0.000), mat=mat)
    # Horizontal cross-bars (top, mid, bottom)
    add_box("WallPlate_Top",    (0.180, 0.030, 0.030), (-0.70, 0.000,  0.490), mat=mat)
    add_box("WallPlate_Mid",    (0.180, 0.030, 0.030), (-0.70, 0.000,  0.000), mat=mat)
    add_box("WallPlate_Bot",    (0.180, 0.030, 0.030), (-0.70, 0.000, -0.490), mat=mat)

    # ── PIVOT 1: trapezoidal truss (rotates around wall-side Z axis) ─────
    pivot_wall = add_empty("PivotWall", (-0.55, 0.040, 0.000))

    # Central pivot column (target of the trusses)
    # Local position from PivotWall: forward by 0.65 (in PivotWall's +X / forward)
    # Length 1.0m vertical, thickness 0.04m
    add_box("CenterPivotCol", (0.030, 0.030, 0.500),
            (0.65, 0.000, 0.000), parent=pivot_wall, mat=mat)

    # Four angled trusses — each goes from a wall-rail corner to a corner
    # of the central pivot column. Modeled as boxes sized to span the gap.
    # Wall-side endpoints (in PivotWall local frame, since wall rails are
    # at world x=-0.55 and pivot_wall is at world x=-0.55, the rails are
    # at LOCAL x=0). Truss endpoints in pivot_wall local space:
    #   Wall ends:    (0.00, ±0.150, ±0.450)
    #   Center ends:  (0.65, 0.000, ±0.450)
    # For a box bar between two points, place at midpoint, scale length to
    # the distance, rotate to align with the line.
    def add_truss(name, p_start, p_end, parent):
        sx, sy, sz = p_start
        ex, ey, ez = p_end
        dx, dy, dz = ex - sx, ey - sy, ez - sz
        length = math.sqrt(dx*dx + dy*dy + dz*dz)
        mid = ((sx+ex)/2, (sy+ey)/2, (sz+ez)/2)
        # Default box orientation has its long axis along X, so rotate that
        # axis to align with the (dx,dy,dz) direction.
        from mathutils import Vector
        x_axis = Vector((1, 0, 0))
        target = Vector((dx, dy, dz)).normalized()
        quat = x_axis.rotation_difference(target)
        rot_e = quat.to_euler()
        bpy.ops.mesh.primitive_cube_add(size=2.0, location=mid)
        obj = bpy.context.object
        obj.name = name
        obj.scale = (length / 2, 0.020, 0.020)
        obj.rotation_euler = rot_e
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        m = obj.modifiers.new("Bevel", "BEVEL")
        m.width = 0.004; m.segments = 3; m.limit_method = 'ANGLE'
        obj.parent = parent
        obj.matrix_parent_inverse = parent.matrix_world.inverted()
        obj.data.materials.clear()
        obj.data.materials.append(mat)
        return obj

    add_truss("Truss_TL", ( 0.00, -0.150,  0.450), (0.65, 0.000,  0.450), pivot_wall)
    add_truss("Truss_TR", ( 0.00,  0.150,  0.450), (0.65, 0.000,  0.450), pivot_wall)
    add_truss("Truss_BL", ( 0.00, -0.150, -0.450), (0.65, 0.000, -0.450), pivot_wall)
    add_truss("Truss_BR", ( 0.00,  0.150, -0.450), (0.65, 0.000, -0.450), pivot_wall)

    # ── PIVOT 2: TV-side bracket pivots on the central column ────────────
    pivot_center = add_empty("PivotCenter", (0.65, 0.000, 0.000))
    pivot_center.parent = pivot_wall
    pivot_center.matrix_parent_inverse = pivot_wall.matrix_world.inverted()

    # Horizontal swing arms (top + bottom) from central column to TV bracket
    add_box("SwingArm_Top",  (0.300, 0.020, 0.030), (0.300, 0.000,  0.450),
            parent=pivot_center, mat=mat)
    add_box("SwingArm_Bot",  (0.300, 0.020, 0.030), (0.300, 0.000, -0.450),
            parent=pivot_center, mat=mat)

    # TV-side bracket: 2 vertical rails + cross-bars + VESA plate
    add_box("TVRail_L",      (0.030, 0.030, 0.520), (0.600, -0.150, 0.000),
            parent=pivot_center, mat=mat)
    add_box("TVRail_R",      (0.030, 0.030, 0.520), (0.600,  0.150, 0.000),
            parent=pivot_center, mat=mat)
    add_box("TVBracket_Top", (0.030, 0.180, 0.030), (0.600,  0.000,  0.490),
            parent=pivot_center, mat=mat)
    add_box("TVBracket_Mid", (0.030, 0.180, 0.030), (0.600,  0.000,  0.000),
            parent=pivot_center, mat=mat)
    add_box("TVBracket_Bot", (0.030, 0.180, 0.030), (0.600,  0.000, -0.490),
            parent=pivot_center, mat=mat)
    # VESA mounting plate in the middle (large rectangular plate with holes
    # — holes not modeled, suggested by the plate's prominence)
    add_box("VESAPlate",     (0.015, 0.150, 0.180), (0.585,  0.000, 0.000),
            parent=pivot_center, mat=mat)

    return pivot_wall, pivot_center


def keyframe_fullmotion(rig):
    """Dual-pivot animation matching the AlfaShop full-motion mount:
       PivotWall (the trapezoidal-truss arm assembly) rotates around its
       Z axis to swing the TV bracket out from / back toward the wall.
       PivotCenter (the TV bracket on the central column) counter-rotates
       so the TV face stays approximately camera-facing through the swing.
    """
    pivot_wall, pivot_center = rig

    WALL_AMP   = math.radians(35)   # how far the truss swings out
    CENTER_AMP = math.radians(25)   # TV bracket counter-swivel

    for f in range(1, FRAMES + 1):
        t = (f - 1) / FRAMES
        phase = t * 2 * math.pi
        bpy.context.scene.frame_set(f)
        pivot_wall.rotation_euler[2] = math.sin(phase) * WALL_AMP
        pivot_wall.keyframe_insert("rotation_euler", index=2, frame=f)
        pivot_center.rotation_euler[2] = -math.sin(phase) * CENTER_AMP
        pivot_center.keyframe_insert("rotation_euler", index=2, frame=f)


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
    keyframe_fn(rig)

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
