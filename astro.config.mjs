// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

/**
 * The site is deployed to GitHub Pages at the root of the org's
 * github.io domain — the repository is named `itsmypassword.github.io`,
 * which GitHub serves at https://itsmypassword.github.io/ directly.
 *
 * i18n: English is the default and lives at the root. French lives under
 * /fr/. Astro handles the routing; the t() helper in src/i18n/ picks the
 * right strings per request.
 */
export default defineConfig({
  site: "https://itsmypassword.github.io",
  trailingSlash: "ignore",
  prefetch: true,
  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr"],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  build: {
    inlineStylesheets: "auto",
  },
  vite: {
    // @ts-expect-error — @tailwindcss/vite and Astro's bundled Vite ship
    // slightly different plugin types; the runtime hook contract is identical.
    plugins: [tailwindcss()],
  },
  integrations: [sitemap()],
});
