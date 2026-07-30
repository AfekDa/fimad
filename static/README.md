# Static build (hand-authored)

> **Superseded by `npm run build`.** The project now uses Astro and emits the
> same kind of output — static HTML, CSS and assets, zero JavaScript — into
> `dist/`. Prefer `dist/` for anything you share; it is generated from the
> components and cannot drift from them. This folder is kept because it was
> hand-authored and is not reproduced by the build.

A dependency-free, JavaScript-free version of the app. Open `index.html`
directly (`file://` works) or serve this folder from any static host — there is
no build step, no bundler, and no runtime.

```
static/
  index.html      Homepage — Figma frame 1:90, the app's only route
  buttons.html    Button/Filter component sheet — Figma frame 1:19
  css/            One stylesheet per source module
  assets/         Images and fonts, copied verbatim from src/assets
```

## What changed from the React build

- **Routing is gone.** The app has exactly one full-screen frame, so the router,
  the screen manifest and the route registry collapse into a single file.
- **Nav tab selection is a native radio group.** It was React state; it is now
  one hidden `<input type="radio">` per tab with the item as its `<label>`, and
  the selected underline comes from `.nav-input:checked + .nav-item`. Selection,
  keyboard arrow-key navigation and screen-reader semantics all come from the
  platform, so the page needs no script.
- **Button state reads off `data-state`.** The variant/state class combination
  the component computed from props is now an attribute selector on markup that
  already carried `data-state`.
- **CSS-module class names became prefixed plain classes** (`hp-`, `nav-`,
  `icon-`, `btn-`). `reset.css`, `fonts.css`, `tokens.css` and `app.css` are
  byte-identical copies — every Figma-derived value still lives in
  `tokens.css` only.
- **`data-node-id` attributes are preserved**, so any rendered pixel is still
  traceable back to its Figma node.

The social buttons have no action attached, exactly as in the React build: the
design defines no destinations for them.

## Fidelity

Verified against the same Figma-export baselines the React build is held to
(`tests/visual/__screenshots__/figma-fidelity/`, tolerance from
`playwright.config.ts`): first viewport, below-the-fold band, nav docking under
scroll, and a full render with JavaScript disabled in the browser. All within
tolerance.
