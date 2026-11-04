# AOH knowledge tree

One `config.md` per layer: the root is shared, then division, then team, then agent. A folder named after an agent (`Trade Capture Developer` → `trade-capture-developer/`) marks where that agent sits. The hooks inject every `config.md` from the root down to that folder. See the main README, "How context reaches an agent".

Only `config.md` files are injected. `workflows/` folders hold workflow definitions the config files point to. Keep everything here reviewed and non-sensitive; it is committed.
