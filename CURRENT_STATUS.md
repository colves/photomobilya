# CURRENT STATUS

## System State
PhotoMobilya standalone viewer is fully functional with advanced procedural rendering and material assignment.
- Targeted structural cutaway successfully hides Walls, Ceiling, Floor, Windows, Doors, and Wall Beams *only* when they block interior furniture.
- Procedural appliance detailing (Oven glass, Hob burners) added dynamically to flat CAD boxes without heavy GLB assets.
- Intelligent CAB_BODY_WALL raycaster checks ensure back panels are generated *only* for upper modules genuinely missing their rear face.
- UI features a 'Yalnizca kapaklari degistir' toggle that isolates door-color changes from cabinet bodies, completely respecting the new Kapak/Body layer mapping rules.

## Next Phase
- Standalone integration into the live Kapak repository.
- Awaiting final user approval for integration.
