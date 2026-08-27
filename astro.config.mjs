// @ts-check
import { defineConfig } from "astro/config";

// Standalone static build, zero backend, no analytics, no Sentry, no sitemap.
// Brand tokens mirror the mhsbsolutions.com v4.3 system so this can later be
// merged into the main Astro site as a route.
export default defineConfig({
  site: "https://www.mhsbsolutions.com",
  trailingSlash: "ignore",
  build: {
    // Inline small assets; keep the output self-contained.
    inlineStylesheets: "auto",
  },
});
