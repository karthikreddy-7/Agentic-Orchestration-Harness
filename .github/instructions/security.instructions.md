---
description: Security-oriented coding guidance for project source files. Adjust applyTo to match the host repository layout.
applyTo: 'src/**'
---

- Validate untrusted input at the boundary where it enters the application.
- Do not hardcode credentials, tokens, private keys, or other secrets.
- Use parameterized APIs for database queries and safe APIs for command or path handling.
- Avoid logging credentials, personal data, or sensitive request contents.
- Preserve existing authorization checks when changing code.

These instructions guide edits; they are not a substitute for security testing or runtime enforcement. Update `applyTo` if this repository uses a different source directory.
