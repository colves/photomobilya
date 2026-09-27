# CURRENT STATUS

## System State
PhotoMobilya standalone viewer is fully functional and optimized for production performance.
- Targeted structural cutaway successfully hides WALLS, CEILING, DOOR_WINDOW, WINDOW_GLASSES, WALL_BEAM, and PORAL *only* when they block interior furniture. FLOOR is explicitly excluded from cutaway and always visible.
- Procedural appliance detailing (Oven glass, Hob burners, Washer panels, Fridge splits) added dynamically to flat CAD boxes based on exact geometry bounds.
- Intelligent CAB_BODY_WALL analysis checks actual mesh face counts on the rear bounds, ensuring back panels are generated *only* for upper modules genuinely missing their rear face.
- UI features a 'Yalnizca kapaklari degistir' toggle that isolates door-color changes from cabinet bodies, completely respecting the new Kapak/Body layer mapping rules.
- **Performance Upgrade:** Render-on-demand loop implemented. The viewer sleeps when idle and only renders frames during camera movement, material changes, or window resize, completely eliminating idle GPU burn. Cutaway raycasting has been optimized to only intersect necessary structural meshes, drastically reducing raycaster cost.

## Next Phase
- Standalone integration into the live Kapak repository.
- Awaiting final user approval for integration.
