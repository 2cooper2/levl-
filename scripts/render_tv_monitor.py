#!/usr/bin/env python3
"""
render_tv_monitor.py — Modern slim flat-panel TV, dark charcoal, thin bezels,
spread stand legs. Transparent bg, AgX. Matches art-frame render quality.
Run: blender --background --python scripts/render_tv_monitor.py
"""
import bpy, math, os
from mathutils import Vector, Euler

def log(m): print(m, flush=True)
log("render_tv_monitor.py started")

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for block in (list(bpy.data.meshes)+list(bpy.data.materials)+
              list(bpy.data.lights)+list(bpy.data.curves)):
    try: bpy.data.batch_remove([block])
    except: pass

scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.render.engine = 'CYCLES'
scene.cycles.samples = 512
scene.cycles.use_denoising = True
try: scene.cycles.denoiser = 'OPENIMAGEDENOISE'
except: pass
scene.render.resolution_x = 1200
scene.render.resolution_y = 1200
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.film_transparent = True

try:
    cprefs = bpy.context.preferences.addons['cycles'].preferences
    for dev in ('METAL','OPTIX','CUDA','OPENCL'):
        try:
            cprefs.compute_device_type = dev; cprefs.get_devices()
            scene.cycles.device = 'GPU'; log(f"GPU: {dev}"); break
        except: continue
except: scene.cycles.device = 'CPU'

script_dir  = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
out_dir     = os.path.join(project_dir, 'public', 'assets', 'renders')
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, 'tv-monitor.png')
scene.render.filepath = out_path
BL = bpy.app.version

# AgX Medium High Contrast
try:
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look            = 'AgX - Medium High Contrast'
    scene.view_settings.exposure        = 0.0
    scene.view_settings.gamma           = 1.0
except:
    try:
        scene.view_settings.view_transform = 'AgX'
        scene.view_settings.look            = 'None'
    except:
        try: scene.view_settings.view_transform = 'Filmic'
        except: pass

# ── World: very low GI so dark objects stay dark ──────────────────────────────
world = bpy.data.worlds.get('World') or bpy.data.worlds.new('World')
scene.world = world; world.use_nodes = True
wt = world.node_tree; wt.nodes.clear()
out_w = wt.nodes.new('ShaderNodeOutputWorld')
bg_gi = wt.nodes.new('ShaderNodeBackground')
bg_gi.inputs['Color'].default_value    = (0.70, 0.66, 0.62, 1.0)
bg_gi.inputs['Strength'].default_value = 0.06   # very low — let lights define the look
wt.links.new(bg_gi.outputs['Background'], out_w.inputs['Surface'])
log("World set up")

def node_in(bsdf, v4, v3, val):
    nm = v4 if BL >= (4,0,0) else v3
    if nm in bsdf.inputs: bsdf.inputs[nm].default_value = val

def make_mat(name, *, base_color, roughness, metallic=0., clearcoat=0., cc_rough=0.10):
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
    return mat

def assign_mat(obj, mat):
    obj.data.materials.clear(); obj.data.materials.append(mat)

def bevel_smooth(obj, width=0.003, segs=3):
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_add(type='BEVEL')
    m = obj.modifiers[-1]
    m.width = width; m.segments = segs; m.profile = 0.5
    try: m.limit_method='ANGLE'; m.angle_limit=math.radians(60)
    except: pass
    bpy.ops.object.modifier_apply(modifier=m.name)
    for p in obj.data.polygons: p.use_smooth = True

# ── Materials — keep dark, controlled by direct lights only ───────────────────
MAT_BODY  = make_mat('Body',  base_color=(0.018,0.018,0.022), roughness=0.40,
                     metallic=0.05, clearcoat=0.40, cc_rough=0.12)
MAT_STAND = make_mat('Stand', base_color=(0.016,0.016,0.020), roughness=0.45,
                     metallic=0.05)

def make_screen_mat():
    mat = bpy.data.materials.new('Screen'); mat.use_nodes = True
    n = mat.node_tree.nodes; l = mat.node_tree.links; n.clear()
    out  = n.new('ShaderNodeOutputMaterial')
    bsdf = n.new('ShaderNodeBsdfPrincipled')
    l.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    coord = n.new('ShaderNodeTexCoord')
    sep   = n.new('ShaderNodeSeparateXYZ')
    l.new(coord.outputs['UV'], sep.inputs['Vector'])
    ramp = n.new('ShaderNodeValToRGB')
    ramp.color_ramp.interpolation = 'LINEAR'
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color    = (0.006, 0.006, 0.010, 1.0)
    ramp.color_ramp.elements[-1].position = 1.0
    ramp.color_ramp.elements[-1].color   = (0.010, 0.012, 0.020, 1.0)
    l.new(sep.outputs['Y'], ramp.inputs['Fac'])
    l.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = 0.04
    node_in(bsdf,'Coat Weight','Clearcoat', 0.95)
    node_in(bsdf,'Coat Roughness','Clearcoat Roughness', 0.02)
    ec = 'Emission Color' if BL >= (4,0,0) else 'Emission'
    if ec in bsdf.inputs: bsdf.inputs[ec].default_value = (0.03,0.05,0.12,1.0)
    bsdf.inputs['Emission Strength'].default_value = 0.28
    return mat

MAT_SCREEN = make_screen_mat()

# ── TV dimensions: 43" class 16:9, Z=up ───────────────────────────────────────
TW  = 0.960   # width
TH  = 0.546   # height
TD  = 0.024   # depth (slim)
BZS = 0.009   # bezel sides/top
BZB = 0.019   # bezel bottom
SW  = TW - BZS * 2
SH  = TH - BZS - BZB
SCR_Z = (BZB - BZS) / 2   # screen center offset (Z axis)

# TV body — centered at origin
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
body = bpy.context.active_object; body.name = 'TVBody'
body.scale = (TW/2, TD/2, TH/2)
bpy.ops.object.transform_apply(scale=True)
bevel_smooth(body, width=0.004, segs=4)
assign_mat(body, MAT_BODY)

# Screen panel — flush on front face
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -TD/2 - 0.0004, SCR_Z))
scr = bpy.context.active_object; scr.name = 'Screen'
scr.scale = (SW/2, 0.0003, SH/2)
bpy.ops.object.transform_apply(scale=True)
assign_mat(scr, MAT_SCREEN)

# ── Stand legs — two flat plates angled outward ────────────────────────────────
LEG_W  = 0.020
LEG_D  = 0.058   # front-to-back
LEG_H  = 0.065
LEG_X  = TW * 0.26   # x offset from center to each leg
LEG_Y  = TD/2 + LEG_D/2 - 0.008  # mostly forward of TV back face

for side in [-1, 1]:
    bpy.ops.mesh.primitive_cube_add(size=1,
        location=(side * LEG_X, LEG_Y, -TH/2 - LEG_H/2 + 0.002))
    leg = bpy.context.active_object
    leg.scale = (LEG_W/2, LEG_D/2, LEG_H/2)
    bpy.ops.object.transform_apply(scale=True)
    bevel_smooth(leg, width=0.002, segs=2)
    assign_mat(leg, MAT_STAND)

# Thin bar connecting legs at TV base
bpy.ops.mesh.primitive_cube_add(size=1,
    location=(0, TD/2 + 0.005, -TH/2 + 0.005))
bar = bpy.context.active_object
bar.scale = (LEG_X + LEG_W/2, 0.006, 0.007)
bpy.ops.object.transform_apply(scale=True)
bevel_smooth(bar, width=0.002, segs=2)
assign_mat(bar, MAT_STAND)

log("Geometry done")

# Shadow catcher — floor under stand
FLOOR_Z = -TH/2 - LEG_H - 0.006
bpy.ops.mesh.primitive_plane_add(size=3.5, location=(0, LEG_Y, FLOOR_Z))
sc = bpy.context.active_object
try: sc.is_shadow_catcher = True
except AttributeError:
    try: sc.cycles.is_shadow_catcher = True
    except: pass

# ── Lighting — more frontal key so shadow falls mostly below, not sideways ─────
def add_area(loc, energy, size, color, rot_xyz):
    bpy.ops.object.light_add(type='AREA', location=loc)
    L = bpy.context.active_object
    L.data.energy=energy; L.data.size=size; L.data.color=color
    try: L.data.use_shadow=True
    except: pass
    L.rotation_euler=Euler(tuple(math.radians(d) for d in rot_xyz),'XYZ')

# Key: upper-left, more frontal (less side angle) — shadow falls nearly straight down
add_area((-1.4,-2.6, 2.8), 3500, 1.4, (1.00,0.97,0.90), (38, 0,-16))
# Fill: right, soft
add_area(( 2.0,-2.2, 0.5), 900,  2.0, (0.90,0.95,1.00), (4,  0, 22))
# Rim: near-overhead
add_area(( 0.0,-0.8, 4.2), 650,  2.2, (1.00,0.98,0.94), (76, 0,  0))
# Front: very soft, lifts screen face slightly
add_area(( 0.0,-3.8, 0.0), 220,  3.5, (0.97,0.96,0.94), (0,  0,  0))

# ── Camera ─────────────────────────────────────────────────────────────────────
cam_data = bpy.data.cameras.new('Camera')
cam_data.lens = 68; cam_data.clip_start=0.01; cam_data.clip_end=50.
cam_obj  = bpy.data.objects.new('Camera', cam_data)
bpy.context.collection.objects.link(cam_obj); scene.camera = cam_obj
cam_pos  = Vector((0.0, -2.40, 0.05))
look_at  = Vector((0.0,  0.00, SCR_Z))
cam_obj.location = cam_pos
cam_obj.rotation_euler = (look_at - cam_pos).to_track_quat('-Z','Y').to_euler()

log("Rendering...")
bpy.ops.render.render(write_still=True)
log(f"Done → {out_path}")
