# DECISIONS

Only important project decisions belong here. Keep each decision short and replace it if it becomes outdated.

---

## D-001 — Shared AI memory

Decision:
Use shared Markdown files in the project root for ChatGPT and Gemini.

Reason:
Allow multiple AI agents to continue the project without relying on conversation history.

Status: Active

---

## D-005 — Kapak repository protection

Decision:
Treat the Kapak repository as read-only throughout PhotoMobilya development.

Reason:
Prevent unintended changes to the existing Kapak site while the standalone viewer is being developed.

Override:
Only the user's exact approval, `kapak dosyasında değişiklik yapmanı onaylıyorum`, permits a Kapak-site modification.

Status: Active

---

## D-006 — Confirmed ADEKO source export formats

Decision:
Treat ADEKO 22 Pro DWG/DXF output as the confirmed initial source for conversion testing.

Reason:
The ADEKO Save As screen confirms AutoCAD DWG and DXF choices, while a direct GLB export is not present there.

Status: Active

---

## D-002 — GitHub shared source of truth

Decision:
Use Git and GitHub to synchronize completed work between agents.

Reason:
Preserve a reviewable history, prevent lost work, and make collaboration safer.

Status: Active when the repository and remote are configured.

---

## D-003 — Standalone viewer first, Kapak integration last

Decision:
Develop the interactive kitchen viewer in the PhotoMobilya repository first; integrate it into the Kapak site only after the viewer is ready and reviewed.

Reason:
Keep development isolated, protect the live site, and allow the viewer to be tested independently.

Status: Active

---

## D-004 — Initial presentation environment

Decision:
Use the `Photo Studio 1` 1K HDRI as the initial environment-lighting asset.

Reason:
Establish a consistent polished presentation look while keeping the first web prototype lightweight.

Status: Active

---

## D-007 — ADEKO layer names are the material and cutaway contract

Decision:
Use the manually verified ADEKO layer names as the source of truth for material assignment and structural cutaway rules; do not expand matching by guesswork.

Reason:
Similar-looking names can represent cabinet construction, appliance details, or room structure, and broad matching has previously recolored or hidden the wrong geometry.

Status: Active

---

## D-008 — Do not generate a generic ceiling filler

Decision:
Use only the CEILING geometry supplied by the source model; do not add an automatic whole-room ceiling plane.

Reason:
The source test models already contain a CEILING mesh. The generic plane duplicated it and created a visibly split ceiling. Any genuinely missing ceiling detail requires source-specific geometry evidence.

Status: Active
