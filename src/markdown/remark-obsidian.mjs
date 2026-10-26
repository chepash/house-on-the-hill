// Renders the Obsidian syntax used in the vault notes:
// - `![[name.png|18]]` icon embeds -> <img>; `portrait-*` files get the portrait class
// - `> [!type] Title` callouts (nested too) -> <aside class="callout">; foldable ones
//   (`[!type]-` / `[!type]+`) -> <details> with the title as <summary>
// - every heading and callout gets a positional id (`b1`, `b2`, ...) and
//   `data-anchor`. Both languages of a note have the same structure (checked by
//   scripts/sync-vault.mjs), so the same id points to the same block, which is
//   what the language switch uses to keep the reading position.
// - the haunts' "Read First!" section (up to the `---` after it) -> <section class="read-first">;
//   objective + tokens, the endings and lists of tiles -> tinted <section class="panel">;
//   a `## Monster: …` heading moves into the monster box that follows it
//
// Must run before remark-breaks: callout titles end at the first line break.

import { visit } from 'unist-util-visit';

const EMBED = /!\[\[([^\]|\\]+)(?:\\?\|(\d+))?\]\]/g;
const GLUED_WORD = /([^\s ]+) $/;
const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const CALLOUT_MARKER = /^\[!([a-z-]+)\]([+-]?)[ \t]*/;

const CALLOUT_ICONS = {
  action: 'icons/special-action.svg',
  monster: 'icons/monster.svg',
  death: 'icons/death.svg',
  important: 'icons/important.svg',
  clarify: 'ui/clarify.svg',
};

/** @param {{ base: string }} options Site base URL ending with `/`. */
export default function remarkObsidian({ base }) {
  const img = (src, className, width) =>
    `<img class="${className}" src="${base}${encodeURI(src)}" alt=""${width ? ` width="${width}"` : ''}>`;

  return (tree) => {
    visit(tree, 'blockquote', (node) => {
      transformCallout(node, (type) => (CALLOUT_ICONS[type] ? img(CALLOUT_ICONS[type], 'callout__icon') : null));
    });

    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === undefined || !node.value.includes('![[')) return;
      const parts = [];
      let last = 0;
      for (const match of node.value.matchAll(EMBED)) {
        let before = node.value.slice(last, match.index);
        const name = match[1].trim();
        let html = img(`icons/${name}`, name.startsWith('portrait-') ? 'portrait' : 'icon', match[2]);
        // "Items ![[item.svg]]": the notes join the word and its icon with a no-break space,
        // but browsers still break next to an image, so the pair goes in one nowrap span.
        const word = before.match(GLUED_WORD);
        if (word) {
          before = before.slice(0, -word[0].length);
          html = `<span class="nowrap">${escapeHtml(word[1])} ${html}</span>`;
        }
        if (before) parts.push({ type: 'text', value: before });
        parts.push({ type: 'html', value: html });
        last = match.index + match[0].length;
      }
      if (last < node.value.length) parts.push({ type: 'text', value: node.value.slice(last) });
      parent.children.splice(index, 1, ...parts);
      return index + parts.length;
    });

    wrapHauntSections(tree, img(CALLOUT_ICONS.monster, 'callout__badge'));

    let anchor = 0;
    visit(tree, (node) => {
      if (node.type !== 'heading' && !node.data?.callout) return;
      anchor += 1;
      node.data ??= {};
      node.data.hProperties = { ...node.data.hProperties, id: `b${anchor}`, dataAnchor: '' };
    });
  };
}

// The haunt notes' "Read First!" heading, and what the rulebook ("Starting the Haunt")
// says to do with that part: it is shared with everyone, the rest of the haunt is not.
const READ_FIRST = {
  'Read First!':
    'Read the introduction aloud to all players, then do the setup. Everything below this box is for your side only.',
  'Читать в первую очередь!':
    'Введение зачитайте вслух всем игрокам, затем выполните подготовку. Всё, что ниже этой рамки, — только для вашей стороны.',
};

// Haunt sections printed on a tinted panel: objective + tokens (red), the endings (yellow),
// lists of tiles (grey).
const TILES_RE = /^(Tiles[ ,]|Warding Tiles|Rooms with |Haunted Tiles|Bedroom Tiles|The Gang.s Favorite Places|Тайлы[ ,]|Комнаты с |Заколдованные тайлы|Любимые места)/;
const OBJECTIVE = ['Objective', 'Цель'];
const TOKENS = ['Tokens Needed', 'Жетоны'];
const WIN = ['If You Win', 'If the Heroes Win', 'If the Traitor Wins', 'Если вы победили', 'Если победили герои', 'Если победил предатель'];

const h2Text = (n) => (n.type === 'heading' && n.depth === 2 && n.children.length === 1 ? n.children[0].value : null);

/**
 * Index after the section starting at `start`: the next h2, `---` or callout, or the end.
 * Callouts (special actions, monsters) are printed outside the panels, even when they
 * have no heading of their own; our own notes stay with the section they explain.
 */
function sectionEnd(children, start) {
  const end = children.findIndex(
    (n, i) =>
      i > start &&
      ((n.type === 'heading' && n.depth === 2) ||
        n.type === 'thematicBreak' ||
        (n.data?.callout && n.data.hProperties.dataCallout !== 'clarify')),
  );
  return end === -1 ? children.length : end;
}

function wrapPanel(children, start, end, className) {
  const panel = {
    type: 'panel',
    data: { hName: 'section', hProperties: { className: ['panel', className] } },
    children: children.slice(start, end),
  };
  children.splice(start, end - start, panel);
}

const MONSTER_HEADING = /^\s*(Monster|Монстр)s?:/;

/**
 * `## Monster: Slugs` followed by the `[!monster] Slugs` box: the books print one box with
 * the heading as its title, so the heading moves into the box and replaces its title. The
 * monster icon sits on the box's top edge, as printed.
 */
function mergeMonsterHeadings(kids, badge) {
  for (let i = 0; i < kids.length - 1; i++) {
    const heading = kids[i];
    const box = kids[i + 1];
    if (heading.type !== 'heading' || heading.depth !== 2) continue;
    const text = heading.children.filter((c) => c.type === 'text').map((c) => c.value).join('');
    if (!MONSTER_HEADING.test(text) || box.data?.hProperties?.dataCallout !== 'monster') continue;
    box.children = [{ type: 'html', value: badge }, heading, ...box.children.filter((c) => c.data?.hProperties?.className?.[0] !== 'callout__title')];
    kids.splice(i, 1);
  }
}

/** Haunt notes only: boxes the sections the haunt books print on panels. */
function wrapHauntSections(tree, monsterBadge) {
  if (!wrapReadFirst(tree)) return;
  const kids = tree.children;
  mergeMonsterHeadings(kids, monsterBadge);
  const objective = kids.findIndex((n) => OBJECTIVE.includes(h2Text(n)));
  if (objective !== -1) {
    let end = sectionEnd(kids, objective);
    if (TOKENS.includes(h2Text(kids[end] ?? {}))) end = sectionEnd(kids, end);
    wrapPanel(kids, objective, end, 'panel--objective');
  }
  const win = kids.findIndex((n) => WIN.includes(h2Text(n)));
  if (win !== -1) {
    // Hidden traitor haunts have two endings in a row; they share one panel.
    let end = sectionEnd(kids, win);
    while (WIN.includes(h2Text(kids[end] ?? {}))) end = sectionEnd(kids, end);
    wrapPanel(kids, win, end, 'panel--win');
  }
  const isTiles = (n) => TILES_RE.test(h2Text(n ?? {}) ?? '');
  for (let i = 0; i < kids.length; i++) {
    if (!isTiles(kids[i])) continue;
    // Lists of tiles in a row share one panel, as printed.
    let end = sectionEnd(kids, i);
    while (isTiles(kids[end])) end = sectionEnd(kids, end);
    wrapPanel(kids, i, end, 'panel--tiles');
  }
}

/** Puts the "Read First!" section (up to the `---` after it) in a box, as in the haunt books. */
function wrapReadFirst(tree) {
  const start = tree.children.findIndex((n) => READ_FIRST[h2Text(n)]);
  if (start === -1) return false;
  const end = tree.children.findIndex((n, i) => i > start && n.type === 'thematicBreak');
  if (end === -1) return false;

  const heading = tree.children[start];
  heading.data = { hProperties: { className: ['read-first__banner'] } };
  const hint = {
    type: 'paragraph',
    data: { hProperties: { className: ['read-first__hint'] } },
    children: [{ type: 'text', value: READ_FIRST[heading.children[0].value] }],
  };
  const box = {
    type: 'readFirst',
    data: { hName: 'section', hProperties: { className: ['read-first'] } },
    children: [heading, hint, ...tree.children.slice(start + 1, end)],
  };
  // The box replaces the `---` that closed the section.
  tree.children.splice(start, end - start + 1, box);
  return true;
}

/** Turns a `> [!type] Title` blockquote into title + content containers. */
function transformCallout(node, iconHtml) {
  const first = node.children[0];
  const head = first?.type === 'paragraph' ? first.children[0] : undefined;
  const marker = head?.type === 'text' ? head.value.match(CALLOUT_MARKER) : null;
  if (!marker) return;

  const type = marker[1];
  // Obsidian's foldable callouts: `[!type]-` starts folded, `[!type]+` starts open.
  const fold = marker[2];
  head.value = head.value.slice(marker[0].length);

  // The title is everything on the marker line; the rest of the paragraph is content.
  const title = [];
  const rest = [];
  let inTitle = true;
  for (const child of first.children) {
    if (!inTitle) {
      rest.push(child);
    } else if (child.type === 'break') {
      inTitle = false;
    } else if (child.type === 'text' && child.value.includes('\n')) {
      const [before, ...after] = child.value.split('\n');
      if (before) title.push({ ...child, value: before });
      rest.push({ type: 'text', value: after.join('\n') });
      inTitle = false;
    } else {
      title.push(child);
    }
  }

  // `Once during your turn, you may: **Name**` (special actions): the lead-in becomes a small
  // line above the name, as printed in the books.
  let kicker = null;
  const parts = title.filter((n) => !(n.type === 'text' && !n.value.trim()));
  if (parts.length === 2 && parts[0].type === 'text' && /:\s*$/.test(parts[0].value) && parts[1].type === 'strong') {
    kicker = parts[0].value.replace(/:\s*$/, '').trim();
    title.splice(0, title.length, ...parts[1].children);
  }

  const icon = iconHtml(type);
  const content = rest.length ? [{ type: 'paragraph', children: rest }, ...node.children.slice(1)] : node.children.slice(1);

  node.data = {
    callout: true,
    hName: fold ? 'details' : 'aside',
    hProperties: { className: ['callout'], dataCallout: type, ...(fold === '+' ? { open: true } : {}) },
  };
  node.children = [
    ...(kicker
      ? [{ type: 'paragraph', data: { hName: 'div', hProperties: { className: ['callout__kicker'] } }, children: [{ type: 'text', value: kicker }] }]
      : []),
    {
      type: 'paragraph',
      data: {
        hName: fold ? 'summary' : 'div',
        hProperties: { className: kicker ? ['callout__title', 'callout__title--named'] : ['callout__title'] },
      },
      // Title text in one span: the title row is a flex container, and loose
      // text/strong nodes would otherwise become separate flex columns.
      children: [
        ...(icon ? [{ type: 'html', value: icon }] : []),
        { type: 'calloutTitleText', data: { hName: 'span' }, children: title },
      ],
    },
    ...(content.length
      ? [{ type: 'calloutContent', data: { hName: 'div', hProperties: { className: ['callout__content'] } }, children: content }]
      : []),
  ];
}
