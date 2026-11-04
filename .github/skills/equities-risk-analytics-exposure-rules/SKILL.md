---
name: equities-risk-analytics-exposure-rules
description: Risk Analytics team (fictional example). Use when computing or reviewing position exposure or limit checks — defines the exposure formula and limit semantics.
---

# Exposure and limits (fictional example)

- **Exposure** of a position = `quantity × price`. Long positions have positive quantity, short positions negative.
- **Gross exposure** of a book = sum of `|exposure|` over positions. **Net exposure** = sum of signed exposure.
- **Limit check:** a book breaches its limit when gross exposure is *strictly greater* than the limit. Equal is not a breach.
- Inputs with a non-finite quantity or price are rejected, not treated as zero.
