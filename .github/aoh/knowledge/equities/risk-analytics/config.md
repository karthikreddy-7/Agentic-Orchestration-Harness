## Risk Analytics team

The team owns position exposure and limit calculations.

- **Write scope:** `examples/equities/risk-analytics/**`
- **Test command:** `npm test`
- Every exported function has tests in the matching `*.test.mjs` file (`node:test`, `node:assert/strict`).
- Calculations are pure functions: no I/O, no clock, no globals.
- Do not:
  - add dependencies
  - change files owned by Trade Capture
  - change limit semantics without updating the skill below

### Skills you can pull

- `equities-risk-analytics-exposure-rules`: how exposure is computed and how limits are checked.
