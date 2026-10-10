---
name: aoh-delegation
description: Use when preparing a bounded subagent task, collecting its completion report, or presenting the result for a human decision.
---

# AOH Delegation and Reporting

## Before delegation

1. Confirm the target subagent is listed in the immediate caller's `agents` frontmatter.
2. Provide the objective, necessary context, allowed files or paths, edit permission, constraints, and expected output.
3. Avoid concurrent subagent tasks with overlapping write scopes.

## Required subagent report

Ask the subagent to return a concise status block containing:

```text
status: completed | partial | blocked | failed
summary: <what was done or found>
files_changed: <paths, or none>
checks: <checks and outcomes, or not run>
confidence: <score and short rationale>
blockers_or_risks: <items, or none>
metrics: <available relevant metrics, or unavailable>
```

Reports are self-assessments. Confidence and reported checks are not independent proof of quality; unavailable values must not be fabricated.

## After delegation

The orchestrator summarizes the returned report, identifies incomplete work and risks, and asks the human to accept the reported result or authorize the next step. It does not independently inspect or re-review the implementation. If edits must wait for approval, obtain approval before assigning implementation work.
