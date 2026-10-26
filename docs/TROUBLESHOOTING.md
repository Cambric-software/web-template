# Troubleshooting

Common problems, with the actual cause.

---

## The page is unstyled or a link is broken

Open the browser console. The usual cause is an absolute path (`/css/main.css`)
or a path that assumes the old layout (`./index/css/main.css`). Every local link
must be relative to the page and start with `./`.

Run:

```bash
npm run doctor
```

It reports every local `href`/`src` whose target does not exist. The Node tests
run the same check.

---

## The version chip says `unknown`

The page fetches `./config.json`. It fails when:

- you opened `index/index.html` with `file://` (browsers block the fetch),
- the file is missing or is not valid JSON,
- the site is served from a path where `config.json` was not copied.

Use `npm run dev` and check that `index/config.json` parses. The version is not
hard-coded anywhere else on purpose, so a failed fetch is visible instead of
showing a stale number.

---

## `npm run dev` says the port is in use

Set a different port:

```bash
# PowerShell
$env:PORT=4174; npm run dev

# bash
PORT=4174 npm run dev
```

The Playwright config expects 4173; change `baseURL`/`PORT` together if you make
this permanent.

---

## The form says nothing was sent

That is correct. The contact form validates in the browser and stops; it has no
endpoint. Sending is a product decision, and the template does not pretend to do
it.

To connect one, replace the final block in `site.js` that sets the success
status with a `fetch` to your endpoint, keep the validation, and update the copy
and `SECURITY.md` to say what is sent and where.

---

## Arabic is left-to-right, or the layout scrolls sideways

The language toggle sets `lang` and `dir` on `<html>` and stores the choice.
Do not set `dir` on a nested element, and do not position elements at
`left: -9999px`; in RTL that creates a huge horizontal scroll area. The skip link
uses a vertical transform for this reason.

If a page is stuck in Arabic, clear `cambric:language` in `localStorage`.

---

## Service worker serves an old page

The shell is cache-first. Clear it:

1. DevTools → **Application → Storage → Clear site data**, or
2. DevTools → **Application → Service Workers → Unregister**, then reload.

For a permanent change, bump `CACHE_NAME` in `index/service-worker.js` and add
any new file to `SHELL`. A missing entry makes `install` fail, which leaves the
old worker in control; the Node test checks every entry exists.

---

## GitHub Pages deploys, but the site is stale

- Hard reload (`Ctrl + Shift + R`, `Cmd + Shift + R`) to bypass the browser
  cache.
- Check that Pages is set to **GitHub Actions**, not a branch.
- Open the workflow log and confirm it uploaded `dist/`, not the repository root.
- A new service worker does not take control until the old tab is closed; test
  in a private window.

CDN propagation can take a few minutes.

---

## Playwright cannot find Chromium

```bash
npx playwright install chromium
```

On Linux CI, use `npx playwright install --with-deps chromium`. The included
workflow does this.

---

## `npm ci` fails

The lockfile must match `package.json`. Run `npm install` once, commit the
updated `package-lock.json`, and use `npm ci` everywhere else. Do not delete the
lockfile to make CI pass.

---

## The doctor fails on versions

`index/config.json`, `cambric.manifest.json` and `package.json` must carry the
same version. Edit all three. This is deliberate: three sources that can drift
are worse than three edits that cannot be skipped silently.
