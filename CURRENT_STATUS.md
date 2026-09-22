# CURRENT STATUS

Stage: Material Mapping & Scale Correction

Currently working on:
Added dynamic PBR material mapping and automatic scale correction for ADEKO exports.

Working:
- Shared project-memory files are in place.
- Standalone Three.js viewer is functional with robust model loading, camera controls, and walkthrough mode.
- ADEKO to GLB Pipeline Analysis completed (`docs/adeko-to-glb-pipeline-analysis.md`).
- Real model structure inspected (`docs/mutfakdeneme1-model-inspection.md`).
- Scale correction (`x10`) applied globally to ADEKO GLB models during load time.
- Dynamic material mapping system (`material-library.js`) assigns PBR materials based on mesh names.

Not completed:
- Interactive configurator for materials (UI for users to change colors/textures).
- Refined physical constraints (collision detection) in Walkthrough mode.

Next recommended action:
Review visual quality with the mapped materials. Then plan the UI layer for the material configurator (allowing the user to switch door/worktop colors).
