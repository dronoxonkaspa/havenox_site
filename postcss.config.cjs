/**
 * Minimal PostCSS config in CommonJS format (no JSON parsing issues)
 * Loads tailwindcss and autoprefixer if they’re installed.
 */
module.exports = {
  plugins: [
    (() => { try { return require("tailwindcss"); } catch { return null; } })(),
    (() => { try { return require("autoprefixer"); } catch { return null; } })()
  ].filter(Boolean)
};
