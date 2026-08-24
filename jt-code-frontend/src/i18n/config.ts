import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { LANGUAGES, isRtl } from './languages';

import en from './locales/en.json';
import zh from './locales/zh.json';
import hi from './locales/hi.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import bn from './locales/bn.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import ur from './locales/ur.json';
import id from './locales/id.json';
import de from './locales/de.json';
import ja from './locales/ja.json';
import sw from './locales/sw.json';
import mr from './locales/mr.json';
import te from './locales/te.json';
import tr from './locales/tr.json';
import ta from './locales/ta.json';
import ko from './locales/ko.json';
import it from './locales/it.json';

export const STORAGE_KEY = 'jt-code-lang';

const resources = {
  en: { translation: en },
  zh: { translation: zh },
  hi: { translation: hi },
  es: { translation: es },
  fr: { translation: fr },
  ar: { translation: ar },
  bn: { translation: bn },
  pt: { translation: pt },
  ru: { translation: ru },
  ur: { translation: ur },
  id: { translation: id },
  de: { translation: de },
  ja: { translation: ja },
  sw: { translation: sw },
  mr: { translation: mr },
  te: { translation: te },
  tr: { translation: tr },
  ta: { translation: ta },
  ko: { translation: ko },
  it: { translation: it },
} as const;

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: LANGUAGES.map((l) => l.code),
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: STORAGE_KEY,
    },
  });

function applyDirection(lng: string) {
  document.documentElement.dir = isRtl(lng) ? 'rtl' : 'ltr';
}

applyDirection(i18n.language);
i18n.on('languageChanged', applyDirection);

export default i18n;
