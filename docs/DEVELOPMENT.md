# Development

How to edit, test and extend the web template.

---

## Prerequisites

- Node.js 18 or newer.
- npm (included with Node).
- Optional: a Chromium browser for the Playwright tests.

No global CLI is required. The template has no runtime dependencies.

---

## Commands

```bash
npm ci               # install the test tooling
npm run dev          # serve index/ at http://localhost:4173
npm run doctor       # required files, JSON, versions and local links
npm test             # Node tests
npm run test:browser # Playwright + axe (needs Chromium)
npm run lint         # node --check on every JavaScript file
npm run build        # copy index/ to dist/
npm run verify       # doctor + tests + build
```

`npm run dev` serves `index/` directly. There is no watch step and no bundler:
save a file, refresh the page.

The first browser-test run may need the browser binary:

```bash
npx playwright install chromium
```

---

## Where things live

| What | Where |
|---|---|
| Pages | `index/*.html` |
| Tokens and components | `index/css/main.css` |
| Behaviour | `index/js/site.js` |
| Theme before paint | `index/js/theme.js` |
| Product identity | `index/config.json` |
| Offline shell | `index/service-worker.js` |
| Build and checks | `scripts/` |
| Tests | `tests/site.test.js`, `tests/browser/` |

The site is self-contained. A page must not depend on a file outside `index/`,
because `dist/` is a copy of that folder.

---

## Adding a page

1. Copy the header and footer from `index/index.html`.
2. Keep the CSP meta tag and the two scripts: `js/theme.js` in `<head>` and
   `js/site.js` at the end of `<body>`.
3. Link the stylesheet with `./css/main.css`.
4. Add the page to the doctor's `REQUIRED`/`PAGES` lists only if it is part of
   the template's contract; otherwise the link checker still checks the links on
   existing pages.
5. Add it to `SHELL` in the service worker if it must work offline.

Use relative paths (`./`, `./css/...`, `./components.html`). Do not use a leading
slash: it breaks the site under a subpath and hides errors during local preview.

---

## Adding a component

1. Add the class to `index/css/main.css` using the tokens. Do not introduce a
   new colour literal outside the token block.
2. Add an example to `index/components.html`.
3. If the component needs behaviour, keep it in `site.js` behind a `data-`
   attribute; there is no framework.
4. Check it in light and dark, English and Arabic, at 390 px and 1440 px.

No inline `<style>` or `<script>`: the CSP allows only same-origin files. If you
need a page-specific rule, add a class rather than an inline style.

---

## Identity and versions

`index/config.json` is the runtime identity. `cambric.manifest.json` and
`package.json` carry the same version for tooling. The doctor fails when the
three disagree, and the page shows `unknown` if the config cannot be fetched.

Rename the template by editing those three files and the copy in the pages. There
is no setup script; three edits are easier to audit than a generator.

---

## Tests

`tests/site.test.js` checks the contract:

- required files exist and JSON parses,
- the three version sources match,
- every local `href`/`src` resolves,
- one theme and one language toggle per page,
- the 404 page does not redirect,
- `site.js` has no hard-coded version,
- every service-worker `SHELL` entry exists,
- the token block still contains the shared values.

`tests/browser/website.spec.js` checks the behaviour in Chromium desktop and
mobile: identity, theme persistence, Arabic/RTL, form validation, 404 handling
and axe. The axe assertion is strict; fix the contrast rather than disabling the
rule.

Run both before a pull request:

```bash
npm run verify
npm run test:browser
```

---

## Code style

- Four spaces in HTML, CSS and JavaScript.
- Single quotes in JavaScript, semicolons, `const`/`let`.
- Sentence case in copy; no exclamation marks.
- Comments explain why, not what.
- No generated files in git: `dist/`, `node_modules/`, `test-results/`.

See `docs/DESIGN.md` before changing a visual value.
