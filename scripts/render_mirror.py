#!/usr/bin/env python3
"""
render_mirror.py — floor mirror leaning against plaster wall.
Polyhaven HDR lighting + PBR surface textures (concrete floor, grey plaster wall,
japanese sycamore frame). Terracotta vase prop on the right.
Run: blender --background --python scripts/render_mirror.py
"""
import bpy, math, os
from mathutils import Vector, Euler

def log(m): print(m, flush=True)
log("render_mirror.py started")

# ── Clear scene ────────────────────────────────────────────────────────────────
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
scene.render.resolution_x = 1200
scene.render.resolution_y = 1200
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'
scene.render.film_transparent = False

# Color management — AgX, same as floating shelves (natural shadows, warm tones)
try:
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look            = 'None'
    scene.view_settings.exposure        = 0.0
    scene.view_settings.gamma           = 1.0
except:
    try: scene.view_settings.view_transform = 'Filmic'
    except: pass

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
out_path    = os.path.join(project_dir, 'public', 'assets', 'renders', 'mirror.png')
tex_dir     = os.path.join(project_dir, 'tmp_textures')
os.makedirs(os.path.dirname(out_path), exist_ok=True)
scene.render.filepath = out_path

# ── Texture loader ─────────────────────────────────────────────────────────────
def dl(asset_id, res='2k'):
    """Find pre-downloaded PBR maps. Handles both old (id_res_map) and new (id_map_res) naming."""
    canonical = {
        'diff':   ['diff', 'Diffuse', 'col'],
        'rough':  ['rough', 'Rough'],
        'nor_gl': ['nor_gl'],
        'disp':   ['disp', 'Displacement'],
        'ao':     ['ao', 'AO'],
    }
    paths = {}
    for canon, aliases in canonical.items():
        for alias in aliases:
            for ext in ['jpg', 'png', 'exr']:
                for fname in [
                    f"{asset_id}_{res}_{alias}.{ext}",    # old: dark_wood_2k_diff.jpg
                    f"{asset_id}_{alias}_{res}.{ext}",    # new: concrete_floor_02_diff_2k.jpg
                ]:
                    fpath = os.path.join(tex_dir, fname)
                    if os.path.exists(fpath) and os.path.getsize(fpath) > 1000:
                        paths[canon] = fpath
                        break
                if canon in paths: break
            if canon in paths: break
    log(f"  {asset_id}: found {list(paths.keys())}")
    return paths

tx_floor  = dl('concrete_floor_02')      # smooth concrete
tx_wall   = dl('grey_plaster_02')        # textured plaster
tx_frame  = dl('fine_grained_wood')      # fine natural grain — best Polyhaven wood for walnut

# ── PBR material builder ────────────────────────────────────────────────────────
def pbr_mat(name, tex_paths, scale=2.0, roughness_mult=1.0,
            tint=None, tint_fac=0.0, normal_strength=1.0, disp_scale=0.0,
            metallic=0.0, clearcoat=0.0, clearcoat_rough=0.10):
    mat = bpy.data.materials.new(name); mat.use_nodes = True
    n = mat.node_tree.nodes; lk = mat.node_tree.links; n.clear()
    out  = n.new('ShaderNodeOutputMaterial')
    bsdf = n.new('ShaderNodeBsdfPrincipled')
    coord = n.new('ShaderNodeTexCoord')
    mapp  = n.new('ShaderNodeMapping')
    mapp.inputs['Scale'].default_value = (scale, scale, scale)
    lk.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    lk.new(coord.outputs['UV'], mapp.inputs['Vector'])
    if metallic > 0:
        bsdf.inputs['Metallic'].default_value = metallic
    if clearcoat > 0:
        try:
            bsdf.inputs['Coat Weight'].default_value = clearcoat
            bsdf.inputs['Coat Roughness'].default_value = clearcoat_rough
        except:
            try:
                bsdf.inputs['Clearcoat'].default_value = clearcoat
                bsdf.inputs['Clearcoat Roughness'].default_value = clearcoat_rough
            except: pass

    def img(path, colorspace='sRGB'):
        im = bpy.data.images.load(path)
        im.colorspace_settings.name = colorspace
        nd = n.new('ShaderNodeTexImage'); nd.image = im
        lk.new(mapp.outputs['Vector'], nd.inputs['Vector'])
        return nd

    if tex_paths.get('diff'):
        dn = img(tex_paths['diff'])
        if tint and tint_fac > 0:
            mix = n.new('ShaderNodeMixRGB'); mix.blend_type = 'MIX'
            mix.inputs['Fac'].default_value = tint_fac
            mix.inputs['Color2'].default_value = (*tint, 1.0)
            lk.new(dn.outputs['Color'], mix.inputs['Color1'])
            lk.new(mix.outputs['Color'], bsdf.inputs['Base Color'])
        else:
            lk.new(dn.outputs['Color'], bsdf.inputs['Base Color'])

    if tex_paths.get('rough'):
        rn = img(tex_paths['rough'], 'Non-Color')
        if roughness_mult != 1.0:
            mul = n.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'
            mul.inputs[1].default_value = roughness_mult
            lk.new(rn.outputs['Color'], mul.inputs[0])
            lk.new(mul.outputs['Value'], bsdf.inputs['Roughness'])
        else:
            lk.new(rn.outputs['Color'], bsdf.inputs['Roughness'])

    if tex_paths.get('nor_gl'):
        nn   = img(tex_paths['nor_gl'], 'Non-Color')
        nmap = n.new('ShaderNodeNormalMap')
        nmap.inputs['Strength'].default_value = normal_strength
        lk.new(nn.outputs['Color'], nmap.inputs['Color'])
        lk.new(nmap.outputs['Normal'], bsdf.inputs['Normal'])

    if tex_paths.get('ao') and tex_paths.get('diff'):
        ao_n   = img(tex_paths['ao'], 'Non-Color')
        mix_ao = n.new('ShaderNodeMixRGB'); mix_ao.blend_type = 'MULTIPLY'
        mix_ao.inputs['Fac'].default_value = 0.50
        bc_src = bsdf.inputs['Base Color'].links[0].from_socket if bsdf.inputs['Base Color'].is_linked else None
        if bc_src:
            lk.new(bc_src, mix_ao.inputs['Color1'])
            lk.new(ao_n.outputs['Color'], mix_ao.inputs['Color2'])
            lk.new(mix_ao.outputs['Color'], bsdf.inputs['Base Color'])

    if tex_paths.get('disp') and disp_scale > 0:
        di_n = img(tex_paths['disp'], 'Non-Color')
        disp = n.new('ShaderNodeDisplacement')
        disp.inputs['Scale'].default_value    = disp_scale
        disp.inputs['Midlevel'].default_value = 0.50
        lk.new(di_n.outputs['Color'], disp.inputs['Height'])
        lk.new(disp.outputs['Displacement'], out.inputs['Displacement'])
        try: mat.cycles.displacement_method = 'BOTH'
        except: pass

    return mat

# ── Materials ──────────────────────────────────────────────────────────────────
log("Building materials…")

# Finished/polished concrete — low roughness, subtle normal, slightly darker
mat_floor = pbr_mat('FinishedConcrete', tx_floor,
                    scale=1.8, roughness_mult=0.28, normal_strength=0.12,
                    tint=(0.42, 0.40, 0.38), tint_fac=0.35)

mat_wall  = pbr_mat('PlasterWall', tx_wall,    # grey_plaster_02 — elegant subtle surface texture
                    scale=1.6, roughness_mult=0.70, normal_strength=0.18,
                    tint=(0.55, 0.55, 0.54), tint_fac=0.78)  # same cool grey, plaster micro-texture

# Walnut frame — fully procedural wave-based wood grain
# Gives exact color control: deep dark walnut with warm lighter grain streaks
def make_walnut_mat():
    """Dark walnut frame — noise-based grain (no stripes), exact color stops from
    approved floating-shelves dark_wood render. Object coords, vertically elongated
    for realistic longitudinal grain direction."""
    mat = bpy.data.materials.new('WalnutFrame')
    mat.use_nodes = True
    n = mat.node_tree.nodes; lk = mat.node_tree.links; n.clear()
    out  = n.new('ShaderNodeOutputMaterial')
    bsdf = n.new('ShaderNodeBsdfPrincipled')
    lk.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

    # Object coords with vertical stretch → grain runs along frame height (Z)
    coord = n.new('ShaderNodeTexCoord')
    mapp  = n.new('ShaderNodeMapping')
    mapp.inputs['Scale'].default_value = (2.5, 1.0, 5.5)
    lk.new(coord.outputs['Object'], mapp.inputs['Vector'])

    # Noise texture → organic grain variation (no ring stripes)
    noise = n.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value           = 9.0
    noise.inputs['Detail'].default_value          = 8.0
    noise.inputs['Roughness'].default_value       = 0.65
    noise.inputs['Distortion'].default_value      = 0.35
    lk.new(mapp.outputs['Vector'], noise.inputs['Vector'])

    # Noise grain → organic wood texture (no stripes)
    sub  = n.new('ShaderNodeMath'); sub.operation  = 'SUBTRACT'
    sub.inputs[1].default_value = 0.25
    clmp = n.new('ShaderNodeMath'); clmp.operation = 'MAXIMUM'
    clmp.inputs[1].default_value = 0.0
    lk.new(noise.outputs['Fac'], sub.inputs[0])
    lk.new(sub.outputs['Value'], clmp.inputs[0])

    # Dark walnut calibrated for low-ambient rig (HDRI 0.25, low fill/rim).
    # Frame appears warm terracotta at (0.060→0.140) range → halved to darken to chocolate walnut.
    ramp = n.new('ShaderNodeValToRGB')
    ramp.color_ramp.interpolation = 'B_SPLINE'
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color    = (0.012, 0.0035, 0.0010, 1.0)  # dark chocolate walnut (warm brown)
    ramp.color_ramp.elements[1].position = 1.0
    ramp.color_ramp.elements[1].color    = (0.030, 0.0090, 0.0028, 1.0)  # warm grain streak
    lk.new(clmp.outputs['Value'], ramp.inputs['Fac'])
    lk.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])

    bsdf.inputs['Roughness'].default_value = 0.58

    # Fine surface grain via fine_grained_wood normal map (UV-based, separate mapping)
    tx_fine = dl('fine_grained_wood')
    if tx_fine.get('nor_gl'):
        coord2 = n.new('ShaderNodeTexCoord')
        mapp2  = n.new('ShaderNodeMapping')
        mapp2.inputs['Scale'].default_value = (3.0, 3.0, 3.0)
        lk.new(coord2.outputs['UV'], mapp2.inputs['Vector'])
        nim = n.new('ShaderNodeTexImage')
        im  = bpy.data.images.load(tx_fine['nor_gl'])
        im.colorspace_settings.name = 'Non-Color'
        nim.image = im
        lk.new(mapp2.outputs['Vector'], nim.inputs['Vector'])
        nmap = n.new('ShaderNodeNormalMap')
        nmap.inputs['Strength'].default_value = 0.75
        lk.new(nim.outputs['Color'], nmap.inputs['Color'])
        lk.new(nmap.outputs['Normal'], bsdf.inputs['Normal'])

    # Lower clearcoat: less cool HDRI specular washing out warm walnut hue
    for cc in ('Coat Weight', 'Clearcoat'):
        if cc in bsdf.inputs:
            bsdf.inputs[cc].default_value = 0.15; break
    for cr in ('Coat Roughness', 'Clearcoat Roughness'):
        if cr in bsdf.inputs:
            bsdf.inputs[cr].default_value = 0.35; break

    return mat

mat_frame = make_walnut_mat()

# Mirror glass — warm cream reflection matching reference photo tone
mat_glass = bpy.data.materials.new('MirrorGlass'); mat_glass.use_nodes = True
mg = mat_glass.node_tree.nodes; mgl = mat_glass.node_tree.links; mg.clear()
out_gl = mg.new('ShaderNodeOutputMaterial')
bsdf_gl = mg.new('ShaderNodeBsdfPrincipled')
bsdf_gl.inputs['Base Color'].default_value = (0.88, 0.84, 0.76, 1.0)  # warm silver-cream tint
bsdf_gl.inputs['Metallic'].default_value   = 1.00   # true mirror
bsdf_gl.inputs['Roughness'].default_value  = 0.04   # near-perfect reflection
mgl.new(bsdf_gl.outputs['BSDF'], out_gl.inputs['Surface'])

# Backboard — matte black
mat_back = bpy.data.materials.new('Backboard'); mat_back.use_nodes = True
nb = mat_back.node_tree.nodes; nb.clear()
ob = nb.new('ShaderNodeOutputMaterial'); bb = nb.new('ShaderNodeBsdfPrincipled')
mat_back.node_tree.links.new(bb.outputs['BSDF'], ob.inputs['Surface'])
bb.inputs['Base Color'].default_value = (0.03, 0.02, 0.02, 1.0)
bb.inputs['Roughness'].default_value  = 0.95

log("Materials ready")

# ── Mirror geometry: organic sinuous frame ─────────────────────────────────────
LEAN_DEG    = 8.0
FRAME_DEPTH = 0.12   # 12cm deep — thick sculptural walnut frame
wall_y      = 0.28

def make_bezier_spline(crv, pts_xy, reverse=False, vector_indices=None):
    """Add a closed bezier spline. reverse=True winds CW (for hole cut-out).
    vector_indices: list of point indices that should use VECTOR handles (straight sides)."""
    if reverse: pts_xy = list(reversed(pts_xy))
    sp = crv.splines.new('BEZIER')
    sp.bezier_points.add(len(pts_xy) - 1)
    sp.use_cyclic_u = True
    vec_set = set(vector_indices) if vector_indices else set()
    for i, (x, y) in enumerate(pts_xy):
        bp = sp.bezier_points[i]
        bp.co = (x, y, 0)
        if i in vec_set:
            bp.handle_left_type  = 'VECTOR'
            bp.handle_right_type = 'VECTOR'
        else:
            bp.handle_left_type  = 'AUTO'
            bp.handle_right_type = 'AUTO'

# ── Rectangle frame — 4-corner VECTOR handles → clean straight sides ──────────
# User requested rectangular shape (not organic/wavy). Corners slightly rounded
# by bevel modifier. Glass will be inlaid/recessed into frame for depth effect.
FW = 0.44   # outer half-width
FH = 0.95   # outer half-height
GW = 0.38   # inner (glass) half-width → ~6cm frame on each side (thinner)
GH = 0.89   # inner (glass) half-height → ~6cm frame top/bottom

outer_pts = [
    (-FW,  FH),   # top-left
    ( FW,  FH),   # top-right
    ( FW, -FH),   # bottom-right
    (-FW, -FH),   # bottom-left
]

inner_pts = [
    (-GW,  GH),
    ( GW,  GH),
    ( GW, -GH),
    (-GW, -GH),
]

# ── Frame ring (outer − inner, extruded to depth) ─────────────────────────────
frame_crv = bpy.data.curves.new('FrameShape', type='CURVE')
frame_crv.dimensions  = '2D'
frame_crv.fill_mode   = 'BOTH'
frame_crv.extrude     = FRAME_DEPTH / 2
frame_crv.resolution_u = 64

# VECTOR handles on all 4 corners → perfectly straight sides
make_bezier_spline(frame_crv, outer_pts, reverse=False, vector_indices=[0,1,2,3])
make_bezier_spline(frame_crv, inner_pts, reverse=True,  vector_indices=[0,1,2,3])

frame_obj = bpy.data.objects.new('MirrorFrame', frame_crv)
bpy.context.collection.objects.link(frame_obj)
bpy.context.view_layer.objects.active = frame_obj
frame_obj.select_set(True)
bpy.ops.object.convert(target='MESH')

# Bevel ONLY the 90° corners (angle > 80°) — slight rounding, like a real frame
bpy.ops.object.modifier_add(type='BEVEL')
bev = frame_obj.modifiers[-1]
bev.width = 0.025; bev.segments = 6; bev.profile = 0.70
try: bev.limit_method = 'ANGLE'; bev.angle_limit = math.radians(80)
except: pass
bpy.ops.object.modifier_apply(modifier=bev.name)

# Stand upright
frame_obj.rotation_euler = Euler((math.radians(90), 0, 0), 'XYZ')
bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
for p in frame_obj.data.polygons: p.use_smooth = True
frame_obj.data.materials.clear(); frame_obj.data.materials.append(mat_frame)

# ── Mirror glass — inlaid into frame like a real mirror ───────────────────────
# Glass is recessed 4cm behind the frame's front face.
# From camera angle you see: frame front face → visible inner frame edge → glass.
# This "inlay" effect is exactly how real framed mirrors and art frames look.
GLASS_INSET = 0.012  # 1.2cm inset — subtle inlay like real mirror frame

glass_crv = bpy.data.curves.new('GlassShape', type='CURVE')
glass_crv.dimensions   = '2D'
glass_crv.fill_mode    = 'BOTH'
glass_crv.extrude      = 0.003
glass_crv.resolution_u = 64

make_bezier_spline(glass_crv, inner_pts, reverse=False, vector_indices=[0,1,2,3])

glass_obj = bpy.data.objects.new('MirrorGlass', glass_crv)
bpy.context.collection.objects.link(glass_obj)
bpy.context.view_layer.objects.active = glass_obj
glass_obj.select_set(True)
bpy.ops.object.convert(target='MESH')

glass_obj.rotation_euler = Euler((math.radians(90), 0, 0), 'XYZ')
bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
for p in glass_obj.data.polygons: p.use_smooth = True
glass_obj.data.materials.clear(); glass_obj.data.materials.append(mat_glass)

# ── Position mirror (lean against wall, bottom resting on floor) ───────────────
mirror_half_h = FH   # 0.95m half-height
MirrorCY_z  = mirror_half_h * math.cos(math.radians(LEAN_DEG)) + 0.003
MirrorCY_y  = wall_y - mirror_half_h * math.sin(math.radians(LEAN_DEG))
MIRROR_LOC  = Vector((0.0, MirrorCY_y, MirrorCY_z))
MIRROR_ROT  = Euler((-math.radians(LEAN_DEG), 0.0, 0.0), 'XYZ')

frame_obj.location       = MIRROR_LOC
frame_obj.rotation_euler = MIRROR_ROT

# Glass: inset 4cm into the frame (moves glass toward wall along depth axis).
# Frame local +Y = world (0, cos(LEAN_DEG), -sin(LEAN_DEG)) after lean rotation.
inset_world = Vector((0,
                       GLASS_INSET * math.cos(math.radians(LEAN_DEG)),
                      -GLASS_INSET * math.sin(math.radians(LEAN_DEG))))
glass_obj.location       = MIRROR_LOC + inset_world
glass_obj.rotation_euler = MIRROR_ROT

# ── Floor ─────────────────────────────────────────────────────────────────────
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0))
floor = bpy.context.active_object; floor.name = 'Floor'
floor.scale = (7.0, 5.0, 1.0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
floor.location = (0, -2.0, 0)   # spans y=-4.5..+0.5
floor.data.materials.clear(); floor.data.materials.append(mat_floor)

# ── Back wall ─────────────────────────────────────────────────────────────────
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0))
wall_back = bpy.context.active_object; wall_back.name = 'WallBack'
wall_back.scale = (12.0, 3.6, 1.0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
wall_back.rotation_euler = Euler((math.radians(90), 0, 0), 'XYZ')
wall_back.location = (0, wall_y, 1.8)
wall_back.data.materials.clear(); wall_back.data.materials.append(mat_wall)

# ── Reflection scene — fills mirror glass with a realistic room reflection ────
# These objects sit on the camera side of the mirror.
# Cycles traces mirror rays into this geometry, producing a real-room reflection.

# Front wall (opposite side of room — behind camera, faces mirror)
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0))
wall_front = bpy.context.active_object; wall_front.name = 'WallFront'
wall_front.scale = (14.0, 4.5, 1.0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
wall_front.rotation_euler = Euler((math.radians(90), 0, 0), 'XYZ')
wall_front.location = (0, -6.0, 2.25)
wall_front.data.materials.clear(); wall_front.data.materials.append(mat_wall)
try: wall_front.cycles_visibility.camera = False
except: pass

# Ceiling — only over the front room area (not over the mirror/back-wall area,
# which would block HDRI/key light and darken the main scene)
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0))
ceiling_obj = bpy.context.active_object; ceiling_obj.name = 'Ceiling'
ceiling_obj.scale = (14.0, 3.5, 1.0)   # spans Y: -6.0 to -3.0 only
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
ceiling_obj.location = (0, -4.5, 3.8)  # centered over front-room zone
ceiling_obj.data.materials.clear(); ceiling_obj.data.materials.append(mat_wall)
# Hide from direct camera — reflection only
try: ceiling_obj.cycles_visibility.camera = False
except: pass

# ── Terracotta floor vase (right side — visible in mirror reflection) ─────────
mat_terra = bpy.data.materials.new('Terracotta'); mat_terra.use_nodes = True
nt = mat_terra.node_tree; nt.nodes.clear()
out_t = nt.nodes.new('ShaderNodeOutputMaterial')
bsdf_t = nt.nodes.new('ShaderNodeBsdfPrincipled')
bsdf_t.inputs['Base Color'].default_value = (0.48, 0.19, 0.09, 1.0)
bsdf_t.inputs['Roughness'].default_value  = 0.82
nt.links.new(bsdf_t.outputs['BSDF'], out_t.inputs['Surface'])

def make_revolution_mesh(profile_rh, n_steps=28, name='RevMesh'):
    """Revolve a (radius, height) profile around Z to create a surface of revolution."""
    verts, faces = [], []
    n = len(profile_rh)
    for i in range(n_steps):
        a = 2 * math.pi * i / n_steps
        c, s = math.cos(a), math.sin(a)
        for r, h in profile_rh:
            verts.append((c*r, s*r, h))
    for i in range(n_steps):
        ni = (i+1) % n_steps
        for j in range(n-1):
            faces.append((i*n+j, i*n+j+1, ni*n+j+1, ni*n+j))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    return mesh

# Tall ceramic floor vase profile: (radius, height)
vase_profile = [
    (0.005, 0.00), (0.10, 0.01), (0.12, 0.10), (0.15, 0.26),
    (0.13, 0.40),  (0.08, 0.50), (0.11, 0.56), (0.08, 0.61), (0.005, 0.62),
]
vase_mesh = make_revolution_mesh(vase_profile, n_steps=28, name='VaseMesh')
vase_obj = bpy.data.objects.new('Vase', vase_mesh)
bpy.context.collection.objects.link(vase_obj)
vase_obj.location = (0.4, -3.8, 0.0)   # left-center of reflection, balances shelves on right
for p in vase_obj.data.polygons: p.use_smooth = True
vase_obj.data.materials.clear(); vase_obj.data.materials.append(mat_terra)

# ── Floating wall shelves (visible in mirror reflection) ──────────────────────
# Wall-mounted floating shelves on front wall — like the floating shelves product render.
# Dark walnut material, with small decorative items on top.

def add_box(cx, cy, bz, dimx, dimy, dimz, mat=None, name='Box'):
    """Add a box: cx/cy = center X/Y, bz = bottom Z, dimx/dimy/dimz = dimensions."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(cx, cy, bz + dimz * 0.5))
    obj = bpy.context.active_object; obj.name = name
    obj.scale = (dimx, dimy, dimz)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat: obj.data.materials.clear(); obj.data.materials.append(mat)
    return obj

# ── Floating shelves on the flat wall opposite the mirror ─────────────────────
# The mirror leans on the BACK wall (Y=0.28). The OPPOSITE wall is the front wall
# (Y=-6.0). The camera is at X=-1.8, so all reflected rays deflect toward +X:
# the center mirror ray hits the front wall at approximately X=2.45, Z=2.0-2.4.
# Shelves are centered there so they land squarely in the reflected view.

# Premium light-stone shelf material (off-white, slightly warm — luxury feel)
mat_float_shelf = bpy.data.materials.new('StoneShelf'); mat_float_shelf.use_nodes = True
fsn = mat_float_shelf.node_tree.nodes; fsn.clear()
fso = fsn.new('ShaderNodeOutputMaterial'); fsb = fsn.new('ShaderNodeBsdfPrincipled')
fsb.inputs['Base Color'].default_value = (0.68, 0.65, 0.60, 1.0)  # warm off-white stone
fsb.inputs['Roughness'].default_value  = 0.28   # slightly polished
mat_float_shelf.node_tree.links.new(fsb.outputs['BSDF'], fso.inputs['Surface'])

# Three longer floating shelves — raised higher, staggered object layout
sc_x = 2.4      # center X — where reflected rays hit front wall
sc_y = -5.88    # flush against front wall

# Bottom: 1.5m · Middle: 1.4m · Top: 1.2m  — raised ~0.35m from before
add_box(sc_x, sc_y, 1.60, 1.50, 0.26, 0.05, mat_float_shelf, 'ShelfBot')
add_box(sc_x, sc_y, 2.02, 1.40, 0.26, 0.05, mat_float_shelf, 'ShelfMid')
add_box(sc_x, sc_y, 2.42, 1.20, 0.26, 0.05, mat_float_shelf, 'ShelfTop')

# ── Premium decorative objects ────────────────────────────────────────────────

def mk_mat(name, color, rough=0.50, metallic=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nn = m.node_tree.nodes; nn.clear()
    mo = nn.new('ShaderNodeOutputMaterial'); mb = nn.new('ShaderNodeBsdfPrincipled')
    mb.inputs['Base Color'].default_value = (*color, 1.0)
    mb.inputs['Roughness'].default_value  = rough
    mb.inputs['Metallic'].default_value   = metallic
    m.node_tree.links.new(mb.outputs['BSDF'], mo.inputs['Surface'])
    return m

mat_white_ceramic = mk_mat('WhiteCeramic', (0.75, 0.73, 0.70), rough=0.38)
mat_brass    = mk_mat('Brass',     (0.62, 0.42, 0.12), rough=0.22, metallic=1.0)
mat_plant    = mk_mat('Plant',     (0.03, 0.22, 0.05), rough=0.80)   # rich leaf green
mat_sage     = mk_mat('SageCeram', (0.28, 0.42, 0.30), rough=0.42)   # sage green ceramic
mat_dustblue = mk_mat('DustBlue',  (0.22, 0.32, 0.50), rough=0.40)   # dusty blue ceramic
mat_terracot = mk_mat('Terracott', (0.52, 0.20, 0.08), rough=0.78)   # warm terracotta pot
mat_blush    = mk_mat('Blush',     (0.58, 0.30, 0.26), rough=0.44)   # muted rose ceramic
mat_book_a   = mk_mat('BookA',     (0.06, 0.14, 0.42), rough=0.90)   # deep cobalt
mat_book_b   = mk_mat('BookB',     (0.48, 0.18, 0.08), rough=0.90)   # burnt sienna
mat_book_c   = mk_mat('BookC',     (0.18, 0.36, 0.20), rough=0.90)   # forest green
mat_book_d   = mk_mat('BookD',     (0.55, 0.42, 0.18), rough=0.90)   # warm ochre
mat_book_e   = mk_mat('BookE',     (0.38, 0.18, 0.38), rough=0.90)   # deep plum

def add_vase(cx, cy, bz, profile, mat=None, name='V'):
    mesh = make_revolution_mesh(profile, n_steps=32, name=name+'M')
    obj  = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = (cx, cy, bz)
    for p in obj.data.polygons: p.use_smooth = True
    if mat: obj.data.materials.clear(); obj.data.materials.append(mat)
    return obj

def add_pot(cx, cy, bz, pot_r=0.052, pot_h=0.10, mat_pot=None, name='Pot'):
    pot_p = [(0.005,0),(pot_r*.80,.01),(pot_r,.04),(pot_r*.88,pot_h),(0.005,pot_h+.005)]
    add_vase(cx, cy, bz, pot_p, mat_pot or mat_white_ceramic, name)

def add_bush_plant(cx, cy, bz, pot_r=0.052, pot_h=0.10, pr=0.082, mat_pot=None, mat_pl=None, name='BP'):
    """Bushy round plant — cluster of overlapping spheres for organic foliage."""
    add_pot(cx, cy, bz, pot_r, pot_h, mat_pot, name+'Pot')
    top = bz + pot_h
    clusters = [
        ( 0.000,  0.000, pr*0.75, pr      ),   # center-low
        (-0.055,  0.010, pr*0.52, pr*0.72 ),   # left lobe
        ( 0.055,  0.010, pr*0.48, pr*0.68 ),   # right lobe
        ( 0.010, -0.048, pr*0.42, pr*0.62 ),   # front lobe
        (-0.018,  0.048, pr*0.55, pr*0.66 ),   # back lobe
        ( 0.000,  0.000, pr*1.38, pr*0.60 ),   # top crown
    ]
    for i, (ox, oy, oz, r) in enumerate(clusters):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=14, ring_count=10,
                                              location=(cx+ox, cy+oy, top+oz))
        cl = bpy.context.active_object; cl.name = f'{name}C{i}'
        cl.scale = (1.0, 1.0, 0.88); bpy.ops.object.transform_apply(scale=True)
        for p in cl.data.polygons: p.use_smooth = True
        if mat_pl: cl.data.materials.clear(); cl.data.materials.append(mat_pl)

def add_tall_plant(cx, cy, bz, pot_r=0.050, pot_h=0.09, mat_pot=None, mat_pl=None, name='TP'):
    """Tall spiky plant — like a snake plant / sansevieria. Elongated leaf spikes."""
    add_pot(cx, cy, bz, pot_r, pot_h, mat_pot, name+'Pot')
    top = bz + pot_h
    spikes = [
        ( 0.000,  0.000, 0.38, 0.019),   # tallest center
        (-0.032,  0.018, 0.30, 0.016),   # left
        ( 0.030, -0.016, 0.34, 0.017),   # right
        (-0.010, -0.028, 0.22, 0.014),   # front-left short
        ( 0.020,  0.025, 0.26, 0.015),   # back-right
    ]
    for i, (ox, oy, h, r) in enumerate(spikes):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=10, ring_count=6,
                                              location=(cx+ox, cy+oy, top + h*0.5))
        sp = bpy.context.active_object; sp.name = f'{name}S{i}'
        sp.scale = (1.0, 0.75, h/(r*2.2)); bpy.ops.object.transform_apply(scale=True)
        for p in sp.data.polygons: p.use_smooth = True
        if mat_pl: sp.data.materials.clear(); sp.data.materials.append(mat_pl)

def add_standing_books(cx, cy, bz, specs, name='SBooks'):
    """Row of upright books standing side by side.
    specs = list of (spine_width, depth, height, material).
    cx = left edge of first book."""
    ox = 0.0
    for i, (sw, d, h, bm) in enumerate(specs):
        add_box(cx + ox + sw/2, cy, bz, sw, d, h, bm, f'{name}{i}')
        ox += sw + 0.004   # 4mm gap between books

def add_book_stack(cx, cy, bz, mats, name='BkSt'):
    """2-3 flat books lying horizontally — a supporting accent beside standing books."""
    for i, bm in enumerate(mats):
        add_box(cx, cy, bz + i*0.026, 0.19, 0.23, 0.024, bm, f'{name}{i}')

# ── BOTTOM SHELF (top at 1.65) ───────────────────────────────────────────────
bot = 1.65
# 6 standing books side by side — far left to center-left
add_standing_books(sc_x - 0.56, sc_y, bot, [
    (0.030, 0.20, 0.32, mat_book_a),   # cobalt — tallest
    (0.026, 0.20, 0.27, mat_book_d),   # ochre
    (0.032, 0.20, 0.30, mat_book_e),   # plum
    (0.025, 0.20, 0.24, mat_book_c),   # forest green
    (0.028, 0.20, 0.28, mat_book_b),   # burnt sienna
    (0.024, 0.20, 0.22, mat_book_a),   # cobalt short
], 'BotBooks')
# Tall sage-green vase right-center
add_vase(sc_x + 0.14, sc_y, bot,
         [(0.005,0),(0.048,.01),(0.058,.09),(0.068,.22),(0.062,.33),(0.035,.42),(0.042,.47),(0.028,.50),(0.005,.51)],
         mat_sage, 'VaseTall')
# Brass sphere far-right accent
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.058, segments=24, ring_count=16,
                                      location=(sc_x+0.42, sc_y, bot+0.058))
sp = bpy.context.active_object; sp.name = 'BrassSphere'
for p in sp.data.polygons: p.use_smooth = True
sp.data.materials.clear(); sp.data.materials.append(mat_brass)

# ── MIDDLE SHELF (top at 2.07) ───────────────────────────────────────────────
mid = 2.07
# Snake plant in terracotta pot far-left
add_tall_plant(sc_x - 0.50, sc_y, mid, pot_r=0.054, pot_h=0.09,
               mat_pot=mat_terracot, mat_pl=mat_plant, name='MidTallP')
# 5 standing books center — starts after plant gap
add_standing_books(sc_x - 0.18, sc_y, mid, [
    (0.028, 0.20, 0.28, mat_book_e),   # plum
    (0.032, 0.20, 0.31, mat_book_c),   # green — tallest
    (0.026, 0.20, 0.25, mat_book_b),   # sienna
    (0.030, 0.20, 0.29, mat_book_d),   # ochre
    (0.025, 0.20, 0.23, mat_book_a),   # cobalt short
], 'MidBooks')
# Slim brass column far-right accent
add_vase(sc_x + 0.42, sc_y, mid,
         [(0.005,0),(0.024,.005),(0.024,.22),(0.005,.226)],
         mat_brass, 'BrassCyl')

# ── TOP SHELF (top at 2.47) ───────────────────────────────────────────────────
top = 2.47
# Bushy plant in blush pot far-left
add_bush_plant(sc_x - 0.46, sc_y, top, pot_r=0.048, pot_h=0.085, pr=0.075,
               mat_pot=mat_blush, mat_pl=mat_plant, name='TopBushP')
# Dusty-blue bud vase center — offset from bottom vase
add_vase(sc_x + 0.02, sc_y, top,
         [(0.005,0),(0.038,.01),(0.044,.07),(0.052,.16),(0.044,.24),(0.026,.30),(0.030,.34),(0.020,.37),(0.005,.375)],
         mat_dustblue, 'VaseBud')
# 4 standing books far-right
add_standing_books(sc_x + 0.22, sc_y, top, [
    (0.030, 0.20, 0.26, mat_book_d),   # ochre
    (0.026, 0.20, 0.30, mat_book_e),   # plum tall
    (0.028, 0.20, 0.23, mat_book_c),   # green short
    (0.025, 0.20, 0.27, mat_book_b),   # sienna
], 'TopBooks')

log("Scene geometry done")

# ── World: interior HDRI ambient — glass reflects actual studio/room space ─────
# ferndale_studio_01 is an interior photography studio — warm, natural, room-like.
# The glass (metallic=1) reflects scene geometry (walls/ceiling/floor) FIRST,
# then HDRI fills in any rays that escape the room — no fake flat color override.
world = bpy.data.worlds.get('World') or bpy.data.worlds.new('World')
scene.world = world; world.use_nodes = True
wt = world.node_tree; wt.nodes.clear()

out_w = wt.nodes.new('ShaderNodeOutputWorld')
bg    = wt.nodes.new('ShaderNodeBackground')

hdri_path = os.path.join(tex_dir, 'ferndale_studio_01_2k.hdr')
if not os.path.exists(hdri_path):
    hdri_path = os.path.join(tex_dir, 'art_studio_2k.hdr')
if os.path.exists(hdri_path):
    env_img = bpy.data.images.load(hdri_path)
    try: env_img.colorspace_settings.name = 'Linear Rec.709'
    except: env_img.colorspace_settings.name = 'Linear'
    env_nd = wt.nodes.new('ShaderNodeTexEnvironment')
    # Rotate HDRI so warm light faces the mirror
    mapp_w = wt.nodes.new('ShaderNodeMapping')
    mapp_w.inputs['Rotation'].default_value = (0, 0, math.radians(60))
    coord_w = wt.nodes.new('ShaderNodeTexCoord')
    wt.links.new(coord_w.outputs['Generated'], mapp_w.inputs['Vector'])
    wt.links.new(mapp_w.outputs['Vector'], env_nd.inputs['Vector'])
    env_nd.image = env_img
    wt.links.new(env_nd.outputs['Color'], bg.inputs['Color'])
    bg.inputs['Strength'].default_value = 0.08   # very low ambient — lets dark walnut read as dark chocolate
    log(f"HDRI loaded: {hdri_path}")
else:
    bg.inputs['Color'].default_value    = (0.60, 0.54, 0.46, 1.0)
    bg.inputs['Strength'].default_value = 0.25

wt.links.new(bg.outputs['Background'], out_w.inputs['Surface'])

# ── Lights: 2 focused lights — aimed at MIRROR, not flooding the wall ─────────
def add_area(loc, energy, size, color, rot_xyz):
    bpy.ops.object.light_add(type='AREA', location=loc)
    L = bpy.context.active_object
    L.data.energy = energy; L.data.size = size; L.data.color = color
    L.rotation_euler = Euler(tuple(math.radians(d) for d in rot_xyz), 'XYZ')

# Lighting: keep key strong (directional shadows), reduce fill/rim/top so
# dark walnut frame reads dark — ambient floor was washing out all colors.
add_area((-2.5, -2.0, 2.5), 300, 1.8, (1.00, 0.97, 0.90), (34,  0, -28))  # key — restored so reflection stays bright
add_area(( 3.5, -3.8, 2.5), 420, 0.4, (0.90, 0.94, 1.00), ( 28,  0, -52))  # fill — pushed far back so near-floor is out of beam, aims across to back wall
add_area(( 0.0, -0.8, 4.0),  60, 3.0, (1.00, 0.98, 0.94), (78,  0,   0))  # top
# rim light removed — was behind the back wall (Y=2.8) causing right-side glow

# ── Camera ─────────────────────────────────────────────────────────────────────
cam_data = bpy.data.cameras.new('Camera')
cam_data.lens = 45
cam_data.clip_start = 0.01; cam_data.clip_end = 50.0
cam_obj = bpy.data.objects.new('Camera', cam_data)
bpy.context.collection.objects.link(cam_obj); scene.camera = cam_obj

# Strong side perspective: ~22° — clearly shows frame depth + 3D thickness.
# 45mm lens = wider FOV, full mirror top to floor visible with breathing room.
cam_pos = Vector((-1.80, -4.50, 0.95))
look_at = Vector(( 0.00,  0.25, 0.82))
cam_obj.location = cam_pos
cam_obj.rotation_euler = (look_at - cam_pos).to_track_quat('-Z', 'Y').to_euler()

log("Rendering…")
bpy.ops.render.render(write_still=True)
log(f"Done → {out_path}")
