# CURRENT STATUS

Stage: UI/UX & Visual Stability Refinements

Currently working on:
Completed removal of walkthrough mode, fixed wall flickering with hysteresis cutaway, and modernized configurator UI to match Kapak design language.

Working:
- Shared project-memory files are in place.
- Standalone Three.js viewer is functional with robust model loading, camera controls, and inspect mode.
- ADEKO to GLB Pipeline Analysis completed (`docs/adeko-to-glb-pipeline-analysis.md`).
- Real model structure inspected (`docs/mutfakdeneme1-model-inspection.md`).
- Scale correction (`x10`) applied safely via Auto-Scale logic only to models exported in 0.1 scale.
- Dynamic material mapping assigns PBR materials based on mesh names, including improved dark appliance/glass and stainless steel sink materials.
- Modernized Configurator UI matching the elegant Kapak "Ayar Paneli" aesthetic, allowing real-time switching of Cabinet Door and Worktop materials.
- Studio lighting setup (Key Light, Fill Light, Ambient Light) and WebGL Soft Shadows implemented.
- HDRI integration with PMREM (via EquirectangularReflectionMapping) provides realistic PBR reflections.
- Lighting and shadow frustum dynamically scales and centers to the exact bounds of the loaded model.
- Dynamic Hysteresis Cutaway system hides outer walls when the camera is outside the room, completely solving Z-fighting and flickering of double-layered CAD walls without touching the raw geometry.
- Removed deprecated Walkthrough Mode components to streamline the codebase and user experience.

Not completed:
- Integration of actual 3D appliance models (GLB) for oven/hob/hood to replace low-poly CAD geometries.

Next recommended action:
Finalize deployment integration with the Kapak site.
