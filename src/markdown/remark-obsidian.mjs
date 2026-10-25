// Renders the Obsidian syntax used in the vault notes:
// - `![[name.png|18]]` icon embeds -> <img>; `portrait-*` files get the portrait class
// - `> [!type] Title` callouts (nested too) -> <aside class="callout">
// - every heading and callout gets a positional id (`b1`, `b2`, ...) and
//   `data-anchor`. Both languages of a note have the same structure (checked by
//   scripts/sync-vault.mjs), so the same id points to the same block, which is
//   what the language switch uses to keep the reading position.
//
// Must run before remark-breaks: callout titles end at the first line break.

import { visit } from 'unist-util-visit';

const EMBED = /!\[\[([^\]|\\]+)(?:\\?\|(\d+))?\]\]/g;
const CALLOUT_MARKER = /^\[!([a-z-]+)\][+-]?[ \t]*/;

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
        if (match.index > last) parts.push({ type: 'text', value: node.value.slice(last, match.index) });
        const name = match[1].trim();
        parts.push({ type: 'html', value: img(`icons/${name}`, name.startsWith('portrait-') ? 'portrait' : 'icon', match[2]) });
        last = match.index + match[0].length;
      }
      if (last < node.value.length) parts.push({ type: 'text', value: node.value.slice(last) });
      parent.children.splice(index, 1, ...parts);
      return index + parts.length;
    });

    let anchor = 0;
    visit(tree, (node) => {
      if (node.type !== 'heading' && !node.data?.callout) return;
      anchor += 1;
      node.data ??= {};
      node.data.hProperties = { ...node.data.hProperties, id: `b${anchor}`, dataAnchor: '' };
    });
  };
}

/** Turns a `> [!type] Title` blockquote into title + content containers. */
function transformCallout(node, iconHtml) {
  const first = node.children[0];
  const head = first?.type === 'paragraph' ? first.children[0] : undefined;
  const marker = head?.type === 'text' ? head.value.match(CALLOUT_MARKER) : null;
  if (!marker) return;

  const type = marker[1];
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

  const icon = iconHtml(type);
  const content = rest.length ? [{ type: 'paragraph', children: rest }, ...node.children.slice(1)] : node.children.slice(1);

  node.data = {
    callout: true,
    hName: 'aside',
    hProperties: { className: ['callout'], dataCallout: type },
  };
  node.children = [
    {
      type: 'paragraph',
      data: { hName: 'div', hProperties: { className: ['callout__title'] } },
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
