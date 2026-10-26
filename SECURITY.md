# Security Policy

## Model

The web template is a static site. There is no server, no account system, no
telemetry and no analytics. The browser loads files from the same origin and
nothing else by default.

- No user data leaves the page.
- The only persisted values are the theme and language choices, under the
  `cambric:theme` and `cambric:language` keys in `localStorage`.
- The contact form validates locally and does not send its contents. A product
  that adds a backend must document what it sends and obtain consent where the
  law requires it.

## Content Security Policy

Every page sets a CSP in a `<meta>` tag:

```text
default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self';
connect-src 'self'; worker-src 'self'; manifest-src 'self'
```

This is why there are no inline scripts or inline styles in the pages. The theme
is applied by `js/theme.js` before paint rather than an inline snippet. When you
deploy behind a server you control, prefer the same policy as an HTTP header and
remove the meta tag; headers cannot be stripped by a browser extension as easily.

If you add a third-party script, you must widen `script-src` and accept that the
"no external requests" property no longer holds. Do not widen it silently.

## Secrets

No credentials belong in this repository. The `Security` workflow runs on every
push and pull request and fails on:

- PEM private-key headers (`BEGIN RSA/OPENSSH/EC/DSA PRIVATE KEY`), and
- strings matching `sk-[A-Za-z0-9]{20,}`.

It also runs `npm audit --audit-level=high` and repeats the secret scan weekly.

If a secret is committed, rotate it first, then remove it from history with
`git filter-repo`. Deleting the file in a new commit does not remove it from the
repository.

## Reporting a vulnerability

Do not open a public issue. Use the repository's private security advisory
("Security" → "Advisories" → "Report a vulnerability") or email
security@cambric.dev.

Include the affected page, the steps to reproduce and the impact. We aim to
acknowledge within 72 hours and to ship a fix or mitigation plan within 14 days
for critical issues.

## Supported versions

Only the latest commit on `main` is supported.
