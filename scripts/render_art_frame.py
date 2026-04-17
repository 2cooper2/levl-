#!/usr/bin/env python3
"""
render_art_frame.py — fine-grained dark wood frame, purple/indigo abstract canvas.
Polyhaven PBR: fine_grained_wood frame. No gold.
Background: pale lavender.
Run: blender --background --python scripts/render_art_frame.py
"""
import bpy, math, os, urllib.request
from mathutils import Vector, Euler

def log(m): print(m, flush=True)
log("render_art_frame.py started")

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for col in [bpy.data.meshes, bpy.data.materials, bpy.data.lights,
            bpy.data.cameras, bpy.data.images, bpy.data.curves]:
    for b in list(col):
        try: col.remove(b)
        except: pass

scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.render.engine = 'CYCLES'
scene.cycles.samples = 400
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

script_dir  = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
out_path    = os.path.join(project_dir, 'public', 'assets', 'renders', 'art-frame.png')
tex_dir     = os.path.join(project_dir, 'tmp_textures')
os.makedirs(tex_dir, exist_ok=True)
os.makedirs(os.path.dirname(out_path), exist_ok=True)
scene.render.filepath = out_path
BL = bpy.app.version

# ── Polyhaven texture downloader ──────────────────────────────────────────────
def dl(asset_id, res='2k'):
    """Return paths to pre-downloaded PBR maps; tries all common extensions."""
    map_keys = ['diff', 'rough', 'nor_gl', 'disp', 'ao']
    paths = {}
    for mtype in map_keys:
        for ext in ['jpg', 'png', 'exr']:
            fpath = os.path.join(tex_dir, f"{asset_id}_{res}_{mtype}.{ext}")
            if os.path.exists(fpath) and os.path.getsize(fpath) > 1000:
                paths[mtype] = fpath
                break
    log(f"  {asset_id}: found {list(paths.keys())}")
    return paths

log("Downloading textures…")
tx_frame = dl('fine_grained_wood', '2k')

# ── PBR material builder ───────────────────────────────────────────────────────
def pbr_mat(name, tex_paths, scale=4.0, roughness_mult=1.0,
            normal_strength=1.0, disp_scale=0.010, extra_rough=None):
    mat = bpy.data.materials.new(name); mat.use_nodes = True
    n = mat.node_tree.nodes; lk = mat.node_tree.links; n.clear()
    out   = n.new('ShaderNodeOutputMaterial')
    bsdf  = n.new('ShaderNodeBsdfPrincipled')
    coord = n.new('ShaderNodeTexCoord')
    mapp  = n.new('ShaderNodeMapping')
    mapp.inputs['Scale'].default_value = (scale, scale, scale)
    lk.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    lk.new(coord.outputs['UV'], mapp.inputs['Vector'])

    def img_node(path, cs='sRGB'):
        img = bpy.data.images.load(path)
        img.colorspace_settings.name = cs
        nd = n.new('ShaderNodeTexImage'); nd.image = img
        lk.new(mapp.outputs['Vector'], nd.inputs['Vector'])
        return nd

    if tex_paths.get('diff'):
        dn = img_node(tex_paths['diff'])
        lk.new(dn.outputs['Color'], bsdf.inputs['Base Color'])

    if tex_paths.get('rough'):
        rn = img_node(tex_paths['rough'], 'Non-Color')
        if roughness_mult != 1.0:
            mul = n.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'
            mul.inputs[1].default_value = roughness_mult
            lk.new(rn.outputs['Color'], mul.inputs[0])
            lk.new(mul.outputs['Value'], bsdf.inputs['Roughness'])
        else:
            lk.new(rn.outputs['Color'], bsdf.inputs['Roughness'])

    if tex_paths.get('nor_gl'):
        nn   = img_node(tex_paths['nor_gl'], 'Non-Color')
        nmap = n.new('ShaderNodeNormalMap')
        nmap.inputs['Strength'].default_value = normal_strength
        lk.new(nn.outputs['Color'], nmap.inputs['Color'])
        lk.new(nmap.outputs['Normal'], bsdf.inputs['Normal'])

    if tex_paths.get('ao') and tex_paths.get('diff'):
        ao_n   = img_node(tex_paths['ao'], 'Non-Color')
        mix_ao = n.new('ShaderNodeMixRGB'); mix_ao.blend_type = 'MULTIPLY'
        mix_ao.inputs['Fac'].default_value = 0.55
        if bsdf.inputs['Base Color'].is_linked:
            src = bsdf.inputs['Base Color'].links[0].from_socket
            lk.new(src, mix_ao.inputs['Color1'])
            lk.new(ao_n.outputs['Color'], mix_ao.inputs['Color2'])
            lk.new(mix_ao.outputs['Color'], bsdf.inputs['Base Color'])

    if tex_paths.get('disp'):
        di_n = img_node(tex_paths['disp'], 'Non-Color')
        disp = n.new('ShaderNodeDisplacement')
        disp.inputs['Scale'].default_value    = disp_scale
        disp.inputs['Midlevel'].default_value = 0.50
        lk.new(di_n.outputs['Color'], disp.inputs['Height'])
        lk.new(disp.outputs['Displacement'], out.inputs['Displacement'])
        try: mat.cycles.displacement_method = 'BOTH'
        except: pass

    # Optional lacquer coat — polished wood sheen
    ck = 'Coat Weight'    if BL >= (4,0,0) else 'Clearcoat'
    cr = 'Coat Roughness' if BL >= (4,0,0) else 'Clearcoat Roughness'
    if ck in bsdf.inputs: bsdf.inputs[ck].default_value = 0.55
    if cr in bsdf.inputs: bsdf.inputs[cr].default_value = 0.08

    return mat

log("Building materials…")
mat_frame = pbr_mat('FineWoodFrame', tx_frame, scale=6.0,
                    roughness_mult=0.85, normal_strength=1.10,
                    disp_scale=0.012)

# Dark liner / reveal strip — matte near-black so canvas pops
mat_liner = bpy.data.materials.new('Liner'); mat_liner.use_nodes = True
nl = mat_liner.node_tree.nodes; nl.clear()
ol = nl.new('ShaderNodeOutputMaterial'); bl2 = nl.new('ShaderNodeBsdfPrincipled')
mat_liner.node_tree.links.new(bl2.outputs['BSDF'], ol.inputs['Surface'])
bl2.inputs['Base Color'].default_value = (0.04, 0.03, 0.02, 1.0)
bl2.inputs['Roughness'].default_value  = 0.85

mat_back = bpy.data.materials.new('Backboard'); mat_back.use_nodes = True
nb = mat_back.node_tree.nodes; nb.clear()
ob = nb.new('ShaderNodeOutputMaterial'); bbd = nb.new('ShaderNodeBsdfPrincipled')
mat_back.node_tree.links.new(bbd.outputs['BSDF'], ob.inputs['Surface'])
bbd.inputs['Base Color'].default_value = (0.04, 0.03, 0.02, 1.0)
bbd.inputs['Roughness'].default_value  = 0.92

# Canvas: deep purple/indigo abstract painting
mat_canvas = bpy.data.materials.new('Canvas'); mat_canvas.use_nodes = True
cn = mat_canvas.node_tree.nodes; cl = mat_canvas.node_tree.links; cn.clear()
out_c  = cn.new('ShaderNodeOutputMaterial')
bsdf_c = cn.new('ShaderNodeBsdfPrincipled')
noise_lg = cn.new('ShaderNodeTexNoise')
noise_lg.inputs['Scale'].default_value      = 3.2
noise_lg.inputs['Detail'].default_value     = 5.0
noise_lg.inputs['Roughness'].default_value  = 0.50
noise_lg.inputs['Distortion'].default_value = 0.60
ramp_paint = cn.new('ShaderNodeValToRGB')
ramp_paint.color_ramp.interpolation = 'B_SPLINE'
ramp_paint.color_ramp.elements[0].position = 0.0
ramp_paint.color_ramp.elements[0].color    = (0.08, 0.04, 0.22, 1.0)
el1 = ramp_paint.color_ramp.elements.new(0.25); el1.color = (0.22, 0.12, 0.48, 1.0)
el2 = ramp_paint.color_ramp.elements.new(0.55); el2.color = (0.45, 0.28, 0.68, 1.0)
el3 = ramp_paint.color_ramp.elements.new(0.78); el3.color = (0.62, 0.42, 0.72, 1.0)
ramp_paint.color_ramp.elements[-1].position = 1.0
ramp_paint.color_ramp.elements[-1].color    = (0.76, 0.58, 0.78, 1.0)
noise_sm = cn.new('ShaderNodeTexNoise')
noise_sm.inputs['Scale'].default_value = 38.0
noise_sm.inputs['Detail'].default_value = 2.0
bump_c = cn.new('ShaderNodeBump')
bump_c.inputs['Strength'].default_value = 0.25
bump_c.inputs['Distance'].default_value = 0.005
cl.new(noise_lg.outputs['Fac'], ramp_paint.inputs['Fac'])
cl.new(ramp_paint.outputs['Color'], bsdf_c.inputs['Base Color'])
cl.new(noise_sm.outputs['Fac'], bump_c.inputs['Height'])
cl.new(bump_c.outputs['Normal'], bsdf_c.inputs['Normal'])
bsdf_c.inputs['Roughness'].default_value = 0.90
cl.new(bsdf_c.outputs['BSDF'], out_c.inputs['Surface'])

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
bg_gi.inputs['Strength'].default_value = 0.38
bg_lav.inputs['Color'].default_value   = (0.86, 0.82, 0.97, 1.0)
bg_lav.inputs['Strength'].default_value = 1.0
wt.links.new(lpath.outputs['Is Camera Ray'], mix_bg.inputs['Fac'])
wt.links.new(bg_gi.outputs['Background'],  mix_bg.inputs[1])
wt.links.new(bg_lav.outputs['Background'], mix_bg.inputs[2])
wt.links.new(mix_bg.outputs['Shader'], out_w.inputs['Surface'])

# ── Frame geometry ─────────────────────────────────────────────────────────────
FX = 0.0; FZ = 1.06
FW = 0.82; FH = 0.62
FF = 0.072; FD = 0.076; LW = 0.008
wall_y   = 0.0
frame_cy = wall_y - 0.004 - FD/2
inner_w  = FW + LW*2; inner_h = FH + LW*2

# Canvas face
bpy.ops.mesh.primitive_cube_add(size=1, location=(FX, wall_y - 0.004 - FD*0.28, FZ))
canvas = bpy.context.active_object; canvas.name = 'Canvas'
canvas.dimensions = Vector((FW, 0.009, FH))
canvas.data.materials.clear(); canvas.data.materials.append(mat_canvas)
for p in canvas.data.polygons: p.use_smooth = True

# Thin dark liner strips (inner reveal before canvas)
for cx,cy,cz,dx,dy,dz in [
    (FX,             wall_y-0.004-FD*0.30, FZ+inner_h/2+LW/2, FW+LW*2, FD*0.45, LW),
    (FX,             wall_y-0.004-FD*0.30, FZ-inner_h/2-LW/2, FW+LW*2, FD*0.45, LW),
    (FX-FW/2-LW/2,  wall_y-0.004-FD*0.30, FZ,                 LW, FD*0.45, FH),
    (FX+FW/2+LW/2,  wall_y-0.004-FD*0.30, FZ,                 LW, FD*0.45, FH),
]:
    bpy.ops.mesh.primitive_cube_add(size=1, location=(cx,cy,cz))
    ln = bpy.context.active_object; ln.dimensions = Vector((dx,dy,dz))
    ln.data.materials.clear(); ln.data.materials.append(mat_liner)

# Frame bars — convex bevel profile=0.85 gives single clean highlight from wood grain
for cx,cy,cz,dx,dy,dz in [
    (FX,                frame_cy, FZ+inner_h/2+FF/2, inner_w+FF*2, FD, FF),
    (FX,                frame_cy, FZ-inner_h/2-FF/2, inner_w+FF*2, FD, FF),
    (FX-inner_w/2-FF/2, frame_cy, FZ,                FF, FD, inner_h),
    (FX+inner_w/2+FF/2, frame_cy, FZ,                FF, FD, inner_h),
]:
    bpy.ops.mesh.primitive_cube_add(size=1, location=(cx,cy,cz))
    fp = bpy.context.active_object
    fp.dimensions = Vector((dx, dy, dz))
    bpy.context.view_layer.objects.active = fp
    bpy.ops.object.modifier_add(type='BEVEL')
    m = fp.modifiers[-1]
    m.width    = FF * 0.44
    m.segments = 8
    m.profile  = 0.85
    try: m.limit_method = 'ANGLE'; m.angle_limit = math.radians(50)
    except: pass
    bpy.ops.object.modifier_apply(modifier=m.name)
    for p in fp.data.polygons: p.use_smooth = True
    fp.data.materials.clear(); fp.data.materials.append(mat_frame)

# Backboard
bpy.ops.mesh.primitive_cube_add(size=1, location=(FX, wall_y + 0.003, FZ))
bb = bpy.context.active_object; bb.name = 'Backboard'
bb.dimensions = Vector((inner_w + FF*2.5, 0.005, inner_h + FF*2.5))
bb.data.materials.clear(); bb.data.materials.append(mat_back)

log("Frame geometry done")

# ── Lights ─────────────────────────────────────────────────────────────────────
def add_area(loc, energy, size, color, rot_xyz):
    bpy.ops.object.light_add(type='AREA', location=loc)
    L = bpy.context.active_object
    L.data.energy = energy; L.data.size = size; L.data.color = color
    L.rotation_euler = Euler(tuple(math.radians(d) for d in rot_xyz), 'XYZ')

# Key: upper-left warm — reveals wood grain across the bevel
add_area((-3.2, -2.6, 3.2),  900, 1.2, (1.0,  0.97, 0.88), (26, 0, -26))
# Fill: right cool — soft counter-shadow
add_area(( 2.6, -2.2, 1.4),  260, 1.6, (0.92, 0.96, 1.0),  (8,  0,  32))
# Top: overhead even wash
add_area(( 0.0, -1.8, 4.2),  220, 2.2, (1.0,  0.99, 0.96), (62, 0,   0))
# Front fill: keeps frame face from going too dark
add_area(( 0.0, -3.8, FZ),   160, 2.8, (1.0,  0.97, 0.92), (0,  0,   0))

# ── Camera ─────────────────────────────────────────────────────────────────────
cam_data = bpy.data.cameras.new('Camera')
cam_data.lens = 46; cam_data.clip_start = 0.01; cam_data.clip_end = 50.0
cam_obj = bpy.data.objects.new('Camera', cam_data)
bpy.context.collection.objects.link(cam_obj); scene.camera = cam_obj
cam_pos = Vector((-0.08, -3.50, FZ + 0.02))
look_at  = Vector(( 0.04,  0.00, FZ))
cam_obj.location = cam_pos
cam_obj.rotation_euler = (look_at - cam_pos).to_track_quat('-Z', 'Y').to_euler()

log("Rendering…")
bpy.ops.render.render(write_still=True)
log(f"Done → {out_path}")
