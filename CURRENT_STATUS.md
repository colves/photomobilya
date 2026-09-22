# CURRENT STATUS

Stage: Walkthrough Mode implementation

Currently working on:
Added first-person walkthrough mode (Gezinme Modu) to the viewer.

Working:
- Shared project-memory files are in place.
- Standalone Three.js viewer is functional with robust model loading and camera controls.
- ADEKO to GLB Pipeline Analysis completed (`docs/adeko-to-glb-pipeline-analysis.md`).
- Walkthrough mode (Gezinme Modu) is implemented.
  - Desktop: WASD + mouse drag.
  - Mobile: On-screen D-Pad + touch drag.
  - Safely respects ground limits and loaded model bounding boxes.

Not completed:
- Real ADEKO kitchen model testing with large files.

Next recommended action:
Provide an initial GLB model from ADEKO to test the web viewer capabilities in both Inspect and Walkthrough modes.
