# Development plan

A static reader for the **Betrayal at House on the Hill, 3rd Edition** books
(Rulebook, Traitor's Tome, Secrets of Survival) in English and Russian,
hosted on GitHub Pages.

## Goals

- Read all three books comfortably on desktop and phone, including at the game table.
- Switch between English and Russian at any moment without losing the reading position.
- Find any rule or haunt quickly: main menu, table of contents, search.
- Keep the haunt books spoiler-safe: the traitor and the heroes read different books.

## Non-goals (for now)

- Accounts, server-side logic, comments.
- Editing content in the browser. Content lives in Markdown in this repo.

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Astro 7 | Content-first static site generator; ships plain HTML, JS only where needed. |
| Interactive UI | React islands (`@astrojs/react`) | Language switch, menus, search UI. Familiar stack. |
| Content | Markdown + Astro content collections | Typed frontmatter (zod schemas), one file per chapter or haunt. |
| Language | TypeScript, strict | |
| Search | Pagefind (later) | Static, multilingual full-text search with no backend. |
| Hosting | GitHub Pages via GitHub Actions | Free, deploys on push to `main`. |
| Runtime | Node 24 LTS | Required by Astro 7 (`>=22`). |

The site is served from `https://chepash.github.io/house-on-the-hill/`,
so Astro is configured with `base: '/house-on-the-hill'`. All internal links
must go through a base-aware helper, never hard-coded `/...` paths.

## Information architecture

```
/                                  -> redirect to /en/ or /ru/ (saved choice, then browser language)
/{lang}/                           main menu: the three books
/{lang}/rules/                     rulebook table of contents
/{lang}/rules/{chapter}/           one rulebook chapter
/{lang}/haunts/                    haunt index: number + title only (spoiler-safe)
/{lang}/haunts/{nn}/               haunt hub: pick "Traitor" or "Heroes", with a spoiler warning
/{lang}/traitors-tome/{nn}/        haunt nn, traitor side
/{lang}/secrets-of-survival/{nn}/  haunt nn, heroes side
```

`{lang}` is `en` or `ru`. `{nn}` is the two-digit haunt number (`01`..`50`).
Every page exists in both languages under the same path, so switching language
only swaps the prefix.

### Persistent UI

- Header: site title (to the main menu), current book, language switch `EN | RU`.
- Sidebar (drawer on mobile): table of contents of the current book.
- Footer of each chapter: previous / next.

## Language switching without losing position

1. Both language versions of a page have the **same block structure**:
   every heading carries the same explicit, English, stable id
   (for example `## Setup {#setup}`) in both files.
2. On switch, a small client script finds the topmost visible heading,
   navigates to the same path in the other language with `#that-id`,
   and restores the offset. Astro view transitions make the swap smooth.
3. The chosen language is stored in `localStorage` and used on the next visit.

Optional later step: paragraph-level ids for finer alignment, and a
side-by-side "bilingual" mode.

## Content layout

```
src/content/
  rules/
    en/01-introduction.md
    ru/01-introduction.md
  traitors-tome/
    en/01.md ... en/50.md
    ru/01.md ... ru/50.md
  secrets-of-survival/
    en/01.md ... en/50.md
    ru/01.md ... ru/50.md
src/assets/images/      shared images (room tiles, icons, diagrams)
```

Rules for content files:

- Same file name in `en/` and `ru/`. The file name (without language) is the page id.
- Same heading tree in both languages, with identical `{#id}` on every heading.
- Frontmatter:

```yaml
# rules chapter
title: Setup
order: 3

# haunt (either tome)
haunt: 1
title: Haunt title
```

- Source PDFs and translation notes stay in the Obsidian vault, not in this repo.
  The Russian text follows the chosen translation versions (rules V3.1, tomes V1.1 with errata).

## Phases

Each phase ends with a deploy and an entry in [DEVLOG.md](DEVLOG.md).

### Phase 0: Scaffold and deploy

- Astro + React + TypeScript project, `base` set for GitHub Pages.
- GitHub Actions workflow that builds and deploys on push to `main`.
- `/en/` and `/ru/` placeholder pages with a working language switch.

### Phase 1: Reader skeleton

- Content collections and schemas for the three books.
- Markdown heading-id support (`{#id}`).
- Reader layout: header, sidebar TOC, prose typography, prev/next.
- One real rulebook chapter imported in both languages to validate the format.

### Phase 2: Seamless language switch

- Position-preserving switch (topmost heading anchor).
- Saved language preference, root redirect.
- Build-time check: every page exists in both languages with the same heading ids.

### Phase 3: Rulebook

- Full rulebook in both languages.
- Main menu and rulebook table of contents.
- Cross-links between rules sections.

### Phase 4: Haunt books

- Traitor's Tome and Secrets of Survival, all 50 haunts in both languages.
- Haunt index and haunt hub pages with spoiler warnings.
- Link from a haunt side to the shared rules it references.

### Phase 5: Polish

- Search (Pagefind, per language).
- Dark theme, mobile layout pass, print styles.
- Haunt lookup: omen + room -> haunt number.
- Optional: offline support (PWA) for use at the table.

## Risks and open questions

- **Copyright.** The books are commercial content by Avalon Hill (Hasbro).
  GitHub Pages on a free plan requires a public repository, so the full text
  becomes public. Consider this before publishing the real books.
- **Content alignment.** Language switching relies on identical heading ids
  in both languages. The build-time check in Phase 2 should catch drift.
- **Images.** Room tiles, cards and diagrams from the PDFs need extraction or
  recreation; decide per image.
