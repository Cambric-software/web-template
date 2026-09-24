# Deployment guide

## Static hosting

This template is designed for static hosting. It can be deployed to GitHub Pages, Netlify, Cloudflare Pages, or any static web host.

## Required files

- `index/index.html`
- `index/css/main.css`
- `index/service-worker.js`
- `config/cambric.config.json`
- `cambric.manifest.json`

## Deployment checklist

1. Validate the project locally.
2. In GitHub, open **Settings > Pages** and set **Source** to **GitHub Actions** once for the repository.
3. Confirm the website identity and version metadata.
4. Run the production build script.
5. Publish the generated static site.
6. Verify the homepage and offline shell work in the deployed environment.

## Notes

- The website does not require a server-side API for core functionality.
- Deployment should avoid exposing secrets or private configuration values.
- `dist/` is generated during validation/build and should not be committed as source. The Pages workflow creates its own deployable artifact from `index/`, `services/`, `config/`, and the product manifest.
- The workflow does not try to create the Pages site because the default `GITHUB_TOKEN` cannot grant repository administration access. Pages must be enabled once in repository settings before the workflow can deploy.
