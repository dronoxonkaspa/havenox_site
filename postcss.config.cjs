/**
 * Minimal PostCSS config in CJS to avoid JSON/BOM parsing issues.
 * Tries to load tailwindcss/autoprefixer if present; otherwise no-ops.
 */
module.exports = {
  plugins: [
    (() => { try { return require("tailwindcss"); } catch { return null; } })(),
    (() => { try { return require("autoprefixer"); } catch { return null; } })()
  ].filter(Boolean)
};
