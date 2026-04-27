"""
render_mount_anim_pbr.py — animate the REAL Sketchfab mount GLBs (the same
PBR meshes used for the static `mount-fixed.webp` / `mount-tilting.webp`)
through the wall-types AgX rig. Whole asset rotates around a hinge axis
at its mounting edge — gives the "painted-in / baked" drill-icon look
plus visible motion, without any procedural primitives.

Tilting:
  - Asset: sketchfab_mount_tilting.glb (elizbarzoidze 600x400 tilt mount)
  - Hinge: horizontal X axis along the top of the asset
  - Animation: ±15° tilt forward/back

Full-motion (best available — no free articulating asset on Sketchfab):
  - Asset: sketchfab_mount_fixed.glb (kacperokacper d70t mount panel)
  - Hinge: vertical Z axis at the asset's left (wall-side) edge
  - Animation: ±35° swing out / back, simulates the swing-arm motion

Run:
    /Applications/Blender.app/Contents/MacOS/Blender --background \\
        --python scripts/render_mount_anim_pbr.py -- tilting fullmotion
"""
import bpy, math, mathutils, os, sys, subprocess, shutil
from mathutils import Vector

HERE     = os.path.dirname(__file__)
PROJECT  = os.path.join(HERE, "..")
MODELS   = os.path.join(HERE, "models")
OUT_DIR  = os.path.join(PROJECT, "public", "assets", "renders")
ANIM_TMP = os.path.join(OUT_DIR, "anim_pbr")

FFMPEG = "/Library/Frameworks/Python.framework/Versions/3.12/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1"

W_RENDER, H_RENDER = 480, 620
FRAMES  = int(os.environ.get("LEVL_FRAMES",  "96"))
FPS     = 24
SAMPLES = int(os.environ.get("LEVL_SAMPLES", "96"))

# Per-asset config: GLB path, target size (largest dim, meters),
# hinge axis ('X' or 'Z'), hinge offset relative to bbox in local frame
# (e.g. {'edge': 'top'} for X-axis at top, or {'edge': 'left'} for Z-axis
# at left), and animation amplitude (radians).
MOUNTS = {
    "tilting": {
        "glb":      "sketchfab_mount_tilting.glb",
        "target_h": 1.8,
        "axis":     'X',           # tilt around horizontal
        "edge":     'top',          # hinge at top of asset
        "amp_deg":  15,
    },
    "fullmotion": {
        # Using the fixed-mount GLB rotated around its wall-side edge as a
        # stand-in for the swing-arm extension. Best approximation given
        # the lack of a free articulating GLB on Sketchfab.
        "glb":      "sketchfab_mount_fixed.glb",
        "target_h": 1.8,
        "axis":     'Z',           # swing around vertical
        "edge":     'left',         # hinge at wall-side edge
        "amp_deg":  35,
    },
}


# ── Wall-types rig (matches the static mount-fixed.webp / mount-tilting.webp)
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
    s.cycles.device = 'CPU'
    try:
        cp = bpy.context.preferences.addons['cycles'].preferences
        for d in ('METAL', 'OPTIX', 'CUDA'):
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


# ── Asset import + fit (matches render_mount_objects_v2.py target_h logic) ──
def import_glb(path):
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.context.scene.objects if o not in before]
    return [o for o in new if o.type == 'MESH']


def fit_to_target(meshes, target_h, x_offset=0.30, z_floor=0.0):
    """Scale so largest dim == target_h, center xy, snap bottom to z_floor."""
    mins = [float('inf')] * 3; maxs = [float('-inf')] * 3
    for o in meshes:
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            for i in range(3):
                mins[i] = min(mins[i], w[i])
                maxs[i] = max(maxs[i], w[i])
    biggest = max(maxs[i] - mins[i] for i in range(3))
    sc = target_h / max(biggest, 0.001)
    cx = (mins[0]+maxs[0])/2; cy = (mins[1]+maxs[1])/2; cz_min = mins[2]
    T = mathutils.Matrix.Translation((-cx, -cy, -cz_min))
    S = mathutils.Matrix.Scale(sc, 4)
    for o in meshes:
        o.matrix_world = S @ T @ o.matrix_world
    bpy.ops.object.select_all(action='DESELECT')
    for o in meshes: o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    try: bpy.ops.object.transform_apply(location=True, scale=True, rotation=True)
    except RuntimeError: pass
    # Re-floor + x_offset
    bpy.context.view_layer.update()
    mins = [float('inf')] * 3; maxs = [float('-inf')] * 3
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
        o.location.y += -cy_post
    bpy.context.view_layer.update()


def parent_under_hinge(meshes, axis, edge):
    """Place a hinge empty at the asset's edge and parent all meshes under it.
       axis: 'X' (horizontal hinge — tilt) or 'Z' (vertical hinge — swing).
       edge: 'top' / 'bottom' (for X axis) or 'left' / 'right' (for Z axis).
    """
    bpy.context.view_layer.update()
    mins = [float('inf')] * 3; maxs = [float('-inf')] * 3
    for o in meshes:
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            for i in range(3):
                mins[i] = min(mins[i], w[i])
                maxs[i] = max(maxs[i], w[i])
    cx = (mins[0]+maxs[0])/2; cy = (mins[1]+maxs[1])/2
    if axis == 'X':
        z_pos = maxs[2] if edge == 'top' else mins[2]
        loc = (cx, cy, z_pos)
    else:  # 'Z' axis
        x_pos = mins[0] if edge == 'left' else maxs[0]
        loc = (x_pos, cy, (mins[2]+maxs[2])/2)
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=loc, radius=0.1)
    hinge = bpy.context.object
    hinge.name = "Hinge"
    for o in meshes:
        o.parent = hinge
        o.matrix_parent_inverse = hinge.matrix_world.inverted()
    return hinge


def keyframe_hinge(hinge, axis, amp_rad):
    """Sinusoidal back-and-forth oscillation around the hinge axis."""
    idx = 0 if axis == 'X' else 2
    for f in range(1, FRAMES + 1):
        t = (f - 1) / FRAMES
        bpy.context.scene.frame_set(f)
        hinge.rotation_euler[idx] = math.sin(t * 2 * math.pi) * amp_rad
        hinge.keyframe_insert("rotation_euler", index=idx, frame=f)


# ── Driver ────────────────────────────────────────────────────────────────────
def render_one(key):
    cfg = MOUNTS[key]
    glb = os.path.join(MODELS, cfg["glb"])
    if not os.path.exists(glb):
        print(f"[ERR] missing {glb}")
        return
    frame_dir = os.path.join(ANIM_TMP, key)
    if os.path.exists(frame_dir): shutil.rmtree(frame_dir)
    os.makedirs(frame_dir, exist_ok=True)

    reset()
    setup_render(frame_dir)
    setup_world()
    add_camera(fov_deg=60)
    add_lights()
    add_shadow_catcher()

    meshes = import_glb(glb)
    fit_to_target(meshes, cfg["target_h"])
    hinge = parent_under_hinge(meshes, cfg["axis"], cfg["edge"])
    keyframe_hinge(hinge, cfg["axis"], math.radians(cfg["amp_deg"]))

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
    args = sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else list(MOUNTS.keys())
    for key in args:
        if key in MOUNTS:
            render_one(key)
        else:
            print(f"[skip] unknown {key}")
    print("ALL DONE")
