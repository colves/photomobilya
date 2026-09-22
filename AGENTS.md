# AI AGENT RULES

This project may be worked on by multiple AI agents, including ChatGPT and Gemini.

## START OF EVERY SESSION

1. Read this file first.
2. Read `CURRENT_STATUS.md`.
3. Read `PROJECT_MEMORY.md`.
4. Read `DECISIONS.md` only when relevant to the task.
5. Read `TASKS.md`.
6. Inspect only the project files relevant to the task before making changes.
7. Never assume another agent's work is incorrect without checking it.

## END OF EVERY MEANINGFUL SESSION

Before finishing meaningful work:

1. Update `CURRENT_STATUS.md`.
2. Update `PROJECT_MEMORY.md` only if important persistent information changed.
3. Add important technical or product decisions to `DECISIONS.md`.
4. Update `TASKS.md`.

## CONTEXT / TOKEN RULES

Keep context usage minimal.

- Do not create or store conversation logs.
- Do not store unnecessary explanations.
- Keep memory entries short and factual.
- Do not duplicate information across files.
- Replace outdated information instead of retaining historical copies.
- Do not read unrelated files.
- Source code and project assets are the source of truth for implementation details.
- Memory files contain only what another AI agent needs to continue the project.

## SAFETY

Before large changes:

- Understand the existing implementation.
- Do not delete working functionality without a reason.
- Prefer small, reversible changes.
- If Git is available, create logical commits or checkpoints.
