// Keeps the reading position when switching languages. Both language versions
// of a page share anchor ids (headings and callouts, see remark-obsidian), so the
// topmost visible anchor identifies the position, and its distance from the
// viewport top is restored after the swap.

export const LANG_STORAGE_KEY = 'hoth:lang';
const ANCHOR_STORAGE_KEY = 'hoth:reading-anchor';

// Anchors below this line (px from the viewport top) are not "read yet".
const READING_LINE = 120;

type Anchor = { id: string; offset: number };

function captureAnchor(): Anchor | null {
  if (window.scrollY === 0) return null;

  const anchors = document.querySelectorAll<HTMLElement>('main [data-anchor][id]');
  let anchor: Anchor | null = null;
  for (const element of anchors) {
    const top = element.getBoundingClientRect().top;
    if (top > READING_LINE && anchor) break;
    anchor = { id: element.id, offset: top };
    if (top > READING_LINE) break;
  }
  return anchor;
}

export function saveReadingAnchor(): void {
  const anchor = captureAnchor();
  if (!anchor) return;
  try {
    sessionStorage.setItem(ANCHOR_STORAGE_KEY, JSON.stringify(anchor));
  } catch {
    // Storage may be unavailable (private mode); the switch still works, just from the top.
  }
}

export function restoreReadingAnchor(): void {
  let anchor: Anchor | null = null;
  try {
    const raw = sessionStorage.getItem(ANCHOR_STORAGE_KEY);
    sessionStorage.removeItem(ANCHOR_STORAGE_KEY);
    anchor = raw ? (JSON.parse(raw) as Anchor) : null;
  } catch {
    return;
  }
  if (!anchor) return;

  const element = document.getElementById(anchor.id);
  if (!element) return;
  window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - anchor.offset);
}

export function rememberLang(lang: string): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Ignore: the root page falls back to the browser language.
  }
}
