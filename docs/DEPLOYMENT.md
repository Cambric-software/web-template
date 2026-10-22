# Deployment

How to publish the site.

---

## Build

```bash
npm run verify
```

This runs the doctor, the Node tests and the build. The output is `dist/`: a
copy of `index/` with the same relative paths. Nothing is rewritten or minified,
so what you tested in `npm run dev` is what ships.

Publish the contents of `dist/`, not the repository root. `index/` is the source
and `scripts/`, `tests/` and `docs/` are not part of the site.

---

## GitHub Pages

The included `.github/workflows/deploy.yml` deploys on every push to `main`.

1. Open the repository's **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Push to `main`, or run the workflow manually.

The workflow verifies the project, uploads `dist/` and deploys it. It needs the
`pages: write` and `id-token: write` permissions already declared in the file.

### Custom domain

Put a `CNAME` file inside `index/` containing the domain. The build copies it to
`dist/`, which is where GitHub Pages expects it. Set the same domain under
**Settings → Pages → Custom domain**.

If the site lives under a subpath (`https://example.com/product/`), keep the
relative paths. Every local link and asset begins with `./`, so a subpath works
without a base tag.

---

## Any static host

Netlify, Cloudflare Pages, Vercel and a plain object store all work:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 18 or newer |

A host that serves a 404 page should point its not-found rule at
`/404.html`. GitHub Pages does this automatically.

---

## Caching

The build output is not fingerprinted, so do not give HTML a long cache. A
practical policy:

- `index.html`, `components.html`, `404.html`, `config.json`: `no-cache` or a
  few minutes.
- `css/`, `js/`, `assets/`: a short cache (minutes to hours), or add your own
  content hash if you need a year.
- `service-worker.js`: `no-cache`. A long-cached service worker can pin an old
  shell for days.

The included dev server sends `Cache-Control: no-store` so it never lies during
development.

---

## Service worker

The service worker is registered on HTTP and HTTPS, not on `file://`. It caches
the shell listed in `index/service-worker.js`. When you add a file that the
offline page needs, add it to `SHELL` and bump `CACHE_NAME`; the old cache is
deleted on activation.

A deploy is not visible to a returning visitor until the new worker activates.
That is normal for a cache-first shell. If you need immediate updates, change
the strategy in `service-worker.js` deliberately and test it.

---

## HTTPS

Required for the service worker and for any form endpoint. GitHub Pages and the
static hosts above provide it. Do not add `http://` endpoints to a template that
otherwise makes no external requests.
