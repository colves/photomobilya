# CURRENT STATUS

Stage: Dynamic Studio Lighting Optimization

Currently working on:
Made the studio lighting and shadow maps dynamic based on the loaded model's bounding box.

Working:
- Shared project-memory files are in place.
- Standalone Three.js viewer is functional with robust model loading, camera controls, and walkthrough mode.
- ADEKO to GLB Pipeline Analysis completed (`docs/adeko-to-glb-pipeline-analysis.md`).
- Real model structure inspected (`docs/mutfakdeneme1-model-inspection.md`).
- Scale correction (`x10`) applied globally to ADEKO GLB models.
- Dynamic material mapping assigns PBR materials based on mesh names.
- Configurator UI allows real-time switching of Cabinet Door and Worktop materials.
- Configurator UI visibility bug fixed.
- Studio lighting setup (Key Light, Fill Light, Ambient Light) and WebGL Soft Shadows implemented.
- HDRI integration with PMREM (via EquirectangularReflectionMapping) provides realistic PBR reflections.
- Lighting and shadow frustum dynamically scales and centers to the exact bounds of the loaded model.

Not completed:
- Refined physical constraints (collision detection) in Walkthrough mode.
- Advanced textures (PBR maps) for configurator options.

Next recommended action:
Finalize deployment integration with the Kapak site.
