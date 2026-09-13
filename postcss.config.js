const isProd = process.env.NODE_ENV === "production";

// Must be a function (not a plain object): postcss-load-config passes the
// CLI's --map option nested as ctx.options.map, but postcss itself expects
// `map` at the top level of the config it receives — a plain object export
// can't forward that, so --map silently produced no sourcemap at all.
module.exports = (ctx) => ({
  map: ctx.options && ctx.options.map,
  plugins: [
    require("postcss-import"),
    require("postcss-preset-env")({
      stage: 1,
      features: {
        // We hand-author font-family fallbacks; don't let the system-ui
        // polyfill rewrite values inside custom properties.
        "system-ui-font-family": false,
        // Logical properties (inset-inline-*, border-*-radius, etc.) are
        // a runtime concept tied to the document's actual `dir` — target
        // browsers all support them natively, and statically "polyfilling"
        // them at build time bakes in a fixed LTR assumption, silently
        // breaking the RTL support they exist for.
        "logical-properties-and-values": false,
        // Same issue as above: this rewrites :dir(rtl) into a static
        // [dir="rtl"] ancestor-selector polyfill, which silently dropped
        // our compound selectors (checked ~ sibling ::after chains) and
        // isn't equivalent anyway ([dir] only matches an explicit
        // attribute, not computed/inherited directionality).
        "dir-pseudo-class": false,
      },
    }),
    ...(isProd ? [require("cssnano")({ preset: "default" })] : []),
  ],
});
