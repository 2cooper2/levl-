"""
render_mount_objects_v2.py — Blender 5.1.1 headless

High-end product-photography render rig for mount-object icons. Uses the
SAME setup as render_wall_types.py (which produced the 4K-feel concrete /
plaster / brick wall renders the user pointed at as the quality bar):

  • AgX Medium-High-Contrast tone mapping
  • 3-point studio lighting: rake key + soft fill + top rim
  • Shadow-catcher ground plane (visible contact shadow)
  • Lavender GI HDRI + bright lavender for camera rays
  • film_transparent → CSS lavender card shows through
  • CYCLES at 512 samples

Output: public/assets/renders/mount-<key>.png  (480x620, resized)

Usage:
    /Applications/Blender.app/Contents/MacOS/Blender --background \\
        --python scripts/render_mount_objects_v2.py -- mirror art-frame light-fixture floating-shelves
"""
import bpy, math, mathutils, os, sys
from mathutils import Vector, Euler

HERE       = os.path.dirname(__file__)
PROJECT    = os.path.join(HERE, "..")
MODELS     = os.path.join(HERE, "models")
OUT_DIR    = os.path.join(PROJECT, "public", "assets", "renders")

W_RENDER, H_RENDER = 960, 1240
W_FINAL,  H_FINAL  = 480, 620
SAMPLES = int(os.environ.get("LEVL_SAMPLES", "512"))


def reset():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for col in [bpy.data.meshes, bpy.data.materials,
                bpy.data.lights, bpy.data.cameras, bpy.data.images]:
        for b in list(col):
            try: col.remove(b)
            except Exception: pass


def setup_render(out_path):
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
    s.render.image_settings.file_format = 'PNG'
    s.render.image_settings.color_mode  = 'RGBA'
    s.render.film_transparent = True
    s.cycles.device = 'CPU'
    try:
        s.view_settings.view_transform = 'AgX'
        s.view_settings.look           = 'AgX - Medium High Contrast'
        s.view_settings.exposure       = 0.0
        s.view_settings.gamma          = 1.0
    except Exception:
        try: s.view_settings.view_transform = 'Filmic'
        except Exception: pass
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    s.render.filepath = out_path


def setup_world():
    s = bpy.context.scene
    world = bpy.data.worlds.new('World'); s.world = world
    world.use_nodes = True
    wt = world.node_tree; wt.nodes.clear()
    ow = wt.nodes.new('ShaderNodeOutputWorld')
    gi = wt.nodes.new('ShaderNodeBackground')
    cm = wt.nodes.new('ShaderNodeBackground')
    mx = wt.nodes.new('ShaderNodeMixShader')
    lp = wt.nodes.new('ShaderNodeLightPath')
    gi.inputs['Color'].default_value    = (0.76, 0.72, 0.88, 1.0)
    gi.inputs['Strength'].default_value = 0.30
    cm.inputs['Color'].default_value    = (0.91, 0.88, 0.97, 1.0)
    cm.inputs['Strength'].default_value = 1.0
    wt.links.new(lp.outputs['Is Camera Ray'], mx.inputs['Fac'])
    wt.links.new(gi.outputs['Background'],    mx.inputs[1])
    wt.links.new(cm.outputs['Background'],    mx.inputs[2])
    wt.links.new(mx.outputs['Shader'], ow.inputs['Surface'])


def add_lights():
    def area(name, loc, energy, size, color, rot_xyz):
        bpy.ops.object.light_add(type='AREA', location=loc)
        L = bpy.context.active_object; L.name = name
        L.data.energy = energy; L.data.size = size; L.data.color = color
        L.rotation_euler = Euler(tuple(math.radians(d) for d in rot_xyz), 'XYZ')
    # Same lighting setup as the wall types
    area('Key',   (-4.5, -1.5, 4.5),  380, 1.4, (1.0,  0.96, 0.88), (20, 0, -22))
    area('Fill',  ( 4.0, -2.0, 3.0),   80, 3.5, (0.86, 0.80, 1.00), ( 8, 0,  28))
    area('Top',   ( 0.0, -0.8, 6.0),   45, 3.0, (1.00, 0.98, 0.95), (80, 0,   0))


def add_camera(fov_deg=42, cam_pos=None, look_at=None):
    cd = bpy.data.cameras.new('Camera')
    cd.lens_unit = 'FOV'; cd.angle = math.radians(fov_deg)
    cd.clip_start = 0.01; cd.clip_end = 50.0
    co = bpy.data.objects.new('Camera', cd)
    bpy.context.collection.objects.link(co)
    bpy.context.scene.camera = co
    cam_pos = Vector(cam_pos) if cam_pos else Vector((2.60, -4.50, 0.97))
    look_at = Vector(look_at) if look_at else Vector((0.00,  0.00, 0.28))
    co.location = cam_pos
    co.rotation_euler = (look_at - cam_pos).to_track_quat('-Z', 'Y').to_euler()


def add_shadow_catcher(z):
    bpy.ops.mesh.primitive_plane_add(size=14.0, location=(0, 0, z))
    sc = bpy.context.active_object; sc.name = 'FloorShadow'
    try: sc.is_shadow_catcher = True
    except Exception:
        try: sc.cycles.is_shadow_catcher = True
        except Exception: pass


def import_glb(glb_path):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=glb_path)
    new = [o for o in bpy.data.objects if o not in before]
    meshes = [o for o in new if o.type == 'MESH']
    # Flatten parent hierarchy
    for m in meshes:
        if m.parent is not None:
            mw = m.matrix_world.copy()
            m.parent = None
            m.matrix_world = mw
    return meshes


def fit_and_pose(meshes, target_height=1.6, rot_xyz=(0,0,0), z_floor=0.0,
                 x_offset=0.0, y_offset=0.0):
    """Scale so largest dim == target_height, rotate, place bottom on floor."""
    # Compute combined world bbox
    mins = [float('inf')]*3; maxs = [float('-inf')]*3
    for o in meshes:
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            for i in range(3):
                mins[i] = min(mins[i], w[i])
                maxs[i] = max(maxs[i], w[i])
    biggest = max(maxs[i] - mins[i] for i in range(3))
    sc = target_height / max(biggest, 0.001)

    # Step 1: scale + center to origin
    cx = (mins[0]+maxs[0])/2; cy = (mins[1]+maxs[1])/2; cz_min = mins[2]
    T = mathutils.Matrix.Translation((-cx, -cy, -cz_min))  # bottom at z=0
    S = mathutils.Matrix.Scale(sc, 4)
    for o in meshes:
        o.matrix_world = S @ T @ o.matrix_world
    bpy.ops.object.select_all(action='DESELECT')
    for o in meshes: o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    try: bpy.ops.object.transform_apply(location=True, scale=True, rotation=True)
    except RuntimeError: pass

    # Step 2: rotate
    rx, ry, rz = rot_xyz
    if (rx, ry, rz) != (0, 0, 0):
        R = (mathutils.Matrix.Rotation(rz, 4, 'Z') @
             mathutils.Matrix.Rotation(ry, 4, 'Y') @
             mathutils.Matrix.Rotation(rx, 4, 'X'))
        for o in meshes:
            o.matrix_world = R @ o.matrix_world
        bpy.ops.object.select_all(action='DESELECT')
        for o in meshes: o.select_set(True)
        bpy.context.view_layer.objects.active = meshes[0]
        try: bpy.ops.object.transform_apply(location=True, scale=True, rotation=True)
        except RuntimeError: pass

    # Step 3: place bottom on z_floor (re-measure after rotation in case
    # rotation moved the bottom).
    bpy.context.view_layer.update()
    mins = [float('inf')]*3; maxs = [float('-inf')]*3
    for o in meshes:
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            for i in range(3):
                mins[i] = min(mins[i], w[i])
                maxs[i] = max(maxs[i], w[i])
    z_shift = z_floor - mins[2]
    cx_post = (mins[0]+maxs[0])/2
    cy_post = (mins[1]+maxs[1])/2
    for o in meshes:
        o.location.z += z_shift
        o.location.x += -cx_post + x_offset
        o.location.y += -cy_post + y_offset
    bpy.context.view_layer.update()


# ── per-icon configs ─────────────────────────────────────────────────────────

ICONS = {
    "mirror": {
        "glb":     "sketchfab_mirror_stockholm.glb",
        "rot_xyz": (0, 0, 0),
        "target_h": 2.6,
        "z_floor": 0.0,
        "x_offset": 0.30,
        # FOV 60° gives ~25% headroom + room for the rake-key shadow on
        # the right (locked light at (-4.5,-1.5,4.5) throws shadows far
        # right; FOV 52° clipped the shadow tip).
        "camera_fov_deg": 60,
    },
    "art-frame": {
        # Multi-frame composition (small/medium/large overlapping). Render
        # logic in compose_art_frame_trio() below. Per-icon camera override:
        # raised look-at, wide FOV so the trio sits low in the card with
        # headroom above and the floor visible below. Distance ~4.5m holds
        # KC's 4m width inside the horizontal view.
        "glb":     "sketchfab_art_frame_modern.glb",
        "multi_frame": True,
        "camera_fov_deg": 65,
        "camera_pos":     (2.50, -3.50, 1.50),
        "camera_look_at": (0.00,  0.00, 1.70),
    },
    "floating-shelves": {
        "glb":     "sketchfab_floating_shelves_scandi_clean.glb",
        "rot_xyz": (0, 0, -math.pi/2),
        "target_h": 2.6,
        "z_floor": 0.0,
        "x_offset": 0.30,
        "camera_fov_deg": 60,    # extra headroom + side margin for shadows
    },
    "light-fixture": {
        "glb":     "sketchfab_pendant_bulbs.glb",
        "rot_xyz": (0, 0, 0),
        "target_h": 2.6,
        "z_floor": 0.0,
        "x_offset": 0.30,
        "camera_fov_deg": 60,    # cords were cropping at top edge at 52°
    },
    "tv-monitor": {
        "glb":     "sketchfab_tv.glb",
        "rot_xyz": (0, 0, -math.pi/2),
        "target_h": 1.6,
        "z_floor": 0.0,
    },
    # ── TV-mount type icons (rendered through the same wall-types rig) ────
    "mount-fixed": {
        "glb":     "sketchfab_mount_fixed.glb",
        "rot_xyz": (0, 0, 0),
        "target_h": 1.8,
        "z_floor": 0.0,
        "x_offset": 0.30,
        "camera_fov_deg": 60,
    },
    "mount-tilting": {
        "glb":     "sketchfab_mount_tilting.glb",
        "rot_xyz": (0, 0, 0),
        "target_h": 1.8,
        "z_floor": 0.0,
        "x_offset": 0.30,
        "camera_fov_deg": 60,
    },
    "mount-fullmotion": {
        # Procedural — modeled directly from a Ktaxon TMD product photo
        # (wall plate + shoulder/elbow/wrist articulations + VESA back
        # plate + horizontal cross-rails + side hooks). Built by
        # _build_procedural_mounts.py.
        "glb":     "procedural_mount_fullmotion.glb",
        "rot_xyz": (0, 0, 0),
        "target_h": 1.6,
        "z_floor": 0.0,
        "x_offset": 0.30,
        "camera_fov_deg": 60,
    },
    "mount-ceiling": {
        # Procedural — modeled from a MOUNTUP-style ceiling-drop reference
        # (ceiling plate + drop pole + swivel + 4-arm VESA cross).
        "glb":     "procedural_mount_ceiling.glb",
        "rot_xyz": (0, 0, 0),
        "target_h": 1.8,
        "z_floor": 0.0,
        "x_offset": 0.30,
        "camera_fov_deg": 60,
    },
}


def import_glb_at(glb_path, target_height, rot_xyz=(0,0,0),
                  z_floor=0.0, x_offset=0.0, y_offset=0.0):
    """Import + fit + pose a single GLB. Returns the meshes."""
    meshes = import_glb(glb_path)
    fit_and_pose(meshes, target_height=target_height, rot_xyz=rot_xyz,
                 z_floor=z_floor, x_offset=x_offset, y_offset=y_offset)
    return meshes


def swap_print_texture(meshes, image_path):
    """Replace the print mesh's base-color image. Inserts a Mapping node
    that rotates/scales the UV so the texture's top-right corner displays
    at the print's top-right with right-side-up glyphs (the imported GLB's
    UV layout is mirrored vs standard image coords)."""
    if not os.path.exists(image_path):
        print(f"  [WARN] missing texture {image_path}")
        return
    target_mesh = None
    for m in meshes:
        if 'PRINT' in m.name.upper() or 'Print' in m.name:
            target_mesh = m; break
    if target_mesh is None:
        target_mesh = max(meshes, key=lambda m: max((p.area for p in m.data.polygons), default=0))
    if not target_mesh.data.materials:
        return
    mat = target_mesh.data.materials[0]
    if not (mat and mat.use_nodes):
        return
    new_mat = mat.copy()
    target_mesh.data.materials[0] = new_mat
    nt = new_mat.node_tree
    img = bpy.data.images.load(image_path)
    img.colorspace_settings.name = "sRGB"
    tex_node = None
    for n in nt.nodes:
        if n.type == 'TEX_IMAGE':
            n.image = img
            tex_node = n
            break
    if tex_node is None:
        return
    print(f"  [{target_mesh.name}] swapped print texture → {os.path.basename(image_path)}")


def stretch_z(meshes, factor):
    """Non-uniform Z-scale around z=0 (frames already snapped bottom-to-floor
    by fit_and_pose, so this stretches purely upward → taller portrait piece)."""
    if abs(factor - 1.0) < 1e-3:
        return
    Sz = mathutils.Matrix.Scale(factor, 4, Vector((0, 0, 1)))
    for o in meshes:
        o.matrix_world = Sz @ o.matrix_world
    bpy.ops.object.select_all(action='DESELECT')
    for o in meshes: o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    try: bpy.ops.object.transform_apply(location=True, scale=True, rotation=True)
    except RuntimeError: pass


def compose_art_frame_trio(glb_path):
    """Three frames composited as one piece:
      • KC (largest, upright, taller portrait) — back, dominant
      • LA (medium, taller portrait, leaning back against KC) — front-left
      • NY (small, leaning back against KC) — front-right
    Lean = negative X-axis rotation (top tilts +Y, away from camera at -Y)."""
    here = os.path.dirname(glb_path)
    base_glb = os.path.join(here, "sketchfab_art_frame_modern.glb")
    tex_ny    = os.path.join(here, "city_new_york.png")
    tex_kc    = os.path.join(here, "city_kansas_city.png")
    tex_la    = os.path.join(here, "city_los_angeles.png")

    # X-offsets shifted -0.16 from the centered set so the trio's weighted
    # x-mass lands on the camera's optical axis at the new ~36°-side angle.
    # KC — biggest, tall 4.0 × 4.0 square (no Z-stretch — stretch distorts
    # the texture).
    m_lg = import_glb_at(base_glb, target_height=4.0, rot_xyz=(0, 0, 0),
                         z_floor=0.0, x_offset=-0.16, y_offset=0.45)
    swap_print_texture(m_lg, tex_kc)

    # LA — 2.5 × 2.46h post-rotation. Mild 10° lean. y_offset tuned so the
    # TOP-BACK corner just kisses KC's front-face plane (y≈0.42) — touches
    # without phasing through.
    m_md = import_glb_at(base_glb, target_height=2.5,
                         rot_xyz=(math.radians(-10), 0, 0),
                         z_floor=0.0, x_offset=-0.86, y_offset=0.08)
    swap_print_texture(m_md, tex_la)

    # NY — small, 1.5 × 1.47h post-rotation. Mild 12° lean.
    m_sm = import_glb_at(base_glb, target_height=1.5,
                         rot_xyz=(math.radians(-12), 0, 0),
                         z_floor=0.0, x_offset=0.94, y_offset=0.19)
    swap_print_texture(m_sm, tex_ny)


def render_one(key):
    cfg = ICONS[key]
    glb = os.path.join(MODELS, cfg["glb"])
    if not os.path.exists(glb):
        print(f"[ERR] missing {glb}"); return
    raw_path = os.path.join(OUT_DIR, f"_mount_{key}_raw.png")
    final_path = os.path.join(OUT_DIR, f"mount-{key}.png")

    reset()
    setup_render(raw_path)
    setup_world()
    add_camera(fov_deg=cfg.get("camera_fov_deg", 42),
               cam_pos=cfg.get("camera_pos"),
               look_at=cfg.get("camera_look_at"))
    add_lights()
    add_shadow_catcher(0.0)

    if cfg.get("multi_frame"):
        compose_art_frame_trio(glb)
    else:
        meshes = import_glb(glb)
        fit_and_pose(
            meshes,
            target_height=cfg.get("target_h", 1.6),
            rot_xyz=cfg.get("rot_xyz", (0, 0, 0)),
            z_floor=cfg.get("z_floor", 0.0),
            x_offset=cfg.get("x_offset", 0.0),
            y_offset=cfg.get("y_offset", 0.0),
        )

    bpy.ops.render.render(write_still=True)

    # Resize raw → final via Pillow
    pil_code = (
        "from PIL import Image\n"
        f"img = Image.open(r'{raw_path}').convert('RGBA')\n"
        f"img = img.resize(({W_FINAL}, {H_FINAL}), Image.LANCZOS)\n"
        f"img.save(r'{final_path}')\n"
    )
    import subprocess
    try: subprocess.run(["python3", "-c", pil_code], check=True)
    except Exception:
        import shutil; shutil.copy(raw_path, final_path)
    print(f"DONE {key} -> {final_path}")


# ── entry point ──────────────────────────────────────────────────────────────
argv = sys.argv
args = argv[argv.index("--")+1:] if "--" in argv else []
targets = [a for a in args if a in ICONS] if args else list(ICONS)
for t in targets:
    render_one(t)
