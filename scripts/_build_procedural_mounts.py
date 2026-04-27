"""Build full-motion + ceiling TV mount GLBs procedurally — modeled directly
from the Ktaxon TMD full-motion swivel and the MOUNTUP ceiling-drop pole
product photos the user supplied as reference.

Deliberate geometry from a real product photo, not abstract primitives:
each part corresponds to a part of the actual mount (wall plate, shoulder
knuckle, upper arm, elbow, forearm, VESA plate, side rails, hooks /
ceiling plate, drop pole, swivel joint, 4-arm cross, mounting caps).

PBR matte-black powder-coat material. Bevels applied for soft edges so
the renders match the wall-types AgX rig look.

Run: /Applications/Blender.app/Contents/MacOS/Blender --background \\
        --python scripts/_build_procedural_mounts.py
Outputs:
  scripts/models/procedural_mount_fullmotion.glb
  scripts/models/procedural_mount_ceiling.glb
"""
import bpy, math, os

OUT = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(OUT, exist_ok=True)


def black_metal_mat():
    mat = bpy.data.materials.new("BlackMetal")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.045, 0.045, 0.05, 1.0)
    if "Metallic" in bsdf.inputs:
        bsdf.inputs["Metallic"].default_value = 0.6
    if "Roughness" in bsdf.inputs:
        bsdf.inputs["Roughness"].default_value = 0.42
    return mat


def reset_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for col in [bpy.data.meshes, bpy.data.materials,
                bpy.data.lights, bpy.data.cameras, bpy.data.images]:
        for b in list(col):
            try: col.remove(b)
            except Exception: pass


def add_box(name, size, location):
    """size = (sx, sy, sz) HALF-EXTENTS. location = center."""
    bpy.ops.mesh.primitive_cube_add(size=2.0, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    m = obj.modifiers.new("Bevel", "BEVEL")
    m.width = 0.004
    m.segments = 3
    m.limit_method = 'ANGLE'
    return obj


def add_cyl(name, radius, depth, location, axis='Z'):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth,
                                        location=location, vertices=32)
    obj = bpy.context.object
    obj.name = name
    if axis == 'X':
        obj.rotation_euler = (0, math.radians(90), 0)
    elif axis == 'Y':
        obj.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    m = obj.modifiers.new("Bevel", "BEVEL")
    m.width = 0.003
    m.segments = 2
    m.limit_method = 'ANGLE'
    return obj


def finalize(name, mat):
    objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    if not objs:
        return None
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    obj = bpy.context.object
    obj.name = name
    # apply bevels
    for mod in list(obj.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=mod.name)
        except Exception:
            pass
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    return obj


def export_selected(path):
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB',
                               use_selection=True)
    print(f"saved {path} ({os.path.getsize(path)} bytes)")


# ── Full-motion swivel arm ─────────────────────────────────────────────────────
def build_full_motion():
    """Wall-mounted articulating arm. World layout:
       - wall plate at world x=-0.55 (vertical rail, slots in plate)
       - TWO parallel arm chains (top + bottom) like the Ktaxon TMD photo
       - VESA back plate + horizontal top/bottom rails + side hooks (TV-grip)
       Z is up. Arms extend in +Y (forward).
    """
    # Wall plate — narrow vertical rail like the photo (slots not modeled,
    # silhouette is what reads). 1.0m tall × 8cm wide × 4cm deep.
    add_box("WallPlate",        (0.040, 0.040, 0.500), (-0.55, 0.000, 0.000))
    add_box("WallPlateInner",   (0.020, 0.060, 0.420), (-0.55, 0.020, 0.000))

    # Helper: build one arm chain at a given Z height.
    def build_arm(prefix, z):
        # Shoulder pivot mounted to wall plate
        add_cyl(f"{prefix}_Shoulder", 0.045, 0.10, (-0.50, 0.080, z), axis='Z')
        # Upper arm — first segment
        add_box(f"{prefix}_UpperArm",    (0.180, 0.025, 0.022), (-0.32, 0.130, z))
        add_box(f"{prefix}_UpperArmCap", (0.030, 0.040, 0.040), (-0.13, 0.130, z))
        # Elbow knuckle
        add_cyl(f"{prefix}_Elbow",    0.045, 0.10, (-0.13, 0.180, z), axis='Z')
        # Forearm — second segment
        add_box(f"{prefix}_Forearm",     (0.180, 0.025, 0.022), ( 0.05, 0.220, z))
        add_box(f"{prefix}_ForearmCap",  (0.030, 0.040, 0.040), ( 0.23, 0.220, z))
        # Wrist knuckle
        add_cyl(f"{prefix}_Wrist",    0.045, 0.10, ( 0.23, 0.270, z), axis='Z')

    # TWO parallel arm chains — upper and lower, like the Ktaxon TMD photo.
    build_arm("Top", 0.150)
    build_arm("Bot", -0.150)

    # VESA back plate — vertical square plate that bolts to the TV's back
    add_box("VESABackPlate",    (0.020, 0.020, 0.220), ( 0.30, 0.310, 0.000))
    add_box("VESABackPlateMid", (0.130, 0.018, 0.140), ( 0.30, 0.300, 0.000))

    # Horizontal cross-rail behind the TV (top + bottom) — crucial silhouette
    # element from the reference photo.
    add_box("TopRail",          (0.450, 0.030, 0.030), ( 0.30, 0.350, 0.180))
    add_box("BotRail",          (0.450, 0.030, 0.030), ( 0.30, 0.350, -0.180))

    # Side hooks — vertical bars at each end of the rails, with little
    # downward-curling tabs that grip the TV edges.
    add_box("HookL",            (0.030, 0.040, 0.260), (-0.13, 0.380, 0.000))
    add_box("HookL_Tab",        (0.030, 0.060, 0.030), (-0.13, 0.410, -0.250))
    add_box("HookR",            (0.030, 0.040, 0.260), ( 0.73, 0.380, 0.000))
    add_box("HookR_Tab",        (0.030, 0.060, 0.030), ( 0.73, 0.410, -0.250))

    return finalize("MountFullMotion", black_metal_mat())


# ── Ceiling-drop pole mount ────────────────────────────────────────────────────
def build_ceiling():
    """Ceiling plate at top → drop pole → swivel joint → 4-arm VESA cross.
       Z is up. Z=0 is the bottom of the VESA cross (sits on floor for
       fit_and_pose). Top of ceiling plate is at z≈0.95.
    """
    # Ceiling mounting plate (angled L-bracket at top in the photo).
    add_box("CeilPlateBack",  (0.090, 0.012, 0.060), (0, -0.080,  0.940))
    add_box("CeilPlate",      (0.090, 0.090, 0.014), (0,  0.000,  0.880))

    # Top knuckle where pole pivots on ceiling plate
    add_cyl("CeilJoint",      0.030, 0.04, (0, 0,    0.840), axis='Y')

    # Drop pole — telescoping, two diameters like the reference
    add_cyl("PoleUpper",      0.022, 0.42, (0, 0,    0.620), axis='Z')
    add_cyl("PoleLower",      0.020, 0.32, (0, 0,    0.220), axis='Z')

    # Swivel joint where pole meets the cross
    add_cyl("Swivel",         0.045, 0.08, (0, 0,    0.040), axis='Z')

    # VESA center hub (square mounting plate, slightly raised)
    add_box("VESAHub",        (0.090, 0.020, 0.090), (0, 0.020, 0.000))
    add_box("VESAHubFront",   (0.060, 0.012, 0.060), (0, 0.040, 0.000))

    # 4-arm cross — long arms extending out the four sides
    add_box("ArmLeft",        (0.300, 0.030, 0.030), (-0.300, 0.000, 0.000))
    add_box("ArmRight",       (0.300, 0.030, 0.030), ( 0.300, 0.000, 0.000))
    add_box("ArmTop",         (0.030, 0.030, 0.260), ( 0.000, 0.000, 0.260))
    add_box("ArmBottom",      (0.030, 0.030, 0.260), ( 0.000, 0.000, -0.260))

    # End caps with mounting hole patterns (vertical tabs at each arm tip)
    add_box("CapLeft",        (0.030, 0.045, 0.090), (-0.560, 0.000, 0.000))
    add_box("CapRight",       (0.030, 0.045, 0.090), ( 0.560, 0.000, 0.000))
    add_box("CapTop",         (0.090, 0.045, 0.030), ( 0.000, 0.000, 0.490))
    add_box("CapBottom",      (0.090, 0.045, 0.030), ( 0.000, 0.000, -0.490))

    return finalize("MountCeiling", black_metal_mat())


# ── Driver ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Full-motion
    reset_scene()
    obj = build_full_motion()
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    export_selected(os.path.join(OUT, "procedural_mount_fullmotion.glb"))

    # Ceiling
    reset_scene()
    obj = build_ceiling()
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    export_selected(os.path.join(OUT, "procedural_mount_ceiling.glb"))

    print("DONE")
