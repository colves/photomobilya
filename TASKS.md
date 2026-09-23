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

## Pending
- [ ] Test system stability and scaling logic with three distinct GLB files (Waiting for files)

- [ ] Advanced PBR texturing for configurator materials
- [ ] Incorporate real 3D assets for Appliances (Oven, Hood, Sink) to replace CAD geometry Configurator UI.
- [ ] Prepare final viewer script for Kapak integration.



