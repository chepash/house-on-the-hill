import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

export const books = ['secrets-of-survival', 'traitors-tome'] as const;
export type Book = (typeof books)[number];

export const otherBook = (book: Book): Book => (book === 'traitors-tome' ? 'secrets-of-survival' : 'traitors-tome');

export type Haunt = CollectionEntry<'haunts'>;

/** One haunt number in a book's list. */
export type BookItem = {
  number: number;
  /** URL segment: `03`. */
  slug: string;
  /** The note rendered on this page. */
  note: Haunt;
  /** Title and metadata shown in the list and the page header. */
  info: Haunt['data'];
  /**
   * Set when the haunt is printed only in the other book (2–8 in the Traitor's Tome,
   * 9–12 in Secrets of Survival). The page then shows the book's pointer note.
   * These haunts still get their own row, so the list does not reveal the group.
   */
  elsewhere?: Book;
};

const pad = (n: number) => String(n).padStart(2, '0');

async function getNotes(book: Book, lang: Lang): Promise<Haunt[]> {
  return getCollection('haunts', (entry) => entry.id.startsWith(`${book}/${lang}/`));
}

export async function getBookItems(book: Book, lang: Lang): Promise<BookItem[]> {
  const [own, other] = await Promise.all([getNotes(book, lang), getNotes(otherBook(book), lang)]);
  const items: BookItem[] = [];

  for (const note of own) {
    const { number, lastNumber, stub } = note.data;
    if (!stub) {
      items.push({ number, slug: pad(number), note, info: note.data });
      continue;
    }
    for (let n = number; n <= (lastNumber ?? number); n++) {
      const real = other.find((h) => !h.data.stub && h.data.number === n);
      if (!real) throw new Error(`${book}/${lang}: haunt ${n} is in neither book`);
      items.push({ number: n, slug: pad(n), note, info: real.data, elsewhere: otherBook(book) });
    }
  }

  return items.sort((a, b) => a.number - b.number);
}
