#!/usr/bin/env python3
"""
render_floating_shelves.py — walnut shelves + premium decor, no wall brackets
Background: pale lavender (0.86, 0.82, 0.97) matching tv-monitor.png
Run: blender --background --python scripts/render_floating_shelves.py
"""
import bpy, math, os
from mathutils import Vector, Euler

def log(m): print(m, flush=True)
log("render_floating_shelves.py started")

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for col in [bpy.data.meshes, bpy.data.materials, bpy.data.lights,
            bpy.data.cameras, bpy.data.images]:
    for b in list(col):
        try: col.remove(b)
        except: pass

scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.render.engine = 'CYCLES'
scene.cycles.samples = 320
scene.cycles.use_denoising = True
try: scene.cycles.denoiser = 'OPENIMAGEDENOISE'
except: pass
scene.render.resolution_x = 1800
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'
scene.render.film_transparent = False

try:
    cprefs = bpy.context.preferences.addons['cycles'].preferences
    cprefs.compute_device_type = 'METAL'
    cprefs.get_devices()
    scene.cycles.device = 'GPU'
    for d in cprefs.devices: d.use = (d.type == 'METAL')
    log("Metal GPU")
except Exception as e:
    scene.cycles.device = 'CPU'
    log(f"CPU fallback: {e}")

project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out_path = os.path.join(project_dir, 'public', 'assets', 'renders', 'floating-shelves.png')
os.makedirs(os.path.dirname(out_path), exist_ok=True)
scene.render.filepath = out_path
BL = bpy.app.version

# ── World ─────────────────────────────────────────────────────────────────────
world = bpy.data.worlds.get('World') or bpy.data.worlds.new('World')
scene.world = world; world.use_nodes = True
wt = world.node_tree; wt.nodes.clear()
out_w  = wt.nodes.new('ShaderNodeOutputWorld')
bg_gi  = wt.nodes.new('ShaderNodeBackground')
bg_lav = wt.nodes.new('ShaderNodeBackground')
mix_bg = wt.nodes.new('ShaderNodeMixShader')
lpath  = wt.nodes.new('ShaderNodeLightPath')
bg_gi.inputs['Color'].default_value    = (0.78, 0.74, 0.70, 1.0)
bg_gi.inputs['Strength'].default_value = 0.4
bg_lav.inputs['Color'].default_value   = (0.86, 0.82, 0.97, 1.0)
bg_lav.inputs['Strength'].default_value = 1.0
wt.links.new(lpath.outputs['Is Camera Ray'], mix_bg.inputs['Fac'])
wt.links.new(bg_gi.outputs['Background'],  mix_bg.inputs[1])
wt.links.new(bg_lav.outputs['Background'], mix_bg.inputs[2])
wt.links.new(mix_bg.outputs['Shader'], out_w.inputs['Surface'])

def node_in(bsdf, v4, v3, val):
    nm = v4 if BL >= (4,0,0) else v3
    if nm in bsdf.inputs: bsdf.inputs[nm].default_value = val

def make_mat(name, *, base_color, roughness, metallic=0., clearcoat=0., cc_rough=0.10,
             em_col=None, em_str=0.):
    mat = bpy.data.materials.new(name); mat.use_nodes = True
    n = mat.node_tree.nodes; l = mat.node_tree.links; n.clear()
    out  = n.new('ShaderNodeOutputMaterial')
    bsdf = n.new('ShaderNodeBsdfPrincipled')
    l.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    bsdf.inputs['Base Color'].default_value = (*base_color, 1.)
    bsdf.inputs['Roughness'].default_value  = roughness
    bsdf.inputs['Metallic'].default_value   = metallic
    node_in(bsdf,'Coat Weight','Clearcoat', clearcoat)
    node_in(bsdf,'Coat Roughness','Clearcoat Roughness', cc_rough)
    if em_col and em_str > 0:
        ec = 'Emission Color' if BL >= (4,0,0) else 'Emission'
        if ec in bsdf.inputs: bsdf.inputs[ec].default_value = (*em_col, 1.)
        bsdf.inputs['Emission Strength'].default_value = em_str
    return mat

def make_walnut(name):
    """Walnut with wave-ring wood grain texture"""
    mat = bpy.data.materials.new(name); mat.use_nodes = True
    n = mat.node_tree.nodes; l = mat.node_tree.links; n.clear()
    out  = n.new('ShaderNodeOutputMaterial')
    bsdf = n.new('ShaderNodeBsdfPrincipled')
    l.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    bsdf.inputs['Roughness'].default_value = 0.38
    node_in(bsdf,'Coat Weight','Clearcoat', 0.4)
    node_in(bsdf,'Coat Roughness','Clearcoat Roughness', 0.18)
    tc = n.new('ShaderNodeTexCoord')
    mp = n.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (14.0, 1.0, 1.0)
    wave = n.new('ShaderNodeTexWave')
    wave.wave_type = 'RINGS'
    wave.inputs['Scale'].default_value    = 5.0
    wave.inputs['Distortion'].default_value = 2.0
    wave.inputs['Detail'].default_value   = 6.0
    wave.inputs['Detail Scale'].default_value = 2.0
    wave.inputs['Detail Roughness'].default_value = 0.65
    ramp = n.new('ShaderNodeValToRGB')
    ramp.color_ramp.interpolation = 'B_SPLINE'
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color    = (0.06, 0.025, 0.010, 1.0)
    ramp.color_ramp.elements[1].position = 1.0
    ramp.color_ramp.elements[1].color    = (0.28, 0.14, 0.06, 1.0)
    el = ramp.color_ramp.elements.new(0.5)
    el.color = (0.15, 0.075, 0.03, 1.0)
    l.new(tc.outputs['Object'], mp.inputs['Vector'])
    l.new(mp.outputs['Vector'], wave.inputs['Vector'])
    l.new(wave.outputs['Fac'], ramp.inputs['Fac'])
    l.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])
    return mat

def make_porcelain(name, base_color=(0.93, 0.91, 0.87)):
    """Premium ceramic/porcelain with subsurface scattering and gloss clearcoat"""
    mat = bpy.data.materials.new(name); mat.use_nodes = True
    n = mat.node_tree.nodes; l = mat.node_tree.links; n.clear()
    out  = n.new('ShaderNodeOutputMaterial')
    bsdf = n.new('ShaderNodeBsdfPrincipled')
    l.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    bsdf.inputs['Base Color'].default_value = (*base_color, 1.)
    bsdf.inputs['Roughness'].default_value  = 0.10
    # Subsurface scattering for porcelain translucency
    sss_w = 'Subsurface Weight' if BL >= (4,0,0) else 'Subsurface'
    if sss_w in bsdf.inputs:
        bsdf.inputs[sss_w].default_value = 0.10
    sss_r = 'Subsurface Radius'
    if sss_r in bsdf.inputs:
        bsdf.inputs[sss_r].default_value = (0.60, 0.28, 0.20)
    sss_c = 'Subsurface Color'
    if sss_c in bsdf.inputs:
        bsdf.inputs[sss_c].default_value = (*base_color, 1.)
    node_in(bsdf, 'Coat Weight', 'Clearcoat', 0.85)
    node_in(bsdf, 'Coat Roughness', 'Clearcoat Roughness', 0.06)
    # Slight normal variation for authentic ceramic surface
    noise = n.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = 32.0
    noise.inputs['Detail'].default_value = 4.0
    noise.inputs['Roughness'].default_value = 0.5
    noise.inputs['Distortion'].default_value = 0.1
    bump = n.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.15
    bump.inputs['Distance'].default_value = 0.008
    l.new(noise.outputs['Fac'], bump.inputs['Height'])
    l.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    return mat

def make_terra(name):
    """Terra cotta with noise grain, SSS clay feel, matte surface"""
    mat = bpy.data.materials.new(name); mat.use_nodes = True
    n = mat.node_tree.nodes; l = mat.node_tree.links; n.clear()
    out  = n.new('ShaderNodeOutputMaterial')
    bsdf = n.new('ShaderNodeBsdfPrincipled')
    l.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    noise = n.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = 9.0
    noise.inputs['Detail'].default_value = 7.0
    noise.inputs['Roughness'].default_value = 0.72
    noise.inputs['Distortion'].default_value = 0.3
    ramp = n.new('ShaderNodeValToRGB')
    ramp.color_ramp.interpolation = 'B_SPLINE'
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color    = (0.38, 0.11, 0.04, 1.0)
    ramp.color_ramp.elements[1].position = 1.0
    ramp.color_ramp.elements[1].color    = (0.65, 0.24, 0.10, 1.0)
    el = ramp.color_ramp.elements.new(0.45)
    el.color = (0.52, 0.17, 0.07, 1.0)
    l.new(noise.outputs['Fac'], ramp.inputs['Fac'])
    l.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = 0.78
    # Clay SSS
    sss_w = 'Subsurface Weight' if BL >= (4,0,0) else 'Subsurface'
    if sss_w in bsdf.inputs:
        bsdf.inputs[sss_w].default_value = 0.05
    sss_r = 'Subsurface Radius'
    if sss_r in bsdf.inputs:
        bsdf.inputs[sss_r].default_value = (0.45, 0.15, 0.08)
    # Surface roughness texture for authentic fired clay
    bump = n.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.30
    bump.inputs['Distance'].default_value = 0.015
    l.new(noise.outputs['Fac'], bump.inputs['Height'])
    l.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    return mat

def make_stone(name, base=(0.58, 0.52, 0.46)):
    """Smooth stone / river stone with subtle variation"""
    mat = bpy.data.materials.new(name); mat.use_nodes = True
    n = mat.node_tree.nodes; l = mat.node_tree.links; n.clear()
    out  = n.new('ShaderNodeOutputMaterial')
    bsdf = n.new('ShaderNodeBsdfPrincipled')
    l.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    noise = n.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = 6.0
    noise.inputs['Detail'].default_value = 8.0
    noise.inputs['Roughness'].default_value = 0.65
    noise.inputs['Distortion'].default_value = 0.4
    ramp = n.new('ShaderNodeValToRGB')
    ramp.color_ramp.interpolation = 'B_SPLINE'
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color    = (0.42, 0.38, 0.34, 1.0)
    ramp.color_ramp.elements[1].position = 1.0
    ramp.color_ramp.elements[1].color    = (0.72, 0.66, 0.58, 1.0)
    l.new(noise.outputs['Fac'], ramp.inputs['Fac'])
    l.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = 0.72
    bump = n.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.5
    bump.inputs['Distance'].default_value = 0.020
    l.new(noise.outputs['Fac'], bump.inputs['Height'])
    l.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    return mat

def make_antique_brass(name):
    """Rich antique brass with tarnish variation and micro-scratches"""
    mat = bpy.data.materials.new(name); mat.use_nodes = True
    n = mat.node_tree.nodes; l = mat.node_tree.links; n.clear()
    out  = n.new('ShaderNodeOutputMaterial')
    bsdf = n.new('ShaderNodeBsdfPrincipled')
    l.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    bsdf.inputs['Metallic'].default_value = 1.0
    # Color variation: warm bright brass to deeper aged areas
    noise_col = n.new('ShaderNodeTexNoise')
    noise_col.inputs['Scale'].default_value = 18.0
    noise_col.inputs['Detail'].default_value = 8.0
    noise_col.inputs['Roughness'].default_value = 0.55
    ramp_col = n.new('ShaderNodeValToRGB')
    ramp_col.color_ramp.interpolation = 'B_SPLINE'
    ramp_col.color_ramp.elements[0].position = 0.0
    ramp_col.color_ramp.elements[0].color    = (0.55, 0.34, 0.08, 1.0)  # aged dark brass
    ramp_col.color_ramp.elements[1].position = 1.0
    ramp_col.color_ramp.elements[1].color    = (0.92, 0.68, 0.14, 1.0)  # bright polished brass
    el = ramp_col.color_ramp.elements.new(0.5)
    el.color = (0.78, 0.55, 0.12, 1.0)
    # Roughness variation
    noise_r = n.new('ShaderNodeTexNoise')
    noise_r.inputs['Scale'].default_value = 40.0
    noise_r.inputs['Detail'].default_value = 4.0
    noise_r.inputs['Roughness'].default_value = 0.5
    ramp_r = n.new('ShaderNodeValToRGB')
    ramp_r.color_ramp.elements[0].position = 0.0
    ramp_r.color_ramp.elements[0].color = (0.04, 0.04, 0.04, 1.0)
    ramp_r.color_ramp.elements[1].position = 1.0
    ramp_r.color_ramp.elements[1].color = (0.22, 0.22, 0.22, 1.0)
    # Micro-bump for brushed look
    noise_b = n.new('ShaderNodeTexNoise')
    noise_b.inputs['Scale'].default_value = 80.0
    noise_b.inputs['Detail'].default_value = 2.0
    noise_b.inputs['Roughness'].default_value = 0.6
    bump = n.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.25
    bump.inputs['Distance'].default_value = 0.004
    l.new(noise_col.outputs['Fac'], ramp_col.inputs['Fac'])
    l.new(noise_r.outputs['Fac'], ramp_r.inputs['Fac'])
    l.new(ramp_col.outputs['Color'], bsdf.inputs['Base Color'])
    l.new(ramp_r.outputs['Color'], bsdf.inputs['Roughness'])
    l.new(noise_b.outputs['Fac'], bump.inputs['Height'])
    l.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    node_in(bsdf, 'Coat Weight', 'Clearcoat', 0.15)
    node_in(bsdf, 'Coat Roughness', 'Clearcoat Roughness', 0.10)
    return mat

def make_plant(name):
    """Botanical plant leaf with translucency and vein detail"""
    mat = bpy.data.materials.new(name); mat.use_nodes = True
    n = mat.node_tree.nodes; l = mat.node_tree.links; n.clear()
    out  = n.new('ShaderNodeOutputMaterial')
    bsdf = n.new('ShaderNodeBsdfPrincipled')
    l.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    # Leaf color with noise variation
    noise = n.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = 12.0
    noise.inputs['Detail'].default_value = 6.0
    noise.inputs['Roughness'].default_value = 0.7
    ramp = n.new('ShaderNodeValToRGB')
    ramp.color_ramp.interpolation = 'B_SPLINE'
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color    = (0.04, 0.18, 0.05, 1.0)  # deep forest green
    ramp.color_ramp.elements[1].position = 1.0
    ramp.color_ramp.elements[1].color    = (0.12, 0.38, 0.10, 1.0)  # bright leaf green
    el = ramp.color_ramp.elements.new(0.5)
    el.color = (0.07, 0.26, 0.07, 1.0)
    l.new(noise.outputs['Fac'], ramp.inputs['Fac'])
    l.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = 0.75
    # Translucency for backlit leaf effect
    trans_w = 'Transmission Weight' if BL >= (4,0,0) else 'Transmission'
    if trans_w in bsdf.inputs:
        bsdf.inputs[trans_w].default_value = 0.08
    # SSS for leaf thickness
    sss_w = 'Subsurface Weight' if BL >= (4,0,0) else 'Subsurface'
    if sss_w in bsdf.inputs:
        bsdf.inputs[sss_w].default_value = 0.06
    sss_r = 'Subsurface Radius'
    if sss_r in bsdf.inputs:
        bsdf.inputs[sss_r].default_value = (0.06, 0.20, 0.03)
    return mat

def make_dark_wood(name):
    """Ebony/dark rosewood with rich grain detail"""
    mat = bpy.data.materials.new(name); mat.use_nodes = True
    n = mat.node_tree.nodes; l = mat.node_tree.links; n.clear()
    out  = n.new('ShaderNodeOutputMaterial')
    bsdf = n.new('ShaderNodeBsdfPrincipled')
    l.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    tc = n.new('ShaderNodeTexCoord')
    mp = n.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (8.0, 1.0, 1.0)
    wave = n.new('ShaderNodeTexWave')
    wave.wave_type = 'RINGS'
    wave.inputs['Scale'].default_value = 4.0
    wave.inputs['Distortion'].default_value = 1.8
    wave.inputs['Detail'].default_value = 5.0
    wave.inputs['Detail Scale'].default_value = 1.8
    wave.inputs['Detail Roughness'].default_value = 0.7
    ramp = n.new('ShaderNodeValToRGB')
    ramp.color_ramp.interpolation = 'B_SPLINE'
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color    = (0.015, 0.006, 0.002, 1.0)  # near-black
    ramp.color_ramp.elements[1].position = 1.0
    ramp.color_ramp.elements[1].color    = (0.12, 0.06, 0.025, 1.0)    # dark mahogany
    l.new(tc.outputs['Object'], mp.inputs['Vector'])
    l.new(mp.outputs['Vector'], wave.inputs['Vector'])
    l.new(wave.outputs['Fac'], ramp.inputs['Fac'])
    l.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = 0.48
    node_in(bsdf, 'Coat Weight', 'Clearcoat', 0.55)
    node_in(bsdf, 'Coat Roughness', 'Clearcoat Roughness', 0.22)
    return mat

MAT_WALNUT  = make_walnut('Walnut')
MAT_BRASS   = make_antique_brass('Brass')
MAT_GREEN   = make_plant('Plant')
MAT_DKWOOD  = make_dark_wood('DkWood')
MAT_LED     = make_mat('LED', base_color=(1.0,0.95,0.82), roughness=0.90,
                        em_col=(1.0,0.92,0.70), em_str=3.5)

def assign(obj, mat):
    obj.data.materials.clear(); obj.data.materials.append(mat)

def cyl(r, h, loc, mat, verts=32):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=verts, location=loc)
    obj = bpy.context.active_object; assign(obj, mat)
    for p in obj.data.polygons: p.use_smooth = True
    return obj

def box(loc, w, d, h, mat, bevel_w=0.):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.active_object; obj.scale = (w, d, h)
    bpy.ops.object.transform_apply(scale=True)
    if bevel_w > 0:
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_add(type='BEVEL')
        m = obj.modifiers[-1]; m.width = bevel_w; m.segments = 3; m.profile = 0.5
        try: m.limit_method = 'ANGLE'; m.angle_limit = math.radians(60)
        except: pass
        bpy.ops.object.modifier_apply(modifier=m.name)
    for p in obj.data.polygons: p.use_smooth = True
    assign(obj, mat)
    return obj

# ── Back wall ─────────────────────────────────────────────────────────────────
SW = 1.36; SD = 0.22; ST = 0.060
shelf_top = lambda z: z + ST/2

bpy.ops.mesh.primitive_plane_add(size=6, location=(0, SD-0.001, 0.0))
wall = bpy.context.active_object; wall.name = 'BackWall'
wall.rotation_euler = Euler((math.radians(90), 0, 0), 'XYZ')
wall.scale = (1.0, 0.65, 1.0); bpy.ops.object.transform_apply(scale=True)
mat_wall = bpy.data.materials.new('WallMat'); mat_wall.use_nodes = True
nw = mat_wall.node_tree.nodes; lw = mat_wall.node_tree.links; nw.clear()
bd = nw.new('ShaderNodeBsdfDiffuse'); ow = nw.new('ShaderNodeOutputMaterial')
bd.inputs['Color'].default_value = (0.85, 0.81, 0.95, 1.0)
lw.new(bd.outputs['BSDF'], ow.inputs['Surface'])
wall.data.materials.clear(); wall.data.materials.append(mat_wall)

# ── 3 shelves (no brackets) ───────────────────────────────────────────────────
shelf_zs = [0.46, 0.00, -0.46]

for z in shelf_zs:
    box((0, SD/2, z), SW, SD, ST, MAT_WALNUT, bevel_w=0.006)
    # LED strip under shelf
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.012, z-ST/2-0.004))
    led = bpy.context.active_object; led.scale = (SW/2-0.06, 0.003, 0.004)
    bpy.ops.object.transform_apply(scale=True)
    assign(led, MAT_LED)

yf = SD * 0.30

# ── Shelf 1 (top) — porcelain vases, brass stems, colorful books ──────────────
z = shelf_zs[0]; t = shelf_top(z)
MAT_PORC1 = make_porcelain('Porc1', (0.94, 0.92, 0.88))  # warm white
MAT_PORC2 = make_porcelain('Porc2', (0.88, 0.86, 0.96))  # soft lavender-white
# Tall porcelain vase
cyl(0.026, 0.160, (-0.48, yf, t+0.080), MAT_PORC1)
cyl(0.013, 0.020, (-0.48, yf, t+0.170), MAT_PORC1)   # lip
# Slim brass bud vases
cyl(0.006, 0.140, (-0.28, yf+0.01, t+0.070), MAT_BRASS, 16)
cyl(0.004, 0.104, (-0.22, yf, t+0.052), MAT_BRASS, 16)
# Books with premium spines
for i,(bx,col) in enumerate([
    (-0.06, (0.22, 0.30, 0.48)),  # slate blue
    ( 0.01, (0.38, 0.22, 0.15)),  # cognac
    ( 0.08, (0.16, 0.32, 0.20)),  # forest green
]):
    box((bx, yf, t+0.075), 0.022, 0.090, 0.150,
        make_mat(f'bk{i}', base_color=col, roughness=0.78), bevel_w=0.002)
# Terra cotta dish
MAT_TC1 = make_terra('TC1')
cyl(0.022, 0.030, (0.44, yf, t+0.015), MAT_TC1)
cyl(0.016, 0.014, (0.44, yf, t+0.037), MAT_TC1)  # inner bowl indent

# ── Shelf 2 (middle) — stone vases, terra cotta pots ─────────────────────────
z = shelf_zs[1]; t = shelf_top(z)
MAT_ST1 = make_stone('Stone1', (0.60, 0.54, 0.48))
MAT_ST2 = make_stone('Stone2', (0.50, 0.46, 0.42))
MAT_TC2 = make_terra('TC2')
MAT_PORC3 = make_porcelain('Porc3', (0.92, 0.90, 0.86))
# Large sculptural stone vase
cyl(0.048, 0.088, (-0.38, yf, t+0.044), MAT_PORC3)
cyl(0.025, 0.020, (-0.38, yf, t+0.098), MAT_PORC3)  # neck collar
# Smooth stone vessels
cyl(0.025, 0.080, (-0.04, yf, t+0.040), MAT_ST1)
cyl(0.018, 0.062, ( 0.05, yf, t+0.031), MAT_ST2)
# Terra cotta pot + smaller one
cyl(0.030, 0.048, (0.39, yf, t+0.024), MAT_TC2)
MAT_PORC4 = make_porcelain('Porc4', (0.95, 0.94, 0.92))
cyl(0.017, 0.044, (0.52, yf, t+0.022), MAT_PORC4)

# ── Shelf 3 (bottom) — dark wood box, plant, brass vase ──────────────────────
z = shelf_zs[2]; t = shelf_top(z)
# Dark wood keepsake box with inset panel
box((-0.38, yf, t+0.090), 0.148, 0.016, 0.180, MAT_DKWOOD, bevel_w=0.003)
box((-0.38, yf-0.007, t+0.090), 0.112, 0.004, 0.136,
    make_mat('cvs', base_color=(0.84, 0.80, 0.72), roughness=0.88))
# Terra cotta plant pot
MAT_TC3 = make_terra('TC3')
cyl(0.034, 0.046, (0.06, yf, t+0.023), MAT_TC3)
# Botanical plant — leaves arch UP from center, not sideways
# Each leaf is a flat oval shape standing nearly vertical, curving outward at top
plant_cx = 0.06
plant_base_z = t + 0.046  # top of pot
for i, (angle, lean, h, w, d) in enumerate([
    (  0, 20, 0.090, 0.014, 0.022),   # outer leaves arch outward
    ( 72, 22, 0.085, 0.013, 0.020),
    (144, 20, 0.088, 0.013, 0.021),
    (216, 21, 0.086, 0.012, 0.020),
    (288, 19, 0.090, 0.014, 0.022),
    ( 36, 10, 0.072, 0.010, 0.018),   # inner upright leaves
    (108, 12, 0.068, 0.009, 0.016),
    (180, 11, 0.070, 0.010, 0.017),
    (252, 10, 0.068, 0.009, 0.016),
    (324, 11, 0.072, 0.010, 0.018),
]):
    a = math.radians(angle)
    # Base of leaf at plant center, tilts outward by 'lean' degrees
    bpy.ops.mesh.primitive_cube_add(size=1,
        location=(plant_cx + math.cos(a)*0.008,
                  yf + math.sin(a)*0.005,
                  plant_base_z + h/2))
    leaf = bpy.context.active_object
    leaf.scale = (w, d, h)
    bpy.ops.object.transform_apply(scale=True)
    # Rotate: lean outward around horizontal axis perpendicular to leaf direction
    lean_rad = math.radians(lean)
    leaf.rotation_euler = Euler((math.cos(a)*lean_rad, math.sin(a)*lean_rad, a), 'XYZ')
    assign(leaf, MAT_GREEN)
# Antique brass candlestick
cyl(0.018, 0.065, (0.40, yf, t+0.033), MAT_BRASS, 20)
cyl(0.028, 0.012, (0.40, yf, t+0.071), MAT_BRASS, 20)  # cap disc
cyl(0.012, 0.010, (0.40, yf, t+0.079), MAT_BRASS, 20)  # neck
cyl(0.022, 0.014, (0.40, yf, t+0.090), MAT_BRASS, 20)  # cup
# Small porcelain piece
MAT_PORC5 = make_porcelain('Porc5', (0.90, 0.88, 0.94))
cyl(0.019, 0.046, (0.52, yf, t+0.023), MAT_PORC5)
cyl(0.012, 0.012, (0.52, yf, t+0.052), MAT_PORC5)  # neck

log("Geometry done")

# ── Lights ─────────────────────────────────────────────────────────────────────
def add_area(loc, energy, size, color, rot_xyz):
    bpy.ops.object.light_add(type='AREA', location=loc)
    L = bpy.context.active_object
    L.data.energy = energy; L.data.size = size; L.data.color = color
    L.rotation_euler = Euler(tuple(math.radians(d) for d in rot_xyz), 'XYZ')

add_area((-2.5,-2.0, 2.5), 900, 3.0, (1.0,0.97,0.90), (34,0,-28))
add_area(( 2.5,-1.6, 0.0), 250, 4.5, (0.90,0.94,1.0),  (6,0,38))
add_area(( 0.0,-0.8, 4.0), 450, 3.0, (1.0,0.98,0.94),  (78,0,0))
add_area(( 0.6, 2.8, 0.6), 320, 1.4, (0.85,0.88,1.0),  (-50,0,12))

# ── Camera ─────────────────────────────────────────────────────────────────────
cam_data = bpy.data.cameras.new('Camera')
cam_data.lens = 42; cam_data.clip_start = 0.01; cam_data.clip_end = 50.
cam_obj = bpy.data.objects.new('Camera', cam_data)
bpy.context.collection.objects.link(cam_obj); scene.camera = cam_obj
cam_pos = Vector((-0.05, -2.85, -0.06))
look_at  = Vector(( 0.0,  SD*0.30, 0.04))
cam_obj.location = cam_pos
cam_obj.rotation_euler = (look_at - cam_pos).to_track_quat('-Z', 'Y').to_euler()

log("Rendering...")
bpy.ops.render.render(write_still=True)
log(f"Done → {out_path}")
