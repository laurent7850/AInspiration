interface SEOPageConfig {
  fr: {
    title: string;
    description: string;
    keywords?: string;
  };
  en: {
    title: string;
    description: string;
    keywords?: string;
  };
}

export const seoPages: Record<string, SEOPageConfig> = {
  '/': {
    fr: {
      title: 'Accueil - Solutions IA pour Entreprises',
      description: 'Transformez votre entreprise avec nos solutions d\'IA. Audit gratuit, recommandations personnalisées et accompagnement expert pour optimiser vos processus.',
      keywords: 'intelligence artificielle, IA entreprise, transformation digitale, audit IA, solutions IA'
    },
    en: {
      title: 'Home - AI Solutions for Businesses',
      description: 'Transform your business with our AI solutions. Free audit, personalized recommendations and expert support to optimize your processes.',
      keywords: 'artificial intelligence, business AI, digital transformation, AI audit, AI solutions'
    }
  },
  '/pourquoi-ia': {
    fr: {
      title: 'Pourquoi l\'IA - Avantages de l\'Intelligence Artificielle',
      description: 'Découvrez pourquoi l\'IA est essentielle pour votre entreprise. Gains de productivité, automatisation et innovation pour rester compétitif.',
      keywords: 'avantages IA, bénéfices intelligence artificielle, productivité IA, ROI IA'
    },
    en: {
      title: 'Why AI - Benefits of Artificial Intelligence',
      description: 'Discover why AI is essential for your business. Productivity gains, automation and innovation to stay competitive.',
      keywords: 'AI benefits, artificial intelligence advantages, AI productivity, AI ROI'
    }
  },
  '/solutions': {
    fr: {
      title: 'Solutions IA - Services d\'Intelligence Artificielle',
      description: 'Découvrez nos solutions IA complètes : analyse, automatisation, assistants virtuels, création visuelle et bien plus.',
      keywords: 'solutions IA, services intelligence artificielle, offres IA, solutions entreprise'
    },
    en: {
      title: 'AI Solutions - Artificial Intelligence Services',
      description: 'Discover our complete AI solutions: analysis, automation, virtual assistants, visual creation and more.',
      keywords: 'AI solutions, artificial intelligence services, AI offerings, business solutions'
    }
  },
  '/blog': {
    fr: {
      title: 'Blog IA - Actualités et Conseils sur l\'Intelligence Artificielle',
      description: 'Découvrez nos articles sur l\'IA, conseils pratiques, cas d\'usage et dernières actualités en intelligence artificielle.',
      keywords: 'blog IA, actualités intelligence artificielle, articles IA, conseils IA'
    },
    en: {
      title: 'AI Blog - News and Tips on Artificial Intelligence',
      description: 'Discover our AI articles, practical tips, use cases and latest news in artificial intelligence.',
      keywords: 'AI blog, artificial intelligence news, AI articles, AI tips'
    }
  },
  '/contact': {
    fr: {
      title: 'Contact - Demandez Votre Audit IA Gratuit',
      description: 'Contactez-nous pour un audit IA gratuit. Notre équipe vous répond sous 24h pour discuter de vos projets.',
      keywords: 'contact IA, audit gratuit, demande devis IA, rendez-vous IA'
    },
    en: {
      title: 'Contact - Request Your Free AI Audit',
      description: 'Contact us for a free AI audit. Our team responds within 24 hours to discuss your projects.',
      keywords: 'AI contact, free audit, AI quote request, AI appointment'
    }
  }
};

export const getSEOConfig = (path: string, lang: 'fr' | 'en') => {
  const config = seoPages[path];
  if (!config) {
    return {
      title: 'Aimagination | Solutions IA',
      description: 'Solutions d\'Intelligence Artificielle pour entreprises',
      keywords: 'intelligence artificielle, IA, solutions IA'
    };
  }
  return config[lang];
};
