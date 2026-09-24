# Development guide

## Prerequisites

- Node.js 18 or newer
- A modern browser for local testing
- Optional: PowerShell for the Windows setup and validation scripts

## Local validation

```bash
npm test
npm run test:browser
npm run doctor
npm run build
npm run verify
```

## Local preview

Build and serve the same `dist/` layout used by static hosting:

```bash
npm run dev
```

Then open `http://localhost:4173`. Set `PORT` to use another port.

## Local-first workflow

1. Update the product identity in the config files.
2. Run the project initializer if creating a new product.
3. Verify the homepage, responsive layout, and offline status behavior in a browser.
4. Validate the cache and offline behavior after changes.
5. Run security checks and CI validation before publishing the website.

Browser tests cover desktop and mobile Chromium, theme persistence, form validation, the component gallery, favicon loading, and critical accessibility violations.
