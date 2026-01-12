import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from 'i18next';

type Language = 'fr' | 'en' | 'nl';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  fr: {
    'nav.getStarted': 'Commencer',
    'nav.solutions': 'Solutions',
    'nav.tools': 'Outils',
    'nav.services': 'Services',
    'nav.pricing': 'Tarifs',
    'nav.analysis': 'Analyse IA',
    'nav.recommendations': 'Recommandations',
    'nav.dashboard': 'Tableau de bord',
    'nav.prompts': 'Bibliothèque de prompts',
    'nav.content': 'Rédaction',
    'nav.support': 'Support',

    'stats.uptime': 'Disponibilité 24/7',
    'stats.accuracy': 'Précision 99.9%',
    'stats.trained': '5K+ modèles entraînés',
    'stats.acceleration': '2-4x accélération processus',

    'button.backHome': 'Retour à l\'accueil',
    'button.getStarted': 'Commencer',
    'button.startFreeTrial': 'Essai gratuit',
    'button.startNow': 'Commencer maintenant',
    'button.learnMore': 'En savoir plus',
    'button.contactUs': 'Nous contacter',
    'button.startAudit': 'Démarrer l\'audit',
    'button.requestDemo': 'Demander une démo',
    'button.startAnalysis': 'Lancer l\'analyse'
  },
  en: {
    'nav.getStarted': 'Get Started',
    'nav.solutions': 'Solutions',
    'nav.tools': 'Tools',
    'nav.services': 'Services',
    'nav.pricing': 'Pricing',
    'nav.analysis': 'AI Analysis',
    'nav.recommendations': 'Recommendations',
    'nav.dashboard': 'Dashboard',
    'nav.prompts': 'Prompt Library',
    'nav.content': 'Writing',
    'nav.support': 'Support',

    'stats.uptime': '24/7 Uptime',
    'stats.accuracy': '99.9% Accuracy',
    'stats.trained': '5K+ Trained Models',
    'stats.acceleration': '2-4x Process Acceleration',

    'button.backHome': 'Back to Home',
    'button.getStarted': 'Get Started',
    'button.startFreeTrial': 'Free Trial',
    'button.startNow': 'Start Now',
    'button.learnMore': 'Learn More',
    'button.contactUs': 'Contact Us',
    'button.startAudit': 'Start Audit',
    'button.requestDemo': 'Request Demo',
    'button.startAnalysis': 'Start Analysis'
  },
  nl: {
    'nav.getStarted': 'Aan de slag',
    'nav.solutions': 'Oplossingen',
    'nav.tools': 'Tools',
    'nav.services': 'Diensten',
    'nav.pricing': 'Prijzen',
    'nav.analysis': 'AI Analyse',
    'nav.recommendations': 'Aanbevelingen',
    'nav.dashboard': 'Dashboard',
    'nav.prompts': 'Prompt Bibliotheek',
    'nav.content': 'Schrijven',
    'nav.support': 'Ondersteuning',

    'stats.uptime': '24/7 Beschikbaarheid',
    'stats.accuracy': '99.9% Nauwkeurigheid',
    'stats.trained': '5K+ Getrainde Modellen',
    'stats.acceleration': '2-4x Procesversnelling',

    'button.backHome': 'Terug naar Home',
    'button.getStarted': 'Aan de slag',
    'button.startFreeTrial': 'Gratis Proef',
    'button.startNow': 'Nu Beginnen',
    'button.learnMore': 'Meer Info',
    'button.contactUs': 'Contact',
    'button.startAudit': 'Start Audit',
    'button.requestDemo': 'Demo Aanvragen',
    'button.startAnalysis': 'Start Analyse'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'fr',
  setLanguage: () => {},
  t: () => ''
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const detectedLang = i18n.language || 'fr';
    return (detectedLang.startsWith('en') ? 'en' : detectedLang.startsWith('nl') ? 'nl' : 'fr') as Language;
  });

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const newLang = (lng.startsWith('en') ? 'en' : lng.startsWith('nl') ? 'nl' : 'fr') as Language;
      setLanguage(newLang);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};