# Fluent CSS Framework

A CSS framework implementing Microsoft's Fluent Design System. Drop-in, framework-agnostic — no required build step to consume it.

## Getting started

This ships as plain CSS. Until it's published to npm (see `PLAN.md`'s Stage 10), include it by building and copying the compiled file into your own project:

1. Run `npm run build:min` in this repo.
2. Copy `dist/fluent.min.css` into your project.
3. Link it in your HTML `<head>`, before any of your own stylesheet overrides.

```html
<link rel="stylesheet" href="fluent.min.css" />
```

Every class is prefixed `fluent-` so it can coexist with an existing project's CSS. See `public/index.html` (or run `npm run dev` and open it) for the full component reference with copyable markup for every component.

## Theming

Every visual decision in this framework — color, spacing, radius, elevation, motion, type — is a CSS custom property (a "design token"), never a hardcoded value baked into a component rule. Rebranding means overriding tokens, not editing component CSS.

### Rebrand the accent color

The whole accent scale (including hover/pressed interaction states) derives from one value:

```css
:root {
  --accent: #7c3aed; /* your brand color */
}
```

`--accent-hover` and `--accent-pressed` are computed from `--accent` via `color-mix()`, so overriding just this one property re-tints every button, focus ring, link, and active-state indicator in the framework consistently. If you need exact hover/pressed values instead of the computed ones, override those two as well:

```css
:root {
  --accent: #7c3aed;
  --accent-hover: #8b5cf6;
  --accent-pressed: #6d28d9;
}
```

### Override other tokens

Any token can be overridden the same way — put your overrides in a stylesheet loaded after `dist/fluent.css`:

```css
:root {
  --radius-medium: 4px; /* sharper corners on cards/dialogs */
  --font-family-base: "Inter", sans-serif; /* swap the base typeface */
  --spacing-l: 20px; /* nudge the spacing scale */
}
```

See `src/tokens/` for the full list of available tokens (`colors.css`, `typography.css`, `spacing.css`, `elevation.css`, `motion.css`, `radius.css`) — each file documents what it defines and, where a value is only an approximation of upstream Fluent 2 guidance, says so.

### Light / dark theme

Tokens that differ between themes (all the `--color-neutral-*` surface/text tokens, plus elevation shadows) follow the OS-level `prefers-color-scheme` automatically. To force a theme regardless of OS setting, set `data-theme` on `<html>`:

```html
<html data-theme="dark">
  <!-- ... -->
</html>
```

```html
<html data-theme="light">
  <!-- ... -->
</html>
```

Omit `data-theme` (or set it to anything else) to follow the OS setting.

### Right-to-left (RTL)

Components use CSS logical properties (`inset-inline-start`, `padding-inline-end`, `border-start-start-radius`, etc.) instead of physical `left`/`right`, so most layouts flip correctly for free under `dir="rtl"`. A few effects that use `transform: translateX()` (the switch thumb, the slide-in panel) aren't direction-aware on their own and are explicitly flipped via the `:dir(rtl)` selector in their component CSS.

```html
<html dir="rtl">
  <!-- ... -->
</html>
```

## Browser support

This framework targets current evergreen browsers and uses several modern CSS features without polyfills:

| Feature | Used for | Approximate support baseline |
| --- | --- | --- |
| `color-mix()` | accent hover/pressed states, alert/badge tints, panel acrylic | Chrome 111+, Firefox 113+, Safari 16.2+ |
| `:has()` | disabled-state styling on checkbox/radio/switch/select wrappers | Chrome 105+, Firefox 121+, Safari 15.4+ |
| `mask-image` | select dropdown chevron (theme-aware via `background-color`) | Chrome 120+ (unprefixed), Firefox 53+, Safari 15.4+ |
| `backdrop-filter` | acrylic/mica material on nav, panel, dialog backdrop | Chrome 76+, Firefox 103+, Safari 9+ (prefixed earlier); has a solid-color fallback everywhere it's used (see below) |
| `@starting-style` + `transition-behavior: allow-discrete` | dialog/panel/menu open-close animation | Chrome 117+, Firefox 129+, Safari 17.4+ — our newest dependency by far |
| `:dir()` | RTL-specific overrides (switch thumb direction, panel dock side) | Chrome 125+, Firefox 49+, Safari 16.4+ |
| CSS logical properties (`inset-inline-*`, `padding-inline-*`, `border-*-start-radius`, `text-align: start`) | RTL-aware layout throughout | Chrome 87+, Firefox 66+, Safari 15+ |
| Native `<dialog>` | modal dialog, panel | Chrome 37+ (`showModal()` 37+), Firefox 98+, Safari 15.4+ |

These figures are from training knowledge, not a live check — verify against current caniuse.com data before shipping to production, especially for `@starting-style`.

**Tested in this repo:** only Chromium (via headless Chrome), since that's what was available in this development environment — no Firefox or Safari verification has actually been performed. Everywhere a feature lacks broad support, the framework degrades to a simpler but still legible/functional appearance rather than breaking:
- No `backdrop-filter` support → the acrylic surfaces (nav, panel) already have a solid-ish background color (`color-mix()` into ~80% opacity) as their base, so they just lose the blur, not legibility. Verified by force-disabling `backdrop-filter` in Chrome and confirming the panel stays fully readable.
- No `@starting-style`/`allow-discrete` support → dialogs, panels, and the menu just show/hide instantly instead of animating; still fully functional.
- No `:has()`/`:dir()` support → the specific disabled-state or RTL-flip styling those rules add won't apply, but nothing breaks structurally.

Before shipping to a project that must support older browsers, test manually in real Firefox and Safari.

## Accessibility

- **Color contrast:** every text/background token pairing (both themes) has been checked against the actual WCAG contrast formula, not eyeballed. This caught and fixed three real bugs: `--color-neutral-foreground-3` failed even the relaxed 3:1 UI-component threshold in light theme; `--accent`/`--accent-hover`/`--accent-pressed` used directly as link/text color failed 4.5:1 against the dark-theme background (fixed by adding theme-aware `--color-link`/`-hover`/`-active` tokens — see `src/tokens/colors.css`); and the colored badge variants (brand/success/warning/danger) failed in one or both themes with their original tinted-pill design, fixed by switching those variants to a solid background with white text (see the comment in `src/components/badge.css`).
- **Keyboard navigation:** every interactive component is built on a real native element (`<button>`, `<input>`, `<select>`, `<details>/<summary>`, `<dialog>`) rather than a `div`/`span` with a click handler, so focusability and keyboard activation come from the browser, not custom JS. One known simplification: tabs and the menu's items are each independently `Tab`-focusable rather than implementing the full ARIA APG roving-`tabindex` + arrow-key pattern — still fully keyboard-operable, just not the maximally-polished interaction model.
- **Reduced motion:** all transition durations collapse to ~0 under `prefers-reduced-motion: reduce` (see `src/tokens/motion.css`). The spinner's rotation is a deliberate, documented exception (it's the information being conveyed, not decorative), while the skeleton's shimmer does respect it.
