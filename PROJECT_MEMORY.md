# PROJECT MEMORY

## Project

Name: PhotoMobilya

## Goal

Create a web-based, interactive 3D kitchen presentation experience for customers. A kitchen project should be shown in a polished, render-like environment that customers can explore in a browser.

## Important Information

- This project may be worked on by ChatGPT and Gemini.
- The Markdown files in the project root are the shared project memory.
- Keep this file concise; record only stable, high-value information.
- The finished experience will be integrated into the Kapak website only after the standalone viewer is ready.

## Technical

- Delivery: Web-based interactive 3D viewer.
- Initial environment asset: `Photo Studio 1` HDRI, 1K resolution.
- Integration target: local Kapak site at `C:\Users\Colves\OneDrive\Masaüstü\Kapak` (GitHub: `colves/kapak`).
- ADEKO → GLB research: `docs/adeko-to-glb-pipeline-analysis.md`.
- Confirmed source application: ADEKO 22 Pro. Its Save As screen offers AutoCAD DWG and DXF versions; direct web/GLB export is not shown there.
- First conversion test input: export a copy as AutoCAD 2007 DWG and, if practical, AutoCAD 2007 ASCII DXF. Keep the original ADEKO drawing unchanged.
- FBX/OBJ export has not been confirmed and must not be assumed available.
- 3ds Max is a possible long-term batch-conversion option; it is not selected for the first prototype.
- A real test proved the current path works: ADEKO DWG → 3ds Max 2026 → Babylon glTF exporter → GLB → PhotoMobilya viewer. The local test file is `assets/models/mutfakdeneme1.glb` and is intentionally not tracked in Git yet.
- Verified ADEKO layer convention: `CAB_DOORS` / `CAB_DOOR_FRAME` are configurable fronts; `WORKTOPS` is configurable worktop; `CAB_BODY_BASE`, `CAB_BODY_WALL`, `CAB_BODY_TALL`, `CORNICES_*`, `PLINTHS`, `PLINTH_LEGS` are fixed cabinet construction; `WALLS`, `CEILING`, `DOOR_WINDOW`, `WINDOW_GLASSES` are structural cutaway candidates. `CAB_DOOR_GLASS` and `SHELVES_GLASS` are cabinet glass and must not be cut away.
- Mapping follow-up required before new material work: `PANELS_SIDE`, `PANELS_WALL`, `SANITARY`, `ACCESSORIES_MODELS`, `ENTS_FOR_HIDE`, `PORAL`, `REFRIGERATOR`, `WALL_BEAM`, and non-glass `SHELVES` currently have no explicit PhotoMobilya rule. Do not infer their behavior without user confirmation.
- Upper-cabinet back-panel rule: generate a 5 mm `BACK_PANEL` only after detecting that a specific `CAB_BODY_WALL` module genuinely lacks its rear face. Never add it blindly to every upper module.
- User-confirmed target behavior: targeted cutaway candidates are `CEILING`, `WALLS`, `DOOR_WINDOW`, `WINDOW_GLASSES`, and `WALL_BEAM`; `FLOOR` must remain visible. The cabinet-color scope (when the "only doors" control is off) is `PANELS_SIDE`, `CORNICES_UPPER`, `CORNICES_LOWER`, `CAB_DOORS`, `CAB_DOOR_FRAME`, `CAB_BODY_BASE`, `CAB_BODY_WALL`, and `CAB_BODY_TALL`; when on, only door/front layers change. `SANITARY` must use the same fixed metal material as sinks.
- Next separate priority: profile and improve viewer performance so orbiting, zooming, material updates, and model loading are consistently smooth rather than stuttering, while preserving visual quality.
- Appliance direction: `APPLIANCES` covers fridge, oven, dishwasher, washer, hob and hood. Add lightweight, identifiable device geometry without pursuing photorealism; use verified names/bounds and shared optimized assets only. `PORAL`, `ENTS_FOR_HIDE`, `APP_BODY_CASE`, `SHELVES`, and `CAM_PRO` remain ambiguous and require model inspection before behavior is assigned.

## Special CAD Naming Convention Rules (Discovered 2026-09-27)
- ACCESSORIES_MODELS: Appliance accessory/control geometry; fixed appliance-metal scope.
- CAM_PRO: Found as a child of a KAPAK door block (e.g. _0947X0422). Treat as a door-frame component only after verifying it is not glass.
- SHELVES: Non-glass shelves; fixed generic furniture scope.
- WALL_BEAM: Structural wall beam; fixed wall material and targeted-cutaway candidate.
- PORAL: Structural window/door-related element; candidate only when it belongs to the occluding window/door package.
- ENTS_FOR_HIDE and APP_BODY_CASE: Appliance-related parts; fixed appliance-metal scope.
- `49eb261` introduced a door-only toggle plus procedural appliance and back-panel logic; `a78b4a6` and `4f1974c` attempted render-on-demand and revised cutaway handling. `9f6f0ec` corrected the ASCII normalization and added OrbitControls render requests. `428619d` must not be treated as QA: it removed PerspectiveCamera construction and breaks startup. Restore it before visual and measured performance acceptance across all three GLBs.

