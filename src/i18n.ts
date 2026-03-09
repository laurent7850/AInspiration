import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Bundle French translations to eliminate HTTP roundtrip for default language (LCP)
import frCommon from '../public/locales/fr/common.json';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en', 'nl'],
    ns: ['common'],
    defaultNS: 'common',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    // French bundled inline, en/nl loaded via HTTP backend on demand
    resources: {
      fr: { common: frCommon }
    },
    partialBundledLanguages: true,
    detection: {
      order: ['path', 'querystring', 'cookie', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0,
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    }
  });

export default i18n;
