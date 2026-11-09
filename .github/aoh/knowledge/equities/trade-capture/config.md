## Trade Capture team

The team owns trade booking: turning an order fill into a validated trade record.

- **Write scope:** `examples/equities/trade-capture/**`
- **Test command:** `npm test`
- Every exported function has tests in the matching `*.test.mjs` file (`node:test`, `node:assert/strict`).
- Validate inputs at the boundary and return clear results; do not throw for ordinary invalid input.
- Do not:
  - add dependencies
  - change files owned by Risk Analytics
  - change the trade ID format without updating the skill below

### Skills you can pull

- `equities-trade-capture-trade-id-format` (`.github/skills/equities-trade-capture-trade-id-format/SKILL.md`): the trade ID format and its validation rules.
