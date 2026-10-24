# House on the Hill

A bilingual (English / Russian) web reader for the books of
**Betrayal at House on the Hill, 3rd Edition**: the Rulebook, the Traitor's Tome
and Secrets of Survival.

Live site: https://chepash.github.io/house-on-the-hill/

## Development

Requires Node 24 LTS (Astro 7 needs Node 22.23 or newer).

```sh
npm install
npm run dev       # http://localhost:4321/house-on-the-hill/
npm run build     # static site in dist/
npm run preview   # serve dist/ locally
npm run check     # type-check .astro and .ts files
```

Pushing to `main` builds and deploys the site with GitHub Actions.

## Docs

- [docs/PLAN.md](docs/PLAN.md): goals, architecture, phases.
- [docs/DEVLOG.md](docs/DEVLOG.md): development log, newest first.
