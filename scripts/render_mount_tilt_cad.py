"""
render_mount_tilt_cad.py — Sketchfab tilting-mount asset with cloth-sim strings:
  * Source GLB: sketchfab_mount_tilting.glb (elizbarzoidze 600x400 20° tilt)
    — long thin vertical TV-side bracket rails, central tilt-detent pivot
    mechanism, top/bottom clamping bolts that match the user's reference.
  * The asset's Object_3 / Object_4 split is by material zones, not by
    plate-vs-bracket — rotating only one scrambles the visible surfaces.
    So all GLB objects (Object_2 + Object_3 + Object_4) are parented to a
    single TiltPivot and rocked together at low amplitude. The asset's
    natural pose already shows a forward tilt — animation is a small ±4°
    sway around that pose.
  * Pull strings hang from each bracket-rail bottom — REAL Blender cloth
    simulation (pinned top, free bottom, gravity + air damping, baked).
"""
import bpy, bmesh, math, os, subprocess, shutil
from mathutils import Vector, Matrix

HERE     = os.path.dirname(__file__)
PROJECT  = os.path.join(HERE, "..")
MODELS   = os.path.join(HERE, "models")
OUT_DIR  = os.path.join(PROJECT, "public", "assets", "renders")
ANIM_TMP = os.path.join(OUT_DIR, "anim_tilt_cad")
FFMPEG   = "/Library/Frameworks/Python.framework/Versions/3.12/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1"

TILTING_GLB = os.path.join(MODELS, "sketchfab_mount_tilting.glb")

W, H    = 480, 780
FRAMES  = int(os.environ.get("LEVL_FRAMES", "144"))
FPS     = 24
SAMPLES = int(os.environ.get("LEVL_SAMPLES", "96"))


def reset():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for col in [bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras]:
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


def add_camera(fov_deg=42, cam_pos=(1.85, -1.62, 1.10), look_at=(0, 0, 1.00)):
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


def reparent(o, p):
    old = o.matrix_world.copy()
    o.parent = p
    o.matrix_parent_inverse = p.matrix_world.inverted()
    o.matrix_world = old


def _world_bbox(o):
    mins = [float('inf')]*3; maxs = [float('-inf')]*3
    for c in o.bound_box:
        w = o.matrix_world @ Vector(c)
        for i in range(3):
            mins[i] = min(mins[i], w[i]); maxs[i] = max(maxs[i], w[i])
    return mins, maxs


def import_assembly(mat):
    """Import sketchfab_mount_tilting.glb. The asset is one rigid tilt-mount
    in its naturally-tilted pose; treat all GLB meshes as a single rigid
    group. Scale uniformly so the assembly width = 1.10m, center at origin,
    lift to Z=1.00. Returns the list of GLB mesh objects."""
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=TILTING_GLB)
    new_objs = [o for o in bpy.context.scene.objects if o not in before]
    meshes = [o for o in new_objs if o.type == 'MESH']
    for o in meshes:
        o.data.materials.clear()
        o.data.materials.append(mat)

    # Compute combined bbox across all meshes for proper scaling/centering
    bpy.context.view_layer.update()
    mins = [float('inf')]*3; maxs = [float('-inf')]*3
    for o in meshes:
        m, M = _world_bbox(o)
        for i in range(3):
            mins[i] = min(mins[i], m[i]); maxs[i] = max(maxs[i], M[i])
    sc = 1.10 / max(maxs[0] - mins[0], 0.001)
    for o in meshes:
        o.scale = (sc * o.scale[0], sc * o.scale[1], sc * o.scale[2])
    bpy.context.view_layer.update()

    # Recompute combined bbox after scale; center XY, lift so vertical
    # midpoint = 1.00.
    mins = [float('inf')]*3; maxs = [float('-inf')]*3
    for o in meshes:
        m, M = _world_bbox(o)
        for i in range(3):
            mins[i] = min(mins[i], m[i]); maxs[i] = max(maxs[i], M[i])
    cx = (mins[0] + maxs[0]) / 2
    cy = (mins[1] + maxs[1]) / 2
    cz = (mins[2] + maxs[2]) / 2
    dx, dy, dz = -cx, -cy, (1.00 - cz)
    for o in meshes:
        o.location.x += dx
        o.location.y += dy
        o.location.z += dz
    bpy.context.view_layer.update()
    return meshes


def make_cloth_string(name, world_top, mat, length=0.30, radius=0.012,
                      segments=24, sides=10):
    """Subdivided cylinder mesh with Cloth modifier. Top ring is in 'Pin'
    vertex group with weight 1.0 → the cloth solver clamps those verts to
    their object-local origin position. Object is parented to anchor empty,
    so when the anchor moves with the rail, the pinned top moves in WORLD,
    and gravity + bending make the rest swing physically."""
    mesh = bpy.data.meshes.new(name + "_mesh")
    obj  = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    bm = bmesh.new()
    rings = []
    for i in range(segments + 1):
        z = -i * (length / segments)         # local: top at z=0
        ring = []
        for j in range(sides):
            ang = 2 * math.pi * j / sides
            ring.append(bm.verts.new((radius * math.cos(ang),
                                      radius * math.sin(ang), z)))
        rings.append(ring)
    bm.verts.ensure_lookup_table()
    for i in range(segments):
        for j in range(sides):
            j2 = (j + 1) % sides
            bm.faces.new([rings[i][j], rings[i][j2],
                          rings[i+1][j2], rings[i+1][j]])
    bm.faces.new(rings[0])                       # top cap
    bm.faces.new(list(reversed(rings[segments]))) # bottom cap
    bm.to_mesh(mesh); bm.free()
    obj.data.materials.append(mat)

    # Place object so its origin (z=0 local) sits at world_top — set the
    # matrix directly so the world transform is committed *before* reparent
    # reads matrix_world.
    obj.matrix_world = Matrix.Translation(Vector(world_top))
    bpy.context.view_layer.update()

    # Pin group — top ring (vertices with z >= -1e-4)
    vg = obj.vertex_groups.new(name="Pin")
    top_idxs = [v.index for v in obj.data.vertices if v.co.z > -1e-4]
    vg.add(top_idxs, 1.0, 'REPLACE')

    cloth = obj.modifiers.new("Cloth", 'CLOTH')
    cs = cloth.settings
    cs.vertex_group_mass     = "Pin"
    cs.pin_stiffness         = 1.0
    cs.mass                  = 0.012          # 12g per cord — light pull cord
    cs.tension_stiffness     = 35             # rigid in length
    cs.compression_stiffness = 35
    cs.shear_stiffness       = 35
    cs.bending_stiffness     = 0.04           # very floppy → swings
    cs.bending_damping       = 0.4
    cs.air_damping           = 1.8            # natural settle
    cs.tension_damping       = 5
    cs.compression_damping   = 5
    cs.shear_damping         = 5
    cloth.collision_settings.use_collision      = False
    cloth.collision_settings.use_self_collision = False
    return obj


def build_tilt_mount():
    mat = black_metal_mat()
    meshes = import_assembly(mat)
    if not meshes:
        return None, [], None

    bpy.context.view_layer.update()
    # Combined assembly bbox after import_assembly's centering/lift
    mins = [float('inf')]*3; maxs = [float('-inf')]*3
    for o in meshes:
        m, M = _world_bbox(o)
        for i in range(3):
            mins[i] = min(mins[i], m[i]); maxs[i] = max(maxs[i], M[i])
    z_top = maxs[2]
    z_bot = mins[2]
    z_ctr = (z_top + z_bot) / 2
    y_back  = maxs[1]                       # wall side
    y_front = mins[1]                       # closest to camera
    y_ctr   = (y_front + y_back) / 2

    # Tilt pivot at assembly back-mid (where the central detent sits in the
    # asset, against the wall plate). Whole rigid group rocks on this line.
    bpy.ops.object.empty_add(type='PLAIN_AXES',
        location=(0, y_back, z_ctr))
    tilt = bpy.context.object
    tilt.name = "TiltPivot"

    for o in meshes:
        reparent(o, tilt)

    # String anchors on each outer rail bottom (rails are at the X extremes)
    rail_dx = (maxs[0] - mins[0]) * 0.46
    strings = []
    for side, sx in (("L", -rail_dx), ("R", +rail_dx)):
        anchor_pos = (sx, y_front, z_bot + 0.02)
        bpy.ops.object.empty_add(type='PLAIN_AXES', location=anchor_pos)
        anchor = bpy.context.object
        anchor.name = f"StringAnchor_{side}"
        reparent(anchor, tilt)
        cord = make_cloth_string(f"PullString_{side}", anchor_pos, mat)
        reparent(cord, anchor)
        strings.append({"anchor": anchor, "cord": cord})

    return tilt, strings, meshes[0]


def keyframe_tilt(tilt):
    """Whole asset gently rocks ±5° around X at the back-mid pivot. The asset
    is naturally pre-tilted, so the small sway shows the bracket-tilt
    motion without distorting the plate too much. Cloth-sim strings swing
    naturally from the bracket motion."""
    AMP = math.radians(5)
    for f in range(1, FRAMES + 1):
        t = (f - 1) / FRAMES
        tilt.rotation_euler[0] = AMP * math.sin(2 * math.pi * t)
        tilt.keyframe_insert("rotation_euler", index=0, frame=f)


def bake_cloth():
    """Set cloth point-cache range = scene range, then bake all caches."""
    s = bpy.context.scene
    for obj in bpy.data.objects:
        for mod in obj.modifiers:
            if mod.type == 'CLOTH':
                pc = mod.point_cache
                pc.frame_start = s.frame_start
                pc.frame_end   = s.frame_end
    s.frame_set(s.frame_start)
    bpy.ops.ptcache.bake_all(bake=True)


def main():
    if os.path.exists(ANIM_TMP): shutil.rmtree(ANIM_TMP)
    os.makedirs(ANIM_TMP, exist_ok=True)

    reset()
    setup_render(ANIM_TMP)
    setup_world()
    add_camera()
    add_lights()
    add_shadow_catcher()
    tilt, strings, plate = build_tilt_mount()
    if tilt is None:
        print("[ERR] assembly import failed"); return
    keyframe_tilt(tilt)
    bake_cloth()

    bpy.ops.render.render(animation=True)

    out_webm = os.path.join(OUT_DIR, "mount-tilting.webm")
    if os.path.exists(out_webm): os.remove(out_webm)
    cmd = [FFMPEG, "-y", "-framerate", str(FPS),
           "-i", os.path.join(ANIM_TMP, "frame_%04d.png"),
           "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p",
           "-b:v", "0", "-crf", "32", "-an", out_webm]
    subprocess.run(cmd, check=True)
    print(f"DONE -> {out_webm}")
    shutil.rmtree(ANIM_TMP, ignore_errors=True)


if __name__ == "__main__":
    main()
