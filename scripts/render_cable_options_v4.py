"""
render_cable_options_v4.py — animated cable-management cards (webm) with
PBR drywall + Sketchfab TV + a translucent "see-through" wall strip
on the hidden scenario.

Common scene
------------
* Wall slab: 1.4 m wide × 0.06 m deep × 1.85 m tall, with the same PBR
  drywall material used by render_wall_types.py (beige_wall_002 albedo +
  normal + roughness).
* TV: sketchfab_tv.glb, scaled and positioned at the upper third of the
  wall, mounted slightly off the wall face.
* Outlet: white duplex receptacle plate at the lower third of the wall.

Per scenario
------------
* cable-hidden  : cable goes from TV back into the wall through a small
                  hole, runs DOWN inside the wall (visible through a
                  vertical translucent "see-through" strip), exits at
                  the outlet. Animation: the inside-wall cable
                  progressively extends from the entry hole down to the
                  exit.
* cable-covers  : cable visible TV→outlet. White D-channel cable cover
                  starts at the TV bottom (Z scale near 0) and animates
                  GROWING downward, eventually covering the entire
                  cable.
* cable-visible : cable just dangles from TV to outlet, no animation.

Output: public/assets/renders/cable-{hidden,covers,visible}.webm
        + matching first-frame PNG fallback.
"""
import bpy, math, os, subprocess, shutil, sys
from mathutils import Vector

HERE     = os.path.dirname(__file__)
PROJECT  = os.path.join(HERE, "..")
MODELS   = os.path.join(HERE, "models")
TEX_DIR  = os.path.join(PROJECT, "tmp_textures", "walls")
OUT_DIR  = os.path.join(PROJECT, "public", "assets", "renders")
FFMPEG   = "/Library/Frameworks/Python.framework/Versions/3.12/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1"

TV_GLB    = os.path.join(MODELS, "sketchfab_tv.glb")
DW_DIFF   = os.path.join(TEX_DIR, "beige_wall_002_Diffuse_2k.jpg")
DW_NORM   = os.path.join(TEX_DIR, "beige_wall_002_nor_gl_2k.jpg")
DW_ROUGH  = os.path.join(TEX_DIR, "beige_wall_002_Rough_2k.jpg")
DW_DISP   = os.path.join(TEX_DIR, "beige_wall_002_Displacement_2k.jpg")

W, H    = 480, 780
FRAMES  = int(os.environ.get("LEVL_FRAMES", "96"))
FPS     = 24
SAMPLES = int(os.environ.get("LEVL_SAMPLES", "64"))


def reset():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for col in [bpy.data.meshes, bpy.data.materials, bpy.data.lights,
                bpy.data.cameras, bpy.data.curves, bpy.data.images]:
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


def add_camera(fov_deg=42, cam_pos=(1.85, -2.05, 0.85), look_at=(0, 0, 0.85)):
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
        ("Top",     ( 0.0, -0.8, 6.0),  45),
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


def mat_pbr(name, color, metal=0.0, rough=0.5, alpha=1.0, transmission=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1.0)
    p.inputs["Metallic"].default_value   = metal
    p.inputs["Roughness"].default_value  = rough
    if "Alpha" in p.inputs:
        p.inputs["Alpha"].default_value = alpha
    if alpha < 1.0:
        m.blend_method = 'BLEND'
        try: m.shadow_method = 'HASHED'
        except Exception: pass
    if "Transmission Weight" in p.inputs and transmission > 0:
        p.inputs["Transmission Weight"].default_value = transmission
    return m


def make_box(name, location, size, mat, bevel_w=0.003, bevel_segs=2):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    o = bpy.context.object; o.name = name; o.scale = size
    bpy.context.view_layer.update()
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bev = o.modifiers.new("Bevel", 'BEVEL'); bev.width = bevel_w; bev.segments = bevel_segs
    o.data.materials.clear(); o.data.materials.append(mat)
    return o


# ── PBR drywall material — same recipe as render_wall_types.py ───────────────
def drywall_mat(tile_u=2.0, tile_v=2.8, norm_strength=0.8, disp_scale=0.0):
    """Drywall PBR: diffuse + normal + roughness. Geometry displacement is
    OFF here (disp_scale=0) so we can keep a thin slab without subdividing
    expensively — bump-via-normal carries enough surface micro-detail."""
    m = bpy.data.materials.new("Drywall")
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    out  = nt.nodes.new('ShaderNodeOutputMaterial')
    bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
    tc   = nt.nodes.new('ShaderNodeTexCoord')
    mp   = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (tile_u, tile_v, 1.0)
    nt.links.new(tc.outputs['UV'], mp.inputs['Vector'])
    nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

    def img(path, cs):
        i = bpy.data.images.load(path); i.colorspace_settings.name = cs
        nd = nt.nodes.new('ShaderNodeTexImage'); nd.image = i
        nt.links.new(mp.outputs['Vector'], nd.inputs['Vector'])
        return nd

    # Skip the bundled diffuse (it's too orange in this lighting). Use a
    # neutral off-white base and let the normal+roughness maps add the
    # micro-surface drywall feel.
    bsdf.inputs['Base Color'].default_value = (0.92, 0.91, 0.88, 1.0)
    if os.path.exists(DW_ROUGH):
        r = img(DW_ROUGH, 'Non-Color')
        nt.links.new(r.outputs['Color'], bsdf.inputs['Roughness'])
    if os.path.exists(DW_NORM):
        n = img(DW_NORM, 'Non-Color')
        nm = nt.nodes.new('ShaderNodeNormalMap')
        nm.inputs['Strength'].default_value = norm_strength
        nt.links.new(n.outputs['Color'], nm.inputs['Color'])
        nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    bsdf.inputs['Metallic'].default_value = 0.0
    return m


# ── Common scene constants ───────────────────────────────────────────────────
WALL_FRONT_Y = 0.0
TV_FRONT_FACE_Y = -0.085      # front of TV is forward of wall front
TV_Z = 1.30                   # TV vertical center
TV_BOT_Z = TV_Z - 0.20        # TV bottom edge
OUTLET_Z = 0.18               # outlet plate vertical center
CABLE_TV_Z   = TV_BOT_Z - 0.005     # cable starts just below TV bottom
CABLE_OUT_Z  = OUTLET_Z + 0.04      # cable end at outlet
CABLE_X_OFF  = 0.0                  # cable centered horizontally


def build_wall():
    """Wall slab — wide backdrop with drywall PBR + UV-unwrap."""
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.03, 0.85))
    wall = bpy.context.object; wall.name = "Wall"
    wall.scale = (2.50, 0.06, 2.50)
    bpy.context.view_layer.update()
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bpy.ops.object.editmode_toggle()
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.005)
    bpy.ops.object.editmode_toggle()
    wall.data.materials.append(drywall_mat())
    return wall


def screen_mat_glossy(name="TVScreen"):
    """Glossy glass-like TV screen with clearcoat for window-pane reflection.
    Base is near-black, clearcoat adds the bright highlight that makes a
    real flat-panel TV read as glass instead of flat black."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (0.008, 0.008, 0.012, 1.0)
    p.inputs["Metallic"].default_value   = 0.0
    p.inputs["Roughness"].default_value  = 0.05
    # Coat (Blender 4+) — adds a glass-like top layer over the base
    if "Coat Weight" in p.inputs:
        p.inputs["Coat Weight"].default_value     = 1.0
        p.inputs["Coat Roughness"].default_value  = 0.04
    return m


def build_tv():
    """Procedural premium-looking TV: glossy clearcoat screen + visible
    chamfered bezel + slim wall mount bracket behind."""
    TV_W, TV_H, TV_D = 0.78, 0.46, 0.030      # 78 × 46 cm × 3 cm thin
    BEZEL_T          = 0.014
    BEZEL_DEPTH      = 0.014                  # bezel protrudes in front of screen

    # Materials
    bezel_mat  = mat_pbr("TVBezel",  (0.045, 0.045, 0.052), metal=0.4, rough=0.32)
    body_mat   = mat_pbr("TVBody",   (0.025, 0.025, 0.028), metal=0.0, rough=0.40)
    screen_mat = screen_mat_glossy()
    bracket_mat = mat_pbr("Bracket", (0.04, 0.04, 0.05), metal=0.6, rough=0.32)

    # Body (back slab — slim, dark)
    make_box("TVBody",
             (0, TV_FRONT_FACE_Y + TV_D / 2, TV_Z),
             (TV_W, TV_D, TV_H),
             body_mat, bevel_w=0.005, bevel_segs=4)

    # Bezel frame — four thin chamfered bars wrapping the screen front
    bz_y = TV_FRONT_FACE_Y - BEZEL_DEPTH / 2
    # Top
    make_box("BezelTop",
             (0, bz_y, TV_Z + (TV_H - BEZEL_T) / 2),
             (TV_W, BEZEL_DEPTH, BEZEL_T), bezel_mat,
             bevel_w=0.0035, bevel_segs=3)
    # Bottom
    make_box("BezelBot",
             (0, bz_y, TV_Z - (TV_H - BEZEL_T) / 2),
             (TV_W, BEZEL_DEPTH, BEZEL_T), bezel_mat,
             bevel_w=0.0035, bevel_segs=3)
    # Left
    make_box("BezelLeft",
             (-(TV_W - BEZEL_T) / 2, bz_y, TV_Z),
             (BEZEL_T, BEZEL_DEPTH, TV_H - 2 * BEZEL_T), bezel_mat,
             bevel_w=0.0035, bevel_segs=3)
    # Right
    make_box("BezelRight",
             ((TV_W - BEZEL_T) / 2, bz_y, TV_Z),
             (BEZEL_T, BEZEL_DEPTH, TV_H - 2 * BEZEL_T), bezel_mat,
             bevel_w=0.0035, bevel_segs=3)

    # Glossy screen — recessed inside bezel
    make_box("TVScreen",
             (0, TV_FRONT_FACE_Y - 0.001, TV_Z),
             (TV_W - 2 * BEZEL_T - 0.002, 0.002, TV_H - 2 * BEZEL_T - 0.002),
             screen_mat, bevel_w=0.0005)

    # Wall-mount bracket behind TV
    make_box("TVBracket",
             (0, TV_FRONT_FACE_Y + TV_D + 0.014, TV_Z),
             (TV_W * 0.52, 0.020, TV_H * 0.42),
             bracket_mat, bevel_w=0.003)
    return None, []


def build_outlet():
    plate_mat  = mat_pbr("OutletPlate",  (0.96, 0.95, 0.93), 0.0, 0.42)
    socket_mat = mat_pbr("OutletSocket", (0.10, 0.10, 0.11), 0.0, 0.55)
    OW, OH, OT = 0.115, 0.072, 0.005
    make_box("OutletPlate", (0, WALL_FRONT_Y - OT/2, OUTLET_Z),
             (OW, OT, OH), plate_mat, bevel_w=0.0025)
    make_box("OutletFrame", (0, WALL_FRONT_Y - OT - 0.0005, OUTLET_Z),
             (0.058, 0.001, 0.092), socket_mat)
    for sz_off in (+0.018, -0.018):
        for sx in (-0.011, +0.011):
            make_box(f"Slot_{sz_off}_{sx}",
                     (sx, WALL_FRONT_Y - OT - 0.0015, OUTLET_Z + sz_off + 0.005),
                     (0.0034, 0.001, 0.014), socket_mat)


def build_common_scene():
    build_wall()
    build_tv()
    build_outlet()


def make_cable_curve(name, points, radius=0.0095):
    """Smooth tube cable through points (custom-aligned ALIGNED handles)."""
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
        if tangent.length > 1e-6: tangent.normalize()
        seg_len = (next_co - prev_co).length / 3.0 if n > 1 else 0.05
        bp.handle_left  = bp.co - tangent * seg_len
        bp.handle_right = bp.co + tangent * seg_len
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_pbr("CableJacket", (0.05, 0.05, 0.06), 0.0, 0.55))
    return obj


# ── Scenario A: HIDDEN — cable inside wall, visible through translucent strip ─
def setup_hidden():
    build_common_scene()

    # Hole-entry / hole-exit positions on the wall front face.
    HOLE_ENTRY_Z = TV_BOT_Z - 0.02     # just below TV
    HOLE_EXIT_Z  = OUTLET_Z + 0.04     # just above outlet socket

    # ─ Cable, in three legs:
    #   1) external stub TV-back → wall hole at HOLE_ENTRY_Z  (in front of wall)
    #   2) inside wall, vertical down to HOLE_EXIT_Z          (Y inside wall)
    #   3) external stub from wall exit → outlet plug         (in front of wall)
    #
    # We want the inside-wall portion to appear BEHIND a translucent strip,
    # so route the inside cable at Y = +0.020 (mid-wall depth).
    Y_STUB     = WALL_FRONT_Y - 0.012      # in front of wall
    Y_INSIDE   = WALL_FRONT_Y + 0.030      # inside wall depth

    # The complete spine — always rendered fully; the wall hides what's inside
    spine = [
        ( CABLE_X_OFF, TV_FRONT_FACE_Y + 0.015, CABLE_TV_Z),       # TV plug
        ( CABLE_X_OFF, Y_STUB,                  CABLE_TV_Z - 0.04),
        ( CABLE_X_OFF, Y_INSIDE,                HOLE_ENTRY_Z),     # entered wall
        ( CABLE_X_OFF, Y_INSIDE,                (HOLE_ENTRY_Z + HOLE_EXIT_Z)/2),
        ( CABLE_X_OFF, Y_INSIDE,                HOLE_EXIT_Z),      # at exit hole
        ( CABLE_X_OFF, Y_STUB,                  HOLE_EXIT_Z - 0.04),
        ( CABLE_X_OFF, WALL_FRONT_Y - 0.005,    CABLE_OUT_Z),      # outlet plug
    ]
    cable = make_cable_curve("Cable", spine)

    # See-through cutaway — a clear "open window" in the wall that lets the
    # cable inside the wall be SEEN. Implementation: a thin dark frame
    # around the cutaway (so it visually reads as an inset cut into the
    # drywall) + a near-fully-transparent glass-tinted pane filling the
    # opening. The cable behind it shows clearly.
    strip_h = (HOLE_ENTRY_Z - HOLE_EXIT_Z) + 0.04
    strip_z = (HOLE_ENTRY_Z + HOLE_EXIT_Z) / 2
    STRIP_W = 0.085

    # Frame (dark recess look — four thin bars wrapping the cutaway)
    frame_mat = mat_pbr("CutawayFrame", (0.18, 0.17, 0.16), metal=0.0, rough=0.55)
    FT = 0.008  # frame thickness
    # Top bar
    make_box("FrameTop",
             (CABLE_X_OFF, WALL_FRONT_Y - 0.001, strip_z + strip_h/2 + FT/2),
             (STRIP_W + 2*FT, 0.012, FT), frame_mat, bevel_w=0.0015)
    make_box("FrameBot",
             (CABLE_X_OFF, WALL_FRONT_Y - 0.001, strip_z - strip_h/2 - FT/2),
             (STRIP_W + 2*FT, 0.012, FT), frame_mat, bevel_w=0.0015)
    make_box("FrameLeft",
             (CABLE_X_OFF - STRIP_W/2 - FT/2, WALL_FRONT_Y - 0.001, strip_z),
             (FT, 0.012, strip_h), frame_mat, bevel_w=0.0015)
    make_box("FrameRight",
             (CABLE_X_OFF + STRIP_W/2 + FT/2, WALL_FRONT_Y - 0.001, strip_z),
             (FT, 0.012, strip_h), frame_mat, bevel_w=0.0015)

    # Glass pane filling the cutaway — VERY transparent so cable behind reads
    strip_mat = mat_pbr("CutawayGlass",
                        (0.84, 0.92, 0.97), metal=0.0, rough=0.02,
                        alpha=0.10, transmission=0.95)
    make_box("CutawayGlass",
             (CABLE_X_OFF, WALL_FRONT_Y - 0.0035, strip_z),
             (STRIP_W, 0.005, strip_h), strip_mat, bevel_w=0.0)

    # Animation: progressively reveal the cable from TV-side down to outlet,
    # so the user sees the cord MOVING DOWN inside the wall.
    cable.data.bevel_factor_start = 0.0
    cable.data.bevel_factor_end   = 0.05
    cable.data.keyframe_insert(data_path="bevel_factor_end", frame=1)
    cable.data.bevel_factor_end   = 1.0
    cable.data.keyframe_insert(data_path="bevel_factor_end",
                               frame=int(FRAMES * 0.80))
    cable.data.keyframe_insert(data_path="bevel_factor_end", frame=FRAMES)


# ── Scenario B: COVERS — cover GROWS DOWN from TV bottom over the cable ──────
def setup_covers():
    build_common_scene()

    # Cable visibly running TV → outlet (in front of wall)
    Y_FRONT = WALL_FRONT_Y - 0.020
    spine = [
        ( CABLE_X_OFF, TV_FRONT_FACE_Y + 0.015, CABLE_TV_Z),
        ( CABLE_X_OFF, Y_FRONT,                 CABLE_TV_Z - 0.20),
        ( CABLE_X_OFF, Y_FRONT,                 (CABLE_TV_Z + CABLE_OUT_Z)/2),
        ( CABLE_X_OFF, Y_FRONT,                 CABLE_OUT_Z + 0.20),
        ( CABLE_X_OFF, WALL_FRONT_Y - 0.005,    CABLE_OUT_Z),
    ]
    make_cable_curve("Cable", spine)

    # Cover sized to fully wrap the cord from TV-bottom down to just above
    # the outlet. Slides DOWN as one piece (translate, not grow) — like
    # someone is installing it.
    cover_top    = CABLE_TV_Z - 0.005
    cover_bot    = CABLE_OUT_Z + 0.010
    cover_h      = cover_top - cover_bot
    cover_z_end  = (cover_top + cover_bot) / 2     # final Z (over cord)
    cover_z_off  = (TV_Z + 0.40) + cover_h         # starting Z (above TV)
    cover_mat = mat_pbr("Raceway", (0.96, 0.95, 0.93), 0.0, 0.35)
    cover = make_box("Raceway",
                     (CABLE_X_OFF, -0.062, cover_z_off),
                     (0.115, 0.085, cover_h),
                     cover_mat, bevel_w=0.030, bevel_segs=5)

    # Translate downward over time — final position fully covers cord.
    cover.location.z = cover_z_off
    cover.keyframe_insert("location", index=2, frame=1)
    cover.location.z = cover_z_end
    cover.keyframe_insert("location", index=2, frame=int(FRAMES * 0.70))
    cover.keyframe_insert("location", index=2, frame=FRAMES)


# ── Scenario C: VISIBLE — cable just dangles, no animation ───────────────────
def setup_visible():
    build_common_scene()
    Y_FRONT = WALL_FRONT_Y - 0.020
    spine = [
        ( CABLE_X_OFF, TV_FRONT_FACE_Y + 0.015, CABLE_TV_Z),
        ( CABLE_X_OFF + 0.04, Y_FRONT,          CABLE_TV_Z - 0.22),
        ( CABLE_X_OFF, Y_FRONT - 0.018,         (CABLE_TV_Z + CABLE_OUT_Z)/2),
        ( CABLE_X_OFF - 0.04, Y_FRONT,          CABLE_OUT_Z + 0.22),
        ( CABLE_X_OFF, WALL_FRONT_Y - 0.005,    CABLE_OUT_Z),
    ]
    make_cable_curve("Cable", spine)


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
