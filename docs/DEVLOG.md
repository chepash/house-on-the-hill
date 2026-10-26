# Development log

Newest entries first. Each entry: what was done, decisions made, what is next.

## 2026-10-26: Special actions styled as printed; "take your turn" wording

### Done

- Special action callouts (`Once during your turn, you may: **Name**`) are split by
  `remark-obsidian.mjs`: the lead-in becomes a small `callout__kicker` line, the action's
  name is the title, in the action color, next to the icon, as in the haunt books. The vault
  notes are unchanged.
- Russian notes: "take your turn as …" is now «делайте ход …» instead of «ходите как …»,
  which also reads as "you walk like …" or "act like …" (haunts 3, 18, 25, 34).
- Clarification callouts are titled "Pasha's note" / «Заметка Паши»,
  so players don't take them for official rulings; the terms page says so too.
  Haunt 34's traitor note was removed: the action's own text already says how many
  times it can be taken.
- Haunts: the "Read First!" section (introduction and setup, up to the `---`) is a box
  under a banner in the book's color, as in the haunt books, with a one-line hint from the
  rulebook: read the introduction aloud to everyone, do the setup, the rest is for your
  side only. The `---` that closed the section is dropped.
- Haunts: "Objective" + "Tokens Needed" sit on a reddish panel and "If You Win" on a
  yellowish one, as in both haunt books. Only notes with a "Read First!" section get
  them, so rulebook and terms pages are untouched. The endings of hidden traitor haunts
  ("If the Heroes Win" / "If the Traitor Wins") share one yellow panel.
- Panels end at the first special action or monster box: those are printed outside the
  panels even without a heading of their own (haunt 23 put its actions right after the
  tokens). Pasha's notes stay inside the section they explain. Any h2 ends a panel, also
  one that starts with a token image (`## ![[fire.png|30]] Seelie Flame`, haunt 24).
- Haunts: lists of tiles ("Tiles Where You Can Research", "Bedroom Tiles", "Warding
  Tiles", …) sit on a grey panel; lists in a row share one panel. The set was taken from
  the grey fills in the PDFs (25 sections).
- Haunts: a `## Monster: …` heading followed by its `[!monster]` box is merged into one
  box with the heading as its title (the box's own title repeated the name). Monster
  boxes are yellow tickets with concave corners and the monster icon centered on the top
  edge, as printed. The ticket outline is a 9-slice SVG `border-image`, so the corners keep
  their shape at any box size. The ticket edge is 12 px with no side padding, leaving
  room for text and wide tables. All 48
  monster boxes per language follow this pattern.
- Monster stat lines lost their trait icons (the names already say it) and use no-break
  spaces, so a trait name never wraps away from its value ("Might 3").
- A word and the icon after it ("Items ![[item.svg]]", 594 places) are joined by a no-break
  space in the notes; the site also puts each pair in a `nowrap` span, since browsers still
  break next to an image despite the no-break space.
- Haunt notes: 21 headings got the token printed beside them in the books (`## ![[trap.png|30]]
  Explosives`, haunts 24, 28 and others), found by scanning the PDFs for token images next
  to headings.
- Token images (vault `_Справочник/жетоны`) were cropped to their visible pixels and
  centered on square canvases with a 1 px margin: the PDF extraction had left uneven
  transparent edges, so tokens like the rune sat off-center next to the text.
- Haunt 40 (traitor): the character table shows a small portrait before each name, and the
  rows are tinted with the color of the character's board, as in the book, so the two
  characters of one double-sided board are easy to spot. Table portraits don't float.
- Character tables get an "In play" checkbox per row (`scripts/characters-in-play.ts`):
  tapping a row hides the numbers of a character who is not in the game (the faded name
  stays, to undo), so the traitor reads the right
  Evil Twin. The choice is kept per device in `localStorage`, by character, for every table
  with portraits.
- Character tables are compact on phones (no wrap under the portrait, narrow centered
  trait columns, 22 px portraits) and fit from 360 px wide,
  the narrowest phone the site supports.
- Haunt lists: the number column is 1.5rem (two digits) instead of 3.25rem, which left a
  wide empty gap before the numbers on phones.
- Pasha's notes reviewed with the user: 6 removed per language (English-only naming quirks
  in haunts 25, 30, 42 ×2; haunt 50's "(3/4/4/5)" is now written as {3/4/4/5}; haunt 47's
  "Trapped token" is now «жетон с её портретом» in the Russian text). 16 remain.
- Pasha's notes start folded: the notes use Obsidian's foldable callout marker
  (`> [!clarify]- Pasha's note`), and `remark-obsidian.mjs` renders foldable callouts as
  `<details>` with the title as `<summary>` (`[!type]+` starts open). Optional reading,
  so they don't distract at the table.
- Pasha's notes rewritten with the user: haunt 39 (why the Number Track isn't in the
  traitor's setup and what it counts), haunt 42 ×2 (Larder in the Basement, no reference
  to haunt 35), haunt 11 (the Monster Card is a reference card; here it marks who the
  haunt revealer is). The fold toggle is a full-size triangle that rotates when open.
- The "Read First!" banner is red in both books, as printed, instead of the book color:
  players compare the site with the physical book.

- Favicon: the book's death skull on a white rounded square with a thin accent border
  (`favicon.svg`, plus a 16/32/48 px `favicon.ico` rendered from it), readable on light
  and dark browser tabs.

### Decisions

- Astro caches rendered Markdown in `.astro/`, `node_modules/.astro` and
  `node_modules/.vite`. After changing a remark plugin without changing the notes, delete
  all three before a local build; deleting only `data-store.json` is not enough. CI always
  builds clean.

## 2026-10-25: Inline icon alignment

### Done

- Inline icons are centered on the capital letters instead of using a fixed `-0.2em` offset.
  The event, item and omen icons are wide and short, so at 18 px width the fixed offset
  dropped them to the baseline. `vertical-align: middle` alone centers on the lowercase
  letters and lets the tall icons hang low, so a `top: -0.1em` lift is added.

## 2026-10-25: Character portraits

### Done

- The 12 character portraits from the rulebook (pp. 20–21) were extracted from the PDF into
  the vault (`_Справочник/портреты/portrait-*.png`) and placed under each character heading
  of chapter 5 in both languages.
- `sync-vault.mjs` copies the portrait folder with the icons; `remark-obsidian.mjs` gives
  `portrait-*` embeds the `portrait` class, which floats right of the character's details.
- The details beside the portrait are a compact card (no bullets, UI font); the description
  starts below the portrait; the portrait is 96 px on narrow screens. Birthdays use a
  non-breaking space so the day and month stay on one line.

### Decisions

- The rulebook has square portraits only; the pentagonal ones are printed on the character
  boards, which are not in the PDFs.

## 2026-10-25: Russian term for haunt: «наваждение»

### Done

- In all Russian notes, the rulebook, the terms page and the UI, "haunt" is now «наваждение»
  instead of «сценарий» (with case and gender agreement): «Наваждение 18», «бросок
  наваждения», «инициатор наваждения», chapters «До / После начала наваждения».
- «сценарий» is kept only for the Scenario card («карточка сценария») and for the film
  script in haunt 45. "curse" stays «проклятие».
- Term hints (`remark-term-hints.mjs`): «инициатор наваждения» -> haunt revealer, plus new
  hints «наваждение» -> haunt and «карточка сценария» -> Scenario card.
- All 218 anchored links of the rulebook pages and the index were re-checked after the rename.

### Decisions

- There is no printed Russian edition: the group plays the English box, so the Russian
  terms are ours to choose. Two English terms (haunt, Scenario card) no longer share one
  Russian word.

## 2026-10-25: Rulebook polish

### Done

- Chapter footer: arrows instead of "Previous" / "Next" (labels kept as `aria-label` and
  `title`), on a three-column grid so "Contents" is always centered.
- The Russian rulebook no longer marks fixes of the printed translation (✎ and footnotes
  "В печатной V3.1: …"): readers don't know that edition. The list lives in the vault, in
  `_Переводы/Поправки печатного перевода.md`. Notes stay only for disputed rules.
- Page references from the printed book ("(See "Attacking," on page 15.)") are now links to
  the section, resolved by the sync script like the index links; all 28 were checked.
- Damage example: the clip positions are underlined as well as bold (`.trait-track`). The
  underline sits below Georgia's old-style descenders and never skips them.

## 2026-10-25: Crime-scene tape until game night

### Done

- Until 25 October 2026, 16:00 Tbilisi time (`UNLOCK_AT` in `src/scripts/lock.ts`), the two
  haunt books are "closed": the home page covers the book cards with one yellow "KEEP OUT"
  tape along the rising diagonal of the cards (the angle is computed from their size, so it
  fits any screen), a note tag on the tape with a live countdown, and the cards are `inert`.
  The "Which side are you on?" heading is under the tape too: it belongs to the closed part. Any book list or haunt URL
  redirects to the home page.
- An inline script in `Base.astro` applies the lock before the first paint (redirect, or the
  `locked` class on `<html>`); `applyLock()` re-applies it after every view-transition swap,
  because the swap replaces the `<html>` attributes.
- At `UNLOCK_AT` everything opens by itself, also on an open page (the countdown timer
  removes the lock). No redeploy is needed.
- Rulebook chapter cards on `/{lang}/rules/` use the same neutral accent as the home
  reference cards.
- Home page: a rule (`.home-divider`) sets the rulebook and terms cards apart from the side
  choice. No heading: "For everyone" and similar titles read oddly.

### Decisions

- A joke, not access control: the pages are built and deployed as usual, and the repository
  is public. Without JavaScript the site is simply open.

### Next

- After game night, remove the lock (`lock.ts`, the inline script, the `.lock` markup and
  styles, the `lock.*` UI keys), or move `UNLOCK_AT` for the next session.

## 2026-10-24: Rulebook pages

### Done

- The vault now has the full rulebook in both languages: `English/Rulebook/1–5 …` and
  `Русский/Правила/1–5 …`, one note per section of the printed book. The sync script
  copies them as pages `rules-1` … `rules-5` (the same structure check as for the other
  pages; it passes).
- New routes `/{lang}/rules/` (contents) and `/{lang}/rules/{n}/` (chapter with
  previous / contents / next links). Chapter lookup lives in `src/lib/rules.ts`.
- Home page: a "Rulebook" / «Правила» link above the terms link. New UI keys `rules.*`.
- Home reference cards (rulebook, terms) are laid out like the book cards (`.choice--reference`):
  the same size (3.5rem icon, full left border), the title in the plain text color, and a
  neutral accent (`--muted`): the default red border looked like the traitor's book.
  Rulebook uses the Omen icon (raven), terms the Item icon.

- The rulebook's alphabetical index (pp. 22–23) is on the contents page `/{lang}/rules/`.
  The vault has it as `English/Rulebook/Index.md` / `Русский/Правила/Указатель.md`, where
  every page number became an Obsidian heading link. The sync script now turns links into
  rulebook chapters into site links with the chapter's positional anchor (`../4/#b5`),
  relative to where the page is served (`from` in `PAGES`), instead of dropping them.
  The terms page's "Full rulebook" link works the same way.
- Rulebook headings carry no icons any more (moved to the first line of the section),
  so heading links match in Obsidian and on the site.

### Decisions

- Chapter URLs use the plain chapter number (`rules/4/`), so both languages share a path.
- Index links target the same positional anchors (`bN`) the language switch uses, so they
  are identical in both languages and are computed by the sync script, not by slugs.
- All 200 index links (100 per language) were checked against the built pages: the anchor
  exists and the heading text equals the link text.

### Next

- Optionally cut the rulebook's illustrations (component photo, setup layout, tile
  placement examples) from the PDF; the notes carry only their captions for now.

## 2026-10-24: Minimal home page

### Done

- Home page: the heading is now the game's name ("Betrayal at House on the Hill" /
  «Предательство в доме на холме»). Removed the short site name subtitle (it is in the
  header), the how-to paragraph under "Which side are you on?" and the description on the
  terms card. UI keys `site.subtitle`, `home.side.body`, `home.terms.body` replaced or removed.
- Book cards (`.choice--book`, home page only): no "Heroes" / "Traitor" label, the book title
  in the book's color, the icon enlarged to 3.5rem and centered against the two text lines.
- The Secrets of Survival card uses the Event icon (spiral) instead of the hero portrait:
  it matches the black skull of the Traitor's Tome.
- Book list pages: the "Heroes" / "Traitor" label above the title is gone; the title itself
  is in the book's color. The `book.*.side` UI keys are removed.
- Home heading breaks at a fixed place on every screen: "Betrayal at House / on the Hill",
  «Предательство / в доме на холме» (`\n` in the UI string, `white-space: pre-line`).
  The automatic wrap on a phone split the name awkwardly.
- Haunt page heading: the number now uses the UI font. Georgia's old-style figures drop
  3, 4, 5, 7 and 9 below the baseline ("3", "37" looked lower than the title), and Georgia
  has no lining variant.

### Decisions

- The edition ("3rd Edition") is technical information and stays in the README only.

## 2026-10-24: Haunt 16 clarification, Large Monster tokens in the glossary

### Done

- Terms page (both languages, in the vault): Large Monster tokens are now their own bullet
  with the Werewolf token icon, instead of a second sentence in the Small Monster bullet.
- Secrets of Survival 16 (both languages, in the vault): a clarification after the Remains
  rules: Remains are not Items or Omens but can be looted; looting takes all the Remains the
  corpse carried at once, and this haunt rule overrides the one Item or Omen per turn limit.

### Decisions

- The printed sentence "If any loot Remains from an explorer's corpse..." is ungrammatical
  and does not say how it fits the rulebook limit (one Item or Omen per corpse per turn).
  The rulebook says each haunt has special rules that change the base rules, so "you must
  take all Remains" wins over that limit. A first draft also said looting Remains used up
  the turn's one loot (as other haunts say for their tokens); dropped, haunt 16 says nothing
  of the kind.
- The traitor still counts as an explorer (rulebook, "Playing the Haunt") and may loot
  corpses, so by the letter the traitor may loot Remains too. Not written on the page yet;
  the owner decides.

## 2026-10-24: Haunt 50 clarification (Landing tiles)

### Done

- Haunt 50 (both books, both languages, in the vault): a "Clarification (not from the
  book)" callout saying that Landing tiles are all three starting tiles, including the
  whole large ground floor tile (Ground Floor Staircase, Hallway, Entrance Hall), so none
  of them can be Consumed and the traitor does not need to Consume them to win. In the
  Traitor's Tome it is nested in the Construct callout after "Consume the House".

### Decisions

- The rulebook defines no "Landing tile"; it names the Basement and Upper Landing and the
  "triple room tile". Other haunts settle it: one calls the triple tile the "Ground Floor
  Landing" and treats Landing tiles the same way (not turned face-down), another returns
  "all tiles except Landing tiles" to the stack, which cannot mean the triple tile.
  Consuming means turning the tile face-down, and the triple tile cannot be partly flipped.
- No footnote: the BoardGameGeek threads on haunt 50 do not discuss this (the 3rd edition
  thread asks whether failed Explosives are lost; the haunt text already says nothing is
  placed). Other haunts are not named in the callout to avoid spoilers.

## 2026-10-24: Haunt 37 clarification

### Done

- Traitor's Tome 37 (both languages, in the vault): a nested "Clarification (not from the
  book)" callout on the Security Robot: a robot that attacks and loses takes no damage; a
  robot damaged by a hero's attack or by Mess with Circuits is killed and removed. A
  footnote links the BoardGameGeek thread where this ruling was discussed.
- Footnote styles restored, now meant for source notes like this one.

### Decisions

- The original sentence ("do not take any damage from attacking heroes") is ambiguous. The
  heroes' objective ("Disable the Security Robots by successfully attacking them") rules out
  the reading that robots are immune to heroes' attacks; the BGG answer agrees.
- Footnotes are fine for sources of disputed rulings; translation-fix footnotes stay removed.

## 2026-10-24: Erratum footnotes removed

### Done

- Removed the ✎ marks and their footnotes (43 footnotes, 48 references in 35 notes) from
  the Russian haunt notes in the vault, plus the "✎" bullet on the terms page and the
  sentence about it in both vault index notes and `make_indexes.py`. Synced; the built
  site has no footnotes left. Footnote styles removed.

### Decisions

- **The fixes stay, the notes about them go.** Players do not know what "printed V1.1" is,
  and a footnote saying "fixed" does not help at the table. The corrected text itself
  (missing lines, tokens, "up to N tiles", etc.) is unchanged.
- Line endings of the vault files were preserved (some notes use CRLF).
- The few footnotes that interpreted an ambiguous original were reported to the owner
  for review instead of being turned into site-only content.

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
