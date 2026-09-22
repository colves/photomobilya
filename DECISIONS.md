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
