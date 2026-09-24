# Development guide

## Prerequisites

- Node.js 18 or newer
- A modern browser for local testing
- Optional: PowerShell for the Windows setup and validation scripts

## Local validation

```bash
npm test
npm run doctor
npm run build
```

## Local-first workflow

1. Update the product identity in the config files.
2. Run the project initializer if creating a new product.
3. Verify the homepage, responsive layout, and offline status behavior in a browser.
4. Validate the cache and offline behavior after changes.
5. Run security checks and CI validation before publishing the website.
