// Copies the haunt notes, the terms page, the rulebook chapters and the icons from the Obsidian vault
// into the repository, normalizing frontmatter to one schema for both languages.
//
// Usage: npm run sync [-- <vault dir>]   (or set VAULT_DIR)
//
// The output is committed: the site never reads from the vault directly.

import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, posix, resolve } from 'node:path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

const DEFAULT_VAULT = 'D:/Dropbox/obsidian_vaults/Betrayal_at_House_on_the_Hill';
const vault = resolve(process.argv[2] ?? process.env.VAULT_DIR ?? DEFAULT_VAULT);
const root = resolve(import.meta.dirname, '..');

const HAUNTS_OUT = join(root, 'src/content/haunts');
const PAGES_OUT = join(root, 'src/content/pages');
const ICONS_OUT = join(root, 'public/icons');

const BOOKS = [
  { book: 'traitors-tome', dirs: { en: "English/Traitor's Tome", ru: 'Русский/Книга предателя' } },
  { book: 'secrets-of-survival', dirs: { en: 'English/Secrets of Survival', ru: 'Русский/Книга выживших' } },
];

const RULEBOOK_CHAPTERS = [
  { en: '1 Preliminaries', ru: '1 Введение' },
  { en: '2 Components and Setup', ru: '2 Компоненты и подготовка' },
  { en: '3 Before the Haunt', ru: '3 До начала наваждения' },
  { en: '4 After the Haunt Begins', ru: '4 После начала наваждения' },
  { en: '5 Characters', ru: '5 Персонажи' },
];

const RULEBOOK_DIRS = { en: 'English/Rulebook', ru: 'Русский/Правила' };

// `from` is where the page is served below the language root; rulebook links are made relative to it.
const PAGES = [
  { id: 'terms', from: 'terms/', files: { en: 'English/Terms and Clarifications.md', ru: 'Русский/Термины и пояснения.md' } },
  // Rulebook chapters become pages `rules-1` … `rules-5`; the index is shown on the contents page.
  ...RULEBOOK_CHAPTERS.map((names, i) => ({
    id: `rules-${i + 1}`,
    from: `rules/${i + 1}/`,
    files: { en: `${RULEBOOK_DIRS.en}/${names.en}.md`, ru: `${RULEBOOK_DIRS.ru}/${names.ru}.md` },
  })),
  { id: 'rules-index', from: 'rules/', files: { en: `${RULEBOOK_DIRS.en}/Index.md`, ru: `${RULEBOOK_DIRS.ru}/Указатель.md` } },
];

const ICON_DIRS = ['_Справочник/иконки', '_Справочник/жетоны', '_Справочник/портреты'];

// Frontmatter keys of the Russian notes, mapped to the English ones.
const RU_KEYS = {
  сценарий: 'haunt',
  сторона: 'side',
  en: 'titleEn',
  карточка: 'scenario_card',
  триггер: 'trigger',
  предатель: 'traitor',
};

const warnings = [];
const warn = (message) => warnings.push(message);

function splitNote(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return { data: {}, body: text };
  return { data: parseYaml(match[1]) ?? {}, body: text.slice(match[0].length) };
}

/** Removes the H1 and the Obsidian footer; returns the H1 text and the body without the footer. */
function stripNote(body) {
  let h1 = null;
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const h1Index = lines.findIndex((line) => line.startsWith('# '));
  if (h1Index !== -1) h1 = lines.splice(h1Index, 1)[0].slice(2).trim();

  // Footer: a `---` rule followed by navigation links at the very end.
  return { h1, text: lines.join('\n').replace(/\n---[ \t]*\n+\[\[[^\n]*\]\][^\n]*\s*$/, '\n') };
}

/**
 * Removes the H1, the Obsidian footer and any line with a vault link; returns the H1 text.
 * `from` is the page's path below the language root (e.g. `rules/`): links to rulebook
 * chapters are turned into site links relative to it instead of being dropped.
 */
function cleanBody(body, file, from) {
  const { h1, text: stripped } = stripNote(body);
  let text = from === undefined ? stripped : resolveRulebookLinks(stripped, from, file);

  // Other vault links (e.g. "Русская версия: [[...]]") make no sense on the site.
  text = text
    .split('\n')
    .filter((line) => {
      if (!/(?<!!)\[\[[^\]]+\]\]/.test(line)) return true;
      warn(`${file}: dropped line with a vault link: ${line.trim()}`);
      return false;
    })
    .join('\n');

  return { h1, body: text.replace(/^\n+/, '').replace(/\s*$/, '\n') };
}

/**
 * Anchors of every rulebook chapter, keyed by vault path without `.md`
 * (`English/Rulebook/4 After the Haunt Begins`): chapter number and heading text -> `bN`.
 * The numbering is the one remark-obsidian gives headings and callouts on the page.
 */
const rulebookAnchors = new Map();

async function loadRulebookAnchors() {
  for (const [i, names] of RULEBOOK_CHAPTERS.entries()) {
    for (const [lang, name] of Object.entries(names)) {
      const path = `${RULEBOOK_DIRS[lang]}/${name}`;
      const { text } = stripNote(splitNote(await readFile(join(vault, `${path}.md`), 'utf8')).body);
      const headings = new Map();
      let anchor = 0;
      for (const m of text.matchAll(/^(#{2,6}) (.*)$|^(?:> ?)*> \[![a-z-]+\]/gm)) {
        anchor += 1;
        if (m[1]) headings.set(m[2].trim(), `b${anchor}`);
      }
      rulebookAnchors.set(path, { chapter: i + 1, headings });
    }
  }
}

/** `[[English/Rulebook/4 …#Attacking|Attacking]]` -> `[Attacking](../4/#b5)`, relative to `from`. */
function resolveRulebookLinks(text, from, file) {
  return text.replace(/(?<!!)\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g, (link, path, heading, label) => {
    const target = rulebookAnchors.get(path.trim());
    if (!target) return link; // not a rulebook link: dropped later with a warning
    const page = posix.relative(from, `rules/${target.chapter}/`) || '.';
    let hash = '';
    if (heading) {
      const id = target.headings.get(heading.trim());
      if (id) hash = `#${id}`;
      else warn(`${file}: no heading "${heading}" in ${path}`);
    }
    return `[${label ?? heading ?? path}](${page}/${hash})`;
  });
}

/** "18 · A Nice Ring to It — Traitor" -> "A Nice Ring to It" */
function titleFromH1(h1, file) {
  const match = h1?.match(/^[\d–-]+\s*·\s*(.+)\s+—\s+[^—]+$/);
  if (match) return match[1].trim();
  warn(`${file}: unexpected H1 "${h1}", used as the title as is`);
  return h1 ?? file;
}

/** Headings (except H1) and callouts, in order: the anchors kept in sync across languages. */
function structure(body) {
  return [...body.matchAll(/^(#{2,6}) |^(?:> ?)*> \[!([a-z-]+)\]/gm)].map((m) => (m[1] ? `h${m[1].length}` : m[2]));
}

const pad = (n) => String(n).padStart(2, '0');

async function writeNote(path, data, body) {
  const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined && v !== null && v !== ''));
  await writeFile(path, `---\n${stringifyYaml(clean)}---\n\n${body}`, 'utf8');
}

async function syncBook({ book, dirs }) {
  const structures = { en: new Map(), ru: new Map() };

  for (const [lang, dir] of Object.entries(dirs)) {
    const out = join(HAUNTS_OUT, book, lang);
    await mkdir(out, { recursive: true });

    for (const name of (await readdir(join(vault, dir))).sort()) {
      const range = name.match(/^(\d+)(?:-(\d+))?\s.*\.md$/);
      if (!range) continue; // Index / table of contents notes are rebuilt by the site.

      const file = `${dir}/${name}`;
      const { data: raw, body: rawBody } = splitNote(await readFile(join(vault, file), 'utf8'));
      const data = lang === 'ru' ? Object.fromEntries(Object.entries(raw).map(([k, v]) => [RU_KEYS[k] ?? k, v])) : raw;
      const { h1, body } = cleanBody(rawBody, file);

      const number = Number(range[1]);
      const lastNumber = range[2] ? Number(range[2]) : undefined;
      const slug = lastNumber ? `${pad(number)}-${pad(lastNumber)}` : pad(number);

      structures[lang].set(slug, structure(body));
      await writeNote(
        join(out, `${slug}.md`),
        {
          title: titleFromH1(h1, file),
          titleEn: data.titleEn,
          number,
          lastNumber,
          // Range notes only point to the other book.
          stub: lastNumber !== undefined,
          scenarioCard: data.scenario_card,
          trigger: data.trigger,
          traitor: data.traitor,
        },
        body,
      );
    }
  }

  checkPairs(book, structures);
  return structures.en.size;
}

function checkPairs(name, structures) {
  const all = new Set([...structures.en.keys(), ...structures.ru.keys()]);
  for (const slug of all) {
    const en = structures.en.get(slug);
    const ru = structures.ru.get(slug);
    if (!en || !ru) {
      warn(`${name}/${slug}: missing in ${en ? 'ru' : 'en'}`);
    } else if (en.join() !== ru.join()) {
      warn(`${name}/${slug}: structure differs (en: ${en.join(' ')} | ru: ${ru.join(' ')})`);
    }
  }
}

async function syncPages() {
  await loadRulebookAnchors();
  for (const { id, from, files } of PAGES) {
    const structures = { en: new Map(), ru: new Map() };
    for (const [lang, file] of Object.entries(files)) {
      const { body: rawBody } = splitNote(await readFile(join(vault, file), 'utf8'));
      const { h1, body } = cleanBody(rawBody, file, from);
      structures[lang].set(id, structure(body));
      await mkdir(join(PAGES_OUT, lang), { recursive: true });
      await writeNote(join(PAGES_OUT, lang, `${id}.md`), { title: h1 }, body);
    }
    checkPairs('pages', structures);
  }
}

async function syncIcons() {
  await mkdir(ICONS_OUT, { recursive: true });
  const seen = new Map();
  for (const dir of ICON_DIRS) {
    for (const name of await readdir(join(vault, dir))) {
      if (seen.has(name)) warn(`icon ${name} exists in both ${seen.get(name)} and ${dir}`);
      seen.set(name, dir);
      await copyFile(join(vault, dir, name), join(ICONS_OUT, name));
    }
  }
  return seen.size;
}

await Promise.all([HAUNTS_OUT, PAGES_OUT, ICONS_OUT].map((dir) => rm(dir, { recursive: true, force: true })));

const counts = [];
for (const book of BOOKS) counts.push(`${book.book}: ${await syncBook(book)}`);
await syncPages();
counts.push(`icons: ${await syncIcons()}`);

console.log(`Synced from ${vault}\n  ${counts.join('\n  ')}`);
if (warnings.length) console.warn(`\n${warnings.length} warning(s):\n  ${warnings.join('\n  ')}`);
