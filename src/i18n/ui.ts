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
  'site.description': 'Rulebook, Traitor’s Tome and Secrets of Survival in English and Russian.',
  'lang.label': 'Language',
  'status.soon': 'Coming soon',

  'about.title': 'About',
  'about.body.1':
    'This site lets you read the three books of Betrayal at House on the Hill, 3rd Edition, right in the browser: on a laptop while learning the rules, or on a phone at the table.',
  'about.body.2':
    'Every page exists in English and Russian. Use the EN / RU switch in the header at any moment: you stay on the same page and at the same section.',

  'books.title': 'Books',
  'book.rules.title': 'Rulebook',
  'book.rules.body':
    'How to set up the house, explore it room by room, use items, omens and events, and what happens when the haunt begins.',
  'book.traitors-tome.title': 'Traitor’s Tome',
  'book.traitors-tome.body':
    'The traitor’s side of every haunt: secret goals and special rules. Only the traitor should read it.',
  'book.secrets-of-survival.title': 'Secrets of Survival',
  'book.secrets-of-survival.body':
    'The heroes’ side of every haunt: how the survivors can win. The traitor should not read it.',

  'switch.title': 'Switching languages',
  'switch.body.1':
    'To try it, scroll down until this section is at the top of the screen and press EN or RU. The page reloads in the other language and keeps this section in place.',
  'switch.body.2':
    'Your choice is remembered: the next time you open the site, it starts in the language you used last.',
} as const;

export type UiKey = keyof typeof en;

const ru: Record<UiKey, string> = {
  'site.title': 'Дом на холме',
  'site.subtitle': 'Предательство в доме на холме, третье издание',
  'site.description': 'Книга правил, книга предателя и книга выживших на русском и английском.',
  'lang.label': 'Язык',
  'status.soon': 'Скоро',

  'about.title': 'О сайте',
  'about.body.1':
    'Здесь можно читать все три книги «Предательства в доме на холме» (третье издание) прямо в браузере: с ноутбука, пока разбираетесь в правилах, или с телефона за игровым столом.',
  'about.body.2':
    'Каждая страница есть на русском и на английском. Переключатель EN / RU в шапке работает в любой момент: вы останетесь на той же странице и в том же разделе.',

  'books.title': 'Книги',
  'book.rules.title': 'Книга правил',
  'book.rules.body':
    'Как подготовить дом к игре, исследовать его комнату за комнатой, пользоваться предметами, знамениями и событиями, и что происходит, когда начинается сценарий.',
  'book.traitors-tome.title': 'Книга предателя',
  'book.traitors-tome.body':
    'Сторона предателя в каждом сценарии: тайные цели и особые правила. Читает только предатель.',
  'book.secrets-of-survival.title': 'Книга выживших',
  'book.secrets-of-survival.body':
    'Сторона героев в каждом сценарии: как выжившим победить. Предателю её читать нельзя.',

  'switch.title': 'Переключение языка',
  'switch.body.1':
    'Чтобы попробовать, прокрутите страницу так, чтобы этот раздел оказался вверху экрана, и нажмите EN или RU. Страница откроется на другом языке, и этот раздел останется на месте.',
  'switch.body.2':
    'Выбор запоминается: в следующий раз сайт откроется на том языке, которым вы пользовались последним.',
};

const strings: Record<Lang, Record<UiKey, string>> = { en, ru };

export function t(lang: Lang, key: UiKey): string {
  return strings[lang][key];
}
