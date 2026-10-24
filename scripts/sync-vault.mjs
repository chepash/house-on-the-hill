// Copies the haunt notes, the terms page and the icons from the Obsidian vault
// into the repository, normalizing frontmatter to one schema for both languages.
//
// Usage: npm run sync [-- <vault dir>]   (or set VAULT_DIR)
//
// The output is committed: the site never reads from the vault directly.

import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
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

const PAGES = [{ id: 'terms', files: { en: 'English/Terms and Clarifications.md', ru: 'Русский/Термины и пояснения.md' } }];

const ICON_DIRS = ['_Справочник/иконки', '_Справочник/жетоны'];

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

/** Removes the H1, the Obsidian footer and any line with a vault link; returns the H1 text. */
function cleanBody(body, file) {
  let h1 = null;
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const h1Index = lines.findIndex((line) => line.startsWith('# '));
  if (h1Index !== -1) h1 = lines.splice(h1Index, 1)[0].slice(2).trim();

  // Footer: a `---` rule followed by navigation links at the very end.
  let text = lines.join('\n').replace(/\n---[ \t]*\n+\[\[[^\n]*\]\][^\n]*\s*$/, '\n');

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
  for (const { id, files } of PAGES) {
    const structures = { en: new Map(), ru: new Map() };
    for (const [lang, file] of Object.entries(files)) {
      const { body: rawBody } = splitNote(await readFile(join(vault, file), 'utf8'));
      const { h1, body } = cleanBody(rawBody, file);
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
