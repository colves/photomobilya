# TASKS

## Completed

- [x] Basic HTML/CSS/JS viewer setup
- [x] Load testing with test .glb model
- [x] Setup OrbitControls for inspection
- [x] Integrate Kapak styles and font (Inter)
- [x] Identify mesh/layer structure of mutfakdeneme1.glb
- [x] Global scale correction (x10) for ADEKO models
- [x] Dynamic PBR material assignment based on mesh names
- [x] Implement UI for switching cabinet door materials (Configurator)
- [x] Implement UI for switching worktop materials
- [x] Add Studio Lighting (Key Light, Fill Light, Ambient Light)
- [x] Add HDRI Environment with PMREM Reflection mapping
- [x] Add Shadow mapping (PCFSoft) scaled dynamically to model bounding box
- [x] Intelligent auto-scale normalization for different GLB sources
- [x] Remove unused Walkthrough Mode and related UI
- [x] Fix wall/ceiling flickering with Hysteresis Cutaway logic
- [x] Solve Z-fighting from the inside via Strict Hash-Based Geometry Deduplication
- [x] Clean up old unused CSS (D-Pad, Walk controls)
- [x] Upgrade Configurator UI to match Kapak's "Ayar Paneli" aesthetic
- [x] Improve Appliance (Oven/Sink) PBR materials
- [x] Implement targeted Raycaster cutaway and connected components mesh splitting
- [x] Generate procedural back panels for CAB_BODY_WALL
- [x] Hide unwanted CAD elements (DOOR_WINDOW and Adeko text)
- [x] Implement Lake (Lacquer) procedural textures and color options
- [x] Fix Configurator UI mutual exclusion logic between normal and lake doors

- [x] Fix back panel scale transformations relative to parent world scale
- [x] Preserve original CAD transformations during mesh component splitting

- [x] Fix GPU memory leak by properly disposing old wall mesh geometries after splitting

- [x] Fix Raycaster logic to strictly ignore upper cabinets (CAB_BODY_WALL)
- [x] Ensure Raycaster only hides walls if they actively block interior furniture
- [x] Enhance appliance PBR materials (Dark glass and stainless steel) to compensate for CAD geometries

- [x] Finalize strict raycaster length and boundary checks for walls
- [x] Clean up local temporary test scripts
- [x] Audit manually classified ADEKO layer names against current viewer behavior
- [x] Apply the user-confirmed material scopes, structural cutaway list, and optimized appliance-geometry rules
- [x] Restrict generated CAB_BODY_WALL back panels to modules whose rear face is actually missing
- [x] Implement procedural lightweight geometries for appliances (Ovens and Hobs)
- [x] Added UI toggle for 'Yalnizca Kapaklari Degistir'
- [ ] Correct `4f1974c` review findings: normalize both Turkish `İ/ı` and ASCII `i/I` into ASCII comparison keys; connect render-on-demand to OrbitControls interaction and damping; keep `FLOOR` out of all cutaway evidence; then validate appliance and back-panel behavior
- [ ] Profile and eliminate viewer stutter during inspection, material changes, and model swaps without reducing customer-facing visual quality
- [ ] Perform visual acceptance tests on `mutfakdeneme1.glb`, `mutfakgunesler.glb`, and `mutfak1kat.glb` after the correction

## Pending
- [ ] Migrate standalone integration to Kapak repository
- [ ] Incorporate real 3D assets for Appliances (Oven, Hood, Sink) to replace CAD geometry Configurator UI.

