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
- [x] Correct `4f1974c` source review findings: normalize Turkish and ASCII I variants; connect render-on-demand to OrbitControls interaction and damping; keep `FLOOR` out of cutaway evidence
- [x] Repair 428619d startup regression: restore THREE.PerspectiveCamera construction and remove temporary browser debug globals
- [x] Validate cutaway, appliance, and missing-back-panel behavior visually on all three real GLBs
- [x] Profile and eliminate viewer stutter during inspection, material changes, and model swaps without reducing customer-facing visual quality
- [x] Perform visual acceptance tests on mutfakdeneme1.glb, mutfakgunesler.glb, and mutfak1kat.glb after the correction

## Pending
- [x] Fix critical bug where js/textures.js was missing in repository causing 404 block on loading screen
- [x] Refactor lakeNoiseDokusuOlustur to return a cached deterministic DataTexture instead of unoptimized random CanvasTexture
- [x] Prevent HDRI loading failure/delay from permanently blocking the viewer startup by making it strictly asynchronous (safely applied without breaking viewer.js)
- [x] Restore heavily damaged viewer.js functions (updateDynamicLighting, updateCutaway) lost during PowerShell regex replacements
- [x] Fix GLB load failure caused by the missing safeUpper import and repair affected user-facing Turkish loading/error strings
- [x] Make wall/ceiling cutaway use CAD hierarchy and hide the associated door/window/glass package
- [x] Remove the duplicate automatic ceiling filler and allow a single CEILING mesh to be cut away
- [x] Apply the selected front finish to visible PLINTHS while preserving fixed PLINTH_LEGS
- [x] Add a lightweight stainless-steel bowl floor for SINKS exports missing an interior surface
- [x] Correct indexed GLB geometry handling so ceiling/wall component processing cannot split faces incorrectly
- [x] Normalize verified CEILING layers to one source-sized plane and prevent room shells from darkening the interior
- [ ] Migrate standalone integration to Kapak repository
- [ ] Incorporate real 3D assets for Appliances (Oven, Hood, Sink) to replace CAD geometry Configurator UI.







