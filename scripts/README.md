# Scripts

Developer CLI commands for the Cambric web template.

---

## Commands

### `node scripts/setup.js`
Interactive setup wizard. Prompts for product name, description, and optional folder rename, then updates the project identity, website metadata, and manifest fields.

```bash
node scripts/setup.js
# or with arguments
node scripts/setup.js "My Website" "A privacy-first website"
```

---

### `node scripts/doctor.js`
Environment check. Verifies that Node.js, npm, and all required project files are present and configured correctly. Prints a diagnostic report.

```bash
node scripts/doctor.js
```

---

### `node scripts/serve.js`
Dependency-free local preview server. Serves the website from `index/` on `http://localhost:3000`. No build step required — changes to source files are reflected on the next browser reload.

```bash
node scripts/serve.js
# Change port with PORT env var
PORT=3001 node scripts/serve.js
```

---

### `node scripts/build.js`
Builds the website to `dist/`. Copies all source files into the output directory, ready for deployment to GitHub Pages or any static host.

```bash
node scripts/build.js
```

Output is written to `dist/`. The directory is recreated on each build.

---

### `node scripts/verify.js`
Runs the full quality pipeline in one command: Node.js tests, diagnostics, and a clean build. Use this before committing or pushing.

```bash
node scripts/verify.js
# or via npm
npm run verify
```

---

### `npm test`
Runs all Node.js unit tests using the built-in test runner (no external test framework required).

```bash
npm test
```

Tests are located in `tests/`. Currently includes:
- `tests/basic.test.js` — JavaScript environment sanity check
- `tests/cambric-core.test.js` — core service tests

---

### `npm run test:browser`
Runs end-to-end browser tests using [Playwright](https://playwright.dev). Requires Playwright to be installed:

```bash
npx playwright install --with-deps chromium
npm run test:browser
```

Tests are located in `tests/browser/`.

---

### `node bin/cambric.js`
Unified CLI entry point. Delegates to the appropriate script based on the subcommand.

```bash
node bin/cambric.js setup          # run setup wizard
node bin/cambric.js doctor         # run environment check
node bin/cambric.js build          # build to dist/
node bin/cambric.js version        # print template version
node bin/cambric.js help           # list available commands
```

---

## npm script aliases

| npm command         | Equivalent                          |
|---------------------|-------------------------------------|
| `npm test`          | `node tests/basic.test.js && node tests/cambric-core.test.js` |
| `npm run dev`       | `node scripts/serve.js`             |
| `npm run build`     | `node scripts/build.js`             |
| `npm run verify`    | `node scripts/verify.js`            |
| `npm run doctor`    | `node scripts/doctor.js`            |
| `npm run test:browser` | `npx playwright test`            |
