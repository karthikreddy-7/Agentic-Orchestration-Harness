# AOH knowledge tree

`shared/config.md` is loaded for every agent (rules, output contract, resume). Below it, one `config.md` per layer: division, then team, then agent. A folder named after an agent (`Trade Capture Developer` → `trade-capture-developer/`) marks where that agent sits. The hooks inject `shared/config.md`, then every `config.md` from the top of the tree down to that folder. See the main README, "How context reaches an agent".

Only `config.md` files are injected. `workflows/` folders hold workflow definitions the config files point to. Keep everything here reviewed and non-sensitive; it is committed.
