// Character tables (rows with a portrait, e.g. haunt 40's Evil Twins) get a checkbox per
// row: unchecking a character who is not in the game dims the row, so the player doesn't
// read the wrong line. The choice is kept per device, by character, for every such table.

const STORAGE_KEY = 'hoth:characters-out';
const PORTRAIT = /portrait-([a-z-]+)\.png/;

function load(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

function save(out: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...out]));
  } catch {
    // Storage may be unavailable (private mode); the checkboxes still work on this page.
  }
}

export function initCharacterRows(): void {
  const out = load();
  const label = document.documentElement.lang === 'ru' ? 'В игре' : 'In play';

  document.querySelectorAll<HTMLTableRowElement>('.prose tr').forEach((row) => {
    const portrait = row.querySelector<HTMLImageElement>('img.portrait');
    const slug = portrait?.getAttribute('src')?.match(PORTRAIT)?.[1];
    if (!portrait || !slug || row.querySelector('.character-toggle')) return;

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 'character-toggle';
    box.title = label;
    box.setAttribute('aria-label', `${label}: ${row.cells[0].textContent?.trim() ?? slug}`);
    box.checked = !out.has(slug);
    row.classList.toggle('character-out', !box.checked);

    box.addEventListener('change', () => {
      if (box.checked) out.delete(slug);
      else out.add(slug);
      save(out);
      row.classList.toggle('character-out', !box.checked);
    });
    // The whole row is the tap target: the checkbox alone is small on a phone.
    row.addEventListener('click', (event) => {
      if (event.target === box) return;
      box.checked = !box.checked;
      box.dispatchEvent(new Event('change'));
    });
    row.classList.add('character-row');
    row.cells[0].prepend(box);
  });
}
