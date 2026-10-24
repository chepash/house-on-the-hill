// A playful, client-side "crime scene" lock on the two haunt books until game night.
// Not security: the pages are built and deployed as usual, and anyone can read the
// repository. Until UNLOCK_AT, book pages redirect to the home page and the home page
// covers the book cards with tape; at UNLOCK_AT everything opens by itself, no redeploy.

/** 25 October 2026, 16:00 in Tbilisi (UTC+4). */
export const UNLOCK_AT = Date.parse('2026-10-25T16:00:00+04:00');

const LOCKED_CLASS = 'locked';

export function isLocked(now = Date.now()): boolean {
  return now < UNLOCK_AT;
}

/** "in 1 d 3 h 20 min" / "через 1 д 3 ч 20 мин". */
function formatCountdown(ms: number, lang: string): string {
  const minutes = Math.max(1, Math.ceil(ms / 60_000));
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes % 1440) / 60);
  const m = minutes % 60;
  const units = lang === 'ru' ? { d: 'д', h: 'ч', m: 'мин', in: 'через' } : { d: 'd', h: 'h', m: 'min', in: 'in' };
  const parts = [d && `${d} ${units.d}`, (d || h) && `${h} ${units.h}`, `${m} ${units.m}`].filter(Boolean);
  return `${units.in} ${parts.join(' ')}`;
}

let timer: number | undefined;

/** Tilts the tape along the rising diagonal of the covered area. */
function fitTapes(): void {
  document.querySelectorAll<HTMLElement>('.lock__overlay').forEach((overlay) => {
    const { width, height } = overlay.getBoundingClientRect();
    if (width && height) overlay.style.setProperty('--tape-angle', `${Math.atan2(height, width)}rad`);
  });
}

let listening = false;

/** Applies the lock to the current page; call on every page load and after every view-transition swap. */
export function applyLock(): void {
  window.clearInterval(timer);
  const root = document.documentElement;

  if (!isLocked()) {
    root.classList.remove(LOCKED_CLASS);
    document.querySelectorAll<HTMLElement>('[data-lock-zone]').forEach((zone) => (zone.inert = false));
    return;
  }

  // Book list and haunt pages are off limits: back to the home page.
  const home = document.body.dataset.home;
  if (document.body.dataset.book && home) {
    location.replace(home);
    return;
  }

  root.classList.add(LOCKED_CLASS);
  document.querySelectorAll<HTMLElement>('[data-lock-zone]').forEach((zone) => (zone.inert = true));
  fitTapes();
  if (!listening) {
    // Registered here, not at module level: Base.astro also imports this module at build time.
    window.addEventListener('resize', fitTapes);
    listening = true;
  }

  const tick = () => {
    if (!isLocked()) return applyLock();
    const text = formatCountdown(UNLOCK_AT - Date.now(), root.lang);
    document.querySelectorAll<HTMLElement>('[data-countdown]').forEach((el) => (el.textContent = text));
  };
  tick();
  timer = window.setInterval(tick, 15_000);
}
