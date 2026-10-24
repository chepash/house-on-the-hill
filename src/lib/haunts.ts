import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

export const books = ['secrets-of-survival', 'traitors-tome'] as const;
export type Book = (typeof books)[number];

export const otherBook = (book: Book): Book => (book === 'traitors-tome' ? 'secrets-of-survival' : 'traitors-tome');

export type Haunt = CollectionEntry<'haunts'>;

/** `traitors-tome/en/09-12` -> `09-12` */
export const hauntSlug = (haunt: Haunt): string => haunt.id.split('/').at(-1)!;

/** `9–12` for range notes, `18` otherwise. */
export const hauntLabel = (haunt: Haunt): string =>
  haunt.data.lastNumber ? `${haunt.data.number}–${haunt.data.lastNumber}` : String(haunt.data.number);

export async function getHaunts(book: Book, lang: Lang): Promise<Haunt[]> {
  const haunts = await getCollection('haunts', (entry) => entry.id.startsWith(`${book}/${lang}/`));
  return haunts.sort((a, b) => a.data.number - b.data.number);
}
