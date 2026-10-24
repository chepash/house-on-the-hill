import { getRelativeLocaleUrl } from 'astro:i18n';
import { langs, type Lang } from './ui';

/** Prefixes a path inside `public/` with the site base. */
export function withBase(path: string): string {
  return import.meta.env.BASE_URL.replace(/\/?$/, '/') + path.replace(/^\//, '');
}

/** URLs of the current page in every language, e.g. `/base/en/rules/` and `/base/ru/rules/`. */
export function localizedUrls(pathname: string): Record<Lang, string> {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  // Drop the base and the leading locale segment: `/base/en/rules/` -> `rules/`.
  const rest = pathname.slice(base.length).replace(/^\/[^/]+\/?/, '');
  return Object.fromEntries(langs.map((lang) => [lang, getRelativeLocaleUrl(lang, rest)])) as Record<Lang, string>;
}
