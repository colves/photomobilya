# CURRENT STATUS

## System State
PhotoMobilya standalone viewer has the latest implementation at `9f6f0ec`. Its source-level normalization and OrbitControls scheduling fixes were reviewed, but visual and measured performance acceptance remains pending.
- The user-confirmed structural cutaway candidates are `WALLS`, `CEILING`, `DOOR_WINDOW`, `WINDOW_GLASSES`, `WALL_BEAM`, and `PORAL`; `FLOOR` must remain visible.
- `safeUpper` now reduces `i`, `I`, `İ`, and `ı` to the ASCII comparison key `I`; shared matching uses the exported helper.
- OrbitControls `change`, `start`, and `end` events now request frames; a render calls `controls.update()`, so damping requests subsequent frames through `change` until settled.
- The door-only UI toggle, appliance details, and missing-back-panel behavior still need visual acceptance testing on all three real GLBs.
- Procedural appliance details and missing-back-panel detection must be verified against actual mesh names and geometry before they are considered delivered.

## Next Phase
- Run visual and measured performance acceptance tests on all three real GLB files, then correct any discovered behavior.
- Standalone integration into the live Kapak repository only after explicit approval.
