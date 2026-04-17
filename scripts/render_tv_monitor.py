#!/usr/bin/env python3
"""
render_tv_monitor.py — glossy black TV, chrome stand, lavender bg
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
scene.cycles.samples = 256
scene.cycles.use_denoising = True
try: scene.cycles.denoiser = 'OPENIMAGEDENOISE'
except: pass
scene.render.resolution_x = 1800
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'
scene.render.film_transparent = False   # bake lavender bg into PNG

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

# ── World: sky texture for object lighting/reflections, lavender for camera bg ──
# This means: glossy surfaces reflect the sky (realistic), but the background
# the camera sees is the same lavender as the app — perfect match.
world = bpy.data.worlds.get('World') or bpy.data.worlds.new('World')
scene.world = world; world.use_nodes = True
wt = world.node_tree; wt.nodes.clear()
out_w  = wt.nodes.new('ShaderNodeOutputWorld')
bg_sky = wt.nodes.new('ShaderNodeBackground')
bg_lav = wt.nodes.new('ShaderNodeBackground')
sky    = wt.nodes.new('ShaderNodeTexSky')
coord  = wt.nodes.new('ShaderNodeTexCoord')
mix_bg = wt.nodes.new('ShaderNodeMixShader')
lpath  = wt.nodes.new('ShaderNodeLightPath')

try:
    sky.sky_type='NISHITA'; sky.sun_elevation=math.radians(42); sky.sun_rotation=math.radians(58)
    try: sky.air_density=1.0
    except: pass
except:
    try: sky.sky_type='HOSEK_WILKIE'; sky.sun_elevation=math.radians(42); sky.turbidity=3.0
    except: pass

wt.links.new(coord.outputs['Generated'], sky.inputs['Vector'])
wt.links.new(sky.outputs['Color'], bg_sky.inputs['Color'])
bg_sky.inputs['Strength'].default_value = 2.2   # sky used for lighting + reflections

# Lavender matching the app gradient (~#e8e0f8 in linear)
bg_lav.inputs['Color'].default_value = (0.86, 0.82, 0.97, 1.0)
bg_lav.inputs['Strength'].default_value = 1.0

# Camera rays → lavender background; bounced/reflection rays → sky
wt.links.new(lpath.outputs['Is Camera Ray'], mix_bg.inputs['Fac'])
wt.links.new(bg_sky.outputs['Background'],  mix_bg.inputs[1])  # non-camera
wt.links.new(bg_lav.outputs['Background'],  mix_bg.inputs[2])  # camera
wt.links.new(mix_bg.outputs['Shader'], out_w.inputs['Surface'])
log("World set up")

def node_in(bsdf, v4, v3, val):
    nm = v4 if BL >= (4,0,0) else v3
    if nm in bsdf.inputs: bsdf.inputs[nm].default_value = val

def make_mat(name, *, base_color, roughness, metallic=0., clearcoat=0., cc_rough=0.08):
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

def bevel_smooth(obj, width=0.004, segs=4):
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_add(type='BEVEL')
    m = obj.modifiers[-1]
    m.width = width; m.segments = segs; m.profile = 0.5
    try: m.limit_method='ANGLE'; m.angle_limit=math.radians(60)
    except: pass
    bpy.ops.object.modifier_apply(modifier=m.name)
    for p in obj.data.polygons: p.use_smooth = True

# Glossy black — roughness 0.14 so it looks dark/black, not mirror-silver
MAT_BEZEL  = make_mat('Bezel',  base_color=(0.008,0.008,0.010), roughness=0.14,
                       clearcoat=0.85, cc_rough=0.04)
# Screen — very dark, barely visible depth
MAT_SCREEN = make_mat('Screen', base_color=(0.02,0.02,0.03), roughness=0.06,
                       clearcoat=0.70, cc_rough=0.02)
MAT_CHROME = make_mat('Chrome', base_color=(0.80,0.80,0.82), roughness=0.05,
                       metallic=1.0, clearcoat=0.90, cc_rough=0.02)
MAT_DARK   = make_mat('Dark',   base_color=(0.04,0.04,0.05), roughness=0.35)

# ── TV body ───────────────────────────────────────────────────────────────────
TW=1.10; TH=0.63; TD=0.042; BZ=0.018; BZB=0.028

bpy.ops.mesh.primitive_cube_add(size=1, location=(0,0,0))
tv = bpy.context.active_object
tv.scale=(TW/2, TD/2, TH/2)
bpy.ops.object.transform_apply(scale=True)
bevel_smooth(tv, width=0.005, segs=4)
assign_mat(tv, MAT_BEZEL)

# Screen inset
SW=TW-BZ*2; SH=TH-BZ-BZB; scr_z=(BZB-BZ)/2
bpy.ops.mesh.primitive_cube_add(size=1, location=(0,-TD/2-0.0008, scr_z))
scr=bpy.context.active_object
scr.scale=(SW/2, 0.0006, SH/2)
bpy.ops.object.transform_apply(scale=True)
assign_mat(scr, MAT_SCREEN)

# Chrome accent bottom bezel
bpy.ops.mesh.primitive_cube_add(size=1, location=(0,-TD/2-0.0007,-TH/2+BZB/2))
acc=bpy.context.active_object
acc.scale=(TW/2-0.010, 0.0006, BZB/2-0.007)
bpy.ops.object.transform_apply(scale=True)
assign_mat(acc, MAT_CHROME)

# ── Stand ─────────────────────────────────────────────────────────────────────
stand_top_z=-TH/2+0.004; stand_bot_z=-TH/2-0.110; leg_y=TD/2+0.012

for sign in [-1,1]:
    bpy.ops.mesh.primitive_cube_add(size=1,
        location=(sign*0.125, leg_y+0.022, (stand_top_z+stand_bot_z)/2))
    leg=bpy.context.active_object
    leg.scale=(0.011, 0.009, abs(stand_top_z-stand_bot_z)/2)
    bpy.ops.object.transform_apply(scale=True)
    leg.rotation_euler=Euler((0,0,sign*math.radians(-8)),'XYZ')
    bevel_smooth(leg, width=0.002, segs=2)
    assign_mat(leg, MAT_CHROME)

bpy.ops.mesh.primitive_cube_add(size=1, location=(0,leg_y+0.020,stand_bot_z+0.009))
bb=bpy.context.active_object; bb.scale=(0.265,0.011,0.008)
bpy.ops.object.transform_apply(scale=True); bevel_smooth(bb,0.002,2); assign_mat(bb,MAT_CHROME)

bpy.ops.mesh.primitive_cylinder_add(radius=0.220, depth=0.016, vertices=64,
    location=(0,leg_y+0.058,stand_bot_z-0.006))
base=bpy.context.active_object; base.scale[0]=0.70
bpy.ops.object.transform_apply(scale=True); assign_mat(base,MAT_CHROME)
for p in base.data.polygons: p.use_smooth=True

bpy.ops.mesh.primitive_cube_add(size=1, location=(0,leg_y+0.009,stand_top_z-0.022))
neck=bpy.context.active_object; neck.scale=(0.080,0.018,0.022)
bpy.ops.object.transform_apply(scale=True); bevel_smooth(neck,0.002,2); assign_mat(neck,MAT_DARK)

log("Geometry done")

# ── Studio softbox panels — invisible to camera, appear in glossy reflections ──
def studio_panel(loc, rot_xyz, sx, sz, strength):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc)
    p=bpy.context.active_object; p.scale=(sx,1,sz)
    bpy.ops.object.transform_apply(scale=True)
    p.rotation_euler=Euler(tuple(math.radians(d) for d in rot_xyz),'XYZ')
    mat=bpy.data.materials.new('_sb'); mat.use_nodes=True
    nt=mat.node_tree; nt.nodes.clear()
    em=nt.nodes.new('ShaderNodeEmission'); o=nt.nodes.new('ShaderNodeOutputMaterial')
    em.inputs['Color'].default_value=(1.0,0.97,0.92,1.0)
    em.inputs['Strength'].default_value=strength
    nt.links.new(em.outputs['Emission'],o.inputs['Surface'])
    p.data.materials.clear(); p.data.materials.append(mat)
    try: p.cycles_visibility.camera=False
    except AttributeError:
        try: p.visible_camera=False
        except: pass

studio_panel((-4.0,-1.5,3.0),(40,0,28),4.5,2.8,22.0)
studio_panel(( 3.5,-1.5,0.6),(10,0,-38),3.5,2.2,10.0)
studio_panel(( 0.0,-1.0,4.5),(82,0,0),4.0,2.5,12.0)

# ── Lights ────────────────────────────────────────────────────────────────────
def add_area(loc, energy, size, color, rot_xyz):
    bpy.ops.object.light_add(type='AREA', location=loc)
    L=bpy.context.active_object
    L.data.energy=energy; L.data.size=size; L.data.color=color
    try: L.data.use_shadow=True
    except: pass
    L.rotation_euler=Euler(tuple(math.radians(d) for d in rot_xyz),'XYZ')

add_area((-3.0,-1.8,2.0),4000,1.0,(1.0,0.97,0.92),(32,0,-30))
add_area(( 2.8,-1.6,0.4),1500,1.4,(0.94,0.96,1.0),(8,0,36))
add_area(( 0.0,-1.2,3.4), 900,1.4,(1.0,0.97,0.94),(62,0,0))
add_area(( 0.0,-2.0,-1.8),400,2.0,(0.96,0.94,0.90),(-28,0,0))

# ── Camera ────────────────────────────────────────────────────────────────────
cam_data=bpy.data.cameras.new('Camera')
cam_data.lens=58; cam_data.clip_start=0.01; cam_data.clip_end=50.
cam_obj=bpy.data.objects.new('Camera',cam_data)
bpy.context.collection.objects.link(cam_obj); scene.camera=cam_obj
cam_pos=Vector((0.0,-2.80,0.06)); look_at=Vector((0.0,0.0,scr_z-0.02))
cam_obj.location=cam_pos
cam_obj.rotation_euler=(look_at-cam_pos).to_track_quat('-Z','Y').to_euler()

log("Rendering...")
bpy.ops.render.render(write_still=True)
log(f"Done → {out_path}")
