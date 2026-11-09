---
name: equities-trade-lifecycle
description: Equities division (fictional example). Use when work involves trade states or status transitions — which states exist and which transitions are allowed.
---

# Equities trade lifecycle (fictional example)

| State | Meaning | Allowed next states |
|---|---|---|
| `NEW` | Captured from a fill, not yet validated | `VALIDATED`, `REJECTED` |
| `VALIDATED` | Passed booking checks | `CONFIRMED`, `CANCELLED` |
| `CONFIRMED` | Agreed with the counterparty | `SETTLED`, `CANCELLED` |
| `SETTLED` | Final | none |
| `REJECTED` | Failed validation | none |
| `CANCELLED` | Withdrawn; keeps its history | none |

Rules:
- A state change appends to history; it never edits or deletes an earlier entry.
- `CANCELLED` after `CONFIRMED` needs a reason string.
- Trade Capture owns `NEW` → `VALIDATED` / `REJECTED`. Risk Analytics only reads states.
