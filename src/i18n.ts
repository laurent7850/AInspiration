import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Bundle French translations to eliminate HTTP roundtrip for default language (LCP)
import frCommon from '../public/locales/fr/common.json';
import frFeatures from '../public/locales/fr/features.json';
import frCollaboration from '../public/locales/fr/collaboration.json';
import frTraining from '../public/locales/fr/training.json';
import frContent from '../public/locales/fr/content.json';
import frSupport from '../public/locales/fr/support.json';

const allNamespaces = [
  'common', 'features', 'analysis', 'audit', 'auth', 'automation', 'blog',
  'collaboration', 'content', 'crm', 'dashboard', 'forms', 'pricing',
  'prompts', 'recommendations', 'support', 'training'
];

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en', 'nl'],
    ns: allNamespaces,
    defaultNS: 'common',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    // French homepage-critical namespaces bundled inline, rest loaded via HTTP
    resources: {
      fr: {
        common: frCommon,
        features: frFeatures,
        collaboration: frCollaboration,
        training: frTraining,
        content: frContent,
        support: frSupport,
      }
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
