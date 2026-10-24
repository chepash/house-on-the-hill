// Adds the original English term after the first mention of key game terms in the
// Russian haunt notes: «предатель» -> «предатель (traitor)». The printed game is in
// English, so the English word is often the quickest common ground at the table.
//
// English terms follow the vault glossary (_Справочник/Глоссарий.md). Patterns cover
// the Russian case forms. Longer phrases come first: «скрытый предатель» must win
// over «предатель».

import { visitParents } from 'unist-util-visit-parents';

const N = '(?:а|я|у|ю|ом|ем|е|и|ы|ей|ев|ов|ам|ям|ами|ями|ах|ях)?';
const ADJ = '(?:ый|ий|ого|его|ому|ему|ым|им|ом|ем|ая|ой|ую|ые|их|ых|ыми|ими)';

/**
 * [pattern (Russian), English, English plural?]. A null English marks a phrase that
 * only looks like a term (a card name) and is skipped.
 */
export const TERMS = [
  [`исследовател(?:ь|${N}) паранормального`, null],
  [`скрыт${ADJ} предател(?:ь|${N})`, 'hidden traitor', 'hidden traitors'],
  [`инициатор${N} сценари(?:я|ев)`, 'haunt revealer'],
  [`исследовател(?:ь|${N})`, 'explorer', 'explorers'],
  [`геро(?:й|${N})`, 'hero', 'heroes'],
  [`предател(?:ь|${N})`, 'traitor', 'traitors'],
  [`карточк(?:а|и|е|у|ой|ам|ами|ах)? персонажа`, 'character board'],
  [`карточк(?:а|и|е|у|ой|ам|ами|ах)? монстр(?:а|ов)`, 'Monster card'],
  [`характеристик(?:а|и|е|у|ой|ам|ами|ах)?`, 'trait'],
  [`критическ${ADJ} значени(?:е|я|ю|ем|и)`, 'critical'],
  [`пол(?:е|я|ю|ем) зрения`, 'line of sight'],
  [`оглуш(?:ён|ен)(?:а|о|ы|н${ADJ})?`, 'stunned'],
];

// Plural endings of the masculine role nouns (герои, исследователей, предателям...).
const PLURAL = /(?:и|ей|ев|ям|ями|ях)$/iu;

// Cyrillic-aware word boundaries: \b only knows ASCII letters.
const combined = new RegExp(
  TERMS.map(([pattern]) => `(?<![а-яё])(${pattern})(?![а-яё])`).join('|'),
  'giu',
);

/** Only for files under a `ru/` folder of the haunt notes. */
export default function remarkTermHints() {
  return (tree, file) => {
    const path = (file.path ?? '').replaceAll('\\', '/');
    if (!path.includes('/haunts/') || !path.includes('/ru/')) return;

    const used = new Set();

    visitParents(tree, 'text', (node, ancestors) => {
      if (ancestors.some((a) => a.type === 'heading' || a.type === 'link')) return;
      const parent = ancestors.at(-1);
      const index = parent.children.indexOf(node);

      combined.lastIndex = 0;
      for (let match; (match = combined.exec(node.value)); ) {
        const [, english, plural] = TERMS[match.slice(1).findIndex(Boolean)];
        const end = match.index + match[0].length;
        if (!english) continue;
        const after = node.value.slice(end) || parent.children[index + 1]?.value || '';
        // Already annotated by hand («Кольцо (Ring)»), or annotated earlier on the page.
        if (used.has(english) || /^\s*\(/.test(after)) continue;

        used.add(english);
        const rest = node.value.slice(end);
        node.value = node.value.slice(0, end);
        const label = plural && PLURAL.test(match[0]) ? plural : english;
        const parts = [{ type: 'html', value: ` <span class="term-en" lang="en">(${label})</span>` }];
        if (rest) parts.push({ type: 'text', value: rest });
        parent.children.splice(index + 1, 0, ...parts);
        // Continue with the rest of the text, which is visited as its own node.
        return index + 1;
      }
    });
  };
}
