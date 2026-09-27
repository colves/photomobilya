# CURRENT STATUS

## System State
PhotoMobilya standalone viewer has the latest implementation at `49eb261`, but its cutaway, procedural appliance, and smart back-panel claims require correction before being accepted as complete.
- The user-confirmed structural cutaway candidates are `WALLS`, `CEILING`, `DOOR_WINDOW`, `WINDOW_GLASSES`, `WALL_BEAM`, and `PORAL`; `FLOOR` must remain visible.
- The door-only UI toggle exists, but its three-model behavior still needs visual acceptance testing.
- Procedural appliance details and missing-back-panel detection must be verified against actual mesh names and geometry before they are considered delivered.

## Next Phase
- Correct `49eb261` findings, then run visual and performance acceptance tests on all three real GLB files.
- Profile and improve inspection smoothness before integration.
- Standalone integration into the live Kapak repository only after explicit approval.
