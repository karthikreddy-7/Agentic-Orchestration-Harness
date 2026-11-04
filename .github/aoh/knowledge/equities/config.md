## Equities division rules (fictional example)

- Every change that touches trade data must keep an audit trail: no silent overwrites, no deleted history.
- Timestamps are UTC, ISO 8601. Money and quantities are never floats in persisted data; prices in the demo are illustrative only.
- No real client, counterparty or account data anywhere, including tests. Use obviously fake identifiers.
- Changes to booking or risk calculations need a reviewer's report before a human accepts them.

### Workflow

All Equities work follows `.github/aoh/knowledge/equities/workflows/plan-approve-implement-review.md`.

### Skills you can pull

- `equities-trade-lifecycle`: trade states and allowed transitions.
