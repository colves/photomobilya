# CURRENT STATUS

## System State
PhotoMobilya standalone viewer has the latest implementation at `428619d`, which introduced a startup regression and is not accepted.
- The user-confirmed structural cutaway candidates are `WALLS`, `CEILING`, `DOOR_WINDOW`, `WINDOW_GLASSES`, `WALL_BEAM`, and `PORAL`; `FLOOR` must remain visible.
- `428619d` removed `new THREE.PerspectiveCamera(...)` while adding browser debug globals. `camera` is undefined when `camera.position.set(...)` runs, preventing viewer startup.
- `safeUpper` and OrbitControls scheduling changes from `9f6f0ec` remain source-level improvements, but cannot be visually accepted until the camera regression is repaired.
- The door-only UI toggle, appliance details, and missing-back-panel behavior still need visual acceptance testing on all three real GLBs.
- Procedural appliance details and missing-back-panel detection must be verified against actual mesh names and geometry before they are considered delivered.

## Next Phase
- Restore the PerspectiveCamera initialization, then run visual and measured performance acceptance tests on all three real GLB files.
- Standalone integration into the live Kapak repository only after explicit approval.

