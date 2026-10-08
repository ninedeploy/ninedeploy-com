# ninedeploy.com

Marketing site and docs for [NineDeploy](https://github.com/NineDeploy/NineDeploy), the self-hosted PaaS by [OXOGNET OÜ](https://oxog.net).

Next.js 16 (App Router, Cache Components, Turbopack) · React 19 · Tailwind CSS 4 · Motion · next-themes.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build && pnpm start
```

## Pages

| Route | What |
| --- | --- |
| `/` | Hero with the interactive blue-green cutover demo, template marquee, scroll-pinned deploy pipeline, feature tabs, interface carousel, comparison, data plate, known limits, install |
| `/features` | Full capability inventory with a scroll-spy index |
| `/templates`, `/templates/[id]` | Featured slider, searchable and filterable hub, one static page per template |
| `/docs`, `/docs/[slug]` | 21 guides with sidebar, on-page index and prev/next |
| `/changelog` | Timeline of the newest releases |
| `/faq` | Accordion |

## Content

`src/content/templates.json` and `src/content/changelog.json` are generated from a clone of the product repo:

```bash
git clone --depth 1 https://github.com/NineDeploy/NineDeploy /tmp/nd
node scripts/sync-content.mjs /tmp/nd
```

`src/content/docs.ts` is the docs content, ported from the product repo's `website/src/docs.ts`.
Site-wide numbers (version, test counts, template counts) live in `src/lib/site.ts`.
