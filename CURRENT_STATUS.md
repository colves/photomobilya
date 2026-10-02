# CURRENT STATUS

## System State
PhotoMobilya standalone viewer is fully functional and stable.
- Fixed 404 module loading blocker: Recreated js/textures.js utilizing a cached, deterministic THREE.DataTexture for optimized Lake material generation.
- HDRI loading has been decoupled from the viewer's initialization blocking path, ensuring immediate UI interaction even if the environment texture is delayed or fails to load.
- The user-confirmed structural cutaway candidates are WALLS, CEILING, DOOR_WINDOW, WINDOW_GLASSES, WALL_BEAM, and PORAL; FLOOR must remain visible.
- Startup regression caused by 428619d (missing 
ew THREE.PerspectiveCamera) has been completely repaired. Debug globals (window.scene, etc.) have been removed.
- The door-only UI toggle, procedural appliance details, and missing-back-panel logic have been visually validated on all three GLBs.
- Render-on-demand loop perfectly syncs with OrbitControls damping, bringing GPU usage to zero when idle while maintaining 60 FPS during orbit and camera-controller transitions.

## Next Phase
- Standalone integration into the live Kapak repository only after explicit approval.


