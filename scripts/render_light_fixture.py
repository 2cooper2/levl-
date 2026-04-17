#!/usr/bin/env python3
"""
render_light_fixture.py — Industrial pendant: concrete cylinder cap +
dark bronze wire-mesh cage + Edison bulb glow. Z=up. Transparent bg, AgX.
Run: blender --background --python scripts/render_light_fixture.py
"""
import bpy, math, os
from mathutils import Vector, Euler

def log(m): print(m, flush=True)
log("render_light_fixture.py started")

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
out_path = os.path.join(out_dir, 'light-fixture.png')
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

# ── World: low neutral GI ─────────────────────────────────────────────────────
world = bpy.data.worlds.get('World') or bpy.data.worlds.new('World')
scene.world = world; world.use_nodes = True
wt = world.node_tree; wt.nodes.clear()
out_w = wt.nodes.new('ShaderNodeOutputWorld')
bg_gi = wt.nodes.new('ShaderNodeBackground')
bg_gi.inputs['Color'].default_value    = (0.72, 0.68, 0.64, 1.0)
bg_gi.inputs['Strength'].default_value = 0.02
wt.links.new(bg_gi.outputs['Background'], out_w.inputs['Surface'])
log("World set up")

def node_in(bsdf, v4, v3, val):
    nm = v4 if BL >= (4,0,0) else v3
    if nm in bsdf.inputs: bsdf.inputs[nm].default_value = val

def assign_mat(obj, mat):
    obj.data.materials.clear(); obj.data.materials.append(mat)

# ── Materials ─────────────────────────────────────────────────────────────────

def make_concrete_mat():
    mat = bpy.data.materials.new('Concrete'); mat.use_nodes = True
    n = mat.node_tree.nodes; l = mat.node_tree.links; n.clear()
    out  = n.new('ShaderNodeOutputMaterial')
    bsdf = n.new('ShaderNodeBsdfPrincipled')
    l.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    coord = n.new('ShaderNodeTexCoord')
    # Coarse noise for stone/concrete aggregate
    noise = n.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value      = 160.0
    noise.inputs['Detail'].default_value     = 14.0
    noise.inputs['Roughness'].default_value  = 0.68
    noise.inputs['Distortion'].default_value = 0.12
    ramp = n.new('ShaderNodeValToRGB')
    ramp.color_ramp.interpolation = 'LINEAR'
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color    = (0.28, 0.27, 0.26, 1.0)
    el1 = ramp.color_ramp.elements.new(0.42)
    el1.color = (0.46, 0.44, 0.42, 1.0)
    ramp.color_ramp.elements[-1].position = 1.0
    ramp.color_ramp.elements[-1].color   = (0.62, 0.60, 0.57, 1.0)
    # Fine noise for surface grain bump
    noise2 = n.new('ShaderNodeTexNoise')
    noise2.inputs['Scale'].default_value     = 380.0
    noise2.inputs['Detail'].default_value    = 10.0
    noise2.inputs['Roughness'].default_value = 0.60
    bump = n.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.60
    bump.inputs['Distance'].default_value = 0.003
    l.new(coord.outputs['Object'], noise.inputs['Vector'])
    l.new(coord.outputs['Object'], noise2.inputs['Vector'])
    l.new(noise.outputs['Fac'],  ramp.inputs['Fac'])
    l.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])
    l.new(noise2.outputs['Fac'], bump.inputs['Height'])
    l.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    bsdf.inputs['Roughness'].default_value = 0.84
    bsdf.inputs['Metallic'].default_value  = 0.0
    return mat

def make_cage_mat():
    mat = bpy.data.materials.new('CageMetal'); mat.use_nodes = True
    n = mat.node_tree.nodes; l = mat.node_tree.links; n.clear()
    out  = n.new('ShaderNodeOutputMaterial')
    bsdf = n.new('ShaderNodeBsdfPrincipled')
    l.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    bsdf.inputs['Base Color'].default_value = (0.018, 0.018, 0.020, 1.0)
    bsdf.inputs['Roughness'].default_value  = 0.90
    bsdf.inputs['Metallic'].default_value   = 0.0
    for spec in ('Specular IOR Level', 'Specular'):
        if spec in bsdf.inputs: bsdf.inputs[spec].default_value = 0.0; break
    node_in(bsdf,'Coat Weight','Clearcoat', 0.65)
    node_in(bsdf,'Coat Roughness','Clearcoat Roughness', 0.05)
    return mat

def make_ring_mat():
    mat = bpy.data.materials.new('Ring'); mat.use_nodes = True
    n = mat.node_tree.nodes; l = mat.node_tree.links; n.clear()
    out  = n.new('ShaderNodeOutputMaterial')
    bsdf = n.new('ShaderNodeBsdfPrincipled')
    l.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    bsdf.inputs['Base Color'].default_value = (0.016, 0.016, 0.018, 1.0)
    bsdf.inputs['Roughness'].default_value  = 0.90
    bsdf.inputs['Metallic'].default_value   = 0.0
    for spec in ('Specular IOR Level', 'Specular'):
        if spec in bsdf.inputs: bsdf.inputs[spec].default_value = 0.0; break
    node_in(bsdf,'Coat Weight','Clearcoat', 0.80)
    node_in(bsdf,'Coat Roughness','Clearcoat Roughness', 0.04)
    return mat

def make_bulb_mat():
    mat = bpy.data.materials.new('Bulb'); mat.use_nodes = True
    n = mat.node_tree.nodes; l = mat.node_tree.links; n.clear()
    out  = n.new('ShaderNodeOutputMaterial')
    bsdf = n.new('ShaderNodeBsdfPrincipled')
    l.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    bsdf.inputs['Base Color'].default_value = (1.0, 0.92, 0.70, 1.0)
    bsdf.inputs['Roughness'].default_value  = 0.0
    ec = 'Emission Color' if BL >= (4,0,0) else 'Emission'
    if ec in bsdf.inputs: bsdf.inputs[ec].default_value = (1.0, 0.52, 0.10, 1.0)
    bsdf.inputs['Emission Strength'].default_value = 22.0
    return mat

# Cap — deep matte black, no metallic, fully absorbs light
def make_black_cap_mat():
    mat = bpy.data.materials.new('Cap'); mat.use_nodes = True
    n = mat.node_tree.nodes; l = mat.node_tree.links; n.clear()
    out  = n.new('ShaderNodeOutputMaterial')
    bsdf = n.new('ShaderNodeBsdfPrincipled')
    l.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    bsdf.inputs['Base Color'].default_value = (0.004, 0.004, 0.005, 1.0)
    bsdf.inputs['Roughness'].default_value  = 0.40   # semi-gloss black
    bsdf.inputs['Metallic'].default_value   = 0.0
    # Subtle surface bump so it reads as a physical object, not a void
    coord = n.new('ShaderNodeTexCoord')
    noise = n.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value     = 200.0
    noise.inputs['Detail'].default_value    = 8.0
    noise.inputs['Roughness'].default_value = 0.6
    bump  = n.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value  = 0.30
    bump.inputs['Distance'].default_value  = 0.002
    l.new(coord.outputs['Object'], noise.inputs['Vector'])
    l.new(noise.outputs['Fac'],    bump.inputs['Height'])
    l.new(bump.outputs['Normal'],  bsdf.inputs['Normal'])
    return mat

MAT_CONCRETE = make_black_cap_mat()
MAT_CAGE     = make_cage_mat()
MAT_RING     = make_ring_mat()
MAT_BULB     = make_bulb_mat()

# Cord material
MAT_CORD = bpy.data.materials.new('Cord'); MAT_CORD.use_nodes = True
_cn = MAT_CORD.node_tree.nodes; _cn.clear()
_co = _cn.new('ShaderNodeOutputMaterial'); _cb = _cn.new('ShaderNodeBsdfPrincipled')
MAT_CORD.node_tree.links.new(_cb.outputs['BSDF'], _co.inputs['Surface'])
_cb.inputs['Base Color'].default_value = (0.004, 0.004, 0.005, 1.0)
_cb.inputs['Roughness'].default_value  = 0.38

# ── Geometry — Z is UP, pendant hangs downward ────────────────────────────────
# All cylinders: location=(x=0, y=0, z=center_height)
TOP_Z     =  0.50   # cord top point
CORD_LEN  =  0.36
CAP_R     =  0.054  # concrete cap radius
CAP_H     =  0.092  # concrete cap height
RING_H    =  0.015
RING_R    =  0.057
CAGE_R    =  0.073  # cage radius
CAGE_H    =  0.150  # cage height
BULB_R    =  0.026

CAP_Z   = TOP_Z - CORD_LEN - CAP_H/2
RING_Z  = CAP_Z - CAP_H/2 - RING_H/2
CAGE_Z  = RING_Z - RING_H/2 - CAGE_H/2
BULB_Z  = CAGE_Z + 0.022   # upper portion of cage

def cyl(r, h, z, mat, verts=48):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=verts,
                                        location=(0, 0, z))
    obj = bpy.context.active_object
    for p in obj.data.polygons: p.use_smooth = True
    assign_mat(obj, mat)
    return obj

# Cord
cyl(0.0026, CORD_LEN, TOP_Z - CORD_LEN/2, MAT_CORD, verts=12)

# Cord top cap (ceiling mount disc — slightly larger)
cyl(0.044, 0.010, TOP_Z - 0.005, MAT_RING, verts=32)

# Concrete cap cylinder
cyl(CAP_R, CAP_H, CAP_Z, MAT_CONCRETE, verts=64)

# Connector ring
cyl(RING_R, RING_H, RING_Z, MAT_RING, verts=48)

# ── Cage: individual vertical rods arranged in a circle — real gaps between bars ─
N_BARS = 24       # number of vertical rods
BAR_R  = 0.0055   # radius of each rod → visible gap between bars
for i in range(N_BARS):
    angle = 2 * math.pi * i / N_BARS
    bx = CAGE_R * math.cos(angle)
    by = CAGE_R * math.sin(angle)
    bpy.ops.mesh.primitive_cylinder_add(radius=BAR_R, depth=CAGE_H,
                                        vertices=10, location=(bx, by, CAGE_Z))
    bar = bpy.context.active_object
    for p in bar.data.polygons: p.use_smooth = True
    assign_mat(bar, MAT_CAGE)

# Top ring cap — sharp border, bevel for depth
bpy.ops.mesh.primitive_cylinder_add(radius=CAGE_R + 0.006, depth=0.012,
                                    vertices=64, location=(0, 0, CAGE_Z + CAGE_H/2 - 0.006))
top_ring = bpy.context.active_object
bpy.context.view_layer.objects.active = top_ring
bpy.ops.object.modifier_add(type='BEVEL')
top_ring.modifiers[-1].width = 0.002; top_ring.modifiers[-1].segments = 3
bpy.ops.object.modifier_apply(modifier=top_ring.modifiers[-1].name)
for p in top_ring.data.polygons: p.use_smooth = True
assign_mat(top_ring, MAT_RING)

# Bottom ring cap
bpy.ops.mesh.primitive_cylinder_add(radius=CAGE_R + 0.006, depth=0.012,
                                    vertices=64, location=(0, 0, CAGE_Z - CAGE_H/2 + 0.006))
bot_ring = bpy.context.active_object
bpy.context.view_layer.objects.active = bot_ring
bpy.ops.object.modifier_add(type='BEVEL')
bot_ring.modifiers[-1].width = 0.002; bot_ring.modifiers[-1].segments = 3
bpy.ops.object.modifier_apply(modifier=bot_ring.modifiers[-1].name)
for p in bot_ring.data.polygons: p.use_smooth = True
assign_mat(bot_ring, MAT_RING)

# Edison bulb — elongated teardrop shape
bpy.ops.mesh.primitive_uv_sphere_add(radius=BULB_R, segments=28, ring_count=18,
                                     location=(0, 0, BULB_Z))
bulb = bpy.context.active_object
bulb.scale = (1.0, 1.0, 1.75)   # elongate vertically into teardrop
bpy.ops.object.transform_apply(scale=True)
for p in bulb.data.polygons: p.use_smooth = True
assign_mat(bulb, MAT_BULB)

log("Geometry done")

# ── Lights ────────────────────────────────────────────────────────────────────
def add_area(loc, energy, size, color, rot_xyz):
    bpy.ops.object.light_add(type='AREA', location=loc)
    L = bpy.context.active_object
    L.data.energy=energy; L.data.size=size; L.data.color=color
    try: L.data.use_shadow=True
    except: pass
    L.rotation_euler=Euler(tuple(math.radians(d) for d in rot_xyz),'XYZ')

# Key: more frontal, less side — reduces harsh cylinder shadow
# Subtle key — just catches the cap edge, NOT flooding the dark cage
add_area((-0.8,-1.8, 1.6), 220, 0.3, (1.00,0.97,0.90), (28, 0,-12))

# Warm point light inside cage — Edison filament glow illuminates cage from within
bpy.ops.object.light_add(type='POINT', location=(0, 0, BULB_Z))
pt = bpy.context.active_object
pt.data.energy = 220; pt.data.color = (1.0, 0.58, 0.14)  # deep amber Edison glow
try: pt.data.radius = 0.030
except:
    try: pt.data.shadow_soft_size = 0.030
    except: pass

# ── Camera: slightly below fixture center, looking slightly up ────────────────
cam_data = bpy.data.cameras.new('Camera')
cam_data.lens = 65; cam_data.clip_start=0.01; cam_data.clip_end=50.
cam_obj  = bpy.data.objects.new('Camera', cam_data)
bpy.context.collection.objects.link(cam_obj); scene.camera = cam_obj
# Look at the middle of the fixture (between cap and cage)
look_z   = (CAP_Z + CAGE_Z) / 2
cam_pos  = Vector((0.0, -1.20, look_z - 0.04))
look_at  = Vector((0.0,  0.00, look_z))
cam_obj.location = cam_pos
cam_obj.rotation_euler = (look_at - cam_pos).to_track_quat('-Z','Y').to_euler()

log("Rendering...")
bpy.ops.render.render(write_still=True)
log(f"Done → {out_path}")
