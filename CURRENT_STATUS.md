# CURRENT STATUS

Stage: Studio Lighting & Shadow Optimization

Currently working on:
Improved lighting and shadows for a photorealistic studio rendering feel.

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

Not completed:
- Refined physical constraints (collision detection) in Walkthrough mode.
- Advanced textures (PBR maps) for configurator options.

Next recommended action:
Finalize deployment integration with the Kapak site.
