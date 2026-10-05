# Security Policy

## Overview

The Cambric web template is designed with privacy and security as first-class concerns. This document describes the security model, built-in protections, and how to report vulnerabilities.

---

## Local-First Design

This template operates as a **local-first** application. All core functionality runs in the browser with no mandatory backend server. No user data is sent to external services unless you explicitly add an integration.

- No telemetry is collected by default.
- No analytics scripts are bundled.
- No mandatory third-party API calls are made.
- Any optional backend integration is isolated in `services/` and clearly documented.

---

## No Mandatory Backend or Telemetry

The template ships with zero backend dependencies. There is no tracking pixel, no beacon, no error reporting service, and no A/B testing framework. If you add such services, document them and obtain appropriate user consent.

---

## Content Security Policy

The `index/index.html` file includes a `Content-Security-Policy` meta tag that restricts:

- Script sources to `'self'`
- Style sources to `'self'`
- Object and frame sources blocked

Review and tighten the CSP when deploying to production. If you serve the site via a web server (e.g., nginx, Caddy, GitHub Pages with a custom header file), prefer HTTP-header-based CSP over the meta tag.

---

## Secret Scanning in CI

The CI pipeline (`security.yml` and `ci.yml`) performs automated secret scanning on every push and pull request:

- Searches for PEM private-key headers (`BEGIN RSA PRIVATE KEY`, `BEGIN OPENSSH PRIVATE KEY`, etc.)
- Searches for common API key patterns (e.g., OpenAI `sk-` keys)
- Scans are run before any build or deploy step

Additional scanning can be added via `security/secret-scan.ps1` for local use on Windows.

---

## No Hardcoded Credentials Policy

**No secrets, API keys, tokens, or passwords may be committed to this repository.**

- Use environment variables or a secrets manager for any credentials required at build or runtime.
- GitHub Actions secrets (`Settings → Secrets and variables → Actions`) are the correct mechanism for CI credentials.
- The `.gitignore` excludes `.env` files and common secret file patterns.

Violations are caught by the CI secret-scanning job. If a secret is accidentally committed, rotate it immediately and use `git filter-repo` to purge the history.

---

## localStorage Safety

User data persisted by this template uses `services/storage.js`, which provides:

- **Namespace isolation**: all keys are prefixed with the application namespace (e.g., `cambric_`) to avoid collisions with other scripts or libraries on the same origin.
- **No sensitive data by default**: the template stores only UI preferences and cache metadata, never credentials or PII.
- **Graceful fallback**: storage writes are wrapped in try/catch so storage quota errors do not break the application.

When extending the template, avoid storing passwords, tokens, or personal information in localStorage. Use a secure, HttpOnly cookie or a backend session for anything sensitive.

---

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest  | ✅        |
| Older   | ❌        |

Only the latest release on `main` receives security fixes.

---

## Reporting Vulnerabilities

If you discover a security vulnerability in this template, please **do not open a public GitHub issue**.

Instead, report it privately:

- **Email**: security@cambric.dev
- **GitHub**: Use the [private security advisory](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) feature in this repository.

Please include:
1. A description of the vulnerability
2. Steps to reproduce or a proof-of-concept
3. The potential impact

We aim to acknowledge reports within 72 hours and provide a fix or mitigation plan within 14 days for critical issues.
