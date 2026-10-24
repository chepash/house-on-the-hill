# Development plan

A static reader for the haunt books of **Betrayal at House on the Hill, 3rd Edition**
(Traitor's Tome and Secrets of Survival) in English and Russian, hosted on GitHub Pages.

The rulebook is out of scope: players use the printed one. A short glossary page
("Terms and Clarifications") is included instead.

## Goals

- At the table, a player opens the site, picks their side (heroes or traitor),
  picks the haunt and reads it comfortably on a phone.
- Switch between English and Russian at any moment without losing the reading
  position, e.g. to check the original terminology.
- Keep the icons from the books: players often scan for them.
- Spoiler safety: the heroes' and the traitor's books never link into each other's haunts.

## Non-goals (for now)

- Accounts, server-side logic, comments.
- Editing content in the browser. The notes are written in the Obsidian vault.

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Astro 7 | Content-first static site generator; ships plain HTML, JS only where needed. |
| Interactive UI | React islands (`@astrojs/react`) | Language switch, haunt number jump. |
| Content | Markdown + Astro content collections | Typed frontmatter (zod schemas), one file per haunt side. |
| Markdown | `unified()` processor + own remark plugin | Obsidian callouts, icon embeds, soft line breaks. |
| Language | TypeScript, strict | |
| Hosting | GitHub Pages via GitHub Actions | Free, deploys on push to `main`. |
| Runtime | Node 24 LTS | Required by Astro 7 (`>=22.23`). |

The site is served from `https://chepash.github.io/house-on-the-hill/`,
so Astro is configured with `base: '/house-on-the-hill'`. Internal links go through
`getRelativeLocaleUrl` or `withBase`, never hard-coded `/...` paths.

## Information architecture

```
/                                     -> redirect to /en/ or /ru/ (saved choice, then browser language)
/{lang}/                              "Which side are you on?": the two books + terms
/{lang}/secrets-of-survival/          heroes' haunt list, with a haunt number jump
/{lang}/secrets-of-survival/{nn}/     heroes' side of haunt nn
/{lang}/traitors-tome/                traitor's haunt list
/{lang}/traitors-tome/{nn}/           traitor's side of haunt nn
/{lang}/terms/                        Terms and Clarifications (no spoilers)
```

`{lang}` is `en` or `ru`. `{nn}` is the two-digit haunt number, `01`..`50`.
Every page exists in both languages under the same path, so switching language
only swaps the prefix.

Both lists show all 50 haunts with their real titles, so a list never reveals which
haunts belong to a special group. Haunts printed only in the other book (2–8 are only
in Secrets of Survival, 9–12 only in the Traitor's Tome) get a pointer page: the
book's own note plus a button to the same haunt in the other book, where all players
read it.

Each book has its own accent color (heroes blue, traitor red) and a spoiler
warning on its list page.

## Content pipeline

The Obsidian vault is the source of truth. `npm run sync` (scripts/sync-vault.mjs) copies it
into the repo, and the copy is committed: the site never reads the vault directly.

```
vault                                         repo
English/Traitor's Tome/18 A Nice Ring….md  -> src/content/haunts/traitors-tome/en/18.md
Русский/Книга предателя/18 Симпатичное….md -> src/content/haunts/traitors-tome/ru/18.md
English/Terms and Clarifications.md        -> src/content/pages/en/terms.md
_Справочник/иконки/*, _Справочник/жетоны/*   -> public/icons/
```

The sync script:

- maps the Russian frontmatter keys to the English ones and writes one schema
  (`title`, `titleEn`, `number`, `lastNumber`, `stub`, `scenarioCard`, `trigger`, `traitor`);
- takes the title from the H1 and removes the H1, the Obsidian footer navigation
  and any other line with a vault link;
- skips the vault's Index / Оглавление notes (the site builds its own lists);
- checks that every note exists in both languages with the same sequence of
  headings and callouts, and prints warnings otherwise.

Rendering (src/markdown/remark-obsidian.mjs):

- `![[name.png|18]]` -> `<img class="icon">` from `public/icons/`;
- `> [!type] Title` callouts, nested too -> `<aside class="callout">` with the book's icon;
- soft line breaks are kept as in Obsidian (remark-breaks).

## Language switching without losing position

1. Every heading and callout gets a positional id (`b1`, `b2`, ...) and `data-anchor`.
   Both languages have the same structure (checked by the sync), so the same id is
   the same block.
2. On switch, the topmost anchor at or above the reading line and its offset from the
   viewport top go to `sessionStorage`; after the client-router swap the same anchor is
   scrolled back to the same offset.
3. The last used language is stored in `localStorage` and used by the root redirect.

## Phases

Each phase ends with a deploy and an entry in [DEVLOG.md](DEVLOG.md).

### Phase 0: Scaffold and deploy (done)

### Phase 1: Haunt books (done)

- Vault sync, content collections, remark plugin for the Obsidian syntax.
- Home page with the side choice, haunt lists, haunt pages, terms page.
- Position-preserving language switch based on shared anchors.

### Phase 2: At-the-table polish

- Check on real phones; tune typography and icon sizes.
- Haunt lookup by Scenario card + trigger (both are in the frontmatter).
- Search (Pagefind, per language), if the lists are not enough.
- Optional: offline support (PWA), print styles, a dark theme with icon backgrounds.

## Risks and open questions

- **Copyright.** The books are commercial content by Avalon Hill (Hasbro).
  GitHub Pages on a free plan requires a public repository, so the full text
  becomes public.
- **Content alignment.** The switch relies on identical structure in both languages.
  The sync script warns about drift; keep the warning list empty.
- **Markdown cache.** Astro caches rendered collection entries. After changing the
  remark plugin, delete `node_modules/.astro` and `.astro` before building.
