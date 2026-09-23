# CURRENT STATUS

Stage: Advanced Visuals & Geometry Fallbacks

Currently working on:
Finalized targeted Raycaster cutaway, lacquer (lake) textures integration, back panel generation for upper cabinets, and mesh hiding fallbacks for Adeko text.

Working:
- Shared project-memory files are in place.
- Standalone Three.js viewer is functional with robust model loading, camera controls, and inspect mode.
- ADEKO to GLB Pipeline Analysis completed.
- Scale correction (x10) applied safely via Auto-Scale logic only to models exported in 0.1 scale.
- Dynamic material mapping assigns PBR materials based on mesh names, including improved dark appliance/glass and stainless steel sink materials.
- Modernized Configurator UI matching the elegant Kapak "Ayar Paneli" aesthetic, featuring mutually exclusive selection between Normal and Lacquer (Lake) doors.
- Lacquer (Lake) procedural texture generator ported from Kapak, applying realistic 10% mix clearcoat noise dynamically to Lake materials.
- Studio lighting setup and HDRI integration providing realistic PBR reflections.
- Lighting and shadow frustum dynamically scales and centers to the exact bounds of the loaded model.
- Targeted Raycaster Cutaway system hides only the specific wall blocking the view from the camera to the orbit target.
- Automatic splitting of disconnected wall meshes (splitMeshIntoComponents) ensures cutaway doesn't incorrectly hide the entire room.
- Mesh Geometry Cleaner: Reads wall meshes, de-indexes them, and securely deletes strictly cloned overlapping faces to prevent Z-fighting.
- Fallback Generators: Missing upper cabinet back panels (CAB_BODY_WALL) are procedurally generated (5mm thick).
- Unwanted Meshes: Large room doors/windows (DOOR_WINDOW) and tiny 2D Adeko texts on hoods (APP_BODY_BASE) are automatically hidden.

Not completed:
- Integration of actual 3D appliance models (GLB) for oven/hob/hood to replace low-poly CAD geometries.

Next recommended action:
Finalize deployment integration with the Kapak site.
