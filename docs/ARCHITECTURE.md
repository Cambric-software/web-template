# Cambric web architecture

## System overview

The repository is structured around a local-first web foundation. The web app remains functional in a browser without requiring a backend service and keeps optional integrations isolated and removable.

## Core directories

- `config/` central config and product identity
- `index/` website, assets, and service worker
- `services/` browser-safe local-first services
- `security/` safe URL, validation, and secret scanning helpers
- `scripts/` setup, diagnostics, and build tooling
- `tests/` automated validation for the template

## Runtime foundations

- Central product configuration and manifest validation
- Product version source of truth
- Local storage with schema-safe serialization
- Cache lifecycle management with service worker support
- Offline status detection and graceful fallback behavior
- Website identity and configurable feature flags
- Localization and Arabic RTL support
- Security validation and secret scanning for local and CI use

## Commands

```bash
node bin/cambric.js setup "My Product" "Product description"
node bin/cambric.js doctor
node bin/cambric.js build
npm test
```

## Design principles

- local-first and privacy-preserving by default
- no mandatory server or database
- explicit capability boundaries for extensions and integrations
- deterministic versioning and migration support
- no committed secrets or credentials
