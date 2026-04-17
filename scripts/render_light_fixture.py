#!/usr/bin/env python3
"""
render_light_fixture.py — 4 pendant styles, sky lighting, transparent bg
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
scene.cycles.samples = 256
scene.cycles.use_denoising = True
try: scene.cycles.denoiser = 'OPENIMAGEDENOISE'
except: pass
scene.render.resolution_x = 1800
scene.render.resolution_y = 900
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

# ── Sky world ─────────────────────────────────────────────────────────────────
world = bpy.data.worlds.get('World') or bpy.data.worlds.new('World')
scene.world = world
world.use_nodes = True
wt = world.node_tree
wt.nodes.clear()
out_w = wt.nodes.new('ShaderNodeOutputWorld')
bg_w  = wt.nodes.new('ShaderNodeBackground')
sky   = wt.nodes.new('ShaderNodeTexSky')
coord = wt.nodes.new('ShaderNodeTexCoord')
try:
    sky.sky_type = 'NISHITA'
    sky.sun_elevation = math.radians(44)
    sky.sun_rotation  = math.radians(70)
    try: sky.air_density = 1.0
    except: pass
    try: sky.dust_density = 0.3
    except: pass
except:
    try:
        sky.sky_type = 'HOSEK_WILKIE'
        sky.sun_elevation = math.radians(44)
        sky.turbidity = 3.0
    except: pass
wt.links.new(coord.outputs['Generated'], sky.inputs['Vector'])
wt.links.new(sky.outputs['Color'], bg_w.inputs['Color'])
bg_w.inputs['Strength'].default_value = 1.8
wt.links.new(bg_w.outputs['Background'], out_w.inputs['Surface'])
log("Sky world set up")

def node_in(bsdf, v4, v3, val):
    nm = v4 if BL >= (4,0,0) else v3
    if nm in bsdf.inputs: bsdf.inputs[nm].default_value = val

def make_mat(name, *, base_color, roughness, metallic=0., clearcoat=0., cc_rough=0.10,
             emission_color=None, emission_str=0.):
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
    if emission_color and emission_str > 0:
        ec = 'Emission Color' if BL >= (4,0,0) else 'Emission'
        if ec in bsdf.inputs: bsdf.inputs[ec].default_value = (*emission_color, 1.)
        bsdf.inputs['Emission Strength'].default_value = emission_str
    return mat

def assign_mat(obj, mat):
    obj.data.materials.clear(); obj.data.materials.append(mat)

# ── Materials ─────────────────────────────────────────────────────────────────
MAT_CORD  = make_mat('Cord',  base_color=(0.05,0.04,0.04), roughness=0.90)
MAT_BRASS = make_mat('Brass', base_color=(0.70,0.50,0.12), roughness=0.06,
                      metallic=0.98, clearcoat=0.94, cc_rough=0.03)
MAT_WHITE = make_mat('White', base_color=(0.92,0.90,0.86), roughness=0.22,
                      clearcoat=0.62, cc_rough=0.16)
MAT_WOOD  = make_mat('Wood',  base_color=(0.46,0.28,0.14), roughness=0.56,
                      clearcoat=0.32, cc_rough=0.26)
MAT_BULB  = make_mat('Bulb',  base_color=(1.0,0.96,0.82), roughness=0.0,
                      emission_color=(1.0,0.85,0.55), emission_str=12.0)

def cyl(r, h, loc, mat, verts=32):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=verts, location=loc)
    obj = bpy.context.active_object; assign_mat(obj, mat)
    for p in obj.data.polygons: p.use_smooth = True
    return obj

# ── Pendant 1: White flared cone (left) ───────────────────────────────────────
def pendant_cone(cx, top_z, cord_len):
    cyl(0.005, cord_len, (cx, 0, top_z-cord_len/2), MAT_CORD, 8)
    # Brass canopy
    cyl(0.046, 0.036, (cx, 0, top_z-cord_len), MAT_BRASS, 20)
    # Shade — each section is a truncated cone approximated as cylinder
    # Profile: (radius_at_bottom, delta_z_from_top)
    st = top_z - cord_len - 0.018   # shade top z
    segs = [(0.050, 0.052), (0.108, 0.070), (0.172, 0.160), (0.228, 0.268), (0.256, 0.360)]
    for i in range(len(segs)-1):
        r0,dz0 = segs[i]; r1,dz1 = segs[i+1]
        r_avg = (r0+r1)/2; ht = dz1-dz0
        cyl(r_avg, ht, (cx, 0, st-(dz0+dz1)/2), MAT_WHITE)
    # Bulb glow
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.026, segments=14, ring_count=8,
        location=(cx, 0, st-0.200))
    assign_mat(bpy.context.active_object, MAT_BULB)

# ── Pendant 2: Glass globe (center-left) ──────────────────────────────────────
def pendant_globe(cx, top_z, cord_len):
    cyl(0.004, cord_len, (cx, 0, top_z-cord_len/2), MAT_CORD, 8)
    # Brass neck
    cyl(0.028, 0.044, (cx, 0, top_z-cord_len), MAT_BRASS, 18)
    globe_z = top_z - cord_len - 0.044 - 0.104
    # Globe — smooth sphere, glossy to show sky reflections
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.140, segments=36, ring_count=22,
        location=(cx, 0, globe_z))
    globe = bpy.context.active_object
    for p in globe.data.polygons: p.use_smooth = True
    # Slightly translucent-looking with clearcoat
    mat_globe = make_mat('Globe', base_color=(0.90,0.94,0.90), roughness=0.02,
                          metallic=0.0, clearcoat=0.95, cc_rough=0.01)
    assign_mat(globe, mat_globe)
    # Edison bulb inside
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.040, segments=12, ring_count=7,
        location=(cx, 0, globe_z+0.010))
    assign_mat(bpy.context.active_object, MAT_BULB)

# ── Pendant 3: Brass stacked discs (center-right) ─────────────────────────────
def pendant_brass_disc(cx, top_z, cord_len):
    cyl(0.004, cord_len, (cx, 0, top_z-cord_len/2), MAT_CORD, 8)
    # Stacked graduated brass discs
    z = top_z - cord_len
    discs = [(0.220, 0.022), (0.172, 0.020), (0.124, 0.018), (0.080, 0.016)]
    gap = 0.003
    for r, h in discs:
        cyl(r, h, (cx, 0, z-h/2), MAT_BRASS)
        z -= h + gap
    # Center pin connecting discs
    pin_h = (top_z - cord_len) - z
    cyl(0.010, pin_h, (cx, 0, (top_z-cord_len+z)/2), MAT_BRASS, 12)
    # Warm glow at bottom
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.016, segments=10, ring_count=6,
        location=(cx, 0, z+0.010))
    assign_mat(bpy.context.active_object, MAT_BULB)

# ── Pendant 4: Wood dome (right) ──────────────────────────────────────────────
def pendant_dome(cx, top_z, cord_len):
    cyl(0.004, cord_len, (cx, 0, top_z-cord_len/2), MAT_CORD, 8)
    # Brass canopy
    cyl(0.040, 0.034, (cx, 0, top_z-cord_len), MAT_BRASS, 18)
    st = top_z - cord_len - 0.017
    segs = [(0.044, 0.000), (0.106, 0.060), (0.154, 0.130),
            (0.175, 0.212), (0.162, 0.302), (0.122, 0.370), (0.056, 0.400)]
    for i in range(len(segs)-1):
        r0,dz0 = segs[i]; r1,dz1 = segs[i+1]
        r_avg = (r0+r1)/2; ht = dz1-dz0
        cyl(r_avg, ht, (cx, 0, st-(dz0+dz1)/2), MAT_WOOD)
    # Bulb glow
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.022, segments=12, ring_count=7,
        location=(cx, 0, st-0.215))
    assign_mat(bpy.context.active_object, MAT_BULB)

# ── Place all 4 pendants, staggered heights ────────────────────────────────────
pendant_cone(      -0.60, 0.88, 0.26)
pendant_globe(     -0.16, 0.88, 0.44)
pendant_brass_disc( 0.10, 0.88, 0.18)
pendant_dome(       0.54, 0.88, 0.30)

log("Geometry done")

# ── Lights ────────────────────────────────────────────────────────────────────
def add_area(loc, energy, size, color, rot_xyz):
    bpy.ops.object.light_add(type='AREA', location=loc)
    L = bpy.context.active_object
    L.data.energy = energy; L.data.size = size; L.data.color = color
    try: L.data.use_shadow = True
    except: pass
    L.rotation_euler = Euler(tuple(math.radians(d) for d in rot_xyz), 'XYZ')

add_area((-2.6,-2.0, 2.2), 1300, 3.0, (1.0,0.97,0.90), (32,0,-28))
add_area(( 2.6,-1.8, 0.2),  350, 4.0, (0.90,0.93,1.0),  (6,0,38))
add_area(( 0.0,-1.5, 4.0),  600, 3.0, (1.0,0.97,0.92), (76,0,0))
add_area(( 0.5, 2.8, 0.6),  480, 1.2, (0.85,0.88,1.0),  (-50,0,12))

# Warm point light — bulb warmth
bpy.ops.object.light_add(type='POINT', location=(-0.02, -0.5, 0.35))
pt = bpy.context.active_object
pt.data.energy = 280; pt.data.color = (1.0,0.80,0.42)
try: pt.data.radius = 0.35
except:
    try: pt.data.shadow_soft_size = 0.35
    except: pass

# ── Camera ────────────────────────────────────────────────────────────────────
cam_data = bpy.data.cameras.new('Camera')
cam_data.lens = 68; cam_data.clip_start = 0.01; cam_data.clip_end = 50.
cam_obj  = bpy.data.objects.new('Camera', cam_data)
bpy.context.collection.objects.link(cam_obj); scene.camera = cam_obj
cam_pos  = Vector((-0.02,-3.20, 0.26))
look_at  = Vector((-0.02,  0.0, 0.26))
cam_obj.location = cam_pos
cam_obj.rotation_euler = (look_at - cam_pos).to_track_quat('-Z','Y').to_euler()

log("Rendering...")
bpy.ops.render.render(write_still=True)
log(f"Done → {out_path}")
