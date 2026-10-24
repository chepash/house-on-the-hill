// Keeps the reading position when switching languages. Both language versions
// of a page share heading ids, so the topmost visible heading identifies the
// position, and its distance from the viewport top is restored after the swap.

export const LANG_STORAGE_KEY = 'hoth:lang';
const ANCHOR_STORAGE_KEY = 'hoth:reading-anchor';

// Headings below this line (px from the viewport top) are not "read yet".
const READING_LINE = 120;

type Anchor = { id: string; offset: number };

function captureAnchor(): Anchor | null {
  if (window.scrollY === 0) return null;

  const headings = document.querySelectorAll<HTMLElement>('main :is(h1, h2, h3, h4, h5, h6)[id]');
  let anchor: Anchor | null = null;
  for (const heading of headings) {
    const top = heading.getBoundingClientRect().top;
    if (top > READING_LINE && anchor) break;
    anchor = { id: heading.id, offset: top };
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

  const heading = document.getElementById(anchor.id);
  if (!heading) return;
  window.scrollTo(0, heading.getBoundingClientRect().top + window.scrollY - anchor.offset);
}

export function rememberLang(lang: string): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Ignore: the root page falls back to the browser language.
  }
}
