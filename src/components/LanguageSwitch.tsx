import type { MouseEvent } from 'react';
import { navigate } from 'astro:transitions/client';
import { langs, languages, type Lang } from '../i18n/ui';
import { saveReadingAnchor } from '../scripts/reading-position';

type Props = {
  current: Lang;
  urls: Record<Lang, string>;
  label: string;
};

export default function LanguageSwitch({ current, urls, label }: Props) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>, lang: Lang) {
    // Let the browser handle "open in new tab" and similar clicks.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    saveReadingAnchor();
    navigate(urls[lang]);
  }

  return (
    <nav className="lang-switch" aria-label={label}>
      {langs.map((lang) =>
        lang === current ? (
          <span key={lang} className="lang-switch__item" aria-current="true" title={languages[lang]}>
            {lang.toUpperCase()}
          </span>
        ) : (
          <a
            key={lang}
            className="lang-switch__item"
            href={urls[lang]}
            hrefLang={lang}
            lang={lang}
            title={languages[lang]}
            onClick={(event) => handleClick(event, lang)}
          >
            {lang.toUpperCase()}
          </a>
        ),
      )}
    </nav>
  );
}
