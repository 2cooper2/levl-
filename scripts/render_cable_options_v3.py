"""
render_cable_options_v3.py — animated cable-management cards (webm).

Common scene: a wall slab, a TV mounted at the upper third, and a small
duplex outlet at the lower third. Per scenario the cable behaves
differently:

  * cable-hidden  : cable's mid section animates back behind the wall,
                    leaving only the entry at the TV and the exit at
                    the outlet visible (cables routed inside wall).
  * cable-covers  : cable visible from TV to outlet, then a white
                    D-channel raceway slides DOWN and covers it.
  * cable-visible : cable just dangles from TV to outlet — static (slight
                    droop), the "cables visible is fine" option.

Output: public/assets/renders/cable-{hidden,covers,visible}.webm
        + matching alpha-preserved still PNGs (frame 1) for fallback.

Usage:
    /Applications/Blender.app/Contents/MacOS/Blender --background \
        --python scripts/render_cable_options_v3.py [-- hidden covers visible]
"""
import bpy, bmesh, math, os, subprocess, shutil, sys
from mathutils import Vector

HERE     = os.path.dirname(__file__)
PROJECT  = os.path.join(HERE, "..")
OUT_DIR  = os.path.join(PROJECT, "public", "assets", "renders")
FFMPEG   = "/Library/Frameworks/Python.framework/Versions/3.12/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1"

W, H    = 480, 780
FRAMES  = int(os.environ.get("LEVL_FRAMES", "96"))
FPS     = 24
SAMPLES = int(os.environ.get("LEVL_SAMPLES", "64"))


def reset():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for col in [bpy.data.meshes, bpy.data.materials, bpy.data.lights,
                bpy.data.cameras, bpy.data.curves]:
        for b in list(col):
            try: col.remove(b)
            except Exception: pass


def setup_render(out_dir):
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
    s.render.filepath = os.path.join(out_dir, "frame_")
    s.cycles.device = 'CPU'


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


def add_camera(fov_deg=42, cam_pos=(1.45, -1.95, 0.92), look_at=(0, 0, 0.92)):
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


def mat_pbr(name, color, metal=0.0, rough=0.5):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1.0)
    p.inputs["Metallic"].default_value   = metal
    p.inputs["Roughness"].default_value  = rough
    return m


def make_box(name, location, size, mat, bevel_w=0.003, bevel_segs=2):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    o = bpy.context.object; o.name = name; o.scale = size
    bpy.context.view_layer.update()
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bev = o.modifiers.new("Bevel", 'BEVEL'); bev.width = bevel_w; bev.segments = bevel_segs
    o.data.materials.clear(); o.data.materials.append(mat)
    return o


# ── Common scene: wall + TV + outlet ─────────────────────────────────────────
WALL_FRONT_Y = 0.0          # wall front face at y=0 (positive Y is into wall)
TV_FRONT_Y   = -0.06        # TV slab front face
OUTLET_Z     = 0.18         # outlet plate vertical center
TV_Z         = 1.55         # TV vertical center
TV_BOT_Z     = TV_Z - 0.20  # TV bottom edge
CABLE_TV_Z   = TV_BOT_Z + 0.02   # cable enters from just under the TV bottom
CABLE_OUT_Z  = OUTLET_Z + 0.04   # cable exits at outlet


def build_common_scene():
    wall_mat   = mat_pbr("Wall", (0.92, 0.90, 0.86), 0.0, 0.78)
    tv_face_mat = mat_pbr("TVFace", (0.04, 0.04, 0.05), 0.0, 0.20)
    tv_bezel_mat = mat_pbr("TVBezel", (0.06, 0.06, 0.07), 0.0, 0.45)
    outlet_plate_mat  = mat_pbr("OutletPlate",  (0.94, 0.93, 0.91), 0.0, 0.42)
    outlet_socket_mat = mat_pbr("OutletSocket", (0.10, 0.10, 0.11), 0.0, 0.55)

    # Wall slab (1.4 m wide × 6 cm deep × 1.85 m tall, centered at z=0.92)
    make_box("Wall", (0, 0.03, 0.92), (1.40, 0.06, 1.85), wall_mat, bevel_w=0.005)

    # TV — bezel + face
    TV_W, TV_H = 0.95, 0.55
    BEZEL_T    = 0.012
    # Bezel (slightly larger frame, behind face)
    make_box("TVBezel", (0, TV_FRONT_Y - 0.012, TV_Z),
             (TV_W + 2 * BEZEL_T, 0.040, TV_H + 2 * BEZEL_T), tv_bezel_mat, bevel_w=0.004)
    # Face (front panel)
    make_box("TVFace", (0, TV_FRONT_Y - 0.038, TV_Z),
             (TV_W, 0.005, TV_H), tv_face_mat, bevel_w=0.001)

    # Outlet plate (12 × 7 cm) flush with wall front face
    OW, OH, OT = 0.115, 0.072, 0.005
    make_box("OutletPlate", (0, WALL_FRONT_Y - OT/2, OUTLET_Z),
             (OW, OT, OH), outlet_plate_mat, bevel_w=0.0025)
    # One duplex socket frame + slots
    make_box("OutletFrame", (0, WALL_FRONT_Y - OT - 0.0005, OUTLET_Z),
             (0.058, 0.001, 0.092), outlet_socket_mat)
    for sz_off in (+0.018, -0.018):
        for sx in (-0.011, +0.011):
            make_box(f"Slot_{sz_off}_{sx}",
                     (sx, WALL_FRONT_Y - OT - 0.0015, OUTLET_Z + sz_off + 0.005),
                     (0.0034, 0.001, 0.014), outlet_socket_mat)


def make_cable_curve(name, points, radius=0.0105):
    """Bezier curve cable. Custom-aligned handles produce a smooth,
    continuous tube. Returns the object so callers can animate
    bevel_factor_start / bevel_factor_end on it."""
    curve = bpy.data.curves.new(name + "_curve", 'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 24
    curve.bevel_depth = radius
    curve.bevel_resolution = 8
    sp = curve.splines.new('BEZIER')
    sp.bezier_points.add(len(points) - 1)
    for i, (x, y, z) in enumerate(points):
        bp = sp.bezier_points[i]
        bp.handle_left_type = bp.handle_right_type = 'ALIGNED'
        bp.co = Vector((x, y, z))
    n = len(points)
    for i in range(n):
        bp = sp.bezier_points[i]
        prev_co = Vector(points[i - 1]) if i > 0     else Vector(points[i])
        next_co = Vector(points[i + 1]) if i < n - 1 else Vector(points[i])
        tangent = (next_co - prev_co)
        if tangent.length > 1e-6:
            tangent.normalize()
        seg_len = (next_co - prev_co).length / 3.0 if n > 1 else 0.05
        bp.handle_left  = bp.co - tangent * seg_len
        bp.handle_right = bp.co + tangent * seg_len
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_pbr("Cable", (0.05, 0.05, 0.06), 0.0, 0.55))
    return obj


# Cable spine — TV plug → in-front-of-wall droop → outlet plug
def cable_spine():
    Y_FRONT = TV_FRONT_Y - 0.020
    return [
        ( 0.00, TV_FRONT_Y,            CABLE_TV_Z),
        ( 0.02, Y_FRONT,               CABLE_TV_Z - 0.22),
        ( 0.00, Y_FRONT,               (CABLE_TV_Z + CABLE_OUT_Z) / 2),
        (-0.02, Y_FRONT,               CABLE_OUT_Z + 0.22),
        ( 0.00, WALL_FRONT_Y - 0.005,  CABLE_OUT_Z),
    ]


def add_static_plug(name, location):
    """Tiny dark plug nubbin that stays put while the cable slides behind
    the wall. Acts as the visible 'cable enters here' / 'cable exits
    here' anchor so the user can see where the cable goes."""
    plug_mat = mat_pbr("Plug_" + name, (0.05, 0.05, 0.06), 0.0, 0.45)
    return make_box("Plug_" + name, location, (0.022, 0.020, 0.022),
                    plug_mat, bevel_w=0.003)


# ── Scenario A: HIDDEN — cable slides back behind the wall ───────────────────
def setup_hidden():
    build_common_scene()
    cable = make_cable_curve("Cable", cable_spine())
    # Two static plugs marking where the cable enters/exits the wall
    add_static_plug("TV",     (0, TV_FRONT_Y + 0.005,        CABLE_TV_Z))
    add_static_plug("Outlet", (0, WALL_FRONT_Y - 0.012,      CABLE_OUT_Z))

    # Animate the cable's Y location: starts in front of wall, slides BACK
    # into the wall body and disappears behind it. The two plugs stay
    # anchored at TV bottom and outlet front, so the visual reads as
    # "cable being routed inside the wall, between the entry and exit
    # points".
    cable.location.y = 0.0
    cable.keyframe_insert(data_path="location", index=1, frame=1)
    cable.keyframe_insert(data_path="location", index=1,
                          frame=int(FRAMES * 0.10))
    cable.location.y = +0.140               # well behind wall back face (depth 0.06)
    cable.keyframe_insert(data_path="location", index=1,
                          frame=int(FRAMES * 0.80))
    cable.keyframe_insert(data_path="location", index=1, frame=FRAMES)


# ── Scenario B: COVERS — white raceway slides down over the visible cable ────
def setup_covers():
    build_common_scene()
    make_cable_curve("Cable", cable_spine())

    cover_top    = CABLE_TV_Z - 0.02
    cover_bot    = CABLE_OUT_Z + 0.02
    cover_height = cover_top - cover_bot
    cover_z_ctr  = (cover_top + cover_bot) / 2
    cover_mat = mat_pbr("Raceway", (0.95, 0.94, 0.92), 0.0, 0.42)
    # Cover sits IN FRONT of the cable (cable spine at Y ≈ -0.080); cover
    # front face at Y ≈ -0.135, back face at Y ≈ -0.080, fully enclosing
    # the cable laterally + in Y.
    cover = make_box("Raceway",
                     (0, -0.110, cover_z_ctr),
                     (0.075, 0.055, cover_height),
                     cover_mat, bevel_w=0.020, bevel_segs=4)

    # Slide DOWN from well above the TV to its final position over the cable.
    start_z = TV_Z + 0.6 + cover_height
    cover.location.z = start_z
    cover.keyframe_insert("location", index=2, frame=1)
    cover.location.z = cover_z_ctr
    cover.keyframe_insert("location", index=2, frame=int(FRAMES * 0.75))
    cover.keyframe_insert("location", index=2, frame=FRAMES)


# ── Scenario C: VISIBLE — cable just dangles, no animation ───────────────────
def setup_visible():
    build_common_scene()
    make_cable_curve("Cable", cable_spine())


# ── Driver ───────────────────────────────────────────────────────────────────
SCENARIOS = {
    "hidden":  setup_hidden,
    "covers":  setup_covers,
    "visible": setup_visible,
}


def render_one(name):
    out_dir = os.path.join(OUT_DIR, f"_anim_cable_{name}")
    if os.path.exists(out_dir): shutil.rmtree(out_dir)
    os.makedirs(out_dir, exist_ok=True)

    reset()
    setup_render(out_dir)
    setup_world()
    add_camera()
    add_lights()
    add_shadow_catcher()
    SCENARIOS[name]()

    bpy.ops.render.render(animation=True)

    out_webm = os.path.join(OUT_DIR, f"cable-{name}.webm")
    if os.path.exists(out_webm): os.remove(out_webm)
    cmd = [FFMPEG, "-y", "-framerate", str(FPS),
           "-i", os.path.join(out_dir, "frame_%04d.png"),
           "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p",
           "-b:v", "0", "-crf", "32", "-an", out_webm]
    subprocess.run(cmd, check=True)
    print(f"DONE -> {out_webm}", flush=True)

    # Also save first frame as fallback PNG.
    import shutil as _sh
    f1 = os.path.join(out_dir, "frame_0001.png")
    fallback_png = os.path.join(OUT_DIR, f"cable-{name}.png")
    if os.path.exists(f1):
        _sh.copyfile(f1, fallback_png)
        print(f"DONE -> {fallback_png}", flush=True)

    shutil.rmtree(out_dir, ignore_errors=True)


def main():
    keys = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else list(SCENARIOS)
    for k in keys:
        if k in SCENARIOS:
            render_one(k)
        else:
            print(f"[skip unknown] {k}")


if __name__ == "__main__":
    main()
