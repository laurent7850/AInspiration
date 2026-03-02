import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en', 'nl'],
    ns: [
      'common',
      'analysis',
      'recommendations',
      'features',
      'audit',
      'dashboard',
      'prompts',
      'collaboration',
      'training',
      'content',
      'support',
      'auth',
      'pricing',
      'crm',
      'forms',
      'automation',
      'blog'
    ],
    defaultNS: 'common',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
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
