# CURRENT STATUS

## System State
PhotoMobilya standalone viewer starts and loads the three local test GLBs.
- The user-confirmed structural cutaway candidates are WALLS, CEILING, DOOR_WINDOW, WINDOW_GLASSES, WALL_BEAM, and PORAL; FLOOR must remain visible.
- The e79a227 viewer.js regression was restored in c4ab721; updateDynamicLighting, updateCutaway, and temporary-scene helpers are present again.
- HDRI loading is non-blocking with a five-second fallback; the viewer can start with the built-in lights while HDRI loading continues or fails.
- Lake noise uses one cached deterministic THREE.DataTexture.
- 2026-10-03: GLB loading failed because model-loader.js called safeUpper without importing it. The named import and user-facing Turkish loading/error strings were repaired. Local browser checks loaded mutfakdeneme1.glb, mutfakgunesler.glb, and mutfak1kat.glb through the same loadModel path without the error screen.
- 2026-10-03: Structural cutaway now reads each mesh's ancestor layer names. When a wall or beam is hidden, its nearby DOOR_WINDOW, WINDOW_GLASSES, and PORAL package hides with it; FLOOR remains excluded. CEILING is eligible even as one source mesh, and the duplicate generated CEILING_FILLER was removed.
- 2026-10-03: Visible PLINTHS follows the selected door finish while “Yalnızca kapakları değiştir” is off; PLINTH_LEGS stay fixed. Missing SINKS bowl floors receive a lightweight procedural stainless-steel floor so cabinet color cannot show through the basin.

## Next Phase
- Standalone integration into the live Kapak repository only after explicit approval.
- Perform user acceptance checks for file-picker upload, material changes, and cutaway behavior on the live deployment.
