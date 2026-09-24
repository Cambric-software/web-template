# Cambric Web Template

This repository is a local-first, privacy-aware website foundation for Cambric products. It provides a polished homepage, reusable configuration, offline support, localization, diagnostics, security validation, and a setup wizard.

## Interactive setup wizard

The template includes a project wizard. Run the setup command without arguments to open a prompt that asks for:

- product name
- optional description
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
node scripts/setup.js "My Website" "A privacy-first website description"
```

## CLI

```bash
node bin/cambric.js setup "My Product" "My description"
node bin/cambric.js doctor
node bin/cambric.js build
node bin/cambric.js version
npm run dev
npm run verify
```

## Structure

- `config/` contains centralized configuration.
- `index/` contains the website homepage and browser assets.
- `services/` contains local-first web services.
- `security/` contains safe validation and secret scanning.
- `scripts/` contains setup, doctor, and build tooling.
- `tests/` contains automated verification.
- `scripts/serve.js` provides a dependency-free local website preview.
- `scripts/verify.js` runs tests, diagnostics, and a clean build in one command.

## Production notes

- The website is designed to run without requiring a mandatory backend.
- Optional service integrations are isolated and removable.
- Secrets are never committed to the repository.
- Cache metadata is stored locally with explicit validity checks.

## Testing and validation

```bash
npm test
npm run test:browser
npm run doctor
npm run build
npm run verify
```
