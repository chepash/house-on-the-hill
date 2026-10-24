# Development log

Newest entries first. Each entry: what was done, decisions made, what is next.

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
