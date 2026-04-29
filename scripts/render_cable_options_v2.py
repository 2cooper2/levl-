"""
render_cable_options_v2.py — three cable-management option cards, in the
TV-mount-card style (matches mount-fixed / mount-tilting / mount-ceiling):
480 × 780 PNG + WEBP with alpha, lavender world, AgX tonemap,
3-point studio lighting, shadow catcher.

Each card centers a different cable element on a thin wall slab:
  - cable-hidden   : white electrical outlet plate (cables behind wall)
  - cable-covers   : vertical white D-channel raceway on wall surface
  - cable-visible  : draped black HDMI cable + plug, hanging on wall

Output: public/assets/renders/cable-{hidden,covers,visible}.{png,webp}
"""
import bpy, math, os, sys
from mathutils import Vector

HERE     = os.path.dirname(__file__)
PROJECT  = os.path.join(HERE, "..")
OUT_DIR  = os.path.join(PROJECT, "public", "assets", "renders")

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


def add_camera(fov_deg=38, cam_pos=(0.95, -0.92, 0.42), look_at=(0, 0, 0.32)):
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


def make_cylinder(name, location, radius, depth, mat, axis='Z', segs=24,
                  bevel_w=0.0015):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth,
                                        vertices=segs, location=location)
    o = bpy.context.object; o.name = name
    if axis == 'X':   o.rotation_euler[1] = math.radians(90)
    elif axis == 'Y': o.rotation_euler[0] = math.radians(90)
    bpy.context.view_layer.update()
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bev = o.modifiers.new("Bevel", 'BEVEL'); bev.width = bevel_w; bev.segments = 2
    o.data.materials.clear(); o.data.materials.append(mat)
    return o


# ── Card A: HIDDEN — outlet plate (suggests cables routed inside the wall) ──
def build_hidden():
    plate_mat  = mat_pbr("OutletPlate", (0.94, 0.93, 0.91), metal=0.0, rough=0.42)
    socket_mat = mat_pbr("Socket",      (0.08, 0.08, 0.09), metal=0.0, rough=0.55)
    screw_mat  = mat_pbr("Screw",       (0.62, 0.62, 0.66), metal=0.85, rough=0.28)

    # Plate (28 cm wide × 36 cm tall × 1.0 cm thick) — large so it dominates
    # the frame; centered at z=0.32, faces -Y (toward camera).
    PW, PH, PT = 0.28, 0.36, 0.010
    Z0         = 0.32
    Y_FRONT    = 0.0                  # plate front face at y=0
    plate = make_box("Plate", (0, Y_FRONT + PT/2, Z0),
                     (PW, PT, PH), plate_mat, bevel_w=0.012, bevel_segs=4)

    # Two duplex socket frames (5 cm tall, 5 cm wide), upper + lower
    for i, sz_off in enumerate((+0.075, -0.075)):
        make_box("SocketFrame_%d" % i,
                 (0, Y_FRONT - 0.0005, Z0 + sz_off),
                 (0.06, 0.001, 0.10), socket_mat)
        # Two outlet receptacles (top + bottom of each frame)
        for j, sub_sz in enumerate((+0.025, -0.025)):
            cz = Z0 + sz_off + sub_sz
            # Outlet body (rounded square)
            make_box("Outlet_%d_%d" % (i, j),
                     (0, Y_FRONT - 0.001, cz),
                     (0.046, 0.0015, 0.038), socket_mat, bevel_w=0.005)
            # Vertical slot pair
            for k, sx in enumerate((-0.011, +0.011)):
                make_box("Slot_%d_%d_%d" % (i, j, k),
                         (sx, Y_FRONT - 0.0015, cz + 0.005),
                         (0.0034, 0.001, 0.014), socket_mat)
            # Ground hole below
            make_cylinder("Gnd_%d_%d" % (i, j),
                          (0, Y_FRONT - 0.0015, cz - 0.012),
                          0.0036, 0.001, socket_mat, axis='Y', segs=16)

    # Centre screw heads (between the two duplex frames, top + bottom of plate)
    for i, sz in enumerate((+PH/2 - 0.018, -PH/2 + 0.018)):
        make_cylinder("Screw_%d" % i,
                      (0, Y_FRONT - 0.001, Z0 + sz),
                      0.005, 0.002, screw_mat, axis='Y', segs=18)


# ── Card B: COVERS — D-channel raceway segment ───────────────────────────────
def build_covers():
    cover_mat = mat_pbr("Raceway", (0.95, 0.94, 0.92), metal=0.0, rough=0.42)
    seam_mat  = mat_pbr("Seam",    (0.72, 0.71, 0.68), metal=0.0, rough=0.55)

    # Long slim white channel running vertically. Big and centered.
    CW, CD, CH = 0.10, 0.055, 0.62
    Z0 = 0.32
    make_box("Raceway", (0, CD/2, Z0),
             (CW, CD, CH), cover_mat, bevel_w=0.024, bevel_segs=6)

    # Modular section seams (thin horizontal grooves)
    for i, z_off in enumerate((-0.22, -0.06, 0.10, 0.26)):
        make_box("Seam_%d" % i, (0, -0.0008, Z0 + z_off),
                 (CW * 0.96, 0.001, 0.0018), seam_mat)


# ── Card C: VISIBLE — looped black cable with two HDMI plugs ─────────────────
def build_visible():
    cable_mat = mat_pbr("CableJacket", (0.05, 0.05, 0.06), metal=0.0, rough=0.55)
    plug_mat  = mat_pbr("PlugShell",   (0.06, 0.06, 0.07), metal=0.0, rough=0.45)
    pin_mat   = mat_pbr("PlugPins",    (0.78, 0.78, 0.82), metal=0.85, rough=0.22)

    # S-curve cable, draping in front of an empty lavender bg.
    curve = bpy.data.curves.new("CableCurve", type='CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = 0.012          # cable radius ~12 mm — visibly thick
    curve.bevel_resolution = 6
    sp = curve.splines.new('BEZIER')
    pts = [
        (-0.16, 0.00, 0.62),           # top — first plug end
        (+0.10, 0.00, 0.50),
        (-0.10, 0.00, 0.34),
        (+0.12, 0.00, 0.18),
        (-0.06, 0.00, 0.04),           # bottom — second plug end
    ]
    sp.bezier_points.add(len(pts) - 1)
    for i, (x, y, z) in enumerate(pts):
        bp = sp.bezier_points[i]
        bp.co = (x, y, z)
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    obj = bpy.data.objects.new("Cable", curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(cable_mat)

    # Two HDMI-style plugs at each end
    def plug(name_suffix, base_xyz):
        bx, by, bz = base_xyz
        # Body — fat plug
        make_box("PlugBody_" + name_suffix,
                 (bx, by, bz),
                 (0.075, 0.044, 0.034), plug_mat,
                 bevel_w=0.005, bevel_segs=3)
        # Metal tip
        make_box("PlugTip_" + name_suffix,
                 (bx, by - 0.025, bz),
                 (0.058, 0.018, 0.022), pin_mat, bevel_w=0.0025)

    plug("top", (pts[0][0], pts[0][1], pts[0][2] + 0.018))
    plug("bot", (pts[-1][0], pts[-1][1], pts[-1][2] - 0.018))


# ── Driver ───────────────────────────────────────────────────────────────────
BUILDERS = {
    "cable-hidden":  build_hidden,
    "cable-covers":  build_covers,
    "cable-visible": build_visible,
}


def render_one(name, builder):
    out_png = os.path.join(OUT_DIR, name + ".png")
    print(f"[1/8] reset", flush=True);            reset()
    print(f"[2/8] setup_render", flush=True);     setup_render(out_png)
    print(f"[3/8] setup_world", flush=True);      setup_world()
    print(f"[4/8] add_camera", flush=True);       add_camera()
    print(f"[5/8] add_lights", flush=True);       add_lights()
    print(f"[6/8] shadow_catcher", flush=True);   add_shadow_catcher()
    print(f"[7/8] builder", flush=True);          builder()
    print(f"[8/8] render", flush=True)
    bpy.ops.render.render(write_still=True)
    print(f"DONE -> {out_png}")


def main():
    keys = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else list(BUILDERS)
    for k in keys:
        if k in BUILDERS:
            render_one(k, BUILDERS[k])
        else:
            print(f"[skip unknown] {k}")


if __name__ == "__main__":
    main()
