# fluent-css-framework

A standalone CSS framework implementing Microsoft's **Fluent Design System**, built for reuse across future projects. Framework-agnostic, dependency-free CSS (no required build step to consume it), distributed as a set of CSS files a project can drop in or install via npm.

## Status

Greenfield project. `public/index.html` is the working demo/kitchen-sink page used to visually build and verify components as they're written — treat it as the living style guide, not a throwaway.

## Design philosophy (Fluent Design System)

Every component should be traceable back to one of Fluent's five pillars. When in doubt about how something should look or behave, check against these:

- **Light** — subtle gradients and glow to draw attention to focused/active elements (e.g. focus rings, accent glows on primary buttons).
- **Depth** — a defined elevation scale using layered box-shadows (not just one flat drop shadow) to imply z-order between surfaces (cards, flyouts, dialogs sit visibly "above" the page).
- **Motion** — transitions are part of the spec, not decoration. Use consistent easing/duration tokens for hover, press, and enter/exit states; respect `prefers-reduced-motion`.
- **Material** — acrylic (translucent, blurred) and mica (opaque, tinted-by-desktop) surface treatments via `backdrop-filter` for panels/nav/flyouts, with solid-color fallbacks for browsers without backdrop-filter support.
- **Scale** — layouts and components adapt across pointer/touch/keyboard input and screen sizes; hit targets and spacing follow Fluent's sizing scale.

Visual defaults to follow unless a component spec says otherwise:
- Corner radius: small controls 4px, cards/dialogs 8px, large surfaces up to 12px.
- Font stack: `"Segoe UI Variable", "Segoe UI", system-ui, -apple-system, sans-serif` (fall back gracefully on non-Windows/non-Segoe systems).
- Reveal highlight on hover for controls in a group (subtle radial-gradient border/background following the cursor) where practical in pure CSS.
- Accent color is a single configurable custom property (`--accent`) that the rest of the palette derives from (tints/shades), so consumers can rebrand by overriding one value.

## Architecture conventions

- **Design tokens first.** All color, spacing, radius, elevation, typography, and motion values live as CSS custom properties in a dedicated tokens layer, not hardcoded in component rules. Components consume tokens; they don't invent new magic numbers.
- **Light and dark themes** are both first-class. Token values are redefined under a dark-mode selector/media query — never hardcode a color that only makes sense in one theme.
- **Naming:** classes are prefixed `fluent-` (e.g. `.fluent-btn`, `.fluent-card`) to avoid collisions when dropped into an existing project. Prefer BEM-style modifiers (`.fluent-btn--primary`, `.fluent-btn--disabled`) over deeply nested selectors.
- **File layout** (as the framework grows):
  - `src/tokens/` — custom property definitions (color, spacing, elevation, motion, type).
  - `src/base/` — resets and element-level defaults.
  - `src/components/` — one file per component (button, card, nav, dialog, etc.).
  - `src/utilities/` — small single-purpose helper classes.
  - A build step (if/when introduced) concatenates and minifies these into a distributable CSS file — don't hand-author a single monolithic file.
- Keep specificity low and flat. Avoid `!important` and ID selectors entirely.

## Working conventions

- Verify new/changed components visually in `public/index.html` before considering them done — add a demo section for each new component.
- No JS framework dependency for core styling. If interactive components need JS (e.g. dialog open/close), keep it minimal, unobtrusive, and optional — the CSS should degrade sensibly without it.
- Match Fluent's real-world behavior where feasible (check current Microsoft Fluent UI / Fluent 2 design guidance for spacing, color, and elevation values) rather than guessing — call out any place where an exact Fluent value isn't known so it can be verified.
