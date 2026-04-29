"""
render_mount_tilting_v2.py — render the Sketchfab tilting mount GLB as
an animated webm. Uses the same lighting/material/aspect as the fixed
and full-motion mounts.

Usage:
    /Applications/Blender.app/Contents/MacOS/Blender --background \\
        --python scripts/render_mount_tilting_v2.py
"""
import bpy, math, os, subprocess, shutil
from mathutils import Vector

HERE     = os.path.dirname(__file__)
PROJECT  = os.path.join(HERE, "..")
MODELS   = os.path.join(HERE, "models")
OUT_DIR  = os.path.join(PROJECT, "public", "assets", "renders")
ANIM_TMP = os.path.join(OUT_DIR, "anim_tilt2")

GLB     = os.path.join(MODELS, "sketchfab_mount_tilting.glb")
FFMPEG  = "/Library/Frameworks/Python.framework/Versions/3.12/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1"

W, H    = 480, 780
FRAMES  = int(os.environ.get("LEVL_FRAMES", "144"))
FPS     = 24
SAMPLES = int(os.environ.get("LEVL_SAMPLES", "96"))


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
    s.render.resolution_x = W
    s.render.resolution_y = H
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
        for d in ('METAL','OPTIX','CUDA'):
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


def add_camera_fitted(center, size, fov_deg=42):
    """Place camera at a 3/4 angle so the mount fills the 480x780 frame."""
    cd = bpy.data.cameras.new('Camera')
    cd.lens_unit = 'FOV'; cd.angle = math.radians(fov_deg)
    cd.clip_start = 0.01; cd.clip_end = 50.0
    co = bpy.data.objects.new('Camera', cd)
    bpy.context.collection.objects.link(co)
    bpy.context.scene.camera = co
    cam_dist = size * 1.85
    co.location = Vector(center) + Vector((cam_dist, -cam_dist, cam_dist * 0.3))
    co.rotation_euler = (Vector(center) - co.location).to_track_quat('-Z', 'Y').to_euler()


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
    bpy.context.object.is_shadow_catcher = True


def black_metal_mat():
    mat = bpy.data.materials.new("BlackMetal")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.045, 0.045, 0.05, 1.0)
    if "Metallic"  in bsdf.inputs: bsdf.inputs["Metallic"].default_value  = 0.65
    if "Roughness" in bsdf.inputs: bsdf.inputs["Roughness"].default_value = 0.28
    return mat


def import_and_setup():
    """Import the tilting GLB and return (new_objs, root, world_center, world_size).
    Mount is centered at origin and scaled to ~2 units max dimension."""
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=GLB)
    new_objs = [o for o in bpy.context.scene.objects if o not in before]
    mat = black_metal_mat()
    for o in new_objs:
        if o.type == 'MESH':
            o.data.materials.clear()
            o.data.materials.append(mat)

    mins = [float('inf')]*3; maxs = [float('-inf')]*3
    for o in new_objs:
        if o.type != 'MESH': continue
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            for i in range(3):
                mins[i] = min(mins[i], w[i]); maxs[i] = max(maxs[i], w[i])
    biggest = max(maxs[i] - mins[i] for i in range(3))
    sc = 2.0 / max(biggest, 0.001)
    cx = (mins[0]+maxs[0])/2; cy = (mins[1]+maxs[1])/2; cz_min = mins[2]

    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    root = bpy.context.object; root.name = "TiltMountRoot"
    for o in list(new_objs):
        if o is root: continue
        if o.parent is None:
            old_world = o.matrix_world.copy()
            o.parent = root
            o.matrix_parent_inverse = root.matrix_world.inverted()
            o.matrix_world = old_world
    bpy.context.view_layer.update()
    root.scale = (sc, sc, sc)
    root.location = (-sc * cx, -sc * cy, -sc * cz_min + 0.6)
    bpy.context.view_layer.update()
    world_center = Vector((0, 0, sc * (maxs[2] - cz_min) / 2 + 0.6))
    world_size = sc * biggest
    return new_objs, root, world_center, world_size


def keyframe_tilt(moving_part, root):
    """Tilt the front bracket ±15° around its top edge X axis."""
    bpy.context.view_layer.update()
    # Compute pivot at top of moving_part
    mins = [float('inf')]*3; maxs = [float('-inf')]*3
    for c in moving_part.bound_box:
        w = moving_part.matrix_world @ Vector(c)
        for i in range(3):
            mins[i] = min(mins[i], w[i]); maxs[i] = max(maxs[i], w[i])
    pivot_loc = Vector(((mins[0]+maxs[0])/2, (mins[1]+maxs[1])/2, maxs[2]))

    # Insert TiltPivot empty between root and moving_part
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=pivot_loc)
    tilt = bpy.context.object; tilt.name = "TiltPivot"
    old = tilt.matrix_world.copy()
    tilt.parent = root
    tilt.matrix_parent_inverse = root.matrix_world.inverted()
    tilt.matrix_world = old
    old = moving_part.matrix_world.copy()
    moving_part.parent = tilt
    moving_part.matrix_parent_inverse = tilt.matrix_world.inverted()
    moving_part.matrix_world = old

    amp = math.radians(15)
    for f in range(1, FRAMES + 1):
        t = (f - 1) / FRAMES
        bpy.context.scene.frame_set(f)
        tilt.rotation_euler[0] = math.sin(t * 2 * math.pi) * amp
        tilt.keyframe_insert("rotation_euler", index=0, frame=f)


def main():
    if not os.path.exists(GLB):
        print(f"[ERR] missing {GLB}"); return
    frame_dir = ANIM_TMP
    if os.path.exists(frame_dir): shutil.rmtree(frame_dir)
    os.makedirs(frame_dir, exist_ok=True)

    reset()
    setup_render(frame_dir)
    setup_world()
    add_lights()
    add_shadow_catcher()
    new_objs, root, world_center, world_size = import_and_setup()
    add_camera_fitted(world_center, world_size)

    # Object_4 is the front bracket (movable in real tilting mounts)
    moving = bpy.data.objects.get("Object_4")
    if moving:
        keyframe_tilt(moving, root)

    bpy.ops.render.render(animation=True)

    out_webm = os.path.join(OUT_DIR, "mount-tilting.webm")
    if os.path.exists(out_webm): os.remove(out_webm)
    cmd = [FFMPEG, "-y", "-framerate", str(FPS),
           "-i", os.path.join(frame_dir, "frame_%04d.png"),
           "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p",
           "-b:v", "0", "-crf", "32", "-an", out_webm]
    subprocess.run(cmd, check=True)
    print(f"DONE -> {out_webm}")
    shutil.rmtree(frame_dir, ignore_errors=True)


if __name__ == "__main__":
    main()
