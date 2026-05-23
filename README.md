# Keyfount — website

> The landing page for [Keyfount](https://github.com/Keyfount/extension), a deterministic password manager Chrome extension.

A quiet, dark single-page site built around the **"Nothing to keep."** hero — a pulsing keycap, a silver-to-graphite headline, and a stream of crypto-random passwords that appear and dissolve without ever being stored.

## Stack

|             |                                                                                |
| ----------- | ------------------------------------------------------------------------------ |
| Framework   | **Astro 5** (zero-JS by default, ships only the hero's canvas script)          |
| Styling     | **Tailwind CSS v4** via `@tailwindcss/vite`, tokens declared with `@theme`     |
| Type checks | **TypeScript strict** + `astro check`                                          |
| Fonts       | **Geist Sans + Geist Mono** (variable, self-hosted via `@fontsource-variable`) |
| Sitemap     | `@astrojs/sitemap`                                                             |
| Deploy      | GitHub Pages, workflow in `.github/workflows/deploy.yml`                       |

Total cold-load JavaScript is ~1 KB gzipped — only the hero's canvas + custom-cursor wiring ships. Everything else is plain HTML.

## Run locally

```sh
npm install
npm run dev
```

Astro serves the site at <http://localhost:4321>.

## Production build

```sh
npm run build      # outputs to dist/
npm run preview    # serves the production build locally
```

`npm run check` runs `astro check` (template type checking).

## Structure

```
src/
├── layouts/Layout.astro         # <html> shell, SEO meta, JSON-LD, fonts
├── components/
│   ├── Hero.astro               # the "Nothing to keep." canvas hero
│   ├── HowItWorks.astro         # three-step explainer
│   ├── Promise.astro            # "less to trust" claims grid
│   ├── Install.astro            # CTA pulling toward the GitHub repo
│   └── Footer.astro
├── pages/index.astro            # composes the page
└── styles/global.css            # Tailwind entry + design tokens + atoms
```

## Deployment

Every push to `main` rebuilds and publishes to GitHub Pages at <https://keyfount.github.io/>. The repository is named `keyfount.github.io`, so GitHub serves it at the org's root domain without a base path.

## Licence

MIT — see [`LICENSE`](./LICENSE).
