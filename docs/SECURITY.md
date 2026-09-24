# Security and privacy

## Principles

- Local-first storage and decision-making by default
- No mandatory backend or database dependency
- Explicit permission boundaries for optional integrations
- Secrets never committed to source control
- Safe URL validation and sanitized output for UI rendering

## Tools

- `security/security.js` for safe validation helpers
- `security/secret-scan.ps1` for local secret scanning
- CI workflows for validation and security gates

## Secret scanning

```powershell
./security/secret-scan.ps1
```

## Safe behaviors

- Validate download URLs before surfacing them to the UI.
- Sanitize output before inserting any user-controlled string into the DOM.
- Prefer cached metadata over speculative release data.
- Keep optional external integrations clearly separated and removable.
