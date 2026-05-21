// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

/**
 * The site is deployed to GitHub Pages under the /website/ subpath of the
 * org's github.io domain. Once a custom domain is wired up, drop `base` and
 * update `site` to the canonical URL.
 */
export default defineConfig({
  site: "https://itsmypassword.github.io",
  base: "/website",
  trailingSlash: "ignore",
  prefetch: true,
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
