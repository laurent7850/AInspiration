import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Minimal i18n instance for tests — returns keys as values
const i18nTest = i18n.createInstance();
i18nTest.use(initReactI18next).init({
  lng: 'fr',
  fallbackLng: 'fr',
  supportedLngs: ['fr', 'en', 'nl'],
  ns: ['common', 'forms'],
  defaultNS: 'common',
  resources: {
    fr: {
      common: {
        'footer.company': 'AInspiration',
        'footer.description': 'Solutions IA pour PME',
        'footer.rights': 'Tous droits réservés',
        'footer.vat': 'TVA: BE0XXX.XXX.XXX',
        'footer.sections.features': 'Solutions',
        'footer.sections.legal': 'Légal',
        'footer.sections.contact': 'Contact',
        'footer.links.aiAnalysis': 'Analyse IA',
        'footer.links.aiAudit': 'Audit IA',
        'footer.links.promptMaster': 'Prompts',
        'footer.links.privacy': 'Confidentialité',
        'footer.links.terms': 'CGV',
        'footer.address.street': 'Chaussée Brunehault 27',
        'footer.address.city': '7041 Givry',
        'footer.address.country': 'Belgique',
        'hero.title': 'Gagnez 10h/semaine avec l\'IA',
        'hero.subtitle': 'Automatisez vos taches',
        'hero.features.simple': 'Simple',
        'hero.features.secure': 'Sécurisé',
        'hero.features.support': 'Support 24/7',
        'button.startFreeAudit': 'Audit Gratuit',
        'button.seeCaseStudies': 'Études de cas',
      },
      forms: {
        'newsletter.title': 'Newsletter',
        'newsletter.description': 'Restez informé',
        'newsletter.placeholder': 'votre@email.com',
        'newsletter.subscribe': 'S\'abonner',
        'newsletter.subscribing': 'Envoi...',
        'newsletter.success': 'Inscription réussie',
        'newsletter.privacy': 'Respect vie privée',
        'newsletter.error.rateLimit': 'Trop de tentatives',
        'newsletter.error.invalidEmail': 'Email invalide',
        'newsletter.error.general': 'Erreur générale',
        'contact.pageTitle': 'Contactez-nous',
        'contact.pageSubtitle': 'Nous sommes là pour vous',
        'contact.sendMessage': 'Envoyer un message',
        'contact.fullName': 'Nom complet',
        'contact.email': 'Email',
        'contact.company': 'Entreprise',
        'contact.subject': 'Sujet',
        'contact.selectSubject': 'Choisir un sujet',
        'contact.message': 'Message',
        'contact.success.title': 'Message envoyé',
        'contact.success.message': 'Nous vous répondrons rapidement',
        'contact.info.email': 'Email',
        'contact.info.phone': 'Téléphone',
        'contact.info.address': 'Adresse',
        'contact.info.mapTitle': 'Carte',
        'contact.subjects.generalInfo': 'Information générale',
        'contact.subjects.demo': 'Demande de démo',
        'contact.subjects.support': 'Support',
        'contact.subjects.partnership': 'Partenariat',
        'contact.subjects.other': 'Autre',
        'contact.error.rateLimit': 'Trop de tentatives',
        'contact.error.general': 'Erreur serveur',
        'common.required': 'Champs obligatoires',
        'common.sending': 'Envoi en cours...',
        'common.send': 'Envoyer',
      },
    },
  },
  interpolation: { escapeValue: false },
});

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
}

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <HelmetProvider>
      <I18nextProvider i18n={i18nTest}>
        <MemoryRouter>
          {children}
        </MemoryRouter>
      </I18nextProvider>
    </HelmetProvider>
  );
}

function renderWithProviders(ui: ReactElement, options?: CustomRenderOptions) {
  const { route = '/', ...renderOptions } = options || {};

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <HelmetProvider>
        <I18nextProvider i18n={i18nTest}>
          <MemoryRouter initialEntries={[route]}>
            {children}
          </MemoryRouter>
        </I18nextProvider>
      </HelmetProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export { renderWithProviders, i18nTest };
export { screen, fireEvent, waitFor, within } from '@testing-library/react';
