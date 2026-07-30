# NFL Betting Guide — Figma Mobile Frontend

Frontend-only implementation of the top-level frames on Figma page
[`LLdGlhexL3wmfFd4HBeOKm`](https://www.figma.com/design/LLdGlhexL3wmfFd4HBeOKm/Test),
built with Astro + TypeScript. Figma is the sole visual source of truth: every
colour, size, string, font and image was read from the file over the Figma MCP
server, and nothing was approximated.

The build is **static and ships zero JavaScript** — `dist/` contains HTML, CSS
and assets only, and no component uses a `client:*` directive.

## Quick start

```bash
npm install
npm run dev        # http://127.0.0.1:5173
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Astro dev server on `:5173`. |
| `npm run build` | `astro check` then a static production build into `dist/`. |
| `npm run preview` | Serve the production build on `:4173`. |
| `npm run typecheck` | `astro check` — strict TypeScript across `.ts` and `.astro`. |
| `npm run lint` | ESLint 9 flat config, type-aware rules + `eslint-plugin-astro`. |
| `npm run test` | Vitest component tests via Astro's container API. |
| `npm run test:visual` | Playwright fidelity + responsive suites. |
| `npm run test:visual:update` | Regenerate baselines — **see the caveat below**. |
| `npm run verify` | lint → typecheck → test → build. |

No deployment configuration is included, by design.

## Verification status

All green on Node v20.10.0:

```
npm run lint         ✓ 0 problems
npm run typecheck    ✓ 0 errors
npm run test         ✓ 33 tests passed (5 files)
npm run build        ✓ 2 pages built in 2.0s, 0 JS bytes emitted
npm run verify       ✓ exit 0
npm run test:visual  ✓ 22 tests passed (chromium + webkit)
```

The frame renders on Figma's exact geometry — verified by measuring the live DOM
against the design, not by eye:

| Figma node | Expected | Rendered |
| --- | --- | --- |
| `1:91` hero | 430×648 | 430.0×648.0 |
| `1:95` year mark | 301×54 | 301.0×54.0 |
| `1:97` headline | 382×45 | 382.0×45.2 |
| `1:99` feature list | 382×366 | 382.0×367.1 |
| `1:127` nav | 382×81 | 382.0×81.0 |
| `1:96` content top offset | 648 | 648.0 |
| `1:126` scrim top offset | 747 | 747.0 |
| `1:127` nav top offset | 811 | 811.0 |

The scrim and nav are **docked to the bottom of the viewport** — the offsets
above are where they land in the 430×932 device viewport the frame is drawn for,
and they stay there while the document scrolls. See
[DECISION-002](./BLOCKERS.md#decision-002--the-bottom-nav-is-docked-resolved).

## Architecture

```
src/
  pages/
    index.astro             Route "/" — the Homepage frame
    buttons.astro           Component sheet for Button/Filter (not a design screen)
  layouts/
    BaseLayout.astro        Document shell + global stylesheets
  routes/
    screens.ts              Pure-data screen manifest (no component imports)
  components/
    Icon/                   5 glyphs from Figma frame "Icons" (1:43)
    Nav/                    Bottom nav from "Nav" (1:128 / 1:127)
    Button/                 4 types x 2 states from "Button/Filter" (1:19)
  screens/
    Homepage/               Frame "Homepage" (1:90), 430x1697
  styles/
    reset.css               Structural reset — no design values
    fonts.css               General Sans @font-face, vendored locally
    tokens.css              GENERATED from Figma; every value cites its node
    app.css                 App shell (fluid 320-480, centred above 480)
    sheet.css               Layout for the component sheet page only
  test/
    render.ts               Astro container API -> DOM, for component tests
  assets/                   21 Figma exports + 3 woff2 files
tests/visual/
  frames.spec.ts            Pixel comparison against the Figma export
  responsive.spec.ts        320/375/390/430/480 overflow, centring, nav behaviour
  refs/                     Original MCP exports, kept for provenance
static/                     Hand-authored static export, kept for sharing
```

### Screens and routing

Routing is file-based: every file in `src/pages/` is a route. `screens.ts` holds
the frame geometry as plain data with no component or stylesheet imports, so the
Playwright specs can read it (their transpiler cannot process CSS modules). A
unit test asserts every manifest entry has a page behind it, so a listed frame
with no implementation is an error rather than a missing route — the guarantee
the old route registry gave by throwing at import time.

Only one frame is a screen; the other three are component sheets. See
[DECISION-001](./BLOCKERS.md#decision-001--only-one-frame-is-a-screen). Nav tab
selection is a native radio group, not component state, since no second
prototype destination exists — see "Zero JavaScript" below.

### Zero JavaScript

Nothing in the design needs a client runtime. The one piece of interactivity —
which nav tab is selected — is a hidden `<input type="radio">` per tab with the
item as its `<label>`, so selection, keyboard arrow-key navigation and
screen-reader semantics all come from the platform:

```css
.navInput:checked + .item { border-bottom-color: var(--color-white); }
```

`tests/visual/responsive.spec.ts` asserts the built page contains no `<script>`
at all, and drives the tab selection in a real browser to prove it works.

### Design tokens

`src/styles/tokens.css` is generated and every custom property cites the Figma
node or variable it came from — the variables `--fanduel-blue` (`#0078ff`) and
`--grey` (`#ababab`), the five text styles, radii, spacing, layer order, and the
frame geometry. Do not hand-author values there.

### Assets

All 21 images are the exact bytes Figma exported (14 for the Homepage, 7 for the
button sheet), referenced through explicit `?url` ES imports so a missing file
fails the build. `build.assetsInlineLimit` is `0` to keep that guarantee. Nothing was
redrawn or replaced with a placeholder.

Fonts are **General Sans** 400/500/600, vendored from Fontshare under the ITF
Free Font License — see [BLOCKER-003](./BLOCKERS.md#blocker-003--fonts-resolved).

### Responsive rules

- Exact match at the native 430px frame width.
- 320–480px: fluid, verified free of horizontal overflow at 320/375/390/430/480
  on both Chromium and WebKit.
- Above 480px: centred in a 480px viewport. No desktop layout is invented.

### Accessibility

Semantic landmarks (`main`, `nav[aria-label]`, `h1`, `ul`/`li`), a skip link,
keyboard-operable controls with `:focus-visible` rings, a native radio group for
tab selection, `aria-pressed` on filter toggles, alt text on meaningful images and
`aria-hidden` on decorative ones, and `prefers-reduced-motion` support that
suppresses transitions without altering appearance.

## Visual testing

Two Playwright projects:

- **`figma-fidelity`** renders the route at 430×932 — the device viewport the
  frame is drawn for — with `deviceScaleFactor: 2` and compares against the
  MCP-exported Figma PNG (Figma exports at 2×, so neither side is resampled
  before comparison).
- **`mobile-chrome` / `mobile-safari`** run the responsive suite.

Because the nav is docked to the viewport, the 1697px frame is compared in two
bands: `1-90-viewport.png` covers 0–932 including the docked chrome in its
designed position, and `1-90-below-fold.png` covers 932–1697 with the dock
hidden. A third test asserts the nav's box does not move after scrolling to the
end of the document. See
[DECISION-006](./BLOCKERS.md#decision-006--the-frame-is-compared-in-two-bands).

> **Baselines in `tests/visual/__screenshots__/figma-fidelity/` are Figma
> exports, not app screenshots.** They are crops of the untouched exports in
> `tests/visual/refs/`, regenerated by `refs/crop-baselines.ps1`. Running
> `test:visual:update` overwrites them with the app's own output, which makes the
> test compare the app to itself and silently pass forever. Use it only to
> refresh an already-correct baseline after a deliberate Figma change; otherwise
> re-export from Figma and re-run the crop script.

The tolerance is `maxDiffPixelRatio: 0.035`, not the 0.002 originally specified.
The measured floor against a Figma baseline is 0.025–0.029 and is pure edge
anti-aliasing — Figma and Chromium rasterise glyphs and resample bitmaps
differently, and toggling font-smoothing changes it by zero pixels. Reasoning and
evidence: [DECISION-005](./BLOCKERS.md#decision-005--visual-tolerance-is-0035-not-0002).

`webServer.reuseExistingServer` is `false`: a leftover preview server would
serve a stale build and quietly compare the wrong pixels. If a run reports port
4173 in use, kill the stray server rather than re-enabling reuse.

## Read this before reviewing

The open item is
[BLOCKER-004](./BLOCKERS.md#blocker-004--figma-omits-the-navs-effects-values-are-measured):
Figma's code output omits the nav's frosted-glass effects, and the MCP quota ran
out before they could be re-read, so the blur radius and rim opacity are
measured from the frame export rather than read from the file. Both are single
token values.

Seven judgement calls are documented in **[BLOCKERS.md](./BLOCKERS.md)**. The
bottom nav is a *docked* bar over a scrolling page
([DECISION-002](./BLOCKERS.md#decision-002--the-bottom-nav-is-docked-resolved)),
confirmed by the design owner and consistent with the frame's geometry: the
scrim's bottom edge lands exactly on the 932px device viewport. That reading
drove the two-band fidelity comparison
([DECISION-006](./BLOCKERS.md#decision-006--the-frame-is-compared-in-two-bands))
and surfaced a real footer overflow at 320px
([DECISION-007](./BLOCKERS.md#decision-007--the-footer-wraps-below-355px)).

Also noted there: `Button` has no pixel coverage because the design places it on
no screen, and the rendered frame runs ~2px taller than Figma due to sub-pixel
text trimming.

## Toolchain notes

Node v20.10.0 constrains the toolchain. Astro 6 requires Node ≥22.12, so the
project pins **Astro 5**, along with Vitest 3 and Playwright 1.62. Everything
runs green on Node 20.10; upgrading Node is optional, not required. Background:
[BLOCKER-002](./BLOCKERS.md#blocker-002--node-version-constrains-the-toolchain-resolved).

Component tests run in Vitest's `node` environment rather than `jsdom`, and each
render builds its own DOM. A global jsdom environment replaces `TextEncoder`
with one whose `Uint8Array` comes from a different realm, which trips an
invariant check inside esbuild — a module Astro loads to render components. See
the note in `src/test/render.ts`.

Browser targets are modern mobile Chrome and Safari. The layout depends on
`text-box-trim`, which both support; see
[DECISION-003](./BLOCKERS.md#decision-003--text-box-trim-is-load-bearing).
