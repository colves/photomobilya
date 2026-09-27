# CURRENT STATUS

## System State
PhotoMobilya standalone viewer has the latest implementation at `a78b4a6`, but its render-on-demand and cutaway implementation require correction before being accepted as complete.
- The user-confirmed structural cutaway candidates are `WALLS`, `CEILING`, `DOOR_WINDOW`, `WINDOW_GLASSES`, `WALL_BEAM`, and `PORAL`; `FLOOR` must remain visible.
- The door-only UI toggle exists, but its three-model behavior still needs visual acceptance testing.
- The current render-on-demand path has no OrbitControls change handler and therefore does not reliably repaint during dragging, damping, or camera-button animation.
- `raycastMeshes` currently contains all scene meshes rather than only the intended structural/furniture blocker sets. `FLOOR` can still be treated as a generic blocker after an occluding structure.
- Procedural appliance details and missing-back-panel detection must be verified against actual mesh names and geometry before they are considered delivered.

## Next Phase
- Correct `a78b4a6` findings, then run visual and performance acceptance tests on all three real GLB files.
- Standalone integration into the live Kapak repository only after explicit approval.
