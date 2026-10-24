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
  'site.subtitle': 'Betrayal at House on the Hill, 3rd Edition',
  'site.description': 'Traitor’s Tome and Secrets of Survival in English and Russian, ready for the phone.',
  'lang.label': 'Language',

  'home.side.title': 'Which side are you on?',
  'home.side.body':
    'When the haunt begins, find its number on the Scenario card, open your book below and pick the haunt. If the haunt is read from the other book, its page will tell you. Switch between EN and RU at any moment: you stay at the same place.',
  'home.terms.body': 'Game terms, icons and how to read {3/4/5/6}. No spoilers.',

  'book.secrets-of-survival.title': 'Secrets of Survival',
  'book.secrets-of-survival.side': 'Heroes',
  'book.secrets-of-survival.body': 'For the heroes.',
  'book.secrets-of-survival.warning': 'Heroes’ book. The traitor must not read it.',
  'book.traitors-tome.title': 'Traitor’s Tome',
  'book.traitors-tome.side': 'Traitor',
  'book.traitors-tome.body': 'For the traitor.',
  'book.traitors-tome.warning': 'Traitor’s book. Heroes must not read it.',

  'terms.title': 'Terms and Clarifications',

  'list.jump.label': 'Haunt number',
  'list.jump.submit': 'Open',
  'list.jump.notFound': 'There is no haunt with this number in this book.',

  'haunt.back': 'All haunts',
  'haunt.elsewhere': 'This haunt is printed in the other book. Everyone reads it there.',
} as const;

export type UiKey = keyof typeof en;

const ru: Record<UiKey, string> = {
  'site.title': 'Дом на холме',
  'site.subtitle': 'Предательство в доме на холме, третье издание',
  'site.description': 'Книга предателя и книга выживших на русском и английском, удобно с телефона.',
  'lang.label': 'Язык',

  'home.side.title': 'На чьей вы стороне?',
  'home.side.body':
    'Когда начнётся сценарий, найдите его номер на карточке сценария, откройте свою книгу и выберите сценарий. Если сценарий читают по другой книге, на его странице это будет сказано. Переключать EN и RU можно в любой момент: вы останетесь на том же месте.',
  'home.terms.body': 'Термины игры, иконки и как читать {3/4/5/6}. Без спойлеров.',

  'book.secrets-of-survival.title': 'Книга выживших',
  'book.secrets-of-survival.side': 'Герои',
  'book.secrets-of-survival.body': 'Для героев.',
  'book.secrets-of-survival.warning': 'Книга героев. Предателю её читать нельзя.',
  'book.traitors-tome.title': 'Книга предателя',
  'book.traitors-tome.side': 'Предатель',
  'book.traitors-tome.body': 'Для предателя.',
  'book.traitors-tome.warning': 'Книга предателя. Героям её читать нельзя.',

  'terms.title': 'Термины и пояснения',

  'list.jump.label': 'Номер сценария',
  'list.jump.submit': 'Открыть',
  'list.jump.notFound': 'В этой книге нет сценария с таким номером.',

  'haunt.back': 'Все сценарии',
  'haunt.elsewhere': 'Этот сценарий напечатан в другой книге. Все читают его там.',
};

const strings: Record<Lang, Record<UiKey, string>> = { en, ru };

export function t(lang: Lang, key: UiKey): string {
  return strings[lang][key];
}
