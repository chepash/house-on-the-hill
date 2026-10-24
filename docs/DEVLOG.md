# Development log

Newest entries first. Each entry: what was done, decisions made, what is next.

## 2026-10-24: Phase 0, scaffold and deploy

### Done

- Upgraded the local toolchain to Node 24.22.1 / npm 11.
- Astro 7.4 project with React 19 islands and strict TypeScript.
- i18n routing: `/en/` and `/ru/` with `prefixDefaultLocale`, `base: '/house-on-the-hill'`,
  `trailingSlash: 'always'`.
- Root page redirects to the saved language, then to the browser language, then to English.
- Placeholder main menu (about, the three books as "coming soon", a language switch demo).
- `LanguageSwitch` React island: navigates with the client router, keeps the reading position.
- GitHub Actions workflow (`withastro/action@v6` + `actions/deploy-pages@v5`).
- `npm run check` (astro check) added; check and build pass with no errors.

### Decisions

- **UI strings in `src/i18n/ui.ts`.** English is the source of truth; the Russian table
  is typed against the English keys, so a missing translation is a type error.
- **Reading position.** Before switching, the topmost heading above a 120 px reading line
  and its viewport offset go to `sessionStorage`. After the swap
  (`astro:after-swap`, which runs after the router scrolls and before paint) the same
  heading id is scrolled back to the same offset.
- **Last used language** is saved in `localStorage` on every page load, not only on switch.

### Next

- Enable GitHub Pages (Settings, Pages, Source: GitHub Actions) and check the live site.
- Verify the position-preserving switch in a real browser, on desktop and phone.
- Phase 1: content collections, heading-id syntax, reader layout, first rulebook chapter.

## 2026-10-24: Project start

### Done

- Created the repository and the development plan ([PLAN.md](PLAN.md)).
- Chose the stack: Astro 7 + React islands + TypeScript, deployed to GitHub Pages
  with GitHub Actions.

### Decisions

- **Astro over a Vite React SPA.** The site is mostly static text. Astro renders
  plain HTML per page, so deep links work on GitHub Pages with no 404 workarounds,
  pages are indexable, and React is still available for interactive parts.
- **Language as a URL prefix** (`/en/...`, `/ru/...`) with identical paths in both
  languages. Switching keeps the position through shared heading ids.
- **Node 24 LTS.** Astro 7 requires Node 22 or newer.
- **English only** in code, comments, commit messages and docs. Russian appears
  only in content files and UI translation strings.

### Next

- Phase 0: scaffold, deploy workflow, placeholder pages with a language switch.
