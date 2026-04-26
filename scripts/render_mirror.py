#!/usr/bin/env python3
"""
render_mirror.py — dark espresso walnut leaning floor mirror.
Side-perspective product shot, clean transparent BG with shadow catcher.
Run: blender --background --python scripts/render_mirror.py
"""
import bpy, bmesh, math, os
from mathutils import Vector, Euler

def log(m): print(m, flush=True)
log("render_mirror.py started")

# ── Clear scene ───────────────────────────────────────────────────────────────
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for col in [bpy.data.meshes, bpy.data.materials, bpy.data.lights,
            bpy.data.cameras, bpy.data.images, bpy.data.curves]:
    for b in list(col):
        try: col.remove(b)
        except: pass

# ── Render settings ───────────────────────────────────────────────────────────
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.render.engine = 'CYCLES'
scene.cycles.samples = 512
scene.cycles.use_denoising = True
try: scene.cycles.denoiser = 'OPENIMAGEDENOISE'
except: pass
scene.render.resolution_x = 800
scene.render.resolution_y = 800
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.film_transparent = True
scene.cycles.device = 'CPU'

try:
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look            = 'AgX - Medium High Contrast'
    scene.view_settings.exposure        = -0.20
    scene.view_settings.gamma           = 1.0
except:
    try: scene.view_settings.view_transform = 'Filmic'
    except: pass

project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out_path    = os.path.join(project_dir, 'public', 'assets', 'renders', 'mirror.png')
os.makedirs(os.path.dirname(out_path), exist_ok=True)
scene.render.filepath = out_path

# ── World — 3-way: camera=lavender, glossy=warm cream, GI=warm grey ──────────
world = bpy.data.worlds.get('World') or bpy.data.worlds.new('World')
scene.world = world; world.use_nodes = True
wt = world.node_tree; wt.nodes.clear()
out_w   = wt.nodes.new('ShaderNodeOutputWorld')
bg_gi   = wt.nodes.new('ShaderNodeBackground')
bg_cam  = wt.nodes.new('ShaderNodeBackground')
bg_refl = wt.nodes.new('ShaderNodeBackground')
mix1    = wt.nodes.new('ShaderNodeMixShader')
mix2    = wt.nodes.new('ShaderNodeMixShader')
lpath   = wt.nodes.new('ShaderNodeLightPath')
bg_gi.inputs['Color'].default_value    = (0.82, 0.78, 0.72, 1.0)
bg_gi.inputs['Strength'].default_value = 0.35
bg_cam.inputs['Color'].default_value   = (0.93, 0.91, 0.97, 1.0)   # soft lavender
bg_cam.inputs['Strength'].default_value = 1.0
bg_refl.inputs['Color'].default_value  = (0.86, 0.80, 0.70, 1.0)   # warm cream
bg_refl.inputs['Strength'].default_value = 0.28
wt.links.new(lpath.outputs['Is Glossy Ray'], mix1.inputs['Fac'])
wt.links.new(bg_gi.outputs['Background'],   mix1.inputs[1])
wt.links.new(bg_refl.outputs['Background'], mix1.inputs[2])
wt.links.new(lpath.outputs['Is Camera Ray'], mix2.inputs['Fac'])
wt.links.new(mix1.outputs['Shader'],        mix2.inputs[1])
wt.links.new(bg_cam.outputs['Background'],  mix2.inputs[2])
wt.links.new(mix2.outputs['Shader'], out_w.inputs['Surface'])

log("World setup done")

# ── Mirror geometry — thin espresso frame ────────────────────────────────────
LEAN_DEG    = 8.0
FRAME_DEPTH = 0.055
WALL_Y      = 0.0
FW, FH      = 0.44, 0.95       # outer half — 0.88m × 1.90m total
FBW         = 0.038             # frame border: 3.8cm
GW          = FW - FBW         # 0.402
GH          = FH - FBW         # 0.912

_lean = math.radians(LEAN_DEG)
MIRROR_Z = FH * math.cos(_lean) + 0.005
MIRROR_Y = WALL_Y - FH * math.sin(_lean) - (FRAME_DEPTH / 2) * math.cos(_lean) - 0.01

# Dark espresso walnut frame material
mat_frame = bpy.data.materials.new('EspressoWalnut')
mat_frame.use_nodes = True
nt = mat_frame.node_tree; nt.nodes.clear()
out_m  = nt.nodes.new('ShaderNodeOutputMaterial')
bsdf_m = nt.nodes.new('ShaderNodeBsdfPrincipled')
bsdf_m.inputs['Base Color'].default_value = (0.008, 0.004, 0.001, 1.0)
bsdf_m.inputs['Roughness'].default_value  = 0.70
for k in ('Coat Weight', 'Clearcoat'):
    if k in bsdf_m.inputs: bsdf_m.inputs[k].default_value = 0.04; break
for k in ('Coat Roughness', 'Clearcoat Roughness'):
    if k in bsdf_m.inputs: bsdf_m.inputs[k].default_value = 0.10; break
nt.links.new(bsdf_m.outputs['BSDF'], out_m.inputs['Surface'])

# Frame ring (bmesh)
bm = bmesh.new()
outer = [(-FW,0,-FH),(FW,0,-FH),(FW,0,FH),(-FW,0,FH)]
inner = [(-GW,0,-GH),(GW,0,-GH),(GW,0,GH),(-GW,0,GH)]
fd = FRAME_DEPTH
ov_b = [bm.verts.new(v) for v in outer]
iv_b = [bm.verts.new(v) for v in inner]
ov_f = [bm.verts.new((v[0], -fd, v[2])) for v in outer]
iv_f = [bm.verts.new((v[0], -fd, v[2])) for v in inner]
for i in range(4):
    j = (i + 1) % 4
    bm.faces.new([ov_b[i], ov_b[j], iv_b[j], iv_b[i]])
    bm.faces.new([ov_f[j], ov_f[i], iv_f[i], iv_f[j]])
    bm.faces.new([ov_b[i], ov_f[i], ov_f[j], ov_b[j]])
    bm.faces.new([iv_f[i], iv_b[i], iv_b[j], iv_f[j]])
bm.normal_update()
me = bpy.data.meshes.new('MirrorFrame')
bm.to_mesh(me); bm.free()
frame_obj = bpy.data.objects.new('MirrorFrame', me)
bpy.context.collection.objects.link(frame_obj)
frame_obj.data.materials.append(mat_frame)
for p in frame_obj.data.polygons: p.use_smooth = True
frame_obj.location       = Vector((0.0, MIRROR_Y, MIRROR_Z))
frame_obj.rotation_euler = Euler((-_lean, 0, 0), 'XYZ')

# Mirror glass — metallic plane with slight roughness for elegant soft reflections
bm2 = bmesh.new()
bm2.faces.new([bm2.verts.new((-GW,0,-GH)), bm2.verts.new((GW,0,-GH)),
               bm2.verts.new((GW,0,GH)),   bm2.verts.new((-GW,0,GH))])
bm2.normal_update()
me2 = bpy.data.meshes.new('MirrorGlass')
bm2.to_mesh(me2); bm2.free()
glass_obj = bpy.data.objects.new('MirrorGlass', me2)
bpy.context.collection.objects.link(glass_obj)
mat_gl = bpy.data.materials.new('MirrorGlass')
mat_gl.use_nodes = True
nt_gl = mat_gl.node_tree; nt_gl.nodes.clear()
out_gl  = nt_gl.nodes.new('ShaderNodeOutputMaterial')
bsdf_gl = nt_gl.nodes.new('ShaderNodeBsdfPrincipled')
bsdf_gl.inputs['Base Color'].default_value = (0.96, 0.96, 0.93, 1.0)
bsdf_gl.inputs['Metallic'].default_value   = 1.0
bsdf_gl.inputs['Roughness'].default_value  = 0.038
nt_gl.links.new(bsdf_gl.outputs['BSDF'], out_gl.inputs['Surface'])
glass_obj.data.materials.append(mat_gl)
glass_obj.location       = Vector((0.0, MIRROR_Y - 0.001, MIRROR_Z))
glass_obj.rotation_euler = Euler((-_lean, 0, 0), 'XYZ')

log("Mirror geometry done")

# ── Shadow catchers ───────────────────────────────────────────────────────────
bpy.ops.mesh.primitive_plane_add(size=6.0, location=(0.0, 0.006, MIRROR_Z))
sc_wall = bpy.context.active_object; sc_wall.name = 'WallShadowCatcher'
sc_wall.rotation_euler = Euler((math.radians(90), 0, 0), 'XYZ')
try: sc_wall.is_shadow_catcher = True
except AttributeError:
    try: sc_wall.cycles.is_shadow_catcher = True
    except: pass

bpy.ops.mesh.primitive_plane_add(size=5.0, location=(0.0, -1.0, 0.0))
sc_floor = bpy.context.active_object; sc_floor.name = 'FloorShadowCatcher'
try: sc_floor.is_shadow_catcher = True
except AttributeError:
    try: sc_floor.cycles.is_shadow_catcher = True
    except: pass

log("Shadow catchers done")

# ── Lights ────────────────────────────────────────────────────────────────────
def add_area(name, loc, energy, size, color, rot_xyz, vis_cam=True, vis_gls=True):
    bpy.ops.object.light_add(type='AREA', location=loc)
    L = bpy.context.active_object; L.name = name
    L.data.energy = energy; L.data.size = size; L.data.color = color
    L.rotation_euler = Euler(tuple(math.radians(d) for d in rot_xyz), 'XYZ')
    try: L.visible_camera = vis_cam; L.visible_glossy = vis_gls
    except: pass
    return L

# Frame product lights (camera+shadow only, invisible in glass)
add_area('Key',   (-3.0, -2.0, 4.0), 160, 1.4, (1.0, 0.97, 0.90), (25, 0, -30), vis_gls=False)
add_area('Fill',  ( 2.2, -2.2, 2.0),  80, 1.8, (0.96, 0.98, 1.0),  (8, 0,  30), vis_gls=False)
add_area('Top',   ( 0.0, -1.8, 4.5),  70, 2.4, (1.0, 0.98, 0.95), (65, 0,   0), vis_gls=False)
add_area('Front', ( 0.0, -3.8, MIRROR_Z), 55, 3.0, (1.0, 0.97, 0.94), (0, 0, 0), vis_gls=False)

# Reflection-only lights — create elegant studio sweep in glass
# (glossy-only: visible in mirror reflection but NOT directly to camera)
add_area('Refl_A', ( 1.0, -4.5, 3.5), 180, 8.0, (1.0, 0.96, 0.88), (25, 0, -22), vis_cam=False, vis_gls=True)
add_area('Refl_B', (-1.5, -4.0, 2.8),  90, 5.0, (0.98,0.92, 0.84), (20, 0,  18), vis_cam=False, vis_gls=True)
add_area('Refl_C', ( 0.6, -2.5, 0.3),  55, 1.5, (0.92,0.78, 0.58), ( 0, 0, -10), vis_cam=False, vis_gls=True)

log("Lights done")

# ── Camera — SIDE PERSPECTIVE (LOCKED) ───────────────────────────────────────
cam_data = bpy.data.cameras.new('Camera')
cam_data.lens = 75
cam_data.clip_start = 0.01; cam_data.clip_end = 50.0
cam_obj = bpy.data.objects.new('Camera', cam_data)
bpy.context.collection.objects.link(cam_obj)
scene.camera = cam_obj

cam_pos = Vector((-0.72, -4.2, 1.1))
look_at  = Vector((0.0, 0.05, 0.94))
cam_obj.location = cam_pos
cam_obj.rotation_euler = (look_at - cam_pos).to_track_quat('-Z', 'Y').to_euler()

log("Rendering…")
bpy.ops.render.render(write_still=True)
log(f"Done → {out_path}")
