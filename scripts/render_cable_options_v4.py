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
DW_DIFF   = os.path.join(TEX_DIR, "white_plaster_02_Diffuse_2k.jpg")        # Polyhaven photographic diffuse (matches Image #59)
DW_NORM   = os.path.join(TEX_DIR, "white_plaster_02_nor_gl_2k.jpg")          # Polyhaven REAL surface normal
DW_ROUGH  = os.path.join(TEX_DIR, "white_plaster_02_Rough_2k.jpg")           # Polyhaven REAL roughness
DW_DISP   = os.path.join(TEX_DIR, "white_plaster_02_Displacement_2k.jpg")    # Polyhaven REAL displacement

W, H    = 1920, 3840   # 4K-class — high res = sharp texture detail. 200% scale of 960×1920.
FRAMES  = int(os.environ.get("LEVL_FRAMES", "96"))
FPS     = 24
SAMPLES = int(os.environ.get("LEVL_SAMPLES", "128"))   # 128 at 4K + denoise = sharper than 2000 at 1080p


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
    # Adaptive sampling — converges fast where it can, samples more where noisy
    s.cycles.use_adaptive_sampling = True
    s.cycles.adaptive_threshold = 0.005
    s.cycles.adaptive_min_samples = 64
    s.cycles.use_denoising = True
    try: s.cycles.denoiser = 'OPENIMAGEDENOISE'
    except Exception: pass
    # More bounces for proper light propagation
    s.cycles.diffuse_bounces      = 8
    s.cycles.glossy_bounces       = 8
    s.cycles.transmission_bounces = 12
    s.cycles.transparent_max_bounces = 12
    s.cycles.max_bounces          = 16
    # Light Tree Sampling — better with multiple area lights
    try: s.cycles.use_light_tree = True
    except Exception: pass
    # Persistent Data — caches scene between frames (faster animation)
    try: s.render.use_persistent_data = True
    except Exception: pass
    s.render.resolution_x = W
    s.render.resolution_y = H
    s.render.resolution_percentage = 100
    s.render.film_transparent = True   # mount section style — CSS lavender shows through
    s.view_settings.view_transform = 'AgX'
    s.view_settings.look = 'AgX - Medium High Contrast'
    s.frame_start = 1
    s.frame_end = FRAMES
    s.render.fps = FPS
    s.render.image_settings.file_format = 'PNG'
    s.render.image_settings.color_mode = 'RGBA'
    s.render.filepath = os.path.join(out_dir, "frame_")

    # GPU (METAL on Apple Silicon) for ~3-5x speedup
    s.cycles.device = 'CPU'
    try:
        cprefs = bpy.context.preferences.addons['cycles'].preferences
        for dt in ('METAL','OPTIX','CUDA','HIP','ONEAPI'):
            try:
                cprefs.compute_device_type = dt
                cprefs.refresh_devices()
                gpu = [d for d in cprefs.devices if d.type not in ('CPU','NONE')]
                if gpu:
                    for d in cprefs.devices: d.use = (d.type != 'CPU')
                    s.cycles.device = 'GPU'
                    print(f"[GPU] {dt}: {[d.name for d in gpu]}", flush=True)
                    break
            except Exception: continue
    except Exception: pass


def setup_world():
    """STUDIO HDRI for reflections + bounce light, with camera-ray override
    so the visible background is solid lavender. Same trick the wall_types
    cards use for clean reflections + brand-correct background.
    Why HDRI: real photographic environment data gives PHYSICALLY ACCURATE
    glossy reflections — flat lavender world produces dead, lifeless glossy
    surfaces. HDRI is what makes 'Blender renders look like product photos'."""
    world = bpy.data.worlds.get("World") or bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)

    # Verbatim copy of render_mount_objects_v2.py setup_world
    out         = nt.nodes.new('ShaderNodeOutputWorld')
    bg_hdri     = nt.nodes.new('ShaderNodeBackground')
    bg_camera   = nt.nodes.new('ShaderNodeBackground')
    lp          = nt.nodes.new('ShaderNodeLightPath')
    mix         = nt.nodes.new('ShaderNodeMixShader')

    bg_hdri.inputs['Color'].default_value    = (0.76, 0.72, 0.88, 1.0)
    bg_hdri.inputs['Strength'].default_value = 0.12
    bg_camera.inputs['Color'].default_value    = (0.91, 0.88, 0.97, 1.0)
    bg_camera.inputs['Strength'].default_value = 1.0

    nt.links.new(lp.outputs['Is Camera Ray'],      mix.inputs['Fac'])
    nt.links.new(bg_hdri.outputs['Background'],    mix.inputs[1])
    nt.links.new(bg_camera.outputs['Background'],  mix.inputs[2])
    nt.links.new(mix.outputs['Shader'],            out.inputs['Surface'])


def add_camera(fov_deg=36, cam_pos=(2.40, -5.00, 1.05), look_at=(-0.10, 0, 1.10)):
    """Premium telephoto camera with f/4 DOF + bokeh — physical camera setup."""
    cd = bpy.data.cameras.new('Camera')
    cd.lens_unit = 'FOV'; cd.angle = math.radians(fov_deg)
    cd.clip_start = 0.01; cd.clip_end = 50.0
    # PHYSICAL DOF — wall sharp, edges fall off softly (premium product render)
    cd.dof.use_dof = True
    cd.dof.aperture_fstop = 4.0
    cd.dof.aperture_blades = 6   # hexagonal bokeh shape
    focal_distance = (Vector(look_at) - Vector(cam_pos)).length
    cd.dof.focus_distance = focal_distance
    co = bpy.data.objects.new('Camera', cd)
    bpy.context.collection.objects.link(co)
    bpy.context.scene.camera = co
    co.location = Vector(cam_pos)
    co.rotation_euler = (Vector(look_at) - Vector(cam_pos)).to_track_quat('-Z', 'Y').to_euler()


def add_lights():
    """HARD side key from the LEFT (size=1.0, like the 'what size is your TV'
    section) plus existing soft fills. The small key produces both the sharp
    specular glare on the screen AND a real cast shadow of the TV on the wall
    (the 14cm TV_GAP standoff catches the side rake)."""
    for name, loc, energy, size, color in [
        # KEY — hard side-rake from far LEFT, near TV height for SIDE angle
        # (not top-down). Matches the measure-section key parameters.
        ("Key",    (-4.5, -1.5, 2.1), 1400, 1.0, (1.00, 0.97, 0.90)),
        # Fills CUT HARD so the cast shadow behind the TV actually reads dark.
        ("Fill",   ( 4.0, -2.5, 1.8),   10, 5.5, (0.90, 0.93, 1.00)),
        ("Rim",    ( 1.5,  3.0, 4.5),  300, 2.0, (1.00, 1.00, 1.00)),
        ("Top",    ( 0.0, -1.0, 6.0),   15, 4.5, (1.00, 0.99, 0.97)),
        ("Bounce", ( 0.0, -3.5,-0.5),   60, 4.0, (1.00, 1.00, 1.00)),
        ("FrontKey",( 0.5, -3.0, 1.8),  25, 3.0, (1.00, 0.98, 0.95)),
    ]:
        ld = bpy.data.lights.new(name, type='AREA')
        ld.size = size
        ld.energy = energy
        ld.color = color
        lo = bpy.data.objects.new(name, ld)
        bpy.context.collection.objects.link(lo)
        lo.location = loc
        if name == "Key":
            # Aim Key directly at the TV (TV is high on the wall at Z=1.85).
            target = Vector((TV_X, TV_FRONT_FACE_Y, TV_Z))
        else:
            target = Vector((0, 0, 1.0))
        lo.rotation_euler = (target - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()


def add_shadow_catcher():
    # Plane size 14 → 200: edge is now way outside camera view so no horizontal
    # line shows. Keeps the wall-on-floor contact shadow (the user wanted that).
    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, 0))
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


def add_inset_recess(obj, inset=0.015, depth=0.003, face_normal_axis='Y'):
    """Inset face + extrude inward — creates a recessed panel detail using
    edit-mode tools (the procedural equivalent of loop cut + bevel + extrude).
    `face_normal_axis` selects which face (X/Y/Z = ±) to operate on.
    For a TV facing -Y (front), use 'Y' and we'll pick the -Y face automatically."""
    import bmesh
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(obj.data)
    # Find front-facing face (most negative Y normal in world)
    bpy.ops.mesh.select_all(action='DESELECT')
    target = None
    target_dot = 1.0
    for f in bm.faces:
        # face normal in world
        wn = (obj.matrix_world.to_3x3() @ f.normal).normalized()
        if face_normal_axis == 'Y':
            d = wn.y    # we want most negative
            if d < target_dot: target_dot = d; target = f
    if target is not None:
        target.select_set(True)
        # INSET FACE — equivalent to a loop cut around the face
        bpy.ops.mesh.inset(thickness=inset, depth=0)
        # EXTRUDE the inset face inward
        bpy.ops.mesh.extrude_region_move(
            TRANSFORM_OT_translate={"value": (0, depth, 0)})
        # Optional: BEVEL the new edges for soft transition
        bpy.ops.mesh.region_to_loop()
        bpy.ops.mesh.bevel(offset=0.001, segments=2)
    bpy.ops.object.mode_set(mode='OBJECT')


def make_box(name, location, size, mat, bevel_w=0.003, bevel_segs=2, subsurf=0):
    """FULL hard-surface stack on every box:
       1. Bevel modifier (limit by angle 30°) — rounded edges catch highlights
       2. Weighted Normals modifier — fixes flat-face shading post-bevel
       3. Optional Subdivision Surface (Catmull-Clark) for curve definition
       4. Auto Smooth — smooths bevel transitions"""
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    o = bpy.context.object; o.name = name; o.scale = size
    bpy.context.view_layer.update()
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    # 1. BEVEL
    bev = o.modifiers.new("Bevel", 'BEVEL')
    bev.width = bevel_w
    bev.segments = bevel_segs
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(30)
    # 2. WEIGHTED NORMALS — corrects shading on flat faces post-bevel
    try:
        wn = o.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
        wn.weight = 50
        wn.keep_sharp = True
    except Exception: pass
    # 3. SUBDIVISION SURFACE (optional — for smoother curves on detail elements)
    if subsurf > 0:
        ss = o.modifiers.new("Subsurf", 'SUBSURF')
        ss.subdivision_type = 'CATMULL_CLARK'
        ss.levels = min(subsurf, 2)
        ss.render_levels = subsurf
    # 4. AUTO SMOOTH
    try:
        bpy.ops.object.shade_auto_smooth(angle=math.radians(30))
    except Exception:
        try:
            o.data.use_auto_smooth = True
            o.data.auto_smooth_angle = math.radians(30)
            for f in o.data.polygons: f.use_smooth = True
        except Exception: pass
    o.data.materials.clear(); o.data.materials.append(mat)
    return o


def merge_doubles(obj, threshold=0.0001):
    """Clean up duplicate verts after Boolean ops — fixes shading glitches."""
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.remove_doubles(threshold=threshold)
    bpy.ops.object.mode_set(mode='OBJECT')


# ── PBR drywall material — same recipe as render_wall_types.py ───────────────
def drywall_mat_patch():
    """World-XZ-projected drywall material for the HIDDEN scenario's cutout
    patch ONLY. Mapping scale (1.33, 0.83) is calculated to match the wall's
    smart_project density (1.65m / 2.2 cycles horizontal, 2.65m / 2.2 cycles
    vertical) — patch and wall sample texture at the same world-space density,
    so the boundary is invisible. drywall_mat() is NOT touched."""
    m = bpy.data.materials.new("DrywallPatch")
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    out  = nt.nodes.new('ShaderNodeOutputMaterial')
    bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
    mp   = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (1.33, 0.83, 1.0)
    geo  = nt.nodes.new('ShaderNodeNewGeometry')
    sep  = nt.nodes.new('ShaderNodeSeparateXYZ')
    comb = nt.nodes.new('ShaderNodeCombineXYZ')
    nt.links.new(geo.outputs['Position'], sep.inputs[0])
    nt.links.new(sep.outputs['X'], comb.inputs['X'])
    nt.links.new(sep.outputs['Z'], comb.inputs['Y'])
    nt.links.new(comb.outputs['Vector'], mp.inputs['Vector'])
    nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

    def img(path, cs):
        i = bpy.data.images.load(path); i.colorspace_settings.name = cs
        nd = nt.nodes.new('ShaderNodeTexImage'); nd.image = i
        nt.links.new(mp.outputs['Vector'], nd.inputs['Vector'])
        return nd

    if os.path.exists(DW_DIFF):
        dn = img(DW_DIFF, 'sRGB')
        bc = nt.nodes.new('ShaderNodeBrightContrast')
        bc.inputs['Bright'].default_value    = 0.40
        bc.inputs['Contrast'].default_value  = 0.50
        nt.links.new(dn.outputs['Color'], bc.inputs['Color'])
        ao = nt.nodes.new('ShaderNodeAmbientOcclusion')
        ao.samples = 16
        ao.inputs['Distance'].default_value = 0.05
        ao_mix = nt.nodes.new('ShaderNodeMix')
        ao_mix.data_type = 'RGBA'
        ao_mix.blend_type = 'MULTIPLY'
        ao_mix.inputs[0].default_value = 0.85
        nt.links.new(bc.outputs['Color'],    ao_mix.inputs[6])
        nt.links.new(ao.outputs['Color'],    ao_mix.inputs[7])
        nt.links.new(ao_mix.outputs[2],      bsdf.inputs['Base Color'])
    else:
        bsdf.inputs['Base Color'].default_value = (0.96, 0.95, 0.96, 1.0)
    if os.path.exists(DW_ROUGH):
        r = img(DW_ROUGH, 'Non-Color')
        nt.links.new(r.outputs['Color'], bsdf.inputs['Roughness'])
    else:
        bsdf.inputs['Roughness'].default_value = 0.78
    if os.path.exists(DW_NORM):
        n = img(DW_NORM, 'Non-Color')
        nm = nt.nodes.new('ShaderNodeNormalMap')
        nm.inputs['Strength'].default_value = 0.30
        nt.links.new(n.outputs['Color'], nm.inputs['Color'])
        nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    bsdf.inputs['Metallic'].default_value = 0.0
    if 'Subsurface Weight' in bsdf.inputs:
        bsdf.inputs['Subsurface Weight'].default_value = 0.02
    return m


def drywall_mat(tile_u=2.0, tile_v=2.8, norm_strength=0.30, disp_scale=0.0):
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
    # Tile UVs ~2x denser so each speckle reads smaller → smoother painted-drywall
    # appearance instead of chunky plaster aggregate.
    mp.inputs['Scale'].default_value = (2.2, 2.2, 1.0)
    nt.links.new(tc.outputs['UV'], mp.inputs['Vector'])
    nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

    def img(path, cs):
        i = bpy.data.images.load(path); i.colorspace_settings.name = cs
        nd = nt.nodes.new('ShaderNodeTexImage'); nd.image = i
        nt.links.new(mp.outputs['Vector'], nd.inputs['Vector'])
        return nd

    # ── HYBRID PBR DRYWALL ────────────────────────────────────────────
    # Diffuse: Pollinations-generated speckled white pattern (the "AI look")
    # Normal/Roughness/Displacement: Polyhaven beige_wall_002 (real photographic
    # surface bumps + roughness variation). Combined: AI aesthetic with real
    # PBR depth.
    if os.path.exists(DW_DIFF):
        dn = img(DW_DIFF, 'sRGB')
        # WHITEN: Bright/Contrast node pushes the grey Polyhaven diffuse to
        # white while keeping all the texture detail (speckles, surface
        # variation). User wanted: keep the texture exactly the same but white.
        bc = nt.nodes.new('ShaderNodeBrightContrast')
        bc.inputs['Bright'].default_value    = 0.40
        bc.inputs['Contrast'].default_value  = 0.50    # MORE contrast — speckles read clearly
        nt.links.new(dn.outputs['Color'], bc.inputs['Color'])
        # AO multiplied for crevice darkening
        ao = nt.nodes.new('ShaderNodeAmbientOcclusion')
        ao.samples = 16
        ao.inputs['Distance'].default_value = 0.05
        ao_mix = nt.nodes.new('ShaderNodeMix')
        ao_mix.data_type = 'RGBA'
        ao_mix.blend_type = 'MULTIPLY'
        ao_mix.inputs[0].default_value = 0.85
        nt.links.new(bc.outputs['Color'],    ao_mix.inputs[6])
        nt.links.new(ao.outputs['Color'],    ao_mix.inputs[7])
        nt.links.new(ao_mix.outputs[2],      bsdf.inputs['Base Color'])
    else:
        bsdf.inputs['Base Color'].default_value = (0.96, 0.95, 0.96, 1.0)

    if os.path.exists(DW_ROUGH):
        r = img(DW_ROUGH, 'Non-Color')
        nt.links.new(r.outputs['Color'], bsdf.inputs['Roughness'])
    else:
        bsdf.inputs['Roughness'].default_value = 0.78
    if os.path.exists(DW_NORM):
        n = img(DW_NORM, 'Non-Color')
        nm = nt.nodes.new('ShaderNodeNormalMap')
        nm.inputs['Strength'].default_value = norm_strength
        nt.links.new(n.outputs['Color'], nm.inputs['Color'])
        nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    bsdf.inputs['Metallic'].default_value = 0.0
    # SSS minimal — heavy SSS was making wall pick up lavender world color
    if 'Subsurface Weight' in bsdf.inputs:
        bsdf.inputs['Subsurface Weight'].default_value = 0.02
    return m


# ── Common scene constants ───────────────────────────────────────────────────
# Wall slab is a chunky 3D block (like the wall_types render): visibly thick
# from the side, taller than wide, TV mounted on the front face.
WALL_W       = 1.65           # wall width X
WALL_D       = 0.13           # wall depth Y — realistic drywall+stud bay thickness
WALL_H       = 2.65           # wall height Z — taller
WALL_X       = -0.10          # wall slightly LEFT so its right side edge
                              # shows for the side-perspective look
WALL_FRONT_Y = -WALL_D / 2    # wall front face Y
WALL_BACK_Y  = +WALL_D / 2

TV_W         = 1.32           # TV width X — extended right; left edge held by TV_X shift
TV_H         = 0.78           # TV height Z
TV_D         = 0.040
TV_GAP       = 0.140          # TV stands off the wall by 14cm — VERY visible mount stand-off
TV_FRONT_FACE_Y = WALL_FRONT_Y - TV_GAP - TV_D   # TV back face is 4.5cm in front of wall
TV_X         = WALL_X + 0.05  # TV shifted +0.05 so the additional width extends RIGHT only
TV_Z         = 1.85           # TV raised higher
                              # room below for the cable management visuals
TV_BOT_Z     = TV_Z - TV_H / 2

OUTLET_Z     = 0.32   # raised — too low at 0.18 disappears at this camera angle
CABLE_TV_Z   = TV_BOT_Z - 0.005
CABLE_OUT_Z  = OUTLET_Z + 0.04
CABLE_X_OFF  = WALL_X         # cable centered on wall too


def _wall_panel(name, location, size, mat):
    """Build a single drywall panel with PBR + UV unwrap."""
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    o = bpy.context.object; o.name = name; o.scale = size
    bpy.context.view_layer.update()
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bpy.ops.object.editmode_toggle()
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.005)
    bpy.ops.object.editmode_toggle()
    o.data.materials.append(mat)
    return o


def build_wall(cutout=None):
    """ONE solid wall slab. If `cutout` is provided ({'x','z','w','h'}),
    a Boolean DIFFERENCE modifier cuts the rectangular hole — single
    continuous topology, no visible panel seams. Texture flows seamlessly
    across the whole surface."""
    mat = drywall_mat()
    wall_y_ctr = (WALL_FRONT_Y + WALL_BACK_Y) / 2

    # Solid wall slab (no bevel — keeps Boolean clean)
    wall = _wall_panel("Wall",
        (WALL_X, wall_y_ctr, WALL_H / 2),
        (WALL_W, WALL_D, WALL_H), mat)

    if cutout is None:
        return wall

    cx = cutout['x']; cz = cutout['z']
    cw = cutout['w']; ch = cutout['h']

    # Cutter cube — full intended dims; Y slightly larger than wall so the
    # Boolean cuts cleanly through both faces. (size=1 cube spans -0.5..+0.5,
    # so scale = full target dimension on each axis.)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(cx, wall_y_ctr, cz))
    cutter = bpy.context.active_object
    cutter.name = "Cutter"
    cutter.scale = (cw, WALL_D * 1.2, ch)
    bpy.ops.object.transform_apply(scale=True)
    cutter.display_type = 'WIRE'

    bm = wall.modifiers.new("CutHole", 'BOOLEAN')
    bm.object = cutter
    bm.operation = 'DIFFERENCE'
    bm.solver = 'EXACT'   # watertight cut — no gaps at hole edges
    cutter.hide_render = True
    # NOTE: merge_doubles is applied to wall AFTER Boolean is evaluated.
    # Doing it here would have no effect since Boolean is a modifier (lazy).
    # Apply if needed via render-time mesh evaluation.
    return wall


def screen_mat_glossy(name="TVScreen"):
    """Powered-on flat-panel TV screen — gradient-emissive panel mixed with
    a glossy clearcoat top so the screen reads as both 'on' (faint glow)
    and 'glass' (sharp window-pane highlight). Replaces the flat-black
    look that read as 'TV is off'."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)

    # Subtle radial darkening — center slightly brighter than edges (mimics
    # the soft ambient reflection in the reference image).
    tc       = nt.nodes.new('ShaderNodeTexCoord')
    mp_g     = nt.nodes.new('ShaderNodeMapping')
    mp_g.inputs['Location'].default_value = (-0.5, -0.5, 0)
    grad     = nt.nodes.new('ShaderNodeTexGradient')
    grad.gradient_type = 'SPHERICAL'
    cramp    = nt.nodes.new('ShaderNodeValToRGB')
    cramp.color_ramp.elements[0].color = (0.005, 0.005, 0.010, 1.0)   # edges (very dark)
    cramp.color_ramp.elements[1].color = (0.030, 0.030, 0.050, 1.0)   # center (slightly brighter)
    cramp.color_ramp.interpolation = 'B_SPLINE'
    nt.links.new(tc.outputs['Generated'], mp_g.inputs['Vector'])
    nt.links.new(mp_g.outputs['Vector'], grad.inputs['Vector'])
    nt.links.new(grad.outputs['Color'], cramp.inputs['Fac'])

    em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Strength'].default_value = 0.6   # very subtle "on" glow
    nt.links.new(cramp.outputs['Color'], em.inputs['Color'])

    # Matte deep-black screen — high roughness so HDRI does NOT show as a
    # hard horizon mirror. Subtle clearcoat for premium "glass look" without
    # reflecting environmental hard edges.
    bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs["Base Color"].default_value = (0.008, 0.008, 0.012, 1.0)
    bsdf.inputs["Metallic"].default_value   = 0.0
    bsdf.inputs["Roughness"].default_value  = 0.30   # blurry reflection — kills hard horizon line
    if "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value     = 0.5
        bsdf.inputs["Coat Roughness"].default_value  = 0.20

    # Mostly emission (the subtle radial gradient) over matte BSDF
    mix = nt.nodes.new('ShaderNodeMixShader')
    mix.inputs['Fac'].default_value = 0.70          # 70% bsdf / 30% emission
    nt.links.new(em.outputs['Emission'], mix.inputs[1])
    nt.links.new(bsdf.outputs['BSDF'],   mix.inputs[2])

    out = nt.nodes.new('ShaderNodeOutputMaterial')
    nt.links.new(mix.outputs['Shader'], out.inputs['Surface'])
    return m


def build_tv():
    """Premium Samsung S95C OLED TV (Sketchfab) with seamless gloss-black
    bezel — replaces the procedural box TV."""
    bracket_mat = mat_pbr("Bracket",   (0.025, 0.025, 0.028), metal=0.4, rough=0.40)

    # Visible mount bracket between wall and TV back
    tv_back_y = TV_FRONT_FACE_Y + TV_D
    mount_y_ctr = (WALL_FRONT_Y + tv_back_y) / 2
    make_box("Mount",
             (TV_X, mount_y_ctr, TV_Z),
             (0.22, TV_GAP, 0.18),
             bracket_mat, bevel_w=0.003, bevel_segs=3)

    # ── PROCEDURAL TV (back to thicker visible bezel) ──
    BEZEL_T     = 0.022
    BEZEL_DEPTH = 0.020
    # Glossy black metallic bezel — seamless because we'll JOIN the bezel
    # pieces at corners and apply auto-smooth across them.
    bezel_mat   = mat_pbr("TVBezel",   (0.022, 0.022, 0.026), metal=0.7, rough=0.12)
    body_mat    = mat_pbr("TVBody",    (0.022, 0.022, 0.025), metal=0.0, rough=0.40)
    screen_mat  = screen_mat_glossy()

    # Back body slab — Subsurf 1 for smoother curves at the bevels
    body = make_box("TVBody",
             (TV_X, TV_FRONT_FACE_Y + TV_D / 2, TV_Z),
             (TV_W, TV_D, TV_H),
             body_mat, bevel_w=0.005, bevel_segs=4, subsurf=1)

    bz_y = TV_FRONT_FACE_Y - BEZEL_DEPTH / 2
    make_box("BezelTop",
             (TV_X, bz_y, TV_Z + (TV_H - BEZEL_T) / 2),
             (TV_W, BEZEL_DEPTH, BEZEL_T), bezel_mat, bevel_w=0.0035, bevel_segs=3, subsurf=1)
    make_box("BezelBot",
             (TV_X, bz_y, TV_Z - (TV_H - BEZEL_T) / 2),
             (TV_W, BEZEL_DEPTH, BEZEL_T), bezel_mat, bevel_w=0.0035, bevel_segs=3, subsurf=1)
    make_box("BezelLeft",
             (TV_X - (TV_W - BEZEL_T) / 2, bz_y, TV_Z),
             (BEZEL_T, BEZEL_DEPTH, TV_H - 2 * BEZEL_T), bezel_mat,
             bevel_w=0.0035, bevel_segs=3, subsurf=1)
    make_box("BezelRight",
             (TV_X + (TV_W - BEZEL_T) / 2, bz_y, TV_Z),
             (BEZEL_T, BEZEL_DEPTH, TV_H - 2 * BEZEL_T), bezel_mat,
             bevel_w=0.0035, bevel_segs=3, subsurf=1)

    # Glossy screen — recessed inside bezel
    make_box("TVScreen",
             (TV_X, TV_FRONT_FACE_Y - 0.001, TV_Z),
             (TV_W - 2 * BEZEL_T - 0.002, 0.002, TV_H - 2 * BEZEL_T - 0.002),
             screen_mat, bevel_w=0.0005)

    # Wall-mount bracket
    make_box("TVBracket",
             (TV_X, TV_FRONT_FACE_Y + TV_D + 0.014, TV_Z),
             (TV_W * 0.52, 0.020, TV_H * 0.42),
             bracket_mat, bevel_w=0.003)

    # Tiny status LED on the bottom bezel (the 'TV is on' dot)
    led_mat = emission_mat("TVLed", (0.20, 1.00, 0.30), strength=8.0)
    make_box("TVLed",
             (TV_X, bz_y - 0.0005, TV_Z - TV_H / 2 + BEZEL_T / 2),
             (0.006, 0.001, 0.003), led_mat, bevel_w=0.0)

    return None, []


def import_glb(path):
    """Import GLB and return list of newly-added mesh objects."""
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    return [o for o in new if o.type == 'MESH']


def fit_glb_to_wall(meshes, target_w, x, z, depth_into_wall=0.001):
    """Auto-orient + scale + position a GLB on the wall front face."""
    bpy.ops.object.select_all(action='DESELECT')
    for o in meshes: o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]

    # Get bounding box
    pts = []
    for o in meshes:
        for c in o.bound_box:
            pts.append(o.matrix_world @ Vector(c))
    xs = [p.x for p in pts]; ys = [p.y for p in pts]; zs = [p.z for p in pts]
    dims = [max(xs)-min(xs), max(ys)-min(ys), max(zs)-min(zs)]

    # Smallest axis = depth; orient so it's Y
    smallest = min(range(3), key=lambda i: dims[i])
    if smallest == 0: bpy.ops.transform.rotate(value=math.radians(90), orient_axis='Z')
    elif smallest == 2: bpy.ops.transform.rotate(value=math.radians(90), orient_axis='X')
    bpy.ops.object.transform_apply(rotation=True)

    # Scale to target width
    bpy.context.view_layer.update()
    pts = []
    for o in meshes:
        for c in o.bound_box: pts.append(o.matrix_world @ Vector(c))
    xs = [p.x for p in pts]; cur_w = max(xs) - min(xs)
    sc = target_w / max(cur_w, 0.001)
    bpy.ops.transform.resize(value=(sc, sc, sc))
    bpy.ops.object.transform_apply(scale=True)

    # Position: front face just OFF the wall
    bpy.context.view_layer.update()
    pts = []
    for o in meshes:
        for c in o.bound_box: pts.append(o.matrix_world @ Vector(c))
    xs = [p.x for p in pts]; ys = [p.y for p in pts]; zs = [p.z for p in pts]
    cx = (min(xs)+max(xs))/2; cy = (min(ys)+max(ys))/2; cz = (min(zs)+max(zs))/2
    d = max(ys) - min(ys)
    target_y_max = WALL_FRONT_Y - depth_into_wall
    target_y_ctr = target_y_max - d/2
    bpy.ops.transform.translate(value=(x-cx, target_y_ctr-cy, z-cz))
    bpy.ops.object.transform_apply(location=True)


def build_recessed_plate(cx, cz):
    """Procedural DataComm-style recessed cable management plate.
    Outer flat plate + inset recess + cable pass-through hole on the right.
    Outlet GLB is positioned INSIDE the recess on the left."""
    plate_mat = mat_pbr("RecessPlate", (0.96, 0.95, 0.94), 0.0, 0.40)
    inner_mat = mat_pbr("RecessInner", (0.92, 0.91, 0.90), 0.0, 0.50)
    hole_mat  = mat_pbr("CableHole",   (0.04, 0.04, 0.05), 0.0, 0.85)

    PW, PH, PT = 0.230, 0.260, 0.010      # outer plate dimensions
    RW, RH, RD = 0.180, 0.205, 0.040      # inner recess (recessed back into plate)

    # Outer flat plate (sits on wall front face)
    plate_y = WALL_FRONT_Y - PT/2 - 0.001
    make_box("RecessPlate", (cx, plate_y, cz), (PW, PT, PH),
             plate_mat, bevel_w=0.003, bevel_segs=3)

    # Recess walls — inner box recessed BEHIND the front plate (into wall)
    # This creates the "boxed inset" look like Image #61
    inner_y_back  = WALL_FRONT_Y + RD          # back of recess (behind plate)
    inner_y_ctr   = (plate_y + PT/2 + inner_y_back) / 2
    make_box("RecessInner", (cx, inner_y_back + 0.002, cz),
             (RW, 0.004, RH), inner_mat, bevel_w=0.001, bevel_segs=2)

    # Cable pass-through opening on the RIGHT side of the plate (curved arch)
    hole_x = cx + 0.055
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.030, depth=PT*1.5, vertices=24,
        location=(hole_x, plate_y, cz + 0.025),
        rotation=(math.radians(90), 0, 0))
    hole = bpy.context.active_object
    hole.name = "CableHoleVisible"
    hole.data.materials.clear()
    hole.data.materials.append(hole_mat)


def build_brush_cable_plate(cx, cz):
    """Detailed white wall plate with brush bristle pass-through — Image #63.
    Same size as outlet (0.115×0.115). Includes outer plate, beveled
    recess walls, dense bristles, and 4 corner screws."""
    plate_mat   = mat_pbr("BrushPlate",  (0.96, 0.95, 0.94), 0.0, 0.42)
    recess_mat  = mat_pbr("BrushRecess", (0.025, 0.025, 0.030), 0.0, 0.85)   # BLACK recess BEHIND bristles
    bristle_mat = mat_pbr("Bristles",    (0.85, 0.85, 0.84), 0.0, 0.85)      # WHITE/silver bristles (reference)
    screw_mat   = mat_pbr("Screws",      (0.72, 0.72, 0.74), metal=0.95, rough=0.30)

    PW, PH, PT = 0.115, 0.115, 0.006     # SAME size as outlet (115×115mm)
    RW, RH     = 0.072, 0.072            # recess opening
    RD         = 0.012                    # recess depth (into the plate)

    plate_y = WALL_FRONT_Y - PT/2 - 0.001
    # Outer plate — wider bevel for premium plastic look
    make_box("BrushPlate", (cx, plate_y, cz), (PW, PT, PH),
             plate_mat, bevel_w=0.003, bevel_segs=4)

    # Recess BACK — dark surface visible at back of recess
    recess_back_y = plate_y + PT/2 - RD
    make_box("BrushRecessBack",
             (cx, recess_back_y - 0.0005, cz),
             (RW, 0.001, RH), recess_mat, bevel_w=0)

    # Recess WALLS (top, bottom, left, right) — gives the boxed inset feel
    wall_t = 0.003
    # top
    make_box("BrushRecessTop",
             (cx, (plate_y + recess_back_y)/2, cz + RH/2 - wall_t/2),
             (RW, RD, wall_t), recess_mat, bevel_w=0.0008)
    # bottom
    make_box("BrushRecessBot",
             (cx, (plate_y + recess_back_y)/2, cz - RH/2 + wall_t/2),
             (RW, RD, wall_t), recess_mat, bevel_w=0.0008)
    # left
    make_box("BrushRecessLeft",
             (cx - RW/2 + wall_t/2, (plate_y + recess_back_y)/2, cz),
             (wall_t, RD, RH - 2*wall_t), recess_mat, bevel_w=0.0008)
    # right
    make_box("BrushRecessRight",
             (cx + RW/2 - wall_t/2, (plate_y + recess_back_y)/2, cz),
             (wall_t, RD, RH - 2*wall_t), recess_mat, bevel_w=0.0008)

    # DENSE bristles — 50 strips for proper brush field appearance
    bristle_count = 50
    bristle_z_extent = RH - 4*wall_t
    for i in range(bristle_count):
        x_off = (i / (bristle_count-1) - 0.5) * (RW - 4*wall_t)
        # Each bristle is a thin vertical strip slightly behind the plate front
        make_box(f"Bristle_{i}",
                 (cx + x_off, plate_y - PT/2 + 0.0005, cz),
                 (0.0006, 0.004, bristle_z_extent),
                 bristle_mat, bevel_w=0)

    # 4 corner screws (small cylinders at plate corners)
    sc_off_x = PW/2 - 0.008
    sc_off_z = PH/2 - 0.008
    for sx in (-sc_off_x, +sc_off_x):
        for sz in (-sc_off_z, +sc_off_z):
            bpy.ops.mesh.primitive_cylinder_add(
                radius=0.0028, depth=0.0015, vertices=20,
                location=(cx + sx, plate_y - PT/2 - 0.0005, cz + sz),
                rotation=(math.radians(90), 0, 0))
            sc = bpy.context.active_object
            sc.name = f"BrushScrew_{int(sx*1000)}_{int(sz*1000)}"
            sc.data.materials.clear()
            sc.data.materials.append(screw_mat)


def build_passthrough_plate(cx, cz):
    """Cable pass-through wall plate — Thingiverse thing:2634134 by Teece, CC-BY.
    Single-gang plate with a hood/visor over the cable opening."""
    stl_path = os.path.join(MODELS, "thingiverse_cable_passthrough.stl")
    if not os.path.exists(stl_path):
        # Procedural fallback if STL missing
        build_brush_cable_plate(cx, cz)
        return

    before = set(bpy.data.objects)
    try:
        bpy.ops.wm.stl_import(filepath=stl_path)
    except AttributeError:
        bpy.ops.import_mesh.stl(filepath=stl_path)
    new = [o for o in bpy.data.objects if o not in before and o.type == 'MESH']
    if not new:
        build_brush_cable_plate(cx, cz)
        return

    # Same white material as the outlet plate so they read as a matched pair.
    white_mat = mat_pbr("PassThruWhite", (0.96, 0.95, 0.94), 0.0, 0.42)
    for o in new:
        o.data.materials.clear()
        o.data.materials.append(white_mat)

    # Auto-orient + scale + position on wall front face (same helper used for
    # the outlet GLB — picks smallest dim as depth → Y).
    fit_glb_to_wall(new, target_w=0.115, x=cx, z=cz)

    # ── Cover the empty screw recesses (top + bottom centered, STL-local
    # ±41.5mm → world ±0.0683 from cz). Wider FLUSH cylinders sunk INTO
    # the recess so the front face sits exactly at plate_front_y — no
    # protrusion = no edge shadow, no visible cap bump.
    plate_front_y = WALL_FRONT_Y - 0.001 - 0.0083   # plate ~8mm thick after scaling
    for dz in (+0.0683, -0.0683):
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.0110, depth=0.0050, vertices=32,
            location=(cx, plate_front_y + 0.0024, cz + dz),
            rotation=(math.radians(90), 0, 0))
        plug = bpy.context.active_object
        plug.name = f"ScrewFill_{int(dz*10000)}"
        plug.data.materials.append(white_mat)
    print(f"[PassThru] Teece STL: {len(new)} meshes (screw holes filled flush)", flush=True)


def build_outlet(with_passthrough=False):
    """White duplex outlet. When `with_passthrough=True` (HIDDEN scenario only),
    also place the Teece STL pass-through plate to the right; in that case the
    outlet is shifted LEFT to make room. Otherwise the outlet is centered on
    CABLE_X_OFF so the cable plugs into it cleanly.
    Pass-through plate model: Thingiverse #2634134 by Teece (CC-BY)."""
    OUTLET_W = 0.115
    OUTLET_H = 0.115
    if with_passthrough:
        OUTLET_X_OFF   = 0.075   # outlet shifted LEFT
        PASSTHRU_X_OFF = 0.075   # plate to the RIGHT
        outlet_x = CABLE_X_OFF - OUTLET_X_OFF
    else:
        outlet_x = CABLE_X_OFF   # centered — no pass-through plate
    glb_path = os.path.join(MODELS, "sketchfab_outlet_premium.glb")
    if os.path.exists(glb_path):
        meshes = import_glb(glb_path)
        if meshes:
            # Outlet on the LEFT
            fit_glb_to_wall(meshes, target_w=OUTLET_W, x=outlet_x, z=OUTLET_Z)
            # White plate
            white_mat = mat_pbr("OutletWhite", (0.96, 0.95, 0.94), 0.0, 0.42)
            for o in meshes:
                o.data.materials.clear()
                o.data.materials.append(white_mat)

            # ── Recessed black duplex socket panels + vertical prong slits ──
            # Larger DARK rectangles pushed further proud of the plate face so
            # they read clearly. Each panel has 2 vertical slits + 1 ground
            # hole on its front face for the prong detail.
            socket_recess_mat = mat_pbr("SocketRecess", (0.012, 0.012, 0.016), 0.0, 0.55)
            slot_mat  = mat_pbr("PlugSlot",   (0.005, 0.005, 0.008), 0.0, 0.85)
            screw_mat = mat_pbr("OutScrew",   (0.72, 0.72, 0.74), metal=0.95, rough=0.30)
            PANEL_PROUD = 0.0050              # 5mm proud of plate face
            panel_y = WALL_FRONT_Y - 0.0010 - PANEL_PROUD/2
            slit_y  = WALL_FRONT_Y - 0.0010 - PANEL_PROUD - 0.0005   # just in front of panel face
            for socket_offset in (+0.025, -0.025):
                socket_z = OUTLET_Z + socket_offset
                bpy.ops.mesh.primitive_cube_add(size=1,
                    location=(outlet_x, panel_y, socket_z))
                sf = bpy.context.active_object
                sf.name = f"SocketFace_{int(socket_offset*1000)}"
                sf.scale = (0.030, PANEL_PROUD, 0.038)   # 30mm × 38mm panel
                bpy.ops.object.transform_apply(scale=True)
                sf.data.materials.append(socket_recess_mat)
                # Vertical prong slits — 2 per socket
                for sx in (-0.0070, +0.0070):
                    bpy.ops.mesh.primitive_cube_add(size=1,
                        location=(outlet_x + sx, slit_y, socket_z + 0.005))
                    s = bpy.context.active_object
                    s.scale = (0.0020, 0.0008, 0.012)
                    bpy.ops.object.transform_apply(scale=True)
                    s.data.materials.append(slot_mat)
                # Round ground hole below slits
                bpy.ops.mesh.primitive_cylinder_add(
                    radius=0.0028, depth=0.0008, vertices=20,
                    location=(outlet_x, slit_y, socket_z - 0.011),
                    rotation=(math.radians(90), 0, 0))
                g = bpy.context.active_object
                g.data.materials.append(slot_mat)
            # Top + bottom screws on outlet plate (matches reference)
            for sz in (OUTLET_Z + OUTLET_H/2 - 0.008, OUTLET_Z - OUTLET_H/2 + 0.008):
                bpy.ops.mesh.primitive_cylinder_add(
                    radius=0.0028, depth=0.0014, vertices=20,
                    location=(outlet_x, WALL_FRONT_Y - 0.0024, sz),
                    rotation=(math.radians(90), 0, 0))
                sc = bpy.context.active_object
                sc.data.materials.append(screw_mat)
            # The auto-orient puts the BACK toward camera. Flip 180° around Z.
            bpy.ops.object.select_all(action='DESELECT')
            for o in meshes: o.select_set(True)
            bpy.context.view_layer.objects.active = meshes[0]
            bpy.ops.transform.rotate(value=math.radians(180), orient_axis='Z')
            bpy.ops.object.transform_apply(rotation=True)
            # Re-position so it's still on the wall after the flip
            bpy.context.view_layer.update()
            pts = []
            for o in meshes:
                for c in o.bound_box: pts.append(o.matrix_world @ Vector(c))
            ys = [p.y for p in pts]
            xs = [p.x for p in pts]; zs = [p.z for p in pts]
            cy = (min(ys) + max(ys)) / 2
            cx = (min(xs) + max(xs)) / 2
            cz = (min(zs) + max(zs)) / 2
            d = max(ys) - min(ys)
            target_y_max = WALL_FRONT_Y - 0.001
            target_y_ctr = target_y_max - d/2
            # CRITICAL: re-center to outlet_x so the slot/screw details (which
            # were placed at outlet_x earlier) actually land ON the outlet plate.
            bpy.ops.transform.translate(value=(outlet_x-cx, target_y_ctr-cy, OUTLET_Z-cz))
            bpy.ops.object.transform_apply(location=True)
            print(f"[Outlet] Sketchfab GLB: {len(meshes)} meshes (front-flipped)", flush=True)

            # ── Cable pass-through plate (HIDDEN scenario only) ──
            if with_passthrough:
                build_passthrough_plate(CABLE_X_OFF + PASSTHRU_X_OFF, OUTLET_Z)
            return
    # Fallback to procedural
    plate_mat  = mat_pbr("OutletPlate",  (0.96, 0.95, 0.93), 0.0, 0.42)
    socket_mat = mat_pbr("OutletSocket", (0.10, 0.10, 0.11), 0.0, 0.55)
    OW, OH, OT = 0.115, 0.072, 0.005
    make_box("OutletPlate", (CABLE_X_OFF, WALL_FRONT_Y - OT/2, OUTLET_Z),
             (OW, OT, OH), plate_mat, bevel_w=0.0025)


def build_common_scene(wall_cutout=None, with_passthrough=False):
    build_wall(cutout=wall_cutout)
    build_tv()
    build_outlet(with_passthrough=with_passthrough)


def make_cable_curve(name, points, radius=0.014, color=(0.05, 0.05, 0.06)):
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


def emission_mat(name, color, strength=8.0):
    """Pure emissive material — uses Emission shader so it glows brightly
    independent of scene lighting."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Color'].default_value    = (*color, 1.0)
    em.inputs['Strength'].default_value = strength
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
    return m


# ── Scenario A: HIDDEN — narrative cutaway: seamless wall → panel slides out
# → cord drops down cavity, exits STL plate, plug docks → panel slides back ───
def setup_hidden():
    # Cutout: at TV bottom, bottom raised so outlet + STL plate sit BELOW
    # the cavity opening (not inside it).
    CUT_TOP_Z = TV_BOT_Z                  # at TV bottom
    CUT_BOT_Z = OUTLET_Z + 0.12           # ~12 cm above outlet — plate sits clearly below cavity
    CUT_W     = 0.40                      # wider
    cut_h     = CUT_TOP_Z - CUT_BOT_Z
    cut_z_ctr = (CUT_TOP_Z + CUT_BOT_Z) / 2

    # Build common scene with cutout + STL pass-through plate
    build_common_scene(wall_cutout={
        'x': CABLE_X_OFF, 'z': cut_z_ctr,
        'w': CUT_W,       'h': cut_h,
    }, with_passthrough=True)

    # ── 1. Cavity backdrop — sits ~20cm behind the wall back face. Gives
    # enough depth for stud + cord to sit IN the cavity without looking
    # like an infinitely deep tunnel.
    cavity_mat = mat_pbr("Cavity", (0.10, 0.09, 0.10), metal=0.0, rough=0.85)
    make_box("Cavity",
             (CABLE_X_OFF, WALL_BACK_Y + 0.20, cut_z_ctr),
             (CUT_W * 1.6, 0.003, cut_h * 1.05),
             cavity_mat, bevel_w=0.0)

    # ── 1b. Fill light pointed INTO the hole — illuminates stud + cord with
    # crisp shadows. Energy keyframed to 0 during patch-covered phases so
    # there's NO boundary visible on the patch when it's in place.
    cavity_light = bpy.data.lights.new("CavityFill", type='AREA')
    cavity_light.size = 0.40
    cavity_light.energy = 0     # start OFF (patch is covering)
    cavity_light.color = (1.0, 0.97, 0.92)
    clo = bpy.data.objects.new("CavityFill", cavity_light)
    bpy.context.collection.objects.link(clo)
    clo.location = (CABLE_X_OFF - 0.50, WALL_FRONT_Y - 0.40, cut_z_ctr)
    clo.rotation_euler = (Vector((CABLE_X_OFF, (WALL_FRONT_Y+WALL_BACK_Y)/2, cut_z_ctr))
                          - Vector(clo.location)).to_track_quat('-Z', 'Y').to_euler()

    # ── 2. Single LEFT wood stud — Polyhaven fine_grained_wood texture
    wood_mat = bpy.data.materials.new("StudWood")
    wood_mat.use_nodes = True
    _nt = wood_mat.node_tree
    for _n in list(_nt.nodes): _nt.nodes.remove(_n)
    _out = _nt.nodes.new('ShaderNodeOutputMaterial')
    _bsdf = _nt.nodes.new('ShaderNodeBsdfPrincipled')
    _tc   = _nt.nodes.new('ShaderNodeTexCoord')
    _mp   = _nt.nodes.new('ShaderNodeMapping')
    _mp.inputs['Scale'].default_value = (1.0, 1.0, 4.0)   # tile vertically along stud length
    _nt.links.new(_tc.outputs['Generated'], _mp.inputs['Vector'])
    _diff_path = os.path.join(PROJECT, "tmp_textures", "fine_grained_wood_2k_diff.jpg")
    _norm_path = os.path.join(PROJECT, "tmp_textures", "fine_grained_wood_2k_nor_gl.jpg")
    _rough_path = os.path.join(PROJECT, "tmp_textures", "fine_grained_wood_2k_rough.jpg")
    if os.path.exists(_diff_path):
        _di = bpy.data.images.load(_diff_path); _di.colorspace_settings.name = 'sRGB'
        _dn = _nt.nodes.new('ShaderNodeTexImage'); _dn.image = _di
        _nt.links.new(_mp.outputs['Vector'], _dn.inputs['Vector'])
        # Slightly darker than the +0.18 baseline — small step, not crushed.
        _bc = _nt.nodes.new('ShaderNodeBrightContrast')
        _bc.inputs['Bright'].default_value = 0.08
        _bc.inputs['Contrast'].default_value = 0.10
        _nt.links.new(_dn.outputs['Color'], _bc.inputs['Color'])
        _nt.links.new(_bc.outputs['Color'], _bsdf.inputs['Base Color'])
    if os.path.exists(_rough_path):
        _ri = bpy.data.images.load(_rough_path); _ri.colorspace_settings.name = 'Non-Color'
        _rn = _nt.nodes.new('ShaderNodeTexImage'); _rn.image = _ri
        _nt.links.new(_mp.outputs['Vector'], _rn.inputs['Vector'])
        _nt.links.new(_rn.outputs['Color'], _bsdf.inputs['Roughness'])
    if os.path.exists(_norm_path):
        _ni = bpy.data.images.load(_norm_path); _ni.colorspace_settings.name = 'Non-Color'
        _nn = _nt.nodes.new('ShaderNodeTexImage'); _nn.image = _ni
        _nt.links.new(_mp.outputs['Vector'], _nn.inputs['Vector'])
        _nm = _nt.nodes.new('ShaderNodeNormalMap')
        _nm.inputs['Strength'].default_value = 0.6
        _nt.links.new(_nn.outputs['Color'], _nm.inputs['Color'])
        _nt.links.new(_nm.outputs['Normal'], _bsdf.inputs['Normal'])
    _bsdf.inputs['Metallic'].default_value = 0.0
    _nt.links.new(_bsdf.outputs['BSDF'], _out.inputs['Surface'])

    # Stud sits in the actual cavity SPACE BEHIND the wall slab (not
    # embedded inside the wall material). Front face starts ~3cm behind
    # the wall back face, fully in the open cavity. Width extends LEFT
    # only — right edge stays anchored where the cord runs.
    STUD_W = 0.110        # wider — extension goes to the LEFT
    STUD_D = 0.130        # 5" deep
    stud_right_x = CABLE_X_OFF - CUT_W * 0.32 + 0.075 / 2   # original right edge anchor
    stud_x_ctr   = stud_right_x - STUD_W / 2
    stud_y_ctr   = WALL_BACK_Y + 0.030 + STUD_D / 2    # behind wall, clearly in the cavity
    make_box("StudLeft",
             (stud_x_ctr,
              stud_y_ctr,
              cut_z_ctr),
             (STUD_W, STUD_D, cut_h * 1.04),
             wood_mat, bevel_w=0.002, bevel_segs=2)

    # ── 2b. Stud-side accent light — barely grazes the right face of the
    # stud so the cord pops slightly. Low energy intentionally.
    stud_accent = bpy.data.lights.new("StudAccent", type='AREA')
    stud_accent.size = 0.30
    stud_accent.energy = 0     # keyframed in animation block
    stud_accent.color = (1.0, 0.96, 0.88)
    sao = bpy.data.objects.new("StudAccent", stud_accent)
    bpy.context.collection.objects.link(sao)
    sao.location = (stud_right_x + 0.30, WALL_FRONT_Y - 0.30, cut_z_ctr + 0.10)
    sao.rotation_euler = (Vector((stud_right_x, stud_y_ctr, cut_z_ctr))
                          - Vector(sao.location)).to_track_quat('-Z', 'Y').to_euler()

    # ── 3. Real cord (curve tube) — through cavity → out STL plate hood
    # → across to outlet. Animated drawn-in via bevel_factor_end.
    cord_mat = mat_pbr("HiddenCord", (0.005, 0.005, 0.008), 0.0, 0.45)
    cord_curve = bpy.data.curves.new("HiddenCord_curve", 'CURVE')
    cord_curve.dimensions = '3D'
    cord_curve.bevel_depth = 0.010
    cord_curve.bevel_resolution = 6
    sp = cord_curve.splines.new('BEZIER')
    mid_y = (WALL_FRONT_Y + WALL_BACK_Y) / 2
    PLATE_X = CABLE_X_OFF + 0.075         # STL plate center X
    OUTLET_PLUG_X = CABLE_X_OFF - 0.075   # outlet center X
    # Cord exits through STL plate hood center: hood opens at plate front,
    # centered at plate Z = OUTLET_Z, extending forward by ~5cm hood depth.
    PLATE_HOOD_Y = WALL_FRONT_Y - 0.045   # hood front opening in front of wall
    # Cord runs STRAIGHT DOWN alongside the RIGHT side of the stud — no
    # bend toward stud, just a vertical line, then jogs out at the bottom
    # toward the STL plate.
    CORD_X = stud_right_x + 0.025                  # 2.5 cm right of stud right edge (anchor unchanged)
    CORD_Y = stud_y_ctr - 0.005                    # roughly aligned with stud front
    cord_pts = [
        (CORD_X,        CORD_Y, CUT_TOP_Z + 0.02),    # top of cavity
        (CORD_X,        CORD_Y, cut_z_ctr),           # straight down through middle
        (CORD_X,        CORD_Y, OUTLET_Z + 0.04),     # straight down PAST cavity bottom (closes the gap)
        # Skip mid-wall waypoint — direct to plate front so hidden segment
        # is short (no long invisible gap before the cord exits the faceplate).
        (PLATE_X,       WALL_FRONT_Y - 0.005, OUTLET_Z),    # at plate front face
        (PLATE_X,       PLATE_HOOD_Y, OUTLET_Z),            # exit out hood
        (CABLE_X_OFF,   PLATE_HOOD_Y - 0.005, OUTLET_Z),    # cross to outlet
        (OUTLET_PLUG_X, WALL_FRONT_Y - 0.010, OUTLET_Z),    # plug into outlet
    ]
    sp.bezier_points.add(len(cord_pts) - 1)
    for i, (x, y, z) in enumerate(cord_pts):
        bp = sp.bezier_points[i]
        # First 3 points = inside the cavity, force VECTOR handles for a
        # perfectly straight vertical line (AUTO would curve toward next pt).
        if i < 3:
            bp.handle_left_type = bp.handle_right_type = 'VECTOR'
        else:
            bp.handle_left_type = bp.handle_right_type = 'AUTO'
        bp.co = Vector((x, y, z))
    cord_obj = bpy.data.objects.new("HiddenCord", cord_curve)
    bpy.context.collection.objects.link(cord_obj)
    cord_obj.data.materials.append(cord_mat)

    # ── 4. Plug head (black body + 2 metal flat prongs) at the outlet
    # end. Hidden until the cord finishes drawing in, then appears docked.
    plug_mat  = mat_pbr("PlugBody", (0.05, 0.05, 0.06), 0.0, 0.45)
    prong_mat = mat_pbr("PlugProng", (0.78, 0.78, 0.80), metal=0.95, rough=0.30)
    plug_body = make_box("PlugBody",
        (OUTLET_PLUG_X, WALL_FRONT_Y - 0.022, OUTLET_Z),
        (0.024, 0.024, 0.020), plug_mat, bevel_w=0.002, bevel_segs=2)
    prongs = []
    for px in (-0.0055, +0.0055):
        p = make_box(f"PlugProng_{int(px*1000)}",
            (OUTLET_PLUG_X + px, WALL_FRONT_Y - 0.005, OUTLET_Z + 0.005),
            (0.0014, 0.014, 0.008), prong_mat, bevel_w=0.0)
        prongs.append(p)

    # ── 5. Cutout patch = LITERAL piece of the wall.
    # Duplicate the wall mesh, apply Boolean INTERSECT on the duplicate to
    # keep ONLY the cutout-shape geometry; apply DIFFERENCE on the wall to
    # remove that same geometry. Both keep the wall's original UV layout, so
    # the patch's texture is the literal continuation of the wall texture →
    # truly seamless when in place. drywall_mat() is NOT modified.
    wall_obj   = bpy.data.objects.get("Wall")
    cutter_obj = bpy.data.objects.get("Cutter")

    patch = wall_obj.copy()
    patch.data = wall_obj.data.copy()
    patch.name = "CutoutPatch"
    bpy.context.collection.objects.link(patch)
    # Drop inherited CutHole modifier; add INTERSECT instead
    for mod in list(patch.modifiers):
        patch.modifiers.remove(mod)
    inter = patch.modifiers.new("KeepCutout", 'BOOLEAN')
    inter.object = cutter_obj
    inter.operation = 'INTERSECT'
    inter.solver = 'EXACT'   # watertight intersection — no gaps

    # Bake both Booleans by CONVERTING to mesh — more reliable than
    # modifier_apply in headless context.
    bpy.ops.object.select_all(action='DESELECT')
    patch.select_set(True)
    bpy.context.view_layer.objects.active = patch
    bpy.ops.object.convert(target='MESH')
    # Recalculate normals OUTWARD — Boolean ops can produce inverted normals
    # which make faces render incorrectly (front face appears transparent).
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    print(f"[DEBUG] Patch after INTERSECT+normals: {len(patch.data.vertices)} verts, {len(patch.data.polygons)} faces", flush=True)

    bpy.ops.object.select_all(action='DESELECT')
    wall_obj.select_set(True)
    bpy.context.view_layer.objects.active = wall_obj
    bpy.ops.object.convert(target='MESH')
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    print(f"[DEBUG] Wall after DIFFERENCE+normals: {len(wall_obj.data.vertices)} verts, {len(wall_obj.data.polygons)} faces", flush=True)

    # Cutter no longer needed
    bpy.data.objects.remove(cutter_obj, do_unlink=True)

    # ── DATA TRANSFER: copy wall's UVs onto the patch via POLYINTERP_NEAREST.
    # Patch keeps its own mesh but its UVs are now exactly what the wall would
    # have at the patch's vertex positions → texture sampled at the same texels
    # as wall → seamless boundary. drywall_mat() unchanged. Patch stays a
    # SEPARATE object so it can animate freely via location keyframes.
    bpy.ops.object.select_all(action='DESELECT')
    wall_obj.select_set(True)        # source
    patch.select_set(True)           # target
    bpy.context.view_layer.objects.active = wall_obj
    bpy.ops.object.data_transfer(
        use_reverse_transfer=False,
        data_type='UV',
        use_create=True,
        vert_mapping='POLYINTERP_NEAREST',
        loop_mapping='POLYINTERP_LNORPROJ',
        layers_select_src='ACTIVE',
        layers_select_dst='ACTIVE',
    )
    # Give patch its OWN drywall material instance so we can boost the
    # normal-map strength (more visible surface bumps on the patch's outer
    # faces when it's slid out — wall's material stays unchanged).
    patch_mat = drywall_mat(norm_strength=0.80)
    patch.data.materials.clear()
    patch.data.materials.append(patch_mat)
    print(f"[DEBUG] UVs transferred + patch material boosted", flush=True)

    # ── ANIMATION ───────────────────────────────────────────────────────
    # Sequence: patch slides out (natural cadence) → cord cavity descent (2.5s,
    # slightly faster than 3.0s cover) → 1-frame hidden jump → cord plate-emerge
    # to plug (~0.42s) → patch slides back (natural cadence).
    f_phase1_end       = 4                                          # cover hold (3 frames)
    f_forward_end      = 9                                          # patch slides forward (5 frames)
    f_slide_out        = 14                                         # patch slides left, cavity exposed (5 frames)
    f_draw_start       = f_slide_out                                # cord starts at cavity-exposed
    f_cavity_done      = f_draw_start + 60                          # 60 frames = 2.50s cavity
    f_hidden_done      = f_cavity_done + 1                          # 1-frame hidden jump (cord behind wall)
    f_draw_end         = f_hidden_done + 14                         # 14 frames = ~0.58s VISIBLY emerging from STL plate
    f_back_to_forward  = f_draw_end + 4                             # patch slides right back (4 frames)
    f_slide_back       = f_back_to_forward + 3                      # patch fully back into wall (3 frames)
    f_end         = FRAMES

    # Patch position constants for two-stage animation
    orig_x = patch.location.x
    orig_y = patch.location.y
    forward_y = orig_y - 0.25        # 25 cm FORWARD (clear of wall plane)
    out_x  = orig_x - 0.50           # 50 cm to the LEFT
    f_forward_end = max(f_phase1_end + 1, int(FRAMES * 0.16))

    # FRAMES=1 → static preview of the OUT state (cavity exposed, cord drawn)
    if FRAMES == 1:
        patch.location.x = out_x
        patch.location.y = forward_y
        cord_curve.bevel_factor_end = 1.0
        cavity_light.energy = 30
        stud_accent.energy = 12
        for o in [plug_body] + prongs:
            o.hide_render = False
            o.hide_viewport = False
        return  # skip the keyframe animation entirely

    # Two-stage patch animation:
    # 1-f_phase1_end: covered (X=orig, Y=orig)
    # f_phase1_end-f_forward_end: forward only (X=orig, Y=forward_y)
    # f_forward_end-f_slide_out: forward + left (X=out_x, Y=forward_y)
    # f_slide_out-f_draw_end: hold out
    # f_draw_end-f_slide_back: slide right back to forward (X=orig, Y=forward_y)
    # f_slide_back-f_end: forward back into wall (X=orig, Y=orig)
    # Phase 1 covered hold
    patch.location.x = orig_x; patch.location.y = orig_y
    patch.keyframe_insert("location", index=0, frame=1)
    patch.keyframe_insert("location", index=1, frame=1)
    patch.keyframe_insert("location", index=0, frame=f_phase1_end)
    patch.keyframe_insert("location", index=1, frame=f_phase1_end)
    # Stage A — straight forward
    patch.location.x = orig_x; patch.location.y = forward_y
    patch.keyframe_insert("location", index=0, frame=f_forward_end)
    patch.keyframe_insert("location", index=1, frame=f_forward_end)
    # Stage B — slide left (Y stays forward)
    patch.location.x = out_x; patch.location.y = forward_y
    patch.keyframe_insert("location", index=0, frame=f_slide_out)
    patch.keyframe_insert("location", index=1, frame=f_slide_out)
    # Hold out
    patch.keyframe_insert("location", index=0, frame=f_draw_end)
    patch.keyframe_insert("location", index=1, frame=f_draw_end)
    # Reverse Stage B — slide right back to forward
    f_back_to_forward = max(f_draw_end + 1, int(FRAMES * 0.96))
    patch.location.x = orig_x; patch.location.y = forward_y
    patch.keyframe_insert("location", index=0, frame=f_back_to_forward)
    patch.keyframe_insert("location", index=1, frame=f_back_to_forward)
    # Reverse Stage A — back into wall
    patch.location.x = orig_x; patch.location.y = orig_y
    patch.keyframe_insert("location", index=0, frame=f_slide_back)
    patch.keyframe_insert("location", index=1, frame=f_slide_back)
    patch.keyframe_insert("location", index=0, frame=f_end)
    patch.keyframe_insert("location", index=1, frame=f_end)

    # Cord drawn animation via bevel_factor_end — multi-step so the cavity
    # descent runs at user-specified pace (1.75s), the hidden segment is
    # an instant 1-frame jump, and plate-emerge to plug runs at 0.50s.
    cord_curve.bevel_factor_end = 0.0
    cord_curve.keyframe_insert("bevel_factor_end", frame=1)
    cord_curve.keyframe_insert("bevel_factor_end", frame=f_draw_start)
    cord_curve.bevel_factor_end = 0.624                                     # cavity portion done
    cord_curve.keyframe_insert("bevel_factor_end", frame=f_cavity_done)
    cord_curve.bevel_factor_end = 0.836                                     # hidden + at plate front
    cord_curve.keyframe_insert("bevel_factor_end", frame=f_hidden_done)
    cord_curve.bevel_factor_end = 1.0                                       # plate-to-plug
    cord_curve.keyframe_insert("bevel_factor_end", frame=f_draw_end)
    cord_curve.keyframe_insert("bevel_factor_end", frame=f_end)

    # Plug visibility — hidden until cord nearly finishes drawing
    plug_appear_frame = max(f_draw_start, f_draw_end - max(1, int(FRAMES * 0.05)))
    for o in [plug_body] + prongs:
        o.hide_render = True
        o.hide_viewport = True
        o.keyframe_insert("hide_render",   frame=1)
        o.keyframe_insert("hide_viewport", frame=1)
        o.keyframe_insert("hide_render",   frame=plug_appear_frame - 1)
        o.keyframe_insert("hide_viewport", frame=plug_appear_frame - 1)
        o.hide_render = False
        o.hide_viewport = False
        o.keyframe_insert("hide_render",   frame=plug_appear_frame)
        o.keyframe_insert("hide_viewport", frame=plug_appear_frame)
        o.keyframe_insert("hide_render",   frame=f_end)
        o.keyframe_insert("hide_viewport", frame=f_end)

    # Cavity fill light — energy 0 during covered phases, 80 during slide-out
    # + cord-drop phases. Eliminates the patch-vs-wall lighting boundary.
    cavity_light.energy = 0
    cavity_light.keyframe_insert("energy", frame=1)
    cavity_light.keyframe_insert("energy", frame=f_phase1_end)
    cavity_light.energy = 30   # subtle — below default 40
    cavity_light.keyframe_insert("energy", frame=f_slide_out)
    cavity_light.keyframe_insert("energy", frame=f_draw_end)
    cavity_light.energy = 0
    cavity_light.keyframe_insert("energy", frame=f_slide_back)
    cavity_light.keyframe_insert("energy", frame=f_end)

    # Stud-side accent — same on/off schedule as cavity_light, low energy.
    stud_accent.energy = 0
    stud_accent.keyframe_insert("energy", frame=1)
    stud_accent.keyframe_insert("energy", frame=f_phase1_end)
    stud_accent.energy = 12
    stud_accent.keyframe_insert("energy", frame=f_slide_out)
    stud_accent.keyframe_insert("energy", frame=f_draw_end)
    stud_accent.energy = 0
    stud_accent.keyframe_insert("energy", frame=f_slide_back)
    stud_accent.keyframe_insert("energy", frame=f_end)



def _fp_fallback(fp_z):
    fp_mat = mat_pbr("Faceplate", (0.97, 0.96, 0.94), 0.0, 0.42)
    fp_hole_mat = mat_pbr("FpHole", (0.05, 0.05, 0.06), 0.0, 0.55)
    make_box("Faceplate",
             (CABLE_X_OFF, WALL_FRONT_Y - 0.004, fp_z),
             (0.13, 0.007, 0.072), fp_mat, bevel_w=0.003)
    make_box("FaceplateHole",
             (CABLE_X_OFF, WALL_FRONT_Y - 0.008, fp_z),
             (0.038, 0.001, 0.026), fp_hole_mat, bevel_w=0.0)

    # ── 6. Visible cord from faceplate down to outlet plug ──────────────
    cord_mat = mat_pbr("Cord", (0.05, 0.05, 0.06), 0.0, 0.55)
    cord_curve = bpy.data.curves.new("Cord_curve", 'CURVE')
    cord_curve.dimensions = '3D'
    cord_curve.bevel_depth = 0.006
    cord_curve.bevel_resolution = 6
    sp = cord_curve.splines.new('BEZIER')
    cord_pts = [
        (CABLE_X_OFF, WALL_FRONT_Y - 0.008, fp_z - 0.012),
        (CABLE_X_OFF, WALL_FRONT_Y - 0.018, (fp_z + OUTLET_Z) / 2),
        (CABLE_X_OFF, WALL_FRONT_Y - 0.012, OUTLET_Z + 0.018),
    ]
    sp.bezier_points.add(len(cord_pts) - 1)
    for i, (x, y, z) in enumerate(cord_pts):
        bp = sp.bezier_points[i]
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
        bp.co = Vector((x, y, z))
    cord_obj = bpy.data.objects.new("FpCord", cord_curve)
    bpy.context.collection.objects.link(cord_obj)
    cord_obj.data.materials.append(cord_mat)

    # ── 7. Outlet face plug (the cord plug at the outlet) ───────────────
    plug_mat = mat_pbr("OutletPlug", (0.05, 0.05, 0.06), 0.0, 0.45)
    make_box("OutletPlug",
             (CABLE_X_OFF, WALL_FRONT_Y - 0.012, OUTLET_Z + 0.018),
             (0.022, 0.018, 0.022), plug_mat, bevel_w=0.002)

    # ── 8. Drywall PATCH that fades in to COVER the cutaway at the end ──
    # Sized to cover the entire cutout opening; fades from alpha 0 (fully
    # transparent at frame 1) to alpha 1 (fully opaque drywall) over the
    # last quarter of the animation. Uses the same drywall PBR so it
    # blends in seamlessly when fully visible.
    patch_mat = drywall_mat()
    patch_mat.blend_method = 'BLEND'
    try: patch_mat.shadow_method = 'HASHED'
    except Exception: pass
    # Add an Alpha-driving Math node into the BSDF
    nt = patch_mat.node_tree
    bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    val_node = nt.nodes.new('ShaderNodeValue')
    val_node.outputs[0].default_value = 0.0
    val_node.name = "PatchAlpha"
    nt.links.new(val_node.outputs[0], bsdf.inputs["Alpha"])
    patch = make_box("CutoutPatch",
             (CABLE_X_OFF, WALL_FRONT_Y - 0.0008, cut_z_ctr),
             (CUT_W + 0.020, 0.004, cut_h + 0.020),
             patch_mat, bevel_w=0.0)

    # Animate the alpha value: 0 (transparent) hold, then ramp to 1.
    val_node.outputs[0].default_value = 0.0
    val_node.outputs[0].keyframe_insert("default_value", frame=1)
    val_node.outputs[0].keyframe_insert("default_value",
                                         frame=int(FRAMES * 0.65))
    val_node.outputs[0].default_value = 1.0
    val_node.outputs[0].keyframe_insert("default_value",
                                         frame=int(FRAMES * 0.95))
    val_node.outputs[0].keyframe_insert("default_value", frame=FRAMES)


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
    cover_y_ctr = WALL_FRONT_Y - 0.062

    # Cover anchored at TV bottom edge, grows DOWNWARD over the cord.
    # Build it at full final size, then move the object's origin to the
    # TOP edge of the cover so scaling Z scales it downward only.
    cover_top    = CABLE_TV_Z - 0.005
    cover_bot    = CABLE_OUT_Z + 0.020
    cover_h      = cover_top - cover_bot
    cover_mat    = mat_pbr("Raceway", (0.97, 0.96, 0.94), 0.0, 0.32)

    # Create cover centered on its final position
    cover = make_box("Raceway",
                     (CABLE_X_OFF, cover_y_ctr, (cover_top + cover_bot) / 2),
                     (0.115, 0.085, cover_h),
                     cover_mat, bevel_w=0.030, bevel_segs=5)
    # Re-anchor: move origin to the TOP edge of the cover so scale Z
    # extends downward instead of from the center.
    cover.location.z = cover_top
    for v in cover.data.vertices:
        v.co.z -= 0.5            # base mesh was centered at 0; shift so top=0

    # Animate Z scale 0.02 (effectively zero — at TV bottom) → 1.0 (full
    # cord covered). Cover GROWS DOWNWARD from the TV-bottom anchor.
    cover.scale.z = 0.02
    cover.keyframe_insert("scale", index=2, frame=1)
    cover.scale.z = 1.0
    cover.keyframe_insert("scale", index=2, frame=int(FRAMES * 0.75))
    cover.keyframe_insert("scale", index=2, frame=FRAMES)


# ── Scenario C: VISIBLE — black cable hangs from BEHIND TV with realistic
# gravity sag → realistic plug head + prongs into outlet
def setup_visible():
    build_common_scene()
    # Cord starts WAY behind TV (deep into TV body Y), exits behind TV bottom,
    # then sags naturally down to outlet via gravity-shaped bezier control points.
    Y_FRONT = WALL_FRONT_Y - 0.025
    Y_BEHIND_TV = TV_FRONT_FACE_Y + TV_D * 0.85   # inside TV body
    plug_y = WALL_FRONT_Y - 0.013
    plug_z = OUTLET_Z + 0.025                      # top duplex socket position
    plug_right_x = CABLE_X_OFF + 0.019
    # Cord goes UP behind TV (hidden by TV body), transitions Y to wall front
    # while still hidden, exits at TV bottom edge cleanly, straight down,
    # horizontal J-bend into plug right face. Plug Z aligned with cord end.
    spine = [
        ( CABLE_X_OFF, Y_BEHIND_TV, TV_Z + 0.05),                 # UP behind TV center (hidden)
        ( CABLE_X_OFF, Y_BEHIND_TV, TV_BOT_Z + 0.10),             # behind TV, above bottom
        ( CABLE_X_OFF, Y_FRONT,     TV_BOT_Z + 0.06),             # transition Y while still hidden
        ( CABLE_X_OFF, Y_FRONT,     TV_BOT_Z - 0.005),            # exits at TV bottom (front)
        ( CABLE_X_OFF, Y_FRONT,     plug_z + 0.10),               # straight down to just above plug
        ( CABLE_X_OFF + 0.030, Y_FRONT, plug_z + 0.040),          # J-bend start
        ( CABLE_X_OFF + 0.045, plug_y, plug_z),                   # horizontal at plug height
        ( plug_right_x, plug_y, plug_z),                          # into plug RIGHT FACE
    ]
    cord_obj = make_cable_curve("Cable", spine, radius=0.012)
    # Pure black cord
    cord_mat = mat_pbr("VCable", (0.008, 0.008, 0.012), 0.0, 0.55)
    cord_obj.data.materials.clear()
    cord_obj.data.materials.append(cord_mat)

    # Realistic plug head — rectangular plug body with rounded edges + 2 visible
    # angled prongs going into the outlet face. Plug body is wider than tall
    # (real US plug proportions: 38mm wide × 28mm tall × 18mm deep).
    plug_mat  = mat_pbr("VPlugBody",  (0.012, 0.012, 0.018), 0.0, 0.42)
    prong_mat = mat_pbr("VPlugProng", (0.78, 0.78, 0.80), metal=0.95, rough=0.30)
    # Body — slightly proud of outlet plate, oriented horizontally (wider X)
    plug_y = WALL_FRONT_Y - 0.013
    plug_z = OUTLET_Z + 0.025         # top duplex socket position
    make_box("VPlugBody",
        (CABLE_X_OFF, plug_y, plug_z),
        (0.038, 0.018, 0.028), plug_mat, bevel_w=0.004, bevel_segs=4)
    # Two flat metal prongs sticking INTO the outlet (toward +Y, into wall)
    for px in (-0.0075, +0.0075):
        make_box(f"VPlugProng_{int(px*1000)}",
            (CABLE_X_OFF + px, plug_y + 0.014, plug_z + 0.005),
            (0.0014, 0.012, 0.0080), prong_mat, bevel_w=0.0)
    # Strain relief at top of plug body where cord enters from the right side
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.006, depth=0.012, vertices=20,
        location=(CABLE_X_OFF + 0.013, plug_y, plug_z),
        rotation=(0, math.radians(90), 0))   # horizontal (X-axis)
    sr = bpy.context.active_object; sr.name = "VPlugStrain"
    sr.data.materials.append(plug_mat)


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
    # VP9 alpha encoding REQUIRES three things or it silently strips alpha:
    #   1. -pix_fmt yuva420p  (request alpha-aware format)
    #   2. -auto-alt-ref 0    (alt-ref frames break alpha)
    #   3. -metadata:s:v:0 alpha_mode=1  (mark stream as alpha-bearing)
    cmd = [FFMPEG, "-y", "-framerate", str(FPS),
           "-i", os.path.join(out_dir, "frame_%04d.png"),
           "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p",
           "-auto-alt-ref", "0",
           "-metadata:s:v:0", "alpha_mode=1",
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
