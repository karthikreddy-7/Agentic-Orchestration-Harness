---
name: plan-approve-implement-review
description: Plan a change, get human approval, implement it inside a team write scope, then review it.
agents: ['Equities Architect', 'Trade Capture Developer', 'Trade Capture Reviewer', 'Risk Analytics Developer', 'Risk Analytics Reviewer']
---

# Workflow: plan → approve → implement → review

Run by an orchestrator. Pick a `<run-id>` (date plus short slug). Save each report under `.aoh/runs/<run-id>/` **as soon as that step returns**, before starting the next step. If a report is missing fields or does not match the shape in the shared rules, save it anyway and tell the human it is malformed.

1. **Plan.** Delegate to `Equities Architect` with the objective and the affected team folders as read scope.
   Save the report as `1-equities-architect.json`. Show the plan to the human.
2. **Approval gate.** Ask the human to approve, change or stop. Do not continue without explicit approval.
3. **Implement.** For each affected team, delegate to that team's Developer with the approved plan and the team's
   write scope and test command (both are in the team's context). Save as `2-<agent-folder>.json`.
   Cross-team work: run teams one after another, never in parallel on overlapping files.
   If a status is not `completed`, stop and ask the human.
4. **Review.** For each team, delegate to that team's Reviewer with the plan and the developer's `files_changed`.
   Save as `3-<agent-folder>.json`.
5. **Close.** Summarise every report, list reviewer blockers first, and give the human the command
   `npm run validate-reports -- .aoh/runs/<run-id>`. The human decides whether to keep, change or revert the result.
