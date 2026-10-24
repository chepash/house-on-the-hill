# Development log

Newest entries first. Each entry: what was done, decisions made, what is next.

## 2026-10-24: English hints for Russian game terms

### Done

- `remark-term-hints`: in the Russian haunt notes, the first mention of a key term on a
  page gets the English original in parentheses, styled muted and smaller:
  «инициатор сценария (haunt revealer)», «Герои (heroes)».
- Terms: hidden traitor, haunt revealer, explorer, hero, traitor, character board,
  Monster card, trait, critical, line of sight, stunned. English follows the vault glossary.
- About 2 hints per page (412 over 100 Russian haunt pages).

### Decisions

- **Build time, not in the vault.** The notes stay as they are; the list lives in one
  file and is easy to extend.
- **First mention per page only**, the same rule the glossary uses for room and card
  names. Every mention would clutter the text.
- **Case forms by regex**, with Cyrillic-aware word boundaries. Plural role nouns get the
  English plural. Card names that only look like terms («Исследователи паранормального»)
  are skipped explicitly, and a term already followed by «(» is left alone.
- Not on the terms page: there every defined term needs its English original, not
  only the first mention. Those were added to the vault note itself
  (`Русский/Термины и пояснения.md`, 48 terms, e.g. «**Исследователь** (Explorer)»),
  using the wording of the English terms note, then synced.
- Tables got styles: left-aligned headers (they were centered by default and did not
  line up with the cells), wider column gaps, thin row lines. Checked at 360 px: both
  traits tables fit. The Russian traits table header no longer says "(Trait)".

## 2026-10-24: One row per haunt in both lists

### Done

- Replaced the range rows ("2–8 No Traitor or Hidden Traitor", "9–12 Free-for-All")
  with one row and one page per haunt number. Each book now has 50 pages per language.
- A haunt printed only in the other book shows its real title (taken from the other
  book), and its page shows the book's pointer note plus a button to the same haunt in
  the other book.
- `getBookItems()` in `src/lib/haunts.ts` builds the per-number list; the build fails if a
  number is in neither book.

### Decisions

- **The grouped rows were a spoiler.** A traitor scanning the list could tell which haunts
  have no traitor or a hidden one. With uniform rows the list gives nothing away.
- **Pointer pages link to the haunt, not to the list.** For 2–8 and 9–12 every player reads
  the other book, so a direct link is the expected flow, not a spoiler.
- **No range hints anywhere.** The home page no longer says which haunt numbers go to
  which book, and pointer pages show a neutral sentence instead of the book's pointer
  note (which names the whole group: "haunts 2–8 have no traitor..."). The only "2–8" /
  "9–12" left in the built site is a dice-roll table in Secrets of Survival 4.

### Next

- Decide whether the list should show the "trigger · traitor" line at all.

## 2026-10-24: Phase 1, haunt books

### Done

- `npm run sync`: copies the vault notes into `src/content/` and the icons into
  `public/icons/`. Result: 44 Traitor's Tome and 47 Secrets of Survival notes per
  language, the terms page, 64 icons (~400 KB). All EN/RU pairs have identical structure.
- Content collections `haunts` and `pages` with zod schemas.
- `remark-obsidian`: icon embeds, callouts (action, monster, death, important, clarify;
  nested), positional anchors on headings and callouts.
- Pages: side choice on the home page, haunt list per book with a number jump
  (React island), haunt page, terms page. 191 pages in total.
- The language switch now anchors on headings and callouts (`[data-anchor]`).
- Checked the rendered HTML (no raw Obsidian syntax, anchor counts equal per pair,
  every referenced icon exists) and screenshots at phone width in headless Edge.

### Decisions

- **Scope change: no rulebook.** Players use the printed rulebook; the site has the
  two haunt books and the terms page.
- **The vault is the source, the repo holds a copy.** GitHub Actions cannot see the
  vault, so synced content and icons are committed. The vault's Index notes are not
  copied; the site builds its own lists.
- **remark instead of Sätteri.** Astro 7's default Markdown processor (Sätteri 0.10) has
  no callouts or soft line breaks, and its plugin API is new. The official `unified()`
  processor runs ordinary remark plugins.
- **Positional anchors instead of `{#id}` in the notes.** The notes are already
  structurally identical in both languages, so `b1`, `b2`, ... need no extra markup,
  and the sync script guards the structure.
- **Light theme only.** The icons are black, as printed; a dark theme would need icon
  backgrounds.
- **Spoiler safety.** No links between the books, except the two range pointer notes
  (2–8, 9–12), which link to the other book's list, not to a haunt.

### Next

- Try the site on a phone at the table; collect layout feedback.
- Phase 2 items in PLAN.md (lookup by Scenario card + trigger, search, PWA).

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
