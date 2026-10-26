# Cambric web design system

This is the web template's copy of the Cambric interface standard. The app
template carries the same family in `app-template/docs/DESIGN.md`. If a value
changes here, change it there in the same pass.

The code is the authority: the tokens are at the top of `index/css/main.css`
and the components are demonstrated in `index/components.html`.

## Colour

| Role | Light | Dark |
|---|---|---|
| Page background | `#F6F7FB` | `#0E1015` |
| Card surface | `#FFFFFF` | `#171A22` |
| Raised (inputs, nested panels) | `#F0F2F7` | `#1E222C` |
| Hairline / border | `#E0E3EC` | `#2A2F3B` |
| Primary text | `#171A22` | `#E8EAF0` |
| Secondary text | `#5C6474` | `#9AA3B5` |
| Accent (fills, focus) | `#3F6FE0` | `#5B8CFF` |
| Accent text | `#2F5FCC` | `#7DA2FF` |
| Accent 2 | `#6A44E0` | `#7C5BFF` |
| Success | `#0F6B4C` | `#43C79A` |
| Warning | `#8A5200` | `#E8A33C` |
| Danger | `#C63A34` | `#F0736B` |

Two values differ from the app tokens on purpose:

- **Accent text** is darker than the accent fill in the light theme. White text
  on `#3F6FE0` meets AA, but `#3F6FE0` as small text on `#F6F7FB` does not
  (4.33:1). Links, eyebrows and numbers use `--accent-text`; fills use
  `--accent`.
- **Warning text** is darker than the app's `#B26A00` so 12.5 px status text
  passes AA on the tinted status background.

Colour is never the only signal. Every status also has a word, and the status
pill includes a dot only as a secondary cue.

## Surfaces

Cards are opaque with a one-pixel border and a soft shadow. Glass and blur are a
product decision, not the template default: the Digital Saver download page uses
glass deliberately, and every other Cambric page does not.

## Radii

| Use | Radius |
|---|---:|
| Chip, tag | 6 |
| Input | 8 |
| Button | 11 |
| Card | 14 |
| Code block | 10 |
| Pill, status | 999 |

## Type

| Role | Size | Weight |
|---|---:|---:|
| Hero | `clamp(40px, 7vw, 62px)` | 700 |
| Section heading | `clamp(24px, 3.4vw, 32px)` | 700 |
| Card title | 18px | 600 |
| Body | 15px | 400 |
| Lead | 19px | 400 |
| Caption | 12.5px | 600 |
| Code | 13px | 400 |

The stack is Inter if installed, then Segoe UI and the system UI font. The
template makes no external font request. Numbers use tabular figures.

## Spacing and layout

Spacing is `4, 8, 12, 16, 20, 24, 32, 48, 56, 72`; `16` is the default gap and
`56` the space between sections. The container is 1080 px with 20 px side
padding. The page is checked at 390 px and 1440 px.

Cards use `grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))`.
Below 900 px a split section becomes one column; below 720 px the navigation
moves to its own row.

## Components

| Class | Job |
|---|---|
| `.button` `.primary` `.ghost` `.small` | Actions. A disabled button states why it is disabled. |
| `.card` | One idea. Opaque surface, hairline border, radius 14. |
| `.chip` | A short label or version. |
| `.status` | A status word with a dot; `data-state` picks the colour. |
| `.form` | Labels above fields, error text under the field, `aria-invalid` on failure. |
| `.empty-state` | Says what would appear and how to make it appear. |
| `.code` | A command or sample. |
| `.steps` | Numbered guidance with a top rule per step. |

Rules:

1. One idea per card; two headings means two cards.
2. A button says what happens, not what it is.
3. A disabled control explains itself in visible text.
4. Every form field has a visible `<label>` and an error node referenced by
   `aria-describedby`.
5. Destructive actions are danger-coloured and name what they destroy.
6. No lorem ipsum and no invented data. The demo form says it does not send.

## Accessibility

- Body text meets AA; status text was darkened until it did.
- `:focus-visible` draws a 2 px accent outline with a 3 px offset.
- The skip link is fixed and translated off-screen vertically, not positioned at
  `left: -9999px`. Off-screen horizontal positioning creates a huge scroll area
  in right-to-left layouts.
- `prefers-reduced-motion` disables transitions and smooth scrolling.
- The language toggle sets `lang` and `dir` on `<html>`; it does not flip
  individual margins.
- Playwright runs axe on the home page in desktop and mobile Chromium.

## Download pages

An app's download page uses the same web palette and card shapes (see
`app-template/app/landing/`). It is a separate page because a download page is
read once and must stay stable, while the product site changes with the
product. Both share the tokens in this document.
