# Troubleshooting

Common issues and fixes for the Cambric web template.

---

## GitHub Pages not updating after deploy

**Symptom:** You pushed to `main` and the deploy workflow succeeded, but the live site still shows the old version.

**Cause:** Browser cache.

**Fix:** Do a hard reload to bypass the cache:
- **Windows / Linux**: `Ctrl + Shift + R`
- **macOS**: `Cmd + Shift + R`

If the site still shows the old version after a hard reload, wait a few minutes — GitHub Pages CDN propagation can take up to 10 minutes. You can also open the site in an incognito/private window to rule out a local cache issue.

---

## Service worker caching old version

**Symptom:** You deployed a new version but users (or you) still see old content even after a hard reload. The browser DevTools Network tab shows responses served from `ServiceWorker`.

**Fix:** Clear site data for the origin:
1. Open DevTools (`F12`)
2. Go to **Application → Storage**
3. Click **Clear site data**

Alternatively, unregister the service worker:
1. Go to **Application → Service Workers**
2. Click **Unregister**
3. Reload the page

The updated `service-worker.js` uses a versioned cache key. Bumping the cache version in `index/service-worker.js` will force all clients to update on next load.

---

## `node scripts/serve.js` — port already in use

**Symptom:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Fix:** Another process is using port 3000. Options:

1. Kill the existing process:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <pid> /F

   # macOS / Linux
   lsof -ti :3000 | xargs kill
   ```

2. Start the server on a different port:
   ```bash
   PORT=3001 node scripts/serve.js
   ```

---

## Browser test failures — Playwright not installed

**Symptom:**
```
Error: browserType.launch: Executable doesn't exist at ...
```
or
```
Cannot find module '@playwright/test'
```

**Fix:** Install Playwright and its browser binaries:
```bash
npm ci
npx playwright install --with-deps chromium
```

If you only need Chromium (the default), `--with-deps chromium` is faster than installing all browsers.

---

## `npm ci` fails

**Symptom:**
```
npm error The `npm ci` command can only install with an existing package-lock.json
```
or dependency resolution errors after pulling changes.

**Fix:** Delete the lock file and `node_modules`, then reinstall:
```bash
# Windows
rd /s /q node_modules
del package-lock.json
npm install

# macOS / Linux
rm -rf node_modules package-lock.json
npm install
```

Then commit the regenerated `package-lock.json`.

---

## Arabic text not displaying RTL correctly

**Symptom:** Arabic content renders left-to-right, text is misaligned, or punctuation appears on the wrong side.

**Fix:** Make sure `CambricI18n.setLanguage('ar')` is called before rendering Arabic content. This call sets `dir="rtl"` and `lang="ar"` on the `<html>` element.

```js
// In your app initialisation
import { CambricI18n } from './services/i18n.js';

CambricI18n.setLanguage('ar');
```

Also verify that:
- The font loaded supports Arabic glyphs.
- CSS does not hard-code `direction: ltr` or `text-align: left` on affected elements.
- The `lang` attribute on `<html>` is `ar` after the call (check in DevTools → Elements).

---

## Contact form always shows a validation error

**Symptom:** Submitting the contact form always produces a validation error message, even with valid input.

**Explanation:** This is **intentional**. The contact form in `services/forms.js` is a local-first demo component. It validates input client-side but does not submit data to any backend. The validation error demonstrates the error-state UI.

To wire the form to a real backend:
1. Replace the `handleSubmit` logic in `services/forms.js` with a `fetch` call to your endpoint.
2. Remove the demo validation guard.
3. Add CSRF protection if your backend requires it.
