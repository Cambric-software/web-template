# Cambric Web Template

This repository is a local-first, privacy-preserving web foundation for Cambric products. It includes a reusable configuration model, release discovery, cache management, diagnostics, security validation, product manifest, and a browser-first download view.

## Interactive setup wizard

The template includes a project wizard. Run the setup command without arguments to open a prompt that asks for:

- product name
- optional description
- optional release repository
- optional project folder rename

```bash
node scripts/setup.js
# or
node bin/cambric.js setup
```

The wizard updates the project identity, website metadata, manifest fields, and cleans template-only artifacts like `.template` and `SETUP.md` once the project is ready.

## Quick setup

```bash
npm install
node scripts/setup.js "My Product" "A privacy-first product description"
```

## CLI

```bash
node bin/cambric.js setup "My Product" "My description"
node bin/cambric.js doctor
node bin/cambric.js build
node bin/cambric.js release
node bin/cambric.js version
```

## Structure

- `config/` contains centralized configuration.
- `index/` contains the website and download page.
- `services/` contains local-first web services.
- `security/` contains safe validation and secret scanning.
- `scripts/` contains setup, doctor, build, and release tooling.
- `tests/` contains automated verification.

## Production notes

- The website is designed to run without requiring a mandatory backend.
- Optional service integrations are isolated and removable.
- Secrets are never committed to the repository.
- Cache metadata and release metadata are stored locally with explicit validity checks.

## Testing and validation

```bash
npm test
npm run doctor
npm run build
npm run release
```
