"""
render_mount_object_icons.py — Blender 5.1.1 headless

Renders the 5 mount-object icons (TV/Monitor, Art/Picture Frame,
Floating Shelves, Light Fixture, Mirror) with the SAME Levl Icon Card
rig that produces the drill (category-mounting) — lavender card,
HDRI + key/fill/rim lights, perspective camera, 480x620 final.

Each icon imports a Hyper3D-generated GLB from scripts/models/
hyper3d_<key>.glb, preserves the GLB's baked PBR materials (drill
recipe), auto-fits to the icon zone, then renders.

The UI provides the option label as a separate text element below
the image, so we render NO baked-in label.

Output: public/assets/renders/_<key>_raw.png and category-<key>.png
        (480x620). Caller (a wrapping bash command) then renames /
        WebP-encodes to mount-object filenames.

Usage:
    /Applications/Blender.app/Contents/MacOS/Blender --background \\
        --python scripts/render_mount_object_icons.py -- <key>

If <key> is omitted, renders all 5 sequentially.
"""
import bpy, math, mathutils, os, sys

HERE     = os.path.dirname(__file__)
MODELS   = os.path.join(HERE, "models")
OUT_DIR  = os.path.join(HERE, "..", "public", "assets", "renders")

# ── reuse helpers from render_category_cards.py ───────────────────────────────
_src = open(os.path.join(HERE, "render_category_cards.py")).read()
_lines = [ln for ln in _src.splitlines() if not ln.lstrip().startswith("build(\"")]
NS = {"__file__": os.path.join(HERE, "render_category_cards.py")}
exec(compile("\n".join(_lines), "render_category_cards.py", "exec"), NS)

build         = NS["build"]
mat_card      = NS["mat_card"]
CW, CH, CD    = NS["CW"], NS["CH"], NS["CD"]


# Mount-object cards use the CSS lavender from the matchmaker UI, so we render
# the TV (and other items) on a TRANSPARENT background — no inner lavender
# card box — and let the UI's own gradient fill the full card area.
def build_no_card(cat_id, icon_fn):
    NS["reset"]()
    NS["setup_render"](cat_id)
    bpy.context.scene.render.film_transparent = True   # transparent BG (already true)
    NS["setup_hdri"]()
    NS["add_camera"]()
    NS["add_lights"]()
    icon_fn(None)   # no card
    bpy.ops.render.render(write_still=True)
    import subprocess, os
    raw_path   = os.path.join(NS["OUT_DIR"], f"_{cat_id}_raw.png")
    final_path = os.path.join(NS["OUT_DIR"], f"category-{cat_id}.png")
    pil_code = (
        "from PIL import Image\n"
        f"img = Image.open(r'{raw_path}').convert('RGBA')\n"
        f"img = img.resize(({NS['W_FINAL']}, {NS['H_FINAL']}), Image.LANCZOS)\n"
        f"img.save(r'{final_path}')\n"
    )
    try: subprocess.run(["python3", "-c", pil_code], check=True)
    except Exception as e:
        import shutil; shutil.copy(raw_path, final_path)
    print(f"  category-{cat_id}.png done")

# Iteration speed: drop Cycles samples while we dial in the icon recipe.
# Set LEVL_ITER_SAMPLES=0 (or =512) for the final renders.
ITER_SAMPLES = int(os.environ.get("LEVL_ITER_SAMPLES", "192"))
if ITER_SAMPLES:
    _orig_setup_render = NS["setup_render"]
    def _patched_setup_render(cat_id, _orig=_orig_setup_render, _n=ITER_SAMPLES):
        _orig(cat_id)
        bpy.context.scene.cycles.samples = _n
    NS["setup_render"] = _patched_setup_render

# Icon zone: ICON_TARGET sets desired width in scene units.
# Card is 0.62 wide; drill rendered visually around 0.55-0.60 wide.
ICON_W_TARGET = 0.55     # widest dim (X) target for the icon mesh
ICON_Y        = -(CD/2 + 0.04)   # in front of card face
ICON_Z_OFFSET = 0.02     # vertical lift on card

# ── per-icon config ───────────────────────────────────────────────────────────
# Each entry:
#   glb       — filename in scripts/models/
#   rot_xyz   — Euler radians applied to mesh vertices to face the camera (-Y)
#   scale_k   — extra multiplier on the auto-fit scale (1.0 = use full target)
ICONS = {
    "tv-monitor": {
        # Sketchfab hippostance "Flat Screen Television"
        # Native dims X=depth, Y=width, Z=height. Largest face normal +X
        # (probed). Camera is at -Y → rotate -π/2 around Z so face → -Y.
        "glb":     "sketchfab_tv.glb",
        "rot_xyz": (0, 0, -math.pi/2),
        "scale":   0.50,
    },
    "art-frame": {
        # Sketchfab "PICTURE FRAME 15*20" — gold ornate frame. Painting mesh
        # excluded; only frame_lambert1_0 exported. Native front normal -Y
        # already faces camera.
        "glb":     "sketchfab_art_frame.glb",
        "rot_xyz": (0, 0, 0),
        "scale":   0.55,
    },
    "floating-shelves": {
        # Sketchfab "Wooden Wall Bookshelf" — single dark-wood shelf w/
        # metal brackets. Native shelf laying horizontal; camera sees front.
        "glb":     "sketchfab_floating_shelves.glb",
        "rot_xyz": (0, 0, 0),
        "scale":   0.55,
    },
    "light-fixture": {
        "glb":     "sketchfab_light_fixture.glb",
        "rot_xyz": (0, 0, 0),
        "scale":   0.55,
        "strip_cord_above_world_z": -0.15,
    },
    "mirror": {
        # Sketchfab "IKEA Stockholm" — round wall mirror with chunky frame.
        # Wood frame overridden to brushed silver metal (no wood, no gold).
        # 6° forward tilt + side perspective for visible 3D bottom-rim depth.
        # Lighting backed off so the silver doesn't blow out (preserves the
        # brushed-metal surface detail).
        "glb":     "sketchfab_mirror_stockholm.glb",
        "rot_xyz": (math.radians(-6), 0, -math.pi/2 - math.radians(35)),
        "scale":   1.40,
        "camera_fov_deg": 60,
        "force_silver_frame": True,
        "frame_is_largest": True,
        "glass_target": "smallest",    # mirror disc material → glass+clearcoat
        "light_scale": 0.45,
        "front_light_scale": 0.12,
        "exposure_offset": -0.7,
    },
}

# ── icon loader: imports a GLB, auto-fits, positions on card ─────────────────
# Uses the proven drill-icon pattern from render_category_cards.py:
#   1. import GLTF
#   2. flatten parent hierarchy by re-assigning matrix_world after parent=None
#   3. scale + translate to origin via matrix_world  →  transform_apply
#   4. rotate via matrix_world  →  transform_apply
#   5. final positioning via obj.location only
def make_icon_fn(key, cfg):
    def add_icon(card_obj):
        glb = os.path.join(MODELS, cfg["glb"])
        if not os.path.exists(glb):
            print(f"  [WARN] missing {glb} — skipping icon mesh.")
            return

        before = set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=glb)
        new_objs = [o for o in bpy.data.objects if o not in before]
        meshes = [o for o in new_objs if o.type == 'MESH']
        if not meshes:
            print(f"  [WARN] no mesh imported from {glb}")
            return

        # Strip per-vertex color attributes (can tint shaders unexpectedly)
        for m in meshes:
            for layer in list(m.data.color_attributes):
                m.data.color_attributes.remove(layer)

        # Flatten parent hierarchy by detaching while preserving world transform
        for m in meshes:
            if m.parent is not None:
                mw = m.matrix_world.copy()
                m.parent = None
                m.matrix_world = mw

        # Optional: desaturate ALL materials' textures to kill any gold/
        # yellow tint while preserving surface variation. Used to remove
        # brass on icons where "no gold" is required (mirror, light-fixture).
        if cfg.get("desaturate_all"):
            for m in meshes:
                for mat in m.data.materials:
                    if not (mat and mat.use_nodes): continue
                    nt = mat.node_tree
                    bsdf = next((n for n in nt.nodes if n.bl_idname == "ShaderNodeBsdfPrincipled"), None)
                    tex  = next((n for n in nt.nodes if n.bl_idname == "ShaderNodeTexImage"), None)
                    if not bsdf: continue
                    # Disconnect existing Base Color link
                    for lk in list(nt.links):
                        if lk.to_node == bsdf and lk.to_socket.name == "Base Color":
                            nt.links.remove(lk)
                    if tex:
                        # HSV: saturation 0 = pure greyscale, value 0.55 keeps
                        # mid-tones so detail visible. Brightness/Contrast
                        # boosts texture detail visibility.
                        hsv = nt.nodes.new("ShaderNodeHueSaturation")
                        hsv.inputs["Hue"].default_value        = 0.5
                        hsv.inputs["Saturation"].default_value = 0.0
                        hsv.inputs["Value"].default_value      = 0.55
                        bcn = nt.nodes.new("ShaderNodeBrightContrast")
                        bcn.inputs["Bright"].default_value   = -0.05
                        bcn.inputs["Contrast"].default_value = 1.10
                        nt.links.new(tex.outputs["Color"], bcn.inputs["Color"])
                        nt.links.new(bcn.outputs["Color"], hsv.inputs["Color"])
                        nt.links.new(hsv.outputs["Color"], bsdf.inputs["Base Color"])
                    else:
                        bsdf.inputs["Base Color"].default_value = (0.55, 0.55, 0.55, 1.0)
                    # Partial metallic so Levl's lavender HDRI tints the
                    # surface naturally (matches drill body + lamp body).
                    bsdf.inputs["Metallic"].default_value = 0.55
                    bsdf.inputs["Roughness"].default_value = 0.40
                    print(f"  [{key}] mat '{mat.name}' → desaturated greyscale")

        # Optional silver-metal frame override. For models where the FRAME
        # has a curved/wrap-around geometry with MORE polygons than the flat
        # mirror disc (e.g., Stockholm), the largest-area material IS the
        # frame. force_silver_frame_largest=True targets that case.
        if cfg.get("force_silver_frame"):
            area_by_mat = {}
            for m in meshes:
                for p in m.data.polygons:
                    if p.material_index < len(m.data.materials):
                        mat = m.data.materials[p.material_index]
                        if mat is None: continue
                        area_by_mat[mat.name] = area_by_mat.get(mat.name, 0) + p.area
            print(f"  [{key}] silver-frame areas: {area_by_mat}")
            if area_by_mat:
                ranked = sorted(area_by_mat.items(), key=lambda x: -x[1])
                # Stockholm: wood frame = LARGEST area (curved donut),
                # mirror glass = smaller (flat disc). So override the largest.
                target_mats = [ranked[0][0]] if cfg.get("frame_is_largest") else [n for n, _ in ranked[1:]]
                for mat_name in target_mats:
                    fm = bpy.data.materials.get(mat_name)
                    if not (fm and fm.use_nodes): continue
                    nt = fm.node_tree
                    bsdf = next((n for n in nt.nodes if n.bl_idname == "ShaderNodeBsdfPrincipled"), None)
                    if not bsdf: continue
                    for lk in list(nt.links):
                        if lk.to_node == bsdf and (lk.to_socket.name == "Base Color"
                                                   or lk.to_socket.name == "Normal"):
                            nt.links.remove(lk)
                    bsdf.inputs["Base Color"].default_value = (0.62, 0.62, 0.66, 1.0)
                    bsdf.inputs["Metallic"].default_value = 1.0
                    bsdf.inputs["Roughness"].default_value = 0.55
                    # Brushed-noise normal for surface variation
                    noise = nt.nodes.new("ShaderNodeTexNoise")
                    noise.inputs["Scale"].default_value = 80.0
                    noise.inputs["Detail"].default_value = 6.0
                    bump = nt.nodes.new("ShaderNodeBump")
                    bump.inputs["Strength"].default_value = 0.15
                    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
                    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
                    print(f"  [{key}] frame mat '{mat_name}' → brushed silver metal (matte)")

        # Glass-mirror surface override — reads as a real glass mirror plate
        # rather than a flat lavender disc. High-metallic + low-roughness +
        # clearcoat layer simulates the glass surface on top of silvered
        # backing. Use cfg["glass_target"] = 'largest' or 'smallest' to
        # pick which material is the actual mirror plane.
        glass_target = cfg.get("glass_target")  # 'largest' | 'smallest' | None
        if glass_target:
            area_by_mat = {}
            for m in meshes:
                for p in m.data.polygons:
                    if p.material_index < len(m.data.materials):
                        mat = m.data.materials[p.material_index]
                        if mat is None: continue
                        area_by_mat[mat.name] = area_by_mat.get(mat.name, 0) + p.area
            if area_by_mat:
                ranked = sorted(area_by_mat.items(), key=lambda x: -x[1])
                target_mat = ranked[0][0] if glass_target == 'largest' else ranked[-1][0]
                sm = bpy.data.materials.get(target_mat)
                if sm and sm.use_nodes:
                    bsdf = next((n for n in sm.node_tree.nodes if n.bl_idname == "ShaderNodeBsdfPrincipled"), None)
                    if bsdf:
                        for lk in list(sm.node_tree.links):
                            if lk.to_node == bsdf and lk.to_socket.name == "Base Color":
                                sm.node_tree.links.remove(lk)
                        # Slight dark tint so reflections aren't a uniform
                        # lavender wash — gives mirror perceptible body.
                        bsdf.inputs["Base Color"].default_value = (0.06, 0.06, 0.10, 1.0)
                        bsdf.inputs["Metallic"].default_value = 1.0
                        bsdf.inputs["Roughness"].default_value = 0.03
                        # Clear glass coat (Blender 4.x has Coat Weight)
                        for coat_input in ("Coat Weight", "Clearcoat"):
                            if coat_input in bsdf.inputs:
                                bsdf.inputs[coat_input].default_value = 0.6
                                break
                        for coat_rough in ("Coat Roughness", "Clearcoat Roughness"):
                            if coat_rough in bsdf.inputs:
                                bsdf.inputs[coat_rough].default_value = 0.01
                                break
                        for ior_input in ("IOR", "Coat IOR"):
                            if ior_input in bsdf.inputs:
                                bsdf.inputs[ior_input].default_value = 1.55
                                break
                        print(f"  [{key}] glass mirror surface '{target_mat}' → tinted glass + clearcoat")

        # Optional: hue-shift the frame material(s) using the drill recipe so
        # the frame looks painted/baked-in (not photoscanned). Keeps the
        # original texture's surface variation but rotates hue to neutral
        # dark and pulls value way down. Mirror surface (largest-area
        # material) is left untouched.
        if cfg.get("force_dark_frame"):
            area_by_mat = {}
            for m in meshes:
                for p in m.data.polygons:
                    if p.material_index < len(m.data.materials):
                        mat = m.data.materials[p.material_index]
                        if mat is None: continue
                        area_by_mat[mat.name] = area_by_mat.get(mat.name, 0) + p.area
            print(f"  [{key}] material areas: {area_by_mat}")
            if area_by_mat:
                ranked = sorted(area_by_mat.items(), key=lambda x: -x[1])
                # Mirror surface = the LARGEST-area material. Tint slightly
                # darker so it visually separates from the lavender card
                # background instead of being a flat reflection.
                surf_name = ranked[0][0]
                sf = bpy.data.materials.get(surf_name)
                if sf and sf.use_nodes:
                    bsdf = next((n for n in sf.node_tree.nodes if n.bl_idname == "ShaderNodeBsdfPrincipled"), None)
                    if bsdf:
                        for lk in list(sf.node_tree.links):
                            if lk.to_node == bsdf and lk.to_socket.name == "Base Color":
                                sf.node_tree.links.remove(lk)
                        bsdf.inputs["Base Color"].default_value = (0.18, 0.16, 0.22, 1.0)
                        bsdf.inputs["Metallic"].default_value = 0.95
                        bsdf.inputs["Roughness"].default_value = 0.18
                        print(f"  [{key}] mirror surface '{surf_name}' → darkened semi-glossy")

                # Frame = everything except the largest-area material.
                for mat_name, _ in ranked[1:]:
                    fm = bpy.data.materials.get(mat_name)
                    if not (fm and fm.use_nodes): continue
                    nt = fm.node_tree
                    bsdf = next((n for n in nt.nodes if n.bl_idname == "ShaderNodeBsdfPrincipled"), None)
                    tex  = next((n for n in nt.nodes if n.bl_idname == "ShaderNodeTexImage"), None)
                    if not bsdf:
                        continue
                    # Disconnect existing Base Color links
                    for lk in list(nt.links):
                        if lk.to_node == bsdf and lk.to_socket.name == "Base Color":
                            nt.links.remove(lk)
                    # Painted-matte dark navy plastic w/ procedural surface
                    # variation — same style as the drill body. Saturated dark
                    # blue contrasts with lavender environment, and noise+bump
                    # adds surface grit so the frame reads as "painted/baked"
                    # not photoscanned smooth metal.
                    # Disconnect any old base color links
                    for lk in list(nt.links):
                        if lk.to_node == bsdf and (lk.to_socket.name == "Base Color"
                                                   or lk.to_socket.name == "Normal"):
                            nt.links.remove(lk)
                    if tex:
                        # Hue-shift original texture to dark navy so the
                        # texture's surface variation shows through.
                        hsv = nt.nodes.new("ShaderNodeHueSaturation")
                        hsv.inputs["Hue"].default_value        = 0.55  # blue
                        hsv.inputs["Saturation"].default_value = 0.85
                        hsv.inputs["Value"].default_value      = 0.30
                        bcn = nt.nodes.new("ShaderNodeBrightContrast")
                        bcn.inputs["Bright"].default_value   = -0.05
                        bcn.inputs["Contrast"].default_value = 0.85
                        nt.links.new(tex.outputs["Color"], bcn.inputs["Color"])
                        nt.links.new(bcn.outputs["Color"], hsv.inputs["Color"])
                        nt.links.new(hsv.outputs["Color"], bsdf.inputs["Base Color"])
                    else:
                        bsdf.inputs["Base Color"].default_value = (0.05, 0.05, 0.18, 1.0)

                    # Procedural surface noise → bump for fine grit/variation
                    # that breaks up the otherwise-flat material.
                    noise = nt.nodes.new("ShaderNodeTexNoise")
                    noise.inputs["Scale"].default_value  = 120.0
                    noise.inputs["Detail"].default_value = 8.0
                    noise.inputs["Roughness"].default_value = 0.6
                    bump = nt.nodes.new("ShaderNodeBump")
                    bump.inputs["Strength"].default_value = 0.25
                    bump.inputs["Distance"].default_value = 0.005
                    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
                    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

                    # Material props — partial metallic for "painted plastic
                    # over metal" feel (matches drill body recipe).
                    bsdf.inputs["Metallic"].default_value = 0.25
                    bsdf.inputs["Roughness"].default_value = 0.42
                    print(f"  [{key}] frame mat '{mat_name}' → painted dark navy + noise bump")


        # Step 1 — scale + translate to fit ICON_W_TARGET, centered at origin
        target = cfg.get("scale", ICON_W_TARGET)
        mins = [float('inf')] * 3
        maxs = [float('-inf')] * 3
        for o in meshes:
            for c in o.bound_box:
                w = o.matrix_world @ mathutils.Vector(c)
                for i in range(3):
                    mins[i] = min(mins[i], w[i])
                    maxs[i] = max(maxs[i], w[i])
        biggest = max(maxs[i] - mins[i] for i in range(3))
        sc = target / max(biggest, 0.001)
        cx = (mins[0] + maxs[0]) / 2
        cy = (mins[1] + maxs[1]) / 2
        cz = (mins[2] + maxs[2]) / 2
        T = mathutils.Matrix.Translation((-cx, -cy, -cz))
        S = mathutils.Matrix.Scale(sc, 4)
        for o in meshes:
            o.matrix_world = S @ T @ o.matrix_world

        bpy.ops.object.select_all(action='DESELECT')
        for o in meshes: o.select_set(True)
        bpy.context.view_layer.objects.active = meshes[0]
        try:
            bpy.ops.object.transform_apply(location=True, scale=True, rotation=True)
        except RuntimeError as e:
            print(f"  [{key}] step1 transform_apply: {e}")

        # Optional cord-strip: now mesh data is in WORLD coords centered at
        # origin. Delete vertices above a world-Z threshold (used to remove
        # the hanging cord from the light fixture).
        strip_z = cfg.get("strip_cord_above_world_z")
        if strip_z is not None:
            import bmesh
            for m in meshes:
                bm = bmesh.new()
                bm.from_mesh(m.data)
                doomed = [v for v in bm.verts if v.co.z > strip_z]
                bmesh.ops.delete(bm, geom=doomed, context='VERTS')
                bm.to_mesh(m.data)
                bm.free()
                m.data.update()
            total_polys = sum(len(m.data.polygons) for m in meshes)
            print(f"  [{key}] cord-strip above world_z={strip_z}, polys remaining={total_polys}")

        # Step 2 — rotate to face camera, bake into mesh data
        rx, ry, rz = cfg["rot_xyz"]
        if (rx, ry, rz) != (0, 0, 0):
            R = (mathutils.Matrix.Rotation(rz, 4, 'Z') @
                 mathutils.Matrix.Rotation(ry, 4, 'Y') @
                 mathutils.Matrix.Rotation(rx, 4, 'X'))
            for o in meshes:
                o.matrix_world = R @ o.matrix_world
            bpy.ops.object.select_all(action='DESELECT')
            for o in meshes: o.select_set(True)
            bpy.context.view_layer.objects.active = meshes[0]
            try:
                bpy.ops.object.transform_apply(location=True, scale=True, rotation=True)
            except RuntimeError as e:
                print(f"  [{key}] step2 transform_apply: {e}")

        # Step 3 — position on card. Match the working drill pattern: just
        # set obj.location.y = ICON_Y so mesh sits at icon-zone Y. The mesh
        # is already centered at origin from step 1, so this puts the
        # centroid at ICON_Y (with the TV's depth straddling the card).
        bpy.context.view_layer.update()
        for o in meshes:
            o.location.y = ICON_Y

        bpy.context.view_layer.update()
        primary = meshes[0]
        bb = [primary.matrix_world @ mathutils.Vector(c) for c in primary.bound_box]
        wxs=[v.x for v in bb]; wys=[v.y for v in bb]; wzs=[v.z for v in bb]
        print(f"  [{key}] world bbox: "
              f"x[{min(wxs):+.3f},{max(wxs):+.3f}] "
              f"y[{min(wys):+.3f},{max(wys):+.3f}] "
              f"z[{min(wzs):+.3f},{max(wzs):+.3f}] "
              f"polys={sum(len(m.data.polygons) for m in meshes)}")

        # Per-icon camera FOV override — used when an object's silhouette
        # exceeds the default rig's frame and would clip at the edges.
        fov_override = cfg.get("camera_fov_deg")
        if fov_override is not None:
            cam = next((o for o in bpy.data.objects if o.type == 'CAMERA'), None)
            if cam:
                cam.data.angle = math.radians(fov_override)
                print(f"  [{key}] camera FOV set to {fov_override}°")

        # Per-icon lighting back-off — for highly reflective materials that
        # blow out under build()'s default brightness.
        light_scale = cfg.get("light_scale")
        front_light_scale = cfg.get("front_light_scale")
        if light_scale is not None or front_light_scale is not None:
            for o in bpy.data.objects:
                if o.type != 'LIGHT': continue
                # Front lights are the ones in front of the icon (negative Y).
                is_front = o.location.y < 0.0
                s = front_light_scale if (is_front and front_light_scale is not None) else light_scale
                if s is not None:
                    o.data.energy *= s
            print(f"  [{key}] light scaling: front={front_light_scale} else={light_scale}")
        exposure_offset = cfg.get("exposure_offset")
        if exposure_offset is not None:
            bpy.context.scene.view_settings.exposure += exposure_offset
            print(f"  [{key}] exposure {exposure_offset:+.2f} → {bpy.context.scene.view_settings.exposure:.2f}")

        for o in meshes:
            bpy.ops.object.select_all(action='DESELECT')
            o.select_set(True)
            bpy.context.view_layer.objects.active = o
            bpy.ops.object.shade_smooth()
    return add_icon


def render_one(key):
    cfg = ICONS[key]
    icon_fn = make_icon_fn(key, cfg)
    build_no_card(key, icon_fn)
    print(f"DONE {key}")


# ── entry point ────────────────────────────────────────────────────────────────
argv = sys.argv
if "--" in argv:
    args = argv[argv.index("--") + 1:]
else:
    args = []

if args:
    targets = [a for a in args if a in ICONS]
    if not targets:
        print(f"Unknown keys: {args}. Valid: {list(ICONS)}")
        sys.exit(1)
else:
    targets = list(ICONS)

for k in targets:
    if not os.path.exists(os.path.join(MODELS, ICONS[k]["glb"])):
        print(f"SKIP {k}: GLB missing at {ICONS[k]['glb']}")
        continue
    render_one(k)
