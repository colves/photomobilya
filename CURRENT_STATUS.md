# CURRENT STATUS

## System State
PhotoMobilya standalone viewer has the latest implementation at `4f1974c`, but it is not accepted as complete.
- The user-confirmed structural cutaway candidates are `WALLS`, `CEILING`, `DOOR_WINDOW`, `WINDOW_GLASSES`, `WALL_BEAM`, and `PORAL`; `FLOOR` must remain visible.
- The door-only UI toggle exists, but its three-model behavior still needs visual acceptance testing.
- `safeUpper` currently maps ASCII `i` to Turkish dotted `İ`, which breaks ASCII comparisons such as `CEILING`, `WINDOW_GLASSES`, and `FRIDGE`.
- OrbitControls `change`, `start`, and `end` listeners are absent, so render-on-demand does not reliably repaint mouse orbit, zoom, or damping.
- Camera-button animation requests frames, but OrbitControls interaction still needs a correct on-demand render scheduler.
- Procedural appliance details and missing-back-panel detection must be verified against actual mesh names and geometry before they are considered delivered.

## Next Phase
- Correct `4f1974c` findings, then run visual and measured performance acceptance tests on all three real GLB files.
- Standalone integration into the live Kapak repository only after explicit approval.
