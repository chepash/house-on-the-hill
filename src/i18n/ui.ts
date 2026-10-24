export const languages = {
  en: 'English',
  ru: 'Русский',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'en';
export const langs = Object.keys(languages) as Lang[];

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && value in languages;
}

const en = {
  'site.title': 'House on the Hill',
  'game.title': 'Betrayal at House\non the Hill',
  'site.description': 'Traitor’s Tome and Secrets of Survival in English and Russian, ready for the phone.',
  'lang.label': 'Language',

  'home.side.title': 'Which side are you on?',

  'book.secrets-of-survival.title': 'Secrets of Survival',
  'book.secrets-of-survival.body': 'For the heroes.',
  'book.secrets-of-survival.warning': 'Heroes’ book. The traitor must not read it.',
  'book.traitors-tome.title': 'Traitor’s Tome',
  'book.traitors-tome.body': 'For the traitor.',
  'book.traitors-tome.warning': 'Traitor’s book. Heroes must not read it.',

  'terms.title': 'Terms and Clarifications',

  'lock.tape': 'KEEP OUT',
  'lock.note': 'The House on the Hill expects its guests on 25 October at 16:00, Tbilisi time.',

  'rules.title': 'Rulebook',
  'rules.contents': 'Contents',
  'rules.prev': 'Previous',
  'rules.next': 'Next',

  'list.jump.label': 'Haunt number',
  'list.jump.submit': 'Open',
  'list.jump.notFound': 'There is no haunt with this number in this book.',

  'haunt.back': 'All haunts',
  'haunt.elsewhere': 'This haunt is printed in the other book. Everyone reads it there.',
} as const;

export type UiKey = keyof typeof en;

const ru: Record<UiKey, string> = {
  'site.title': 'Дом на холме',
  'game.title': 'Предательство\nв доме на холме',
  'site.description': 'Книга предателя и книга выживших на русском и английском, удобно с телефона.',
  'lang.label': 'Язык',

  'home.side.title': 'На чьей вы стороне?',

  'book.secrets-of-survival.title': 'Книга выживших',
  'book.secrets-of-survival.body': 'Для героев.',
  'book.secrets-of-survival.warning': 'Книга героев. Предателю её читать нельзя.',
  'book.traitors-tome.title': 'Книга предателя',
  'book.traitors-tome.body': 'Для предателя.',
  'book.traitors-tome.warning': 'Книга предателя. Героям её читать нельзя.',

  'terms.title': 'Термины и пояснения',

  'lock.tape': 'KEEP OUT',
  'lock.note': 'Дом на холме ждёт гостей 25 октября в 16:00 по Тбилиси.',

  'rules.title': 'Правила',
  'rules.contents': 'Оглавление',
  'rules.prev': 'Назад',
  'rules.next': 'Далее',

  'list.jump.label': 'Номер наваждения',
  'list.jump.submit': 'Открыть',
  'list.jump.notFound': 'В этой книге нет наваждения с таким номером.',

  'haunt.back': 'Все наваждения',
  'haunt.elsewhere': 'Это наваждение напечатано в другой книге. Все читают его там.',
};

const strings: Record<Lang, Record<UiKey, string>> = { en, ru };

export function t(lang: Lang, key: UiKey): string {
  return strings[lang][key];
}
