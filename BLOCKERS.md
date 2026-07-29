# Blockers and design decisions

Per the plan: *"Unsupported prototype actions or missing design information must
produce an implementation-time error or documented blocker, never a silent
fallback."* This file is that record.

---

## BLOCKER-001 — Figma design data unavailable (RESOLVED)

**Raised:** 2026-07-29 at scaffold time. **Resolved:** same day.

At scaffold time no Figma MCP server was configured, Figma desktop was not
installed, and no `FIGMA_*` token was present, so file `LLdGlhexL3wmfFd4HBeOKm`
could not be read. Nothing design-dependent was produced, and no values were
guessed.

Resolved by registering the remote server and authenticating:

```
claude mcp add --scope user --transport http figma https://mcp.figma.com/mcp
```

The concern that MCP access requires a paid Dev Mode seat did **not** apply: the
account (`afek.david@gmail.com`) holds a **Full** seat on a **starter** tier
plan, and all read tools work.

---

## BLOCKER-002 — Node version constrains the toolchain (RESOLVED)

Installed Node is **v20.10.0**. Vite 7 requires `^20.19.0 || >=22.12.0`, so the
project pins **Vite 6.x**.

Vitest is pinned to **3.x** rather than 2.x for a related reason: Vitest 2
depends on `vite-node`, which pins `vite@^5`, so npm installed a second nested
Vite. Two Vite copies produce irreconcilable structural type conflicts between
`vitest/config`'s `defineConfig` and `@vitejs/plugin-react`, breaking
`npm run typecheck`. Vitest 3 targets Vite 6 directly and deduplicates cleanly.

Playwright was upgraded to **1.62** because the design depends on `text-box-trim`
(see DECISION-003) and the Chromium bundled with 1.49 predates that feature.

One residual `EBADENGINE` warning remains from the transitive
`eslint-visitor-keys@5`, which wants Node ≥ 20.19. Warning only — lint passes.

---

## BLOCKER-003 — Fonts (RESOLVED)

The Figma text styles specify **General Sans** (Regular 400, Medium 500,
Semibold 600). The file identifies the family but does not ship the binaries.

The three weights are vendored from **Fontshare** (Indian Type Foundry, ITF Free
Font License) into `src/assets/fonts/` as woff2 and loaded via `@font-face` in
`src/styles/fonts.css`. All three are confirmed loading at runtime. No system
font substitution was used.

If the ITF Free Font License is unsuitable for your distribution, this is the one
third-party dependency to review.

---

## BLOCKER-004 — Figma omits the nav's effects; values are measured

**Raised:** 2026-07-29. **Open — the two values below need confirming.**

The nav is frosted glass in the design, but `get_design_context` returns this
for `1:127` and nothing else:

```
absolute bg-[rgba(0,0,0,0.1)] content-stretch flex items-center justify-between
left-[24px] px-[40px] rounded-[70px] top-[811px] w-[382px]
```

No `backdrop-blur`, no border — yet the 2× frame export plainly shows both: the
paragraph behind the bar is smeared while the same paragraph is sharp 1px above
it, and a hairline rim traces the whole 70px-radius outline. Figma's code
generator drops effects; the render is the ground truth.

A re-read would settle it, but the account's Figma MCP quota is exhausted
(*"tool call limit for your View seat on the Professional plan"*), so both
values are **measured from `tests/visual/refs/homepage-1-90.png`** instead of
read from the file:

| Token | Value | Derivation |
| --- | --- | --- |
| `--nav-backdrop-blur` | 3px | Compared the horizontal intensity spectrum of a sharp text line above the bar with a blurred one behind it, fitting `A·S(f)·exp(−2π²f²σ²) + noise`. Best fit σ = 6.5 export px = **3.25 CSS px** (Figma background blur ≈ 6). |
| `--nav-stroke` | `rgba(255,255,255,0.5)` at 0.5px | The rim is 1 export px wide — 0.5 CSS px — measured at (117,133,192) on the top edge, (86,103,161) on the bottom, (102,116,170) and (112,129,188) on the sides, over interiors of ≈(19,32,84). That is ≈50% white. |

Confidence: the blur fits the two lowest frequency bands within 4% and 8%; the
higher bands sit on the export's noise floor, so σ is good to roughly ±0.75px.
The rim's red and green channels match 50% white closely but its blue runs ~35%
high, so the real stroke is probably a touch bluer than pure white.

**To correct:** both live in `src/styles/tokens.css` next to `--surface-nav`.
Change the token values — no other file needs touching.

---

## DECISION-001 — Only one frame is a screen

The page holds four top-level frames. Only **Homepage (1:90, 430×1697)** is a
full screen. The other three are component definition sheets:

| Node | Name | Treatment |
| --- | --- | --- |
| `1:19` | Button/Filter | `src/components/Button` — 4 types × 2 states |
| `1:43` | Icons | `src/components/Icon` — 5 glyphs |
| `1:128` | Nav | `src/components/Nav` |

They are implemented as reusable components, not routes, because they are not
full-screen prototype destinations. The route registry therefore has exactly one
entry and no kebab-case secondary routes exist.

The Nav sheet also defines a **Type=Desktop** variant (`1:145`, 700×64). It is
not implemented: the plan scopes delivery to mobile and explicitly forbids
inventing a desktop layout above 480px.

---

## DECISION-002 — The bottom nav is docked (RESOLVED)

**Resolved 2026-07-29 by the design owner: the nav is a sticky bottom bar.**

In Figma the nav (`1:127`) sits at y=811 inside a 1697-tall frame, with a
gradient scrim (`1:126`) spanning y=747–932. Since 747 + 185 = **932**, and
430×932 is exactly an iPhone 14 Pro Max viewport, the frame draws viewport
chrome at its scroll-offset-0 position rather than content at document offset
811.

Implemented as a fixed dock in `src/screens/Homepage/Homepage.module.css`:

| Property | Value | Derivation |
| --- | --- | --- |
| `.navDock` height | 185px | scrim `1:126` height |
| `.navDock` bottom | 0 | scrim bottom edge 747 + 185 = 932 = viewport height |
| `.nav` bottom | 40px | 932 − (811 + 81) |
| `.navDock` width | 100%, max 480, min 320 | fixed elements resolve against the viewport, not the app shell, so the dock repeats the shell's constraint and centring |

The scrim carries `pointer-events: none` and the nav inside re-enables them, so
the gradient never swallows clicks on the content beneath it.

Content clears the bar without extra padding: the footer's bottom edge sits
147px above the end of the document (80px content padding + 67px frame tail)
against the bar's 121px occupied zone.

**Consequence for the fidelity suite.** A viewport-anchored bar renders at the
bottom of a full-page capture, not at 811, so the frame is now compared in two
bands — see DECISION-006.

---

## DECISION-003 — `text-box-trim` is load-bearing

The design's block heights only reconcile with cap-height trimming: the title
(`1:97`) is 45px for two 28px lines, and the nav is 81px only if its 13px label
trims to ~9px. The implementation therefore uses
`text-box-trim: trim-both; text-box-edge: cap alphabetic`.

Browsers without support ignore the declarations and fall back to standard
half-leading, which makes text blocks a few pixels taller. Both stated browser
targets (modern mobile Chrome and Safari) support it. This is why Playwright had
to be upgraded — an older bundled Chromium would have measured the page
differently from the design.

---

## DECISION-004 — Secondary Button states are inferred from colour

The Button/Filter sheet lays out Default in the left column and Active in the
right for every type — except the Secondary Button row, where Figma labels
**both** `1:20` and `1:23` as `State=Default`. Their only difference is colour:
`1:20` is grey (`--grey`), `1:23` is FanDuel blue.

Read as Default = grey, Active = blue, matching the column convention used by
every other row. Flagged rather than silently resolved: the variant name on
`1:23` looks like a mislabel in the source file.

---

## DECISION-005 — Visual tolerance is 0.035, not 0.002

The plan asked for "a small anti-aliasing tolerance". Against a Figma-exported
baseline the achievable floor is **0.025–0.029** — 39,210 of 1,603,040 pixels in
the first-viewport band and 38,007 of 1,315,800 below the fold — with layout
geometry landing on Figma's numbers exactly, verified by measurement:

```
1:91 hero   430.0x648.0  (figma 430x648)   1:96 content top = 648  (figma 648)
1:95 year   301.0x54.0   (figma 301x54)    1:126 scrim  top = 747  (figma 747)
1:99 cards  382.0x367.1  (figma 382x366)   1:127 nav    top = 811  (figma 811)
```

The residue is entirely edge anti-aliasing: Figma and Chromium rasterise glyphs
differently and resample the hero bitmap with different filters. Toggling
`-webkit-font-smoothing` changes it by **zero** pixels. 0.002 is not reachable by
any CSS change; the threshold is set to 0.035 and the measurement documented
here rather than quietly loosened.

---

## DECISION-006 — The frame is compared in two bands

Docking the nav (DECISION-002) made a single full-page comparison impossible:
viewport-anchored chrome renders at the bottom of a full-page capture, so the
one region where the app and the export must differ is exactly the region the
export draws at 747–932.

`tests/visual/frames.spec.ts` therefore compares two crops of the same export:

| Baseline | Region | What it proves |
| --- | --- | --- |
| `1-90-viewport.png` | 0–932 | hero, top of the content, scrim and nav in their designed positions |
| `1-90-below-fold.png` | 932–1697 | the document that scrolls beneath the chrome, with the dock hidden for the capture |

Both crops come from the untouched export in `tests/visual/refs/`;
`refs/crop-baselines.ps1` regenerates them and fails loudly if the export's
dimensions ever stop matching the manifest. A third test asserts the nav's box
is unchanged after scrolling to the end of the document, which is the behaviour
neither band can see.

---

## DECISION-007 — The footer wraps below ~355px

Removing a defensive `overflow-x: clip` from `.page` (added before the dock
existed) exposed a real overflow the clip had been hiding: the footer's two
groups measure 147px and 144px, which do not fit a 272px content box at 320px.
The document scrolled 11px wide.

The row now wraps, dropping the social group to a second right-aligned line
below ~355px. No design-fixed element is shrunk and nothing is clipped, which
the plan requires across 320–480px; at 430px the layout is byte-identical to the
design. The responsive suite covers this at every breakpoint and is now
measuring the real document width rather than a clipped one.

---

## KNOWN GAP — Button has no pixel coverage

`src/components/Button` is fully implemented and unit-tested, but the Figma page
places no button on any screen, so it appears in no route and the fidelity suite
cannot exercise it. Its geometry is transcribed from the sheet's specs rather
than verified against a render. Adding a component gallery route would fix this,
but that route does not exist in Figma and inventing one is out of scope.

---

## KNOWN GAP — Frame is ~2px taller than Figma

The rendered document is 1699.3px against Figma's 1697px. Each text block
overshoots by 0.2–0.5px because the browser's text-box trimming rounds slightly
differently from Figma; four blocks accumulate to +2.3px.

Pinning `.content` to Figma's fixed 982px height would remove it but would clip
text below 430px, breaking the 320–480px fluid requirement. The auto height is
kept and the fidelity comparison is clipped to the 430×1697 frame region instead.
