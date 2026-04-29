"""
render_mount_ceiling_cad.py — ceiling mount, matching the leadzm-style
reference (small ceiling plate → long drop pole with mid coupler →
horizontal TV plate at the bottom).

Uses Object_4 from sketchfab_mount_fixed.glb as the bottom TV plate
(rotated horizontal). Same render rig as render_mount_tilt_cad.py
(AgX, lavender world, 3-point lighting, shadow catcher).
"""
import bpy, math, os
from mathutils import Vector

HERE     = os.path.dirname(__file__)
PROJECT  = os.path.join(HERE, "..")
MODELS   = os.path.join(HERE, "models")
OUT_DIR  = os.path.join(PROJECT, "public", "assets", "renders")

PLATE_GLB = os.path.join(MODELS, "sketchfab_mount_fixed.glb")

W, H    = 480, 780
SAMPLES = int(os.environ.get("LEVL_SAMPLES", "192"))


def reset():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for col in [bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras]:
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
    s.render.resolution_x = W
    s.render.resolution_y = H
    s.render.resolution_percentage = 100
    s.render.film_transparent = True
    s.view_settings.view_transform = 'AgX'
    s.view_settings.look = 'AgX - Medium High Contrast'
    s.render.image_settings.file_format = 'PNG'
    s.render.image_settings.color_mode = 'RGBA'
    s.render.filepath = out_path
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


def add_camera(fov_deg=42, cam_pos=(1.85, -1.74, 1.22), look_at=(0, 0, 1.22)):
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
    bpy.context.object.is_shadow_catcher = True


def black_metal_mat():
    mat = bpy.data.materials.new("BlackMetal")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.045, 0.045, 0.05, 1.0)
    if "Metallic"  in bsdf.inputs: bsdf.inputs["Metallic"].default_value  = 0.65
    if "Roughness" in bsdf.inputs: bsdf.inputs["Roughness"].default_value = 0.28
    return mat


def make_box(name, location, size, mat, bevel_w=0.003, bevel_segments=2):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    o = bpy.context.object; o.name = name; o.scale = size
    bpy.context.view_layer.update()
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bev = o.modifiers.new("Bevel", 'BEVEL'); bev.width = bevel_w; bev.segments = bevel_segments
    o.data.materials.clear(); o.data.materials.append(mat)
    return o


def make_cylinder(name, location, radius, depth, mat, axis='Z',
                  segments=32, bevel_w=0.0015):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth,
                                        vertices=segments, location=location)
    o = bpy.context.object; o.name = name
    if axis == 'X':
        o.rotation_euler[1] = math.radians(90)
    elif axis == 'Y':
        o.rotation_euler[0] = math.radians(90)
    bpy.context.view_layer.update()
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bev = o.modifiers.new("Bevel", 'BEVEL'); bev.width = bevel_w; bev.segments = 2
    o.data.materials.clear(); o.data.materials.append(mat)
    return o


def _world_bbox(o):
    mins = [float('inf')]*3; maxs = [float('-inf')]*3
    for c in o.bound_box:
        w = o.matrix_world @ Vector(c)
        for i in range(3):
            mins[i] = min(mins[i], w[i]); maxs[i] = max(maxs[i], w[i])
    return mins, maxs


def import_tv_plate(mat, target_x_width=1.10):
    """Import Object_4 from sketchfab_mount_fixed.glb (the wall plate w/
    VESA slot holes), rotate 90° around X so it lies HORIZONTAL with its
    long axis along world X (length stays X, original Z height becomes Y
    depth, original Y depth becomes Z thickness). Scale uniformly so the
    horizontal width = target_x_width. Returns the plate object after
    transforms applied."""
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=PLATE_GLB)
    new_objs = [o for o in bpy.context.scene.objects if o not in before]
    plate = bpy.data.objects.get("Object_4")
    for o in new_objs:
        if o is plate: continue
        bpy.data.objects.remove(o, do_unlink=True)
    if plate is None:
        return None
    plate.data.materials.clear()
    plate.data.materials.append(mat)

    # Rotate 90° around X — Y/Z axes swap. Apply so the bbox is correct.
    plate.rotation_euler[0] = math.radians(90)
    bpy.context.view_layer.update()
    bpy.ops.object.select_all(action='DESELECT')
    plate.select_set(True)
    bpy.context.view_layer.objects.active = plate
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)

    # Scale so the horizontal X-width hits target.
    bpy.context.view_layer.update()
    pmins, pmaxs = _world_bbox(plate)
    sc = target_x_width / max(pmaxs[0] - pmins[0], 0.001)
    plate.scale = (sc, sc, sc)
    bpy.context.view_layer.update()
    pmins, pmaxs = _world_bbox(plate)
    cx = (pmins[0] + pmaxs[0]) / 2
    cy = (pmins[1] + pmaxs[1]) / 2
    plate.location.x -= cx
    plate.location.y -= cy
    bpy.context.view_layer.update()
    return plate


def build_ceiling_mount(mat):
    plate = import_tv_plate(mat, target_x_width=0.92)
    if plate is None:
        return None

    # Plate's current Z range (after rotation it's a thin slab — we'll lift
    # it so its top face sits at PLATE_TOP_Z).
    bpy.context.view_layer.update()
    pmins, pmaxs = _world_bbox(plate)
    plate_top_z_native = pmaxs[2]
    PLATE_TOP_Z = 0.55                         # top face of plate
    plate.location.z += (PLATE_TOP_Z - plate_top_z_native)
    bpy.context.view_layer.update()
    pmins, pmaxs = _world_bbox(plate)

    # Ceiling plate (small square at the very top of the assembly)
    CEIL_PLATE_Z = 1.95
    CEIL_PLATE_S = 0.20                        # 20 cm square
    CEIL_PLATE_T = 0.014                       # 14 mm thick
    make_box("CeilPlate",
             (0, 0, CEIL_PLATE_Z + CEIL_PLATE_T / 2),
             (CEIL_PLATE_S, CEIL_PLATE_S, CEIL_PLATE_T),
             mat, bevel_w=0.005)

    # Pole — long thin cylinder from ceiling plate down to TV plate top.
    POLE_R = 0.022                             # 22 mm radius (44 mm diameter)
    pole_top = CEIL_PLATE_Z
    pole_bot = pmaxs[2]                        # top face of TV plate
    pole_h   = pole_top - pole_bot
    make_cylinder("Pole",
                  (0, 0, (pole_top + pole_bot) / 2),
                  POLE_R, pole_h, mat, axis='Z')

    # Top mounting block — beefier square block joining pole to ceiling
    # plate (matches the reference's small bracket at top of pole).
    TOP_BLOCK_H = 0.060
    make_box("PoleTopBlock",
             (0, 0, CEIL_PLATE_Z - TOP_BLOCK_H / 2),
             (0.066, 0.066, TOP_BLOCK_H), mat, bevel_w=0.004)

    # Mid coupler — slightly thicker collar around the pole (the
    # tightening clamp visible mid-pole in the reference).
    COUPLER_Z = pole_bot + pole_h * 0.40
    make_cylinder("PoleCoupler",
                  (0, 0, COUPLER_Z), 0.034, 0.040, mat, axis='Z')

    # Bottom mounting bracket — small block where pole meets the TV plate.
    BOT_BLOCK_H = 0.040
    make_box("PoleBotBlock",
             (0, 0, pole_bot + BOT_BLOCK_H / 2),
             (0.072, 0.072, BOT_BLOCK_H), mat, bevel_w=0.004)

    return plate


def main():
    out_png = os.path.join(OUT_DIR, "mount-ceiling.png")

    reset()
    setup_render(out_png)
    setup_world()
    add_camera()
    add_lights()
    add_shadow_catcher()

    mat = black_metal_mat()
    plate = build_ceiling_mount(mat)
    if plate is None:
        print("[ERR] plate import failed"); return

    bpy.ops.render.render(write_still=True)
    print(f"DONE -> {out_png}")

    try:
        from PIL import Image
        out_webp = out_png.replace(".png", ".webp")
        Image.open(out_png).save(out_webp, "WEBP", quality=85)
        print(f"DONE -> {out_webp}")
    except Exception as e:
        print(f"[skip webp] {e}")


if __name__ == "__main__":
    main()
