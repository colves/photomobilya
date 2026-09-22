# CURRENT STATUS

Stage: Real GLB validation

Currently working on:
Preparing the first real ADEKO-derived model for visual-quality and performance improvements.

Working:
- Shared project-memory files are in place.
- Standalone Three.js viewer is functional with robust model loading and camera controls.
- ADEKO to GLB Pipeline Analysis completed (`docs/adeko-to-glb-pipeline-analysis.md`).
- Walkthrough mode (Gezinme Modu) is implemented.
  - Desktop: WASD + mouse drag.
  - Mobile: On-screen D-Pad + touch drag.
  - Safely respects ground limits and loaded model bounding boxes.
- A real 333 KB GLB exported through 3ds Max 2026 and the Babylon exporter loads successfully in the browser viewer.

Not completed:
- Material mapping and presentation quality for ADEKO-derived models.
- Real-model performance and scale validation.

Next recommended action:
Inspect the real GLB object/layer structure and define a material-mapping strategy for kitchen components.
