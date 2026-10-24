import { getEntry, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

/** Rulebook chapters, synced from the vault as pages `rules-1` … `rules-5`. */
export const chapters = [1, 2, 3, 4, 5] as const;

export async function getChapter(lang: Lang, chapter: number): Promise<CollectionEntry<'pages'>> {
  const page = await getEntry('pages', `${lang}/rules-${chapter}`);
  if (!page) throw new Error(`Missing pages/${lang}/rules-${chapter}.md, run npm run sync`);
  return page;
}
