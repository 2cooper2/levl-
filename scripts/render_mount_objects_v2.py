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


def add_camera():
    cd = bpy.data.cameras.new('Camera')
    cd.lens_unit = 'FOV'; cd.angle = math.radians(42)
    cd.clip_start = 0.01; cd.clip_end = 50.0
    co = bpy.data.objects.new('Camera', cd)
    bpy.context.collection.objects.link(co)
    bpy.context.scene.camera = co
    cam_pos = Vector((2.60, -4.50, 0.97))
    look_at = Vector((0.00,  0.00, 0.28))
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
        "x_offset": 0.30,   # shift right to compensate camera 3/4 perspective
    },
    "art-frame": {
        # Sketchfab "City Map Framed Wall Art Print, Amsterdam" — modern
        # matte-black thin frame with white matt + map print. Print face
        # normal already -Y (toward camera) — no rotation needed.
        "glb":     "sketchfab_art_frame_modern.glb",
        "rot_xyz": (0, 0, 0),
        "target_h": 1.7,
        "z_floor": 0.0,
    },
    "floating-shelves": {
        # Sketchfab "Scandinavian Shelf Decorative Set" — bookcase walls
        # excluded so just the shelves + decor objects render. Front normal
        # +X → -π/2 Z so the shelves face the screen head-on.
        "glb":     "sketchfab_floating_shelves_scandi_clean.glb",
        "rot_xyz": (0, 0, -math.pi/2),
        "target_h": 2.0,
        "z_floor": 0.0,
    },
    "light-fixture": {
        # Brass pendant w/ cord + ceiling mount cup at top. Cord NOT stripped
        # this time — full pendant rendered including hanging wire + ceiling
        # box. Bigger (target_h 2.4) so the wire reads clearly.
        "glb":     "sketchfab_light_fixture.glb",
        "rot_xyz": (0, 0, 0),
        "target_h": 2.4,
        "z_floor": 0.0,
    },
    "tv-monitor": {
        "glb":     "sketchfab_tv.glb",
        "rot_xyz": (0, 0, -math.pi/2),
        "target_h": 1.6,
        "z_floor": 0.0,
    },
}


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
    add_camera()
    add_lights()
    add_shadow_catcher(0.0)

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
