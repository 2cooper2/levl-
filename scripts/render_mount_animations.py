#!/usr/bin/env python3
"""
render_mount_animations.py — Animated WebM renders for tilting + full-motion mounts.
Matches the original WebGL motion: sinusoidal oscillation + camera panning
side-view → front-view → side-view per 96-frame (4s) loop.

Run: /Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/render_mount_animations.py
"""
import bpy, math, os, subprocess
from mathutils import Vector, Euler

def log(m): print(m, flush=True)
log("render_mount_animations.py started")

project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT      = os.path.join(project_dir, 'public', 'assets', 'renders')
HDRI_DIR = os.path.join(project_dir, 'tmp_textures', 'hdri')
BL = bpy.app.version

HDRI = os.path.join(HDRI_DIR, 'cyclorama_hard_light_2k.hdr')
if not os.path.exists(HDRI):
    HDRI = None

FRAMES  = int(os.environ.get("LEVL_FRAMES", "96"))
FPS     = 24
SAMPLES = int(os.environ.get("LEVL_SAMPLES", "256"))

# ── Easing ────────────────────────────────────────────────────────────────────

def smoothstep(t):
    """Cubic smoothstep: maps 0→1 smoothly (clamps outside range)."""
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)

def lerp(a, b, t):
    return a + (b - a) * t

def lerp3(a, b, t):
    return (lerp(a[0],b[0],t), lerp(a[1],b[1],t), lerp(a[2],b[2],t))

# ── Scene helpers ──────────────────────────────────────────────────────────────

def clear():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for col in [bpy.data.meshes, bpy.data.materials,
                bpy.data.lights, bpy.data.cameras]:
        for b in list(col):
            try: col.remove(b)
            except: pass

def setup(fp):
    sc = bpy.context.scene
    sc.unit_settings.system  = 'METRIC'
    sc.render.engine          = 'CYCLES'
    sc.cycles.samples         = SAMPLES
    sc.cycles.use_denoising   = True
    try: sc.cycles.denoiser   = 'OPENIMAGEDENOISE'
    except: pass
    # Higher light bounces — better AO in tight joints, better metal inter-reflections
    sc.cycles.diffuse_bounces      = 6
    sc.cycles.glossy_bounces       = 6
    sc.cycles.transmission_bounces = 8
    sc.cycles.max_bounces          = 14
    sc.render.resolution_x    = 900
    sc.render.resolution_y    = 1170
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode  = 'RGBA'
    sc.render.film_transparent = True
    sc.cycles.device = 'CPU'
    try:
        cp = bpy.context.preferences.addons['cycles'].preferences
        for d in ('METAL','OPTIX','CUDA'):
            try: cp.compute_device_type=d; cp.get_devices(); sc.cycles.device='GPU'; break
            except: pass
    except: pass
    try:
        sc.view_settings.view_transform = 'AgX'
        sc.view_settings.look            = 'AgX - Medium High Contrast'
        sc.view_settings.exposure        = 0.30
        sc.view_settings.gamma           = 1.0
    except:
        try: sc.view_settings.view_transform = 'Filmic'
        except: pass
    sc.render.filepath = fp

def setup_world_hdri(hdri_path=None):
    sc = bpy.context.scene
    w  = bpy.data.worlds.get('World') or bpy.data.worlds.new('World')
    sc.world = w; w.use_nodes = True
    nt = w.node_tree; nt.nodes.clear()
    out_w  = nt.nodes.new('ShaderNodeOutputWorld')
    lp     = nt.nodes.new('ShaderNodeLightPath')
    mx     = nt.nodes.new('ShaderNodeMixShader')

    if hdri_path and os.path.exists(hdri_path):
        env = nt.nodes.new('ShaderNodeBackground')
        tex = nt.nodes.new('ShaderNodeTexEnvironment')
        img = bpy.data.images.load(hdri_path)
        tex.image = img
        env.inputs['Strength'].default_value = 0.60
        nt.links.new(tex.outputs['Color'], env.inputs['Color'])
        gi  = nt.nodes.new('ShaderNodeBackground')
        gi.inputs['Color'].default_value    = (0.76, 0.72, 0.90, 1.0)
        gi.inputs['Strength'].default_value = 0.30
        mx2 = nt.nodes.new('ShaderNodeMixShader')
        nt.links.new(lp.outputs['Is Glossy Ray'], mx2.inputs['Fac'])
        nt.links.new(gi.outputs['Background'],    mx2.inputs[1])
        nt.links.new(env.outputs['Background'],   mx2.inputs[2])
        nt.links.new(lp.outputs['Is Camera Ray'], mx.inputs['Fac'])
        black = nt.nodes.new('ShaderNodeBackground')
        black.inputs['Color'].default_value    = (0.0,0.0,0.0,1.0)
        black.inputs['Strength'].default_value = 0.0
        nt.links.new(mx2.outputs['Shader'], mx.inputs[1])
        nt.links.new(black.outputs['Background'], mx.inputs[2])
    else:
        gi  = nt.nodes.new('ShaderNodeBackground')
        gi.inputs['Color'].default_value    = (0.76, 0.72, 0.90, 1.0)
        gi.inputs['Strength'].default_value = 0.50
        rfl = nt.nodes.new('ShaderNodeBackground')
        rfl.inputs['Color'].default_value    = (0.92, 0.86, 0.76, 1.0)
        rfl.inputs['Strength'].default_value = 0.40
        mx2 = nt.nodes.new('ShaderNodeMixShader')
        nt.links.new(lp.outputs['Is Glossy Ray'], mx2.inputs['Fac'])
        nt.links.new(gi.outputs['Background'],    mx2.inputs[1])
        nt.links.new(rfl.outputs['Background'],   mx2.inputs[2])
        nt.links.new(lp.outputs['Is Camera Ray'], mx.inputs['Fac'])
        black = nt.nodes.new('ShaderNodeBackground')
        black.inputs['Color'].default_value    = (0.0,0.0,0.0,1.0)
        black.inputs['Strength'].default_value = 0.0
        nt.links.new(mx2.outputs['Shader'], mx.inputs[1])
        nt.links.new(black.outputs['Background'], mx.inputs[2])

    nt.links.new(mx.outputs['Shader'], out_w.inputs['Surface'])

def shadow_catcher(z=-0.01):
    bpy.ops.mesh.primitive_plane_add(size=14, location=(0, 0, z))
    sc = bpy.context.active_object; sc.name = 'Shadow'
    try:    sc.is_shadow_catcher = True
    except:
        try: sc.cycles.is_shadow_catcher = True
        except: pass

def add_camera(loc, tgt, focal_mm=75, fstop=4.0):
    cd = bpy.data.cameras.new('Camera')
    cd.lens      = focal_mm; cd.lens_unit = 'MILLIMETERS'
    cd.clip_start = 0.01; cd.clip_end = 50.0
    cd.dof.use_dof        = True
    cd.dof.focus_distance = (Vector(tgt) - Vector(loc)).length
    cd.dof.aperture_fstop = fstop
    co = bpy.data.objects.new('Camera', cd)
    bpy.context.collection.objects.link(co)
    bpy.context.scene.camera = co
    co.location       = Vector(loc)
    co.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat('-Z','Y').to_euler()

def add_lights():
    """Product photography light tent: large wrap key, softbox fill, rim, reflection panels."""
    def area(name, loc, energy, size, color, rot_xyz, vis_cam=True, vis_gls=True):
        bpy.ops.object.light_add(type='AREA', location=loc)
        L = bpy.context.active_object; L.name = name
        L.data.energy = energy; L.data.size = size; L.data.color = color
        L.rotation_euler = Euler(tuple(math.radians(d) for d in rot_xyz), 'XYZ')
        try:
            if hasattr(L,'visible_camera'): L.visible_camera=vis_cam; L.visible_glossy=vis_gls
        except: pass
    # Large wrap key (upper-left, warm)
    area('Key',   (-2.2, -3.2, 4.8), 420, 2.8, (1.00, 0.97, 0.92), ( 38, 0, -22))
    # Softbox fill (front-right, cool)
    area('Fill',  ( 3.2, -2.0, 2.2), 200, 3.8, (0.88, 0.93, 1.00), ( 14, 0,  38))
    # Top overhead (neutral)
    area('Top',   ( 0.0, -1.2, 6.8), 160, 4.5, (1.00, 0.98, 0.96), ( 82, 0,   0))
    # Rim/back light (purple tint, back-right)
    area('Rim',   ( 1.0,  3.2, 3.8), 340, 1.6, (0.55, 0.32, 1.00), (-38, 0,  14))
    # Invisible reflection panels — drive specular highlights on metal surfaces
    area('ReflA', ( 2.8, -4.5, 3.8), 600, 14.0, (1.00, 0.96, 0.88), ( 22, 0, -18), vis_cam=False, vis_gls=True)
    area('ReflB', (-3.2, -3.8, 2.8), 360, 10.0, (0.88, 0.78, 1.00), ( 16, 0,  22), vis_cam=False, vis_gls=True)
    area('ReflC', ( 0.0, -2.5, 0.3), 140, 4.0,  (0.95, 0.85, 0.70), (  0, 0,   0), vis_cam=False, vis_gls=True)
    # Side panel — catchlight on chrome pins from the right
    area('ReflD', ( 4.5,  0.5, 1.5), 280, 6.0,  (1.00, 0.95, 0.90), (  0, 0, -90), vis_cam=False, vis_gls=True)

# ── Materials ──────────────────────────────────────────────────────────────────

def mp(nm, base, rough, metal=0., coat=0., coat_r=0.08):
    m = bpy.data.materials.new(nm); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial')
    b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = (*base, 1.)
    b.inputs['Roughness'].default_value  = rough
    b.inputs['Metallic'].default_value   = metal
    for v4,v3,val in [('Coat Weight','Clearcoat',coat),('Coat Roughness','Clearcoat Roughness',coat_r)]:
        k = v4 if BL>=(4,0,0) else v3
        if k in b.inputs: b.inputs[k].default_value = val
    nt.links.new(b.outputs['BSDF'], o.inputs['Surface']); return m

def me(nm, color, strength):
    m = bpy.data.materials.new(nm); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial')
    e = nt.nodes.new('ShaderNodeEmission')
    e.inputs['Color'].default_value    = (*color, 1.)
    e.inputs['Strength'].default_value = strength
    nt.links.new(e.outputs['Emission'], o.inputs['Surface']); return m

GM    = lambda: mp('gm',    (0.14,0.16,0.20), 0.16,  metal=0.97, coat=0.55, coat_r=0.07)
GM_TV = lambda: mp('gm_tv', (0.17,0.18,0.21), 0.07,  metal=1.00, coat=0.72, coat_r=0.03)
BR    = lambda: mp('br',    (0.58,0.62,0.68), 0.20,  metal=0.96, coat=0.32, coat_r=0.12)
GO    = lambda: mp('go',    (0.96,0.74,0.15), 0.04,  metal=0.99, coat=0.96, coat_r=0.02)
BZ    = lambda: mp('bz',    (0.005,0.005,0.007), 0.015, metal=0.0, coat=1.0, coat_r=0.008)
PUR   = lambda: me('pur', (0.62,0.30,1.00), 3.0)

def BK():
    """Matte black powder coat — edge wear (bare steel at corners) + micro-roughness variation."""
    m = bpy.data.materials.new('bk'); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    o  = nt.nodes.new('ShaderNodeOutputMaterial')
    tc = nt.nodes.new('ShaderNodeTexCoord')

    # ── Base: matte black powder coat with micro-roughness noise ──
    black = nt.nodes.new('ShaderNodeBsdfPrincipled')
    black.inputs['Base Color'].default_value = (0.018, 0.020, 0.022, 1.)
    black.inputs['Metallic'].default_value   = 0.0
    for v4,v3,val in [('Coat Weight','Clearcoat',0.10),('Coat Roughness','Clearcoat Roughness',0.55)]:
        k = v4 if BL>=(4,0,0) else v3
        if k in black.inputs: black.inputs[k].default_value = val
    # Noise → roughness variation (0.62–0.74 across surface)
    noise = nt.nodes.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value     = 24.0
    noise.inputs['Detail'].default_value    = 4.0
    noise.inputs['Roughness'].default_value = 0.60
    nt.links.new(tc.outputs['Object'], noise.inputs['Vector'])
    rmap = nt.nodes.new('ShaderNodeMapRange')
    rmap.inputs[3].default_value = 0.62   # To Min
    rmap.inputs[4].default_value = 0.74   # To Max
    nt.links.new(noise.outputs['Fac'], rmap.inputs['Value'])
    nt.links.new(rmap.outputs['Result'], black.inputs['Roughness'])

    # ── Edge wear: bare steel exposed at sharp edges (Pointiness) ──
    steel = nt.nodes.new('ShaderNodeBsdfPrincipled')
    steel.inputs['Base Color'].default_value = (0.30, 0.32, 0.36, 1.)
    steel.inputs['Roughness'].default_value  = 0.26
    steel.inputs['Metallic'].default_value   = 0.94
    geo  = nt.nodes.new('ShaderNodeNewGeometry')
    wramp = nt.nodes.new('ShaderNodeValToRGB')
    wramp.color_ramp.elements[0].position = 0.56; wramp.color_ramp.elements[0].color = (0,0,0,1)
    wramp.color_ramp.elements[1].position = 0.80; wramp.color_ramp.elements[1].color = (1,1,1,1)
    nt.links.new(geo.outputs['Pointiness'], wramp.inputs['Fac'])

    mix = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(wramp.outputs['Color'],   mix.inputs['Fac'])
    nt.links.new(black.outputs['BSDF'],    mix.inputs[1])
    nt.links.new(steel.outputs['BSDF'],    mix.inputs[2])
    nt.links.new(mix.outputs['Shader'],    o.inputs['Surface'])
    return m

def CH():
    """Anisotropic brushed chrome with fingerprint smudge layer."""
    m = bpy.data.materials.new('ch'); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    o  = nt.nodes.new('ShaderNodeOutputMaterial')
    tc = nt.nodes.new('ShaderNodeTexCoord')
    b  = nt.nodes.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = (0.84, 0.88, 0.94, 1.)
    b.inputs['Metallic'].default_value   = 1.0
    for v4,v3,val in [('Coat Weight','Clearcoat',0.98),('Coat Roughness','Clearcoat Roughness',0.015)]:
        k = v4 if BL>=(4,0,0) else v3
        if k in b.inputs: b.inputs[k].default_value = val
    # Anisotropic brushed finish
    for key in ['Anisotropic', 'Anisotropy']:
        if key in b.inputs: b.inputs[key].default_value = 0.55; break
    for key in ['Anisotropic Rotation', 'Anisotropy Rotation']:
        if key in b.inputs: b.inputs[key].default_value = 0.0; break
    # Fingerprint/smudge: noise drives roughness from 0.03–0.14
    smudge = nt.nodes.new('ShaderNodeTexNoise')
    smudge.inputs['Scale'].default_value     = 7.0
    smudge.inputs['Detail'].default_value    = 6.0
    smudge.inputs['Roughness'].default_value = 0.5
    nt.links.new(tc.outputs['Object'], smudge.inputs['Vector'])
    srmap = nt.nodes.new('ShaderNodeMapRange')
    srmap.inputs[3].default_value = 0.03   # To Min
    srmap.inputs[4].default_value = 0.14   # To Max
    nt.links.new(smudge.outputs['Fac'], srmap.inputs['Value'])
    nt.links.new(srmap.outputs['Result'], b.inputs['Roughness'])
    nt.links.new(b.outputs['BSDF'], o.inputs['Surface'])
    return m

def SCR():
    """OLED TV screen: night cityscape — true blacks, vivid neon HDR, infinite contrast."""
    m = bpy.data.materials.new('scr'); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')

    tc  = nt.nodes.new('ShaderNodeTexCoord')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    nt.links.new(tc.outputs['Generated'], sep.inputs['Vector'])

    # ── Base: near-absolute-black sky gradient (OLED true blacks) ──
    sky = nt.nodes.new('ShaderNodeValToRGB')
    e = sky.color_ramp.elements
    e[0].position=0.0;  e[0].color=(0.0,   0.0,   0.0,   1)  # absolute black ground
    e[1].position=1.0;  e[1].color=(0.0,   0.0,   0.012, 1)  # near-black sky
    e1=e.new(0.18); e1.color=(0.0,   0.0,   0.0,   1)         # building silhouettes
    e2=e.new(0.23); e2.color=(0.008, 0.004, 0.018, 1)         # horizon city glow
    e3=e.new(0.30); e3.color=(0.012, 0.006, 0.030, 1)         # sky glow above city
    nt.links.new(sep.outputs['Y'], sky.inputs['Fac'])

    # ── Orange/amber city window lights (lower half, small-scale noise) ──
    n1 = nt.nodes.new('ShaderNodeTexNoise')
    n1.inputs['Scale'].default_value      = 32.0
    n1.inputs['Detail'].default_value     = 2.0
    n1.inputs['Roughness'].default_value  = 0.65
    n1.inputs['Distortion'].default_value = 0.05
    nt.links.new(tc.outputs['Generated'], n1.inputs['Vector'])
    nr1 = nt.nodes.new('ShaderNodeValToRGB')
    nr1.color_ramp.elements[0].position = 0.72; nr1.color_ramp.elements[0].color=(0,0,0,1)
    nr1.color_ramp.elements[1].position = 0.88; nr1.color_ramp.elements[1].color=(1.0, 0.52, 0.04, 1)
    nt.links.new(n1.outputs['Fac'], nr1.inputs['Fac'])

    # ── Neon blue/cyan accent lights (slightly larger, fewer) ──
    n2 = nt.nodes.new('ShaderNodeTexNoise')
    n2.inputs['Scale'].default_value      = 20.0
    n2.inputs['Detail'].default_value     = 3.0
    n2.inputs['Roughness'].default_value  = 0.55
    n2.inputs['Distortion'].default_value = 0.12
    nt.links.new(tc.outputs['Generated'], n2.inputs['Vector'])
    nr2 = nt.nodes.new('ShaderNodeValToRGB')
    nr2.color_ramp.elements[0].position = 0.78; nr2.color_ramp.elements[0].color=(0,0,0,1)
    nr2.color_ramp.elements[1].position = 0.92; nr2.color_ramp.elements[1].color=(0.04, 0.40, 1.0, 1)
    nt.links.new(n2.outputs['Fac'], nr2.inputs['Fac'])

    # ── Mask lights to building zone (bottom ~28% of screen) ──
    mask = nt.nodes.new('ShaderNodeValToRGB')
    mask.color_ramp.elements[0].position = 0.20; mask.color_ramp.elements[0].color=(1,1,1,1)
    mask.color_ramp.elements[1].position = 0.32; mask.color_ramp.elements[1].color=(0,0,0,1)
    nt.links.new(sep.outputs['Y'], mask.inputs['Fac'])

    mul1 = nt.nodes.new('ShaderNodeMixRGB')
    mul1.blend_type='MULTIPLY'; mul1.inputs['Fac'].default_value=1.0
    nt.links.new(nr1.outputs['Color'], mul1.inputs[1])
    nt.links.new(mask.outputs['Color'], mul1.inputs[2])

    mul2 = nt.nodes.new('ShaderNodeMixRGB')
    mul2.blend_type='MULTIPLY'; mul2.inputs['Fac'].default_value=1.0
    nt.links.new(nr2.outputs['Color'], mul2.inputs[1])
    nt.links.new(mask.outputs['Color'], mul2.inputs[2])

    # ── Combine: base + orange lights + blue lights ──
    add1 = nt.nodes.new('ShaderNodeMixRGB')
    add1.blend_type='ADD'; add1.inputs['Fac'].default_value=1.0
    nt.links.new(sky.outputs['Color'],   add1.inputs[1])
    nt.links.new(mul1.outputs['Color'],  add1.inputs[2])

    add2 = nt.nodes.new('ShaderNodeMixRGB')
    add2.blend_type='ADD'; add2.inputs['Fac'].default_value=1.0
    nt.links.new(add1.outputs['Color'],  add2.inputs[1])
    nt.links.new(mul2.outputs['Color'],  add2.inputs[2])

    # ── Corner vignette (cinematic depth, Apple-product feel) ──
    sx_node = nt.nodes.new('ShaderNodeMath'); sx_node.operation='SUBTRACT'; sx_node.inputs[1].default_value=0.5
    sy_node = nt.nodes.new('ShaderNodeMath'); sy_node.operation='SUBTRACT'; sy_node.inputs[1].default_value=0.5
    nt.links.new(sep.outputs['X'], sx_node.inputs[0])
    nt.links.new(sep.outputs['Y'], sy_node.inputs[0])
    px_node = nt.nodes.new('ShaderNodeMath'); px_node.operation='MULTIPLY'
    py_node = nt.nodes.new('ShaderNodeMath'); py_node.operation='MULTIPLY'
    nt.links.new(sx_node.outputs['Value'], px_node.inputs[0])
    nt.links.new(sx_node.outputs['Value'], px_node.inputs[1])
    nt.links.new(sy_node.outputs['Value'], py_node.inputs[0])
    nt.links.new(sy_node.outputs['Value'], py_node.inputs[1])
    d2_node = nt.nodes.new('ShaderNodeMath'); d2_node.operation='ADD'
    nt.links.new(px_node.outputs['Value'], d2_node.inputs[0])
    nt.links.new(py_node.outputs['Value'], d2_node.inputs[1])
    vgn_ramp = nt.nodes.new('ShaderNodeValToRGB')
    vgn_ramp.color_ramp.elements[0].position=0.06; vgn_ramp.color_ramp.elements[0].color=(0.78,0.78,0.78,1)
    vgn_ramp.color_ramp.elements[1].position=0.22; vgn_ramp.color_ramp.elements[1].color=(1,1,1,1)
    nt.links.new(d2_node.outputs['Value'], vgn_ramp.inputs['Fac'])
    vgn_mul = nt.nodes.new('ShaderNodeMixRGB')
    vgn_mul.blend_type='MULTIPLY'; vgn_mul.inputs['Fac'].default_value=1.0
    nt.links.new(add2.outputs['Color'],       vgn_mul.inputs[1])
    nt.links.new(vgn_ramp.outputs['Color'],   vgn_mul.inputs[2])

    emit = nt.nodes.new('ShaderNodeEmission')
    nt.links.new(vgn_mul.outputs['Color'], emit.inputs['Color'])
    emit.inputs['Strength'].default_value = 5.5   # HDR punch — OLED-style

    # ── Glass panel: 7% glossy reflections from studio lights ──
    glass = nt.nodes.new('ShaderNodeBsdfPrincipled')
    glass.inputs['Base Color'].default_value = (0.0,0.0,0.0,1.0)
    glass.inputs['Roughness'].default_value  = 0.01
    glass.inputs['Metallic'].default_value   = 0.0
    for v4,v3,val in [('Coat Weight','Clearcoat',1.0),('Coat Roughness','Clearcoat Roughness',0.01)]:
        k = v4 if BL>=(4,0,0) else v3
        if k in glass.inputs: glass.inputs[k].default_value = val

    mix = nt.nodes.new('ShaderNodeMixShader')
    mix.inputs['Fac'].default_value = 0.07
    nt.links.new(emit.outputs['Emission'], mix.inputs[1])
    nt.links.new(glass.outputs['BSDF'],    mix.inputs[2])
    nt.links.new(mix.outputs['Shader'],    out.inputs['Surface'])
    return m

def box(nm, loc, sz, mat, rot=(0,0,0), bevel=0.004):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object; o.name = nm; o.scale = sz
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    if bevel > 0:
        bv = o.modifiers.new('Bevel','BEVEL')
        bv.width = bevel; bv.segments = 3; bv.limit_method = 'ANGLE'
        bv.angle_limit = math.radians(60)
    o.data.materials.append(mat); return o

def cyl(nm, loc, r, h, mat, rot=(0,0,0), segs=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=segs, radius=r, depth=h, location=loc, rotation=rot)
    o = bpy.context.active_object; o.name = nm; o.data.materials.append(mat); return o

def sph(nm, loc, r, mat, segs=32):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=segs, ring_count=24)
    o = bpy.context.active_object; o.name = nm
    bpy.ops.object.shade_smooth()
    o.data.materials.append(mat); return o

def tor(nm, loc, R, r, mat, rot=(0,0,0)):
    bpy.ops.mesh.primitive_torus_add(location=loc, major_radius=R, minor_radius=r,
                                      major_segments=64, minor_segments=16)
    o = bpy.context.active_object; o.name = nm; o.rotation_euler = rot
    bpy.ops.object.shade_smooth()
    o.data.materials.append(mat); return o

def screw_bolt(loc):
    """Hex-head bolt: 6-sided head + shaft."""
    x, y, z = loc
    ch = CH()
    # Hex head (6-sided)
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.013, depth=0.007,
                                         location=(x, y, z + 0.0035))
    head = bpy.context.active_object
    head.name = 'bh_' + str(abs(hash(str(loc))))[:5]
    head.data.materials.append(ch)
    # Shaft
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.006, depth=0.013,
                                         location=(x, y, z - 0.0025))
    shaft = bpy.context.active_object
    shaft.name = 'bs_' + str(abs(hash(str(loc))))[:5]
    shaft.data.materials.append(ch)

def weld_bead(nm, loc, R, r=0.004, rot=(0, 0, 0)):
    """Small torus at a joint suggesting a weld bead."""
    tor(nm, loc, R, r, BK(), rot=rot)

def punch_holes(target_obj, holes):
    """Boolean-cut rectangular holes through target_obj.
    holes = list of (world_loc, (sx, sy, sz)) — size in metres."""
    bpy.context.view_layer.objects.active = target_obj
    for i, (loc, sz) in enumerate(holes):
        bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
        cutter = bpy.context.active_object
        cutter.scale = sz
        bpy.ops.object.transform_apply(scale=True)
        bpy.context.view_layer.objects.active = target_obj
        mod = target_obj.modifiers.new(f'bool_{i}', 'BOOLEAN')
        mod.operation = 'DIFFERENCE'
        mod.object = cutter
        try: mod.solver = 'FAST'
        except: pass
        try:
            bpy.ops.object.modifier_apply(modifier=f'bool_{i}')
        except Exception as e:
            log(f'  boolean failed ({e}), skipping hole {i}')
        try: bpy.data.objects.remove(cutter, do_unlink=True)
        except: pass

def tv(loc, w=1.16, h=0.66, tilt=0.):
    x,y,z = loc; d = 0.022; rot = (tilt, 0, 0)   # d=0.022 thin-bezel OLED
    box('bezel',  (x, y, z),             (w,         d,        h        ), BZ(),    rot, bevel=0.004)
    box('screen', (x, y - d*0.62, z),    (w*0.93,    0.003,    h*0.93   ), SCR(),   rot, bevel=0)
    box('back',   (x, y + d*0.48, z),    (w*0.91,    d*0.38,   h*0.90   ), GM_TV(), rot, bevel=0.003)
    # Hairline chrome trim ring — premium edge detail
    box('trim',   (x, y + d*0.02, z),    (w + 0.003, d*0.07,   h + 0.003), CH(),   rot, bevel=0.001)


# ══════════════════════════════════════════════════════════════════════════════
# CAMERA RIG — matches original WebGL TiltingCamRig / FullMotionCamRig
#
# Cycle (4s @ 24fps = 96 frames):
#   0→46%   side view  (hold — longer per user feedback)
#   46→60%  pan side → front  (smoothstep)
#   60→86%  front view (hold)
#   86→100% pan front → side  (smoothstep)
# ══════════════════════════════════════════════════════════════════════════════

def cam_pos_for_fullmotion(frame_idx, side_pos, front_pos):
    """Full-motion camera: slow, gentle pan with longer transition (22% pan duration)."""
    phase = frame_idx / FRAMES
    if phase < 0.42:
        return side_pos
    elif phase < 0.64:
        p = smoothstep((phase - 0.42) / 0.22)
        return lerp3(side_pos, front_pos, p)
    elif phase < 0.82:
        return front_pos
    else:
        p = smoothstep((phase - 0.82) / 0.18)
        return lerp3(front_pos, side_pos, p)


# ══════════════════════════════════════════════════════════════════════════════
# TILTING ANIMATION — StarTech ARMPIVTB2-style
# Hardware: wall plate → clevis tilt arms → landscape VESA frame → TV
# Camera: front-right 3/4 view, in front of wall (negative Y)
# Motion: seamless sin loop, T = sin(2π * f/F) * 0.20 rad (≈±11.5°)
# ══════════════════════════════════════════════════════════════════════════════

def build_tilting_frame(frame_idx, out_path):
    phase = 2 * math.pi * frame_idx / FRAMES
    T = math.sin(phase) * 0.20              # ±11.5° tilt range

    # Profile side view — zoomed in, TV edge + wall plate + tilt rails in depth
    cam_loc = (2.6, 0.22, 0.18)
    cam_tgt = (0.0, 0.25, -0.06)

    clear(); setup(out_path); setup_world_hdri(HDRI); add_lights()
    shadow_catcher(z=-0.60)
    bk = BK(); ch = CH()

    # ── Wall plate: wide horizontal rectangle with rows of slotted holes ──
    WPY = 0.30; WPZ = 0.0
    WP_W = 0.56; WP_H = 0.40; WP_D = 0.018
    box('wall_plate', (0, WPY, WPZ), (WP_W, WP_D, WP_H), bk, bevel=0.004)
    wp_obj = bpy.data.objects.get('wall_plate')
    if wp_obj:
        slot_sz = (0.030, 0.026, 0.013)
        holes = [
            ((sx, WPY, WPZ + sz), slot_sz)
            for sx in [-0.22, -0.11, 0.0, 0.11, 0.22]
            for sz in [0.14, 0.05, -0.05, -0.14]
        ]
        punch_holes(wp_obj, holes)
    for sx in [-0.24, 0.24]:
        for sz in [0.16, -0.16]:
            screw_bolt((sx, WPY - 0.008, WPZ + sz))

    # ── Two tall tilt rails pivoting from hinge ──
    RAIL_H  = 0.52
    RAIL_W  = 0.044
    RAIL_D  = 0.016
    RAIL_SX = 0.230

    # ── Tilt hinge rod — flush against wall plate front face ──
    HINGE_Z = WPZ - WP_H / 2 + 0.028
    HINGE_Y = WPY - WP_D / 2 - RAIL_D / 2 - 0.001
    cyl('hinge_rod', (0, HINGE_Y, HINGE_Z), 0.013, WP_W * 0.84, ch,
        rot=(0, math.pi/2, 0))

    def rfwd(frac, d_fwd=0.0):
        """World Y,Z at fraction frac along rail (0=hinge, 1=top), offset d_fwd toward camera"""
        ry = HINGE_Y - (RAIL_H * frac) * math.sin(T) - d_fwd * math.cos(T)
        rz = HINGE_Z + (RAIL_H * frac) * math.cos(T) - d_fwd * math.sin(T)
        return ry, rz

    rail_cy, rail_cz = rfwd(0.5)
    for sx in [-RAIL_SX, RAIL_SX]:
        box(f'tilt_rail_{int(sx*100)}', (sx, rail_cy, rail_cz),
            (RAIL_W, RAIL_D, RAIL_H), bk, rot=(T, 0, 0), bevel=0.003)
        # Hook arm: horizontal tab from rail bottom back to wall plate hinge rod
        hook_depth = (WPY - WP_D / 2) - HINGE_Y + 0.006  # spans gap to plate
        hook_y = HINGE_Y + hook_depth / 2
        box(f'hook_{int(sx*100)}', (sx, hook_y, HINGE_Z),
            (0.050, hook_depth, 0.032), bk, bevel=0.003)
        # Vertical clevis tab that wraps under the hinge rod
        box(f'clevis_{int(sx*100)}', (sx, WPY - WP_D / 2 - 0.002, HINGE_Z - 0.018),
            (0.044, 0.014, 0.028), bk, bevel=0.002)
        # Slotted holes punched along rail height
        rail_obj = bpy.data.objects.get(f'tilt_rail_{int(sx*100)}')
        if rail_obj:
            slot_r = (0.018, 0.022, 0.032)
            rail_holes = []
            for frac in [0.18, 0.30, 0.42, 0.54, 0.66, 0.78, 0.90]:
                hy, hz = rfwd(frac)
                rail_holes.append(((sx, hy, hz), slot_r))
            punch_holes(rail_obj, rail_holes)

    # Cross-bars connecting the two rails at top, mid and low positions
    for frac, nm in [(0.90, 'top'), (0.55, 'mid'), (0.22, 'low')]:
        cy, cz = rfwd(frac)
        box(f'crossbar_{nm}', (0, cy, cz),
            (RAIL_SX * 2 + RAIL_W, RAIL_D, 0.026), bk, rot=(T, 0, 0), bevel=0.003)

    # ── TV: attaches to front face of rails at mid-height ──
    tv_y, tv_z = rfwd(0.48, RAIL_D / 2 + 0.018)
    tv((0, tv_y, tv_z), tilt=T)
    # VESA bolts
    for vsx in [-0.10, 0.10]:
        for vsz in [-0.10, 0.10]:
            bvy, bvz = rfwd(0.48)
            screw_bolt((vsx, bvy - 0.002, bvz + vsz))

    add_camera(cam_loc, cam_tgt, focal_mm=85, fstop=11.0)
    bpy.ops.render.render(write_still=True)


# ══════════════════════════════════════════════════════════════════════════════
# FULL-MOTION ANIMATION
# Camera: fixed true side-profile — shows arm fold/extend in clean profile
# Motion: seamless fold-extend-sweep loop using sin/cos
#   fold=1 (phase=0): TV flat against wall (arms folded)
#   fold=0 (phase=π): arms fully extended forward
#   sweep oscillates ±1 for lateral swing
# Dual arm pairs (upper + lower) = accurate parallelogram mount geometry
# ══════════════════════════════════════════════════════════════════════════════

def build_fullmotion_frame(frame_idx, out_path):
    phase = 2 * math.pi * frame_idx / FRAMES
    fold  = (1 + math.cos(phase)) / 2
    sweep = math.sin(phase)

    A1_fold  = math.radians(10)
    A1_ext   = math.radians(82)
    A1_sweep = math.radians(28)
    A1 = A1_fold + (A1_ext - A1_fold) * (1 - fold) + A1_sweep * sweep

    A2_fold = math.radians(170)
    A2_ext  = math.radians(58)
    A2 = A2_fold + (A2_ext - A2_fold) * (1 - fold)

    L1 = 0.50; L2 = 0.44
    WX = 0.0; WY = 0.32; WZ = 0.04
    # ARM_SEP: left-right (X) half-spacing — two arms side by side
    ARM_SEP = 0.13

    # Arm kinematics as deltas from each assembly's own wall-pivot
    dA1EX = L1 * math.cos(A1)
    dA1EY = -L1 * math.sin(A1)
    dA2EX = dA1EX + L2 * math.cos(A2)
    dA2EY = dA1EY - L2 * math.sin(A2)

    # TV center X is the average of both wrist X positions = WX + dA2EX
    TV_X = WX + dA2EX
    TV_Y = WY + dA2EY - 0.035

    cam_loc = (2.2, -1.8, 0.85)
    cam_tgt = (0.0, -0.05, 0.06)

    clear(); setup(out_path); setup_world_hdri(HDRI); add_lights()
    shadow_catcher(z=-0.50)
    bk = BK(); ch = CH()

    # ── Wall plate: wide horizontal plate spanning both arm pivots ──
    WP_W = ARM_SEP * 2 + 0.12
    WP_H = 0.52; WP_D = 0.022
    box('wall_plate', (WX, WY, WZ), (WP_W, WP_D, WP_H), bk, bevel=0.005)
    wp_obj = bpy.data.objects.get('wall_plate')
    if wp_obj:
        for px in [+ARM_SEP, -ARM_SEP]:
            holes = [((WX + px, WY, WZ + sz), (0.022, 0.044, 0.013))
                     for sz in [-0.18, -0.06, 0.06, 0.18]]
            punch_holes(wp_obj, holes)
    # Pivot knuckles protruding from face of wall plate
    for px in [+ARM_SEP, -ARM_SEP]:
        cyl(f'wall_pivot_{int(px*100)}',
            (WX + px, WY - WP_D / 2 - 0.014, WZ),
            0.020, 0.038, ch)

    # ── TWO arm assemblies, side by side in X (left and right) ──
    for nm, dx in [('A', +ARM_SEP), ('B', -ARM_SEP)]:
        wx = WX + dx                  # this assembly's wall pivot X
        e1x = wx + dA1EX              # elbow X (absolute)
        e1y = WY + dA1EY              # elbow Y (absolute)
        c1x = (wx + e1x) / 2         # arm1 center X
        c1y = (WY + e1y) / 2         # arm1 center Y
        e2x = wx + dA2EX              # wrist X (absolute)
        e2y = WY + dA2EY              # wrist Y (absolute)
        c2x = (e1x + e2x) / 2        # arm2 center X
        c2y = (e1y + e2y) / 2        # arm2 center Y

        box(f'arm1_{nm}', (c1x, c1y, WZ), (L1, 0.048, 0.030), bk, rot=(0,0,-A1), bevel=0.004)
        sph(f'elbow_{nm}', (e1x, e1y, WZ), 0.032, ch)
        box(f'arm2_{nm}', (c2x, c2y, WZ), (L2, 0.042, 0.026), bk, rot=(0,0,-A2), bevel=0.003)
        weld_bead(f'weld_wall_{nm}',  (wx,  WY - 0.024, WZ), R=0.022, r=0.004)
        weld_bead(f'weld_elbow_{nm}', (e1x, e1y,        WZ), R=0.019, r=0.004)
        weld_bead(f'weld_wrist_{nm}', (e2x, e2y,        WZ), R=0.017, r=0.003)

    # Horizontal bar connecting the two wrist points (at TV cradle back)
    e2x_A = WX + ARM_SEP + dA2EX
    e2x_B = WX - ARM_SEP + dA2EX
    e2y   = WY + dA2EY
    cyl('wrist_bar', ((e2x_A + e2x_B) / 2, e2y, WZ),
        0.013, ARM_SEP * 2 + 0.06, ch, rot=(0, math.pi/2, 0))

    # ── TV cradle: open rectangular frame (no solid panel) ──
    CRAD_W = 0.62; CRAD_H = 0.50
    RT = 0.032; RD = 0.024
    for sx in [-(CRAD_W / 2), +(CRAD_W / 2)]:
        box(f'crad_v{int(sx*100)}', (TV_X + sx, TV_Y + 0.018, WZ),
            (RT, RD, CRAD_H), bk, bevel=0.003)
    box('crad_top', (TV_X, TV_Y + 0.018, WZ + CRAD_H / 2 - RT / 2),
        (CRAD_W, RD, RT), bk, bevel=0.003)
    box('crad_bot', (TV_X, TV_Y + 0.018, WZ - CRAD_H / 2 + RT / 2),
        (CRAD_W, RD, RT), bk, bevel=0.003)
    for sz_off in [CRAD_H * 0.22, -CRAD_H * 0.22]:
        box(f'crad_mid{int(sz_off*100)}', (TV_X, TV_Y + 0.018, WZ + sz_off),
            (CRAD_W, RD, RT * 0.65), bk, bevel=0.002)
    for vsx in [-0.10, 0.10]:
        for vsz in [-0.10, 0.10]:
            screw_bolt((TV_X + vsx, TV_Y + 0.010, WZ + vsz))

    tv((TV_X, TV_Y, WZ), w=1.00, h=0.57)

    add_camera(cam_loc, cam_tgt, focal_mm=50, fstop=3.2)
    bpy.ops.render.render(write_still=True)


# ══════════════════════════════════════════════════════════════════════════════
# RENDER LOOPS + COMPOSE
# ══════════════════════════════════════════════════════════════════════════════

FFMPEG = '/Library/Frameworks/Python.framework/Versions/3.12/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1'

def render_animation(name, build_fn, out_dir):
    log(f"\n=== Rendering {name} animation ({FRAMES} frames) ===")
    os.makedirs(out_dir, exist_ok=True)
    for f in range(FRAMES):
        out_path = os.path.join(out_dir, f'{f:04d}.png')
        if os.path.exists(out_path):
            log(f"  Frame {f:02d}/{FRAMES} — cached, skip")
            continue
        build_fn(f, out_path)
        log(f"  Frame {f:02d}/{FRAMES} — done")
    log(f"=== {name} frames complete ===")

def compose_webm(name, frames_dir, output_path):
    log(f"\nComposing {name} → {output_path}")
    if not os.path.exists(FFMPEG):
        log(f"  ffmpeg not found at {FFMPEG}, skipping")
        return
    cmd = [
        FFMPEG, '-y',
        '-framerate', str(FPS),
        '-i', os.path.join(frames_dir, '%04d.png'),
        '-c:v', 'libvpx-vp9',
        '-pix_fmt', 'yuva420p',
        '-b:v', '3M',
        '-crf', '16',
        '-auto-alt-ref', '0',
        '-loop', '0',
        output_path
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        size = os.path.getsize(output_path)
        log(f"  Saved: {output_path} ({size//1024} KB)")
    else:
        log(f"  FFmpeg error: {result.stderr[-600:]}")

# ── Main ───────────────────────────────────────────────────────────────────────

TILT_DIR = os.path.join(OUT, 'anim', 'tilting')
FM_DIR   = os.path.join(OUT, 'anim', 'fullmotion')

# Wipe old frames so the full 96-frame sequence is fresh
import shutil
for d in [TILT_DIR, FM_DIR]:
    if os.path.exists(d):
        shutil.rmtree(d)

render_animation('Tilting',     build_tilting_frame,   TILT_DIR)
render_animation('Full-motion', build_fullmotion_frame, FM_DIR)

compose_webm('Tilting',     TILT_DIR, os.path.join(OUT, 'mount-tilting.webm'))
compose_webm('Full-motion', FM_DIR,   os.path.join(OUT, 'mount-fullmotion.webm'))

log("\nALL ANIMATION RENDERS DONE.")
