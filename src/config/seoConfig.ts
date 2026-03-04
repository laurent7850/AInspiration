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
  nl: {
    title: string;
    description: string;
    keywords?: string;
  };
}

export const defaultSEO = {
  siteName: 'AInspiration',
  siteUrl: 'https://ainspiration.eu',
  defaultImage: '/og-image.png',
  twitterHandle: '@ainspiration',
};

export const seoPages: Record<string, SEOPageConfig> = {
  '/': {
    fr: {
      title: 'AInspiration | Gagnez 10h/semaine grâce à l\'IA | Audit PME',
      description: 'Automatisez vos tâches répétitives et boostez votre CA grâce à l\'IA. +180% ROI moyen. Audit gratuit en 24h, sans engagement. 50+ PME accompagnées en Belgique et France.',
      keywords: 'intelligence artificielle PME, IA entreprise, automatisation IA, audit IA gratuit, solutions IA Belgique, transformation digitale PME'
    },
    en: {
      title: 'AInspiration | Save 10h/week with AI — Free SME Audit',
      description: 'Automate repetitive tasks and boost revenue with AI. +180% average ROI. Free audit in 24h, no commitment. 50+ SMEs supported in Belgium and France.',
      keywords: 'artificial intelligence SME, business AI, AI automation, free AI audit, AI solutions Belgium, digital transformation SME'
    },
    nl: {
      title: 'AInspiration | Bespaar 10u/week met AI — Gratis KMO Audit',
      description: 'Automatiseer repetitieve taken en verhoog uw omzet met AI. +180% gemiddelde ROI. Gratis audit in 24u, zonder verplichtingen. 50+ KMO\'s begeleid in België en Frankrijk.',
      keywords: 'kunstmatige intelligentie KMO, AI bedrijf, AI automatisering, gratis AI audit, AI oplossingen België, digitale transformatie KMO'
    }
  },
  '/login': {
    fr: {
      title: 'Connexion | AInspiration',
      description: 'Connectez-vous à votre espace client AInspiration pour accéder à votre tableau de bord et gérer vos projets IA.',
      keywords: 'connexion, espace client, login AInspiration'
    },
    en: {
      title: 'Login | AInspiration',
      description: 'Log in to your AInspiration client area to access your dashboard and manage your AI projects.',
      keywords: 'login, client area, AInspiration login'
    },
    nl: {
      title: 'Inloggen | AInspiration',
      description: 'Log in op uw AInspiration klantenzone om toegang te krijgen tot uw dashboard en uw AI-projecten te beheren.',
      keywords: 'inloggen, klantenzone, AInspiration login'
    }
  },
  '/pourquoi-ia': {
    fr: {
      title: 'Pourquoi l\'IA | Avantages de l\'Intelligence Artificielle | AInspiration',
      description: 'Découvrez pourquoi l\'IA est essentielle pour votre entreprise. Gains de productivité, automatisation et innovation pour rester compétitif sur le marché.',
      keywords: 'avantages IA, bénéfices intelligence artificielle, productivité IA, ROI IA, pourquoi adopter IA'
    },
    en: {
      title: 'Why AI | Benefits of Artificial Intelligence | AInspiration',
      description: 'Discover why AI is essential for your business. Productivity gains, automation and innovation to stay competitive in the market.',
      keywords: 'AI benefits, artificial intelligence advantages, AI productivity, AI ROI, why adopt AI'
    },
    nl: {
      title: 'Waarom AI | Voordelen van Kunstmatige Intelligentie | AInspiration',
      description: 'Ontdek waarom AI essentieel is voor uw bedrijf. Productiviteitswinst, automatisering en innovatie om concurrerend te blijven.',
      keywords: 'AI voordelen, kunstmatige intelligentie voordelen, AI productiviteit, AI ROI, waarom AI adopteren'
    }
  },
  '/pour-qui-ia': {
    fr: {
      title: 'Pour Qui l\'IA | Secteurs et Profils Adaptés | AInspiration',
      description: 'L\'IA est accessible à tous les secteurs : PME, startups, grandes entreprises. Découvrez comment l\'IA peut transformer votre activité selon votre profil.',
      keywords: 'IA pour PME, IA secteurs, profils IA, entreprises IA, qui peut utiliser IA'
    },
    en: {
      title: 'AI for Who | Suitable Sectors and Profiles | AInspiration',
      description: 'AI is accessible to all sectors: SMEs, startups, large companies. Discover how AI can transform your business according to your profile.',
      keywords: 'AI for SMEs, AI sectors, AI profiles, AI businesses, who can use AI'
    },
    nl: {
      title: 'AI voor Wie | Geschikte Sectoren en Profielen | AInspiration',
      description: 'AI is toegankelijk voor alle sectoren: KMO\'s, startups, grote bedrijven. Ontdek hoe AI uw bedrijf kan transformeren volgens uw profiel.',
      keywords: 'AI voor KMO, AI sectoren, AI profielen, AI bedrijven, wie kan AI gebruiken'
    }
  },
  '/analyse-ia': {
    fr: {
      title: 'Analyse de Données IA | Business Intelligence | AInspiration',
      description: 'Exploitez vos données avec l\'IA. Analyses prédictives, tableaux de bord intelligents et insights actionnables pour des décisions éclairées.',
      keywords: 'analyse données IA, business intelligence, analytics IA, prédictif, data science entreprise'
    },
    en: {
      title: 'AI Data Analysis | Business Intelligence | AInspiration',
      description: 'Leverage your data with AI. Predictive analytics, smart dashboards and actionable insights for informed decisions.',
      keywords: 'AI data analysis, business intelligence, AI analytics, predictive, enterprise data science'
    },
    nl: {
      title: 'AI Data-analyse | Business Intelligence | AInspiration',
      description: 'Benut uw data met AI. Voorspellende analyses, slimme dashboards en bruikbare inzichten voor weloverwogen beslissingen.',
      keywords: 'AI data-analyse, business intelligence, AI analytics, voorspellend, enterprise data science'
    }
  },
  '/transformation': {
    fr: {
      title: 'Transformation Numérique | Digitalisation avec l\'IA | AInspiration',
      description: 'Accélérez votre transformation digitale grâce à l\'IA. Modernisez vos processus, optimisez vos opérations et préparez l\'avenir de votre entreprise.',
      keywords: 'transformation digitale, digitalisation entreprise, modernisation processus, innovation numérique'
    },
    en: {
      title: 'Digital Transformation | Digitalization with AI | AInspiration',
      description: 'Accelerate your digital transformation with AI. Modernize your processes, optimize your operations and prepare the future of your business.',
      keywords: 'digital transformation, business digitalization, process modernization, digital innovation'
    },
    nl: {
      title: 'Digitale Transformatie | Digitalisering met AI | AInspiration',
      description: 'Versnel uw digitale transformatie met AI. Moderniseer uw processen, optimaliseer uw operaties en bereid de toekomst van uw bedrijf voor.',
      keywords: 'digitale transformatie, bedrijfsdigitalisering, procesmodernisering, digitale innovatie'
    }
  },
  '/creation-visuelle': {
    fr: {
      title: 'Création Visuelle IA | Images et Design Générés par IA | AInspiration',
      description: 'Créez des visuels uniques avec l\'IA générative. Logos, images marketing, illustrations personnalisées pour votre communication.',
      keywords: 'création visuelle IA, images IA, design IA, génération images, IA générative, DALL-E, Midjourney'
    },
    en: {
      title: 'AI Visual Creation | AI-Generated Images and Design | AInspiration',
      description: 'Create unique visuals with generative AI. Logos, marketing images, custom illustrations for your communication.',
      keywords: 'AI visual creation, AI images, AI design, image generation, generative AI, DALL-E, Midjourney'
    },
    nl: {
      title: 'AI Visuele Creatie | AI-Gegenereerde Afbeeldingen en Design | AInspiration',
      description: 'Creëer unieke visuals met generatieve AI. Logo\'s, marketingafbeeldingen, gepersonaliseerde illustraties voor uw communicatie.',
      keywords: 'AI visuele creatie, AI afbeeldingen, AI design, beeldgeneratie, generatieve AI, DALL-E, Midjourney'
    }
  },
  '/recommandations': {
    fr: {
      title: 'Recommandations IA Personnalisées | AInspiration',
      description: 'Recevez des recommandations IA sur mesure pour votre entreprise. Solutions adaptées à vos besoins spécifiques et votre secteur d\'activité.',
      keywords: 'recommandations IA, conseils personnalisés, solutions sur mesure, audit IA'
    },
    en: {
      title: 'Personalized AI Recommendations | AInspiration',
      description: 'Receive tailored AI recommendations for your business. Solutions adapted to your specific needs and industry.',
      keywords: 'AI recommendations, personalized advice, custom solutions, AI audit'
    },
    nl: {
      title: 'Gepersonaliseerde AI Aanbevelingen | AInspiration',
      description: 'Ontvang op maat gemaakte AI-aanbevelingen voor uw bedrijf. Oplossingen aangepast aan uw specifieke behoeften en sector.',
      keywords: 'AI aanbevelingen, gepersonaliseerd advies, oplossingen op maat, AI audit'
    }
  },
  '/solutions': {
    fr: {
      title: 'Solutions IA pour PME | Automatisation, CRM, Chatbot Belgique | AInspiration',
      description: 'Découvrez nos solutions IA complètes pour PME : automatisation, CRM intelligent, chatbots, création visuelle. +180% ROI. Accompagnement en Belgique et France.',
      keywords: 'solutions IA PME, services intelligence artificielle Belgique, automatisation IA, CRM IA, chatbot entreprise, packages IA'
    },
    en: {
      title: 'AI Solutions | Artificial Intelligence Services | AInspiration',
      description: 'Discover our complete AI solutions: data analysis, automation, virtual assistants, visual creation and personalized support.',
      keywords: 'AI solutions, artificial intelligence services, AI offerings, business solutions, AI packages'
    },
    nl: {
      title: 'AI Oplossingen | Kunstmatige Intelligentie Diensten | AInspiration',
      description: 'Ontdek onze complete AI-oplossingen: data-analyse, automatisering, virtuele assistenten, visuele creatie en gepersonaliseerde begeleiding.',
      keywords: 'AI oplossingen, kunstmatige intelligentie diensten, AI aanbod, bedrijfsoplossingen, AI pakketten'
    }
  },
  '/produits': {
    fr: {
      title: 'Offres IA PME | Audit Gratuit, Formation, Accompagnement dès 490\u20AC | AInspiration',
      description: 'Consultez nos offres IA pour PME. Audit gratuit, formation IA, accompagnement premium. Solutions adaptées à chaque budget en Belgique et France.',
      keywords: 'offres IA PME, tarifs IA Belgique, audit IA gratuit, formation IA prix, accompagnement IA'
    },
    en: {
      title: 'AI Products | Our Offers and Pricing | AInspiration',
      description: 'Browse our range of AI products. Solutions adapted to every budget, from free audit to premium support.',
      keywords: 'AI products, AI pricing, artificial intelligence offers, AI solutions prices'
    },
    nl: {
      title: 'AI Producten | Onze Aanbiedingen en Prijzen | AInspiration',
      description: 'Bekijk ons aanbod van AI-producten. Oplossingen aangepast aan elk budget, van gratis audit tot premium ondersteuning.',
      keywords: 'AI producten, AI prijzen, kunstmatige intelligentie aanbiedingen, AI oplossingen prijzen'
    }
  },
  '/etudes-de-cas': {
    fr: {
      title: 'Études de Cas IA | Success Stories | AInspiration',
      description: 'Découvrez nos études de cas clients. Comment l\'IA a transformé des entreprises comme la vôtre avec des résultats concrets et mesurables.',
      keywords: 'études de cas IA, success stories, témoignages clients, résultats IA, exemples transformation'
    },
    en: {
      title: 'AI Case Studies | Success Stories | AInspiration',
      description: 'Discover our client case studies. How AI has transformed businesses like yours with concrete and measurable results.',
      keywords: 'AI case studies, success stories, client testimonials, AI results, transformation examples'
    },
    nl: {
      title: 'AI Casestudies | Succesverhalen | AInspiration',
      description: 'Ontdek onze klantcasestudies. Hoe AI bedrijven zoals het uwe heeft getransformeerd met concrete en meetbare resultaten.',
      keywords: 'AI casestudies, succesverhalen, klanttestimonials, AI resultaten, transformatie voorbeelden'
    }
  },
  '/a-propos': {
    fr: {
      title: 'À Propos | Notre Équipe et Mission | AInspiration',
      description: 'Découvrez l\'équipe AInspiration. Notre mission : démocratiser l\'IA pour les entreprises belges et européennes avec un accompagnement humain.',
      keywords: 'à propos AInspiration, équipe IA, mission, valeurs, entreprise IA Belgique'
    },
    en: {
      title: 'About Us | Our Team and Mission | AInspiration',
      description: 'Discover the AInspiration team. Our mission: democratize AI for Belgian and European businesses with human support.',
      keywords: 'about AInspiration, AI team, mission, values, AI company Belgium'
    },
    nl: {
      title: 'Over Ons | Ons Team en Missie | AInspiration',
      description: 'Ontdek het AInspiration team. Onze missie: AI democratiseren voor Belgische en Europese bedrijven met menselijke ondersteuning.',
      keywords: 'over AInspiration, AI team, missie, waarden, AI bedrijf België'
    }
  },
  '/contact': {
    fr: {
      title: 'Contactez AInspiration | Audit IA Gratuit Belgique — Réponse sous 24h',
      description: 'Demandez votre audit IA gratuit. Notre équipe basée en Belgique vous répond sous 24h. Sans engagement, 100% personnalisé pour votre PME.',
      keywords: 'contact IA Belgique, audit IA gratuit, devis IA PME, consultation IA gratuite, rendez-vous IA'
    },
    en: {
      title: 'Contact | Request Your Free AI Audit | AInspiration',
      description: 'Contact us for a free AI audit. Our team responds within 24 hours to discuss your projects and artificial intelligence needs.',
      keywords: 'AI contact, free audit, AI quote request, AI appointment, free consultation'
    },
    nl: {
      title: 'Contact | Vraag Uw Gratis AI Audit Aan | AInspiration',
      description: 'Neem contact met ons op voor een gratis AI-audit. Ons team reageert binnen 24 uur om uw projecten en AI-behoeften te bespreken.',
      keywords: 'AI contact, gratis audit, AI offerte aanvraag, AI afspraak, gratis consultatie'
    }
  },
  '/prompts': {
    fr: {
      title: 'Bibliothèque de Prompts IA | Optimisation ChatGPT | AInspiration',
      description: 'Accédez à notre bibliothèque de prompts optimisés pour ChatGPT, Claude et autres IA. Gagnez du temps avec des prompts professionnels testés.',
      keywords: 'prompts IA, prompts ChatGPT, bibliothèque prompts, optimisation prompts, prompt engineering'
    },
    en: {
      title: 'AI Prompt Library | ChatGPT Optimization | AInspiration',
      description: 'Access our library of optimized prompts for ChatGPT, Claude and other AI. Save time with tested professional prompts.',
      keywords: 'AI prompts, ChatGPT prompts, prompt library, prompt optimization, prompt engineering'
    },
    nl: {
      title: 'AI Prompt Bibliotheek | ChatGPT Optimalisatie | AInspiration',
      description: 'Krijg toegang tot onze bibliotheek van geoptimaliseerde prompts voor ChatGPT, Claude en andere AI. Bespaar tijd met geteste professionele prompts.',
      keywords: 'AI prompts, ChatGPT prompts, prompt bibliotheek, prompt optimalisatie, prompt engineering'
    }
  },
  '/automatisation': {
    fr: {
      title: 'Automatisation IA | Workflows et Processus Automatisés | AInspiration',
      description: 'Automatisez vos tâches répétitives avec l\'IA. Workflows intelligents, intégrations et gain de productivité pour votre équipe.',
      keywords: 'automatisation IA, workflows automatisés, RPA, processus automatiques, productivité IA'
    },
    en: {
      title: 'AI Automation | Automated Workflows and Processes | AInspiration',
      description: 'Automate your repetitive tasks with AI. Smart workflows, integrations and productivity gains for your team.',
      keywords: 'AI automation, automated workflows, RPA, automatic processes, AI productivity'
    },
    nl: {
      title: 'AI Automatisering | Geautomatiseerde Workflows en Processen | AInspiration',
      description: 'Automatiseer uw repetitieve taken met AI. Slimme workflows, integraties en productiviteitswinst voor uw team.',
      keywords: 'AI automatisering, geautomatiseerde workflows, RPA, automatische processen, AI productiviteit'
    }
  },
  '/assistants': {
    fr: {
      title: 'Assistants Virtuels IA | Chatbots Intelligents | AInspiration',
      description: 'Déployez des assistants virtuels IA pour votre service client. Chatbots intelligents disponibles 24/7 pour répondre à vos clients.',
      keywords: 'assistants virtuels, chatbots IA, service client IA, agents conversationnels, support automatisé'
    },
    en: {
      title: 'AI Virtual Assistants | Smart Chatbots | AInspiration',
      description: 'Deploy AI virtual assistants for your customer service. Smart chatbots available 24/7 to respond to your customers.',
      keywords: 'virtual assistants, AI chatbots, AI customer service, conversational agents, automated support'
    },
    nl: {
      title: 'AI Virtuele Assistenten | Slimme Chatbots | AInspiration',
      description: 'Implementeer AI virtuele assistenten voor uw klantenservice. Slimme chatbots 24/7 beschikbaar om uw klanten te beantwoorden.',
      keywords: 'virtuele assistenten, AI chatbots, AI klantenservice, conversatie-agenten, geautomatiseerde ondersteuning'
    }
  },
  '/creativite': {
    fr: {
      title: 'Créativité IA | Génération de Contenu | AInspiration',
      description: 'Boostez votre créativité avec l\'IA générative. Textes, images, vidéos : créez du contenu unique et engageant pour votre marque.',
      keywords: 'créativité IA, génération contenu, IA générative, création automatique, contenu marketing IA'
    },
    en: {
      title: 'AI Creativity | Content Generation | AInspiration',
      description: 'Boost your creativity with generative AI. Texts, images, videos: create unique and engaging content for your brand.',
      keywords: 'AI creativity, content generation, generative AI, automatic creation, AI marketing content'
    },
    nl: {
      title: 'AI Creativiteit | Contentgeneratie | AInspiration',
      description: 'Boost uw creativiteit met generatieve AI. Teksten, afbeeldingen, video\'s: creëer unieke en boeiende content voor uw merk.',
      keywords: 'AI creativiteit, contentgeneratie, generatieve AI, automatische creatie, AI marketingcontent'
    }
  },
  '/conseil': {
    fr: {
      title: 'Conseil Stratégique IA | Consulting en Intelligence Artificielle | AInspiration',
      description: 'Bénéficiez de notre expertise en conseil stratégique IA. Audit, roadmap, accompagnement pour une intégration réussie de l\'IA.',
      keywords: 'conseil IA, consulting intelligence artificielle, stratégie IA, audit entreprise, roadmap IA'
    },
    en: {
      title: 'AI Strategic Consulting | Artificial Intelligence Consulting | AInspiration',
      description: 'Benefit from our AI strategic consulting expertise. Audit, roadmap, support for successful AI integration.',
      keywords: 'AI consulting, artificial intelligence consulting, AI strategy, business audit, AI roadmap'
    },
    nl: {
      title: 'AI Strategisch Advies | Kunstmatige Intelligentie Consulting | AInspiration',
      description: 'Profiteer van onze expertise in AI strategisch advies. Audit, roadmap, begeleiding voor een succesvolle AI-integratie.',
      keywords: 'AI consulting, kunstmatige intelligentie advies, AI strategie, bedrijfsaudit, AI roadmap'
    }
  },
  '/formation': {
    fr: {
      title: 'Formation IA | Apprentissage Intelligence Artificielle | AInspiration',
      description: 'Formez vos équipes à l\'IA. Programmes adaptés à tous niveaux : initiation, perfectionnement, certifications pour maîtriser l\'IA.',
      keywords: 'formation IA, apprentissage intelligence artificielle, cours IA, certification IA, upskilling'
    },
    en: {
      title: 'AI Training | Artificial Intelligence Learning | AInspiration',
      description: 'Train your teams in AI. Programs adapted to all levels: introduction, advanced, certifications to master AI.',
      keywords: 'AI training, artificial intelligence learning, AI courses, AI certification, upskilling'
    },
    nl: {
      title: 'AI Opleiding | Kunstmatige Intelligentie Training | AInspiration',
      description: 'Train uw teams in AI. Programma\'s aangepast aan alle niveaus: introductie, gevorderd, certificeringen om AI te beheersen.',
      keywords: 'AI opleiding, kunstmatige intelligentie training, AI cursussen, AI certificering, upskilling'
    }
  },
  '/accompagnement': {
    fr: {
      title: 'Accompagnement IA Personnalisé | Support Expert | AInspiration',
      description: 'Bénéficiez d\'un accompagnement IA sur mesure. Support dédié, suivi de projet et expertise continue pour réussir votre transformation.',
      keywords: 'accompagnement IA, support personnalisé, suivi projet IA, expertise dédiée, coaching IA'
    },
    en: {
      title: 'Personalized AI Support | Expert Guidance | AInspiration',
      description: 'Benefit from tailored AI support. Dedicated support, project monitoring and ongoing expertise to succeed in your transformation.',
      keywords: 'AI support, personalized guidance, AI project monitoring, dedicated expertise, AI coaching'
    },
    nl: {
      title: 'Gepersonaliseerde AI Begeleiding | Expert Ondersteuning | AInspiration',
      description: 'Profiteer van AI-begeleiding op maat. Toegewijde ondersteuning, projectopvolging en continue expertise voor een succesvolle transformatie.',
      keywords: 'AI begeleiding, gepersonaliseerde ondersteuning, AI projectopvolging, toegewijde expertise, AI coaching'
    }
  },
  '/blog': {
    fr: {
      title: 'Blog IA | Actualités et Conseils Intelligence Artificielle | AInspiration',
      description: 'Découvrez nos articles sur l\'IA : conseils pratiques, cas d\'usage, tendances et dernières actualités en intelligence artificielle.',
      keywords: 'blog IA, actualités intelligence artificielle, articles IA, conseils IA, tendances IA'
    },
    en: {
      title: 'AI Blog | News and Tips on Artificial Intelligence | AInspiration',
      description: 'Discover our AI articles: practical tips, use cases, trends and latest news in artificial intelligence.',
      keywords: 'AI blog, artificial intelligence news, AI articles, AI tips, AI trends'
    },
    nl: {
      title: 'AI Blog | Nieuws en Tips over Kunstmatige Intelligentie | AInspiration',
      description: 'Ontdek onze AI-artikelen: praktische tips, use cases, trends en laatste nieuws in kunstmatige intelligentie.',
      keywords: 'AI blog, kunstmatige intelligentie nieuws, AI artikelen, AI tips, AI trends'
    }
  },
  '/blog/thierry-facturation-ia': {
    fr: {
      title: 'Cas Thierry | Facturation Automatisée avec l\'IA | AInspiration',
      description: 'Découvrez comment Thierry a automatisé sa facturation grâce à l\'IA et gagné 10 heures par semaine. Témoignage client inspirant.',
      keywords: 'cas client IA, facturation automatisée, témoignage IA, automatisation PME, gain de temps IA'
    },
    en: {
      title: 'Thierry Case | Automated Invoicing with AI | AInspiration',
      description: 'Discover how Thierry automated his invoicing with AI and saved 10 hours per week. Inspiring customer testimonial.',
      keywords: 'AI customer case, automated invoicing, AI testimonial, SME automation, AI time savings'
    },
    nl: {
      title: 'Case Thierry | Geautomatiseerde Facturatie met AI | AInspiration',
      description: 'Ontdek hoe Thierry zijn facturatie automatiseerde met AI en 10 uur per week bespaarde. Inspirerend klantverhaal.',
      keywords: 'AI klantcase, geautomatiseerde facturatie, AI testimonial, KMO automatisering, AI tijdsbesparing'
    }
  },
  '/privacy': {
    fr: {
      title: 'Politique de Confidentialité | RGPD | AInspiration',
      description: 'Consultez notre politique de confidentialité et notre conformité RGPD. Protection de vos données personnelles chez AInspiration.',
      keywords: 'politique confidentialité, RGPD, protection données, vie privée, données personnelles'
    },
    en: {
      title: 'Privacy Policy | GDPR | AInspiration',
      description: 'View our privacy policy and GDPR compliance. Protection of your personal data at AInspiration.',
      keywords: 'privacy policy, GDPR, data protection, privacy, personal data'
    },
    nl: {
      title: 'Privacybeleid | AVG | AInspiration',
      description: 'Bekijk ons privacybeleid en AVG-naleving. Bescherming van uw persoonlijke gegevens bij AInspiration.',
      keywords: 'privacybeleid, AVG, gegevensbescherming, privacy, persoonlijke gegevens'
    }
  },
  '/crm': {
    fr: {
      title: 'Solution CRM IA | Gestion Relation Client Intelligente | AInspiration',
      description: 'Optimisez votre relation client avec notre CRM propulsé par l\'IA. Automatisation, insights et suivi intelligent de vos opportunités.',
      keywords: 'CRM IA, gestion relation client, CRM intelligent, automatisation ventes, pipeline commercial'
    },
    en: {
      title: 'AI CRM Solution | Intelligent Customer Relationship Management | AInspiration',
      description: 'Optimize your customer relationships with our AI-powered CRM. Automation, insights and intelligent tracking of your opportunities.',
      keywords: 'AI CRM, customer relationship management, intelligent CRM, sales automation, sales pipeline'
    },
    nl: {
      title: 'AI CRM Oplossing | Intelligente Klantrelatiebeheer | AInspiration',
      description: 'Optimaliseer uw klantrelaties met onze AI-aangedreven CRM. Automatisering, inzichten en intelligente opvolging van uw kansen.',
      keywords: 'AI CRM, klantrelatiebeheer, intelligente CRM, verkoopautomatisering, verkooppijplijn'
    }
  },
  // Pages CRM privées (SEO minimal car authentifiées)
  '/crm-dashboard': {
    fr: {
      title: 'Tableau de Bord CRM | AInspiration',
      description: 'Accédez à votre tableau de bord CRM AInspiration. Vue d\'ensemble de vos opportunités, contacts et performances commerciales.',
      keywords: 'tableau de bord CRM, dashboard ventes, analytics commercial'
    },
    en: {
      title: 'CRM Dashboard | AInspiration',
      description: 'Access your AInspiration CRM dashboard. Overview of your opportunities, contacts and sales performance.',
      keywords: 'CRM dashboard, sales dashboard, commercial analytics'
    },
    nl: {
      title: 'CRM Dashboard | AInspiration',
      description: 'Toegang tot uw AInspiration CRM-dashboard. Overzicht van uw kansen, contacten en verkoopprestaties.',
      keywords: 'CRM dashboard, verkoop dashboard, commerciële analytics'
    }
  },
  '/opportunities': {
    fr: {
      title: 'Opportunités | CRM AInspiration',
      description: 'Gérez vos opportunités commerciales. Pipeline de ventes, suivi des deals et prévisions avec l\'IA.',
      keywords: 'opportunités commerciales, pipeline ventes, gestion deals'
    },
    en: {
      title: 'Opportunities | AInspiration CRM',
      description: 'Manage your business opportunities. Sales pipeline, deal tracking and forecasts with AI.',
      keywords: 'business opportunities, sales pipeline, deal management'
    },
    nl: {
      title: 'Kansen | AInspiration CRM',
      description: 'Beheer uw zakelijke kansen. Verkooppijplijn, dealopvolging en voorspellingen met AI.',
      keywords: 'zakelijke kansen, verkooppijplijn, dealbeheer'
    }
  },
  '/contacts': {
    fr: {
      title: 'Contacts | CRM AInspiration',
      description: 'Gérez votre base de contacts clients et prospects. Historique des interactions et segmentation intelligente.',
      keywords: 'gestion contacts, base clients, CRM contacts'
    },
    en: {
      title: 'Contacts | AInspiration CRM',
      description: 'Manage your customer and prospect contact base. Interaction history and smart segmentation.',
      keywords: 'contact management, customer base, CRM contacts'
    },
    nl: {
      title: 'Contacten | AInspiration CRM',
      description: 'Beheer uw klant- en prospect contactbasis. Interactiegeschiedenis en slimme segmentatie.',
      keywords: 'contactbeheer, klantenbasis, CRM contacten'
    }
  },
  '/companies': {
    fr: {
      title: 'Entreprises | CRM AInspiration',
      description: 'Gérez vos comptes entreprises. Fiche complète, contacts associés et historique des interactions.',
      keywords: 'gestion entreprises, comptes clients, CRM entreprises'
    },
    en: {
      title: 'Companies | AInspiration CRM',
      description: 'Manage your company accounts. Complete profile, associated contacts and interaction history.',
      keywords: 'company management, customer accounts, CRM companies'
    },
    nl: {
      title: 'Bedrijven | AInspiration CRM',
      description: 'Beheer uw bedrijfsaccounts. Volledig profiel, gekoppelde contacten en interactiegeschiedenis.',
      keywords: 'bedrijfsbeheer, klantenaccounts, CRM bedrijven'
    }
  },
  '/products': {
    fr: {
      title: 'Produits | CRM AInspiration',
      description: 'Gérez votre catalogue de produits et services. Prix, descriptions et association aux opportunités.',
      keywords: 'catalogue produits, gestion produits, CRM produits'
    },
    en: {
      title: 'Products | AInspiration CRM',
      description: 'Manage your product and service catalog. Prices, descriptions and opportunity associations.',
      keywords: 'product catalog, product management, CRM products'
    },
    nl: {
      title: 'Producten | AInspiration CRM',
      description: 'Beheer uw product- en dienstencatalogus. Prijzen, beschrijvingen en opportuniteitskoppelingen.',
      keywords: 'productcatalogus, productbeheer, CRM producten'
    }
  },
  '/tasks': {
    fr: {
      title: 'Tâches | CRM AInspiration',
      description: 'Gérez vos tâches et suivis commerciaux. Rappels, deadlines et priorisation intelligente.',
      keywords: 'gestion tâches, suivi commercial, CRM tâches'
    },
    en: {
      title: 'Tasks | AInspiration CRM',
      description: 'Manage your tasks and commercial follow-ups. Reminders, deadlines and smart prioritization.',
      keywords: 'task management, commercial follow-up, CRM tasks'
    },
    nl: {
      title: 'Taken | AInspiration CRM',
      description: 'Beheer uw taken en commerciële opvolging. Herinneringen, deadlines en slimme prioritering.',
      keywords: 'takenbeheer, commerciële opvolging, CRM taken'
    }
  },
  '/reports': {
    fr: {
      title: 'Rapports | CRM AInspiration',
      description: 'Analysez vos performances commerciales. Rapports personnalisés, KPIs et tableaux de bord analytiques.',
      keywords: 'rapports CRM, analytics ventes, KPI commerciaux'
    },
    en: {
      title: 'Reports | AInspiration CRM',
      description: 'Analyze your commercial performance. Custom reports, KPIs and analytical dashboards.',
      keywords: 'CRM reports, sales analytics, commercial KPIs'
    },
    nl: {
      title: 'Rapporten | AInspiration CRM',
      description: 'Analyseer uw commerciële prestaties. Aangepaste rapporten, KPI\'s en analytische dashboards.',
      keywords: 'CRM rapporten, verkoop analytics, commerciële KPI\'s'
    }
  },
  '/messages': {
    fr: {
      title: 'Messages | CRM AInspiration',
      description: 'Gérez vos communications clients. Historique des messages et réponses assistées par IA.',
      keywords: 'messagerie CRM, communication clients, messages'
    },
    en: {
      title: 'Messages | AInspiration CRM',
      description: 'Manage your customer communications. Message history and AI-assisted responses.',
      keywords: 'CRM messaging, customer communication, messages'
    },
    nl: {
      title: 'Berichten | AInspiration CRM',
      description: 'Beheer uw klantcommunicatie. Berichtgeschiedenis en AI-ondersteunde antwoorden.',
      keywords: 'CRM berichten, klantcommunicatie, berichten'
    }
  },
  '/dashboard': {
    fr: {
      title: 'Mon Espace | Tableau de Bord Personnel | AInspiration',
      description: 'Accédez à votre espace personnel AInspiration. Suivez vos projets IA et recommandations personnalisées.',
      keywords: 'espace client, tableau de bord, mon compte'
    },
    en: {
      title: 'My Space | Personal Dashboard | AInspiration',
      description: 'Access your personal AInspiration space. Track your AI projects and personalized recommendations.',
      keywords: 'client area, dashboard, my account'
    },
    nl: {
      title: 'Mijn Ruimte | Persoonlijk Dashboard | AInspiration',
      description: 'Toegang tot uw persoonlijke AInspiration-ruimte. Volg uw AI-projecten en gepersonaliseerde aanbevelingen.',
      keywords: 'klantenzone, dashboard, mijn account'
    }
  }
};

export type SupportedLanguage = 'fr' | 'en' | 'nl';

export const getSEOConfig = (path: string, lang: SupportedLanguage = 'fr') => {
  // Gestion des routes dynamiques (blog/:slug, contacts/:id, etc.)
  const normalizedPath = path.replace(/\/[a-f0-9-]{36}$/i, '').replace(/\/\d+$/, '');

  const config = seoPages[normalizedPath] || seoPages[path];

  if (!config) {
    return {
      title: `AInspiration | Solutions IA`,
      description: lang === 'fr'
        ? 'Solutions d\'Intelligence Artificielle pour entreprises'
        : lang === 'en'
        ? 'Artificial Intelligence Solutions for businesses'
        : 'Kunstmatige Intelligentie Oplossingen voor bedrijven',
      keywords: 'intelligence artificielle, IA, AI, solutions IA'
    };
  }

  return config[lang] || config.fr;
};

// Génère les balises hreflang pour une page donnée
export const getHreflangTags = (path: string) => {
  const baseUrl = defaultSEO.siteUrl;
  return [
    { lang: 'fr', href: `${baseUrl}${path}` },
    { lang: 'en', href: `${baseUrl}/en${path}` },
    { lang: 'nl', href: `${baseUrl}/nl${path}` },
    { lang: 'x-default', href: `${baseUrl}${path}` }
  ];
};

// Génère les données structurées JSON-LD pour l'organisation
export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AInspiration',
  url: defaultSEO.siteUrl,
  logo: `${defaultSEO.siteUrl}/logo.png`,
  description: 'Solutions d\'Intelligence Artificielle pour entreprises belges et européennes',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'BE'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['French', 'English', 'Dutch']
  },
  sameAs: [
    'https://www.linkedin.com/company/ainspiration',
    'https://twitter.com/ainspiration'
  ]
});

// Génère les données structurées pour une page de service
export const getServiceSchema = (serviceName: string, description: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: serviceName,
  description: description,
  provider: {
    '@type': 'Organization',
    name: 'AInspiration'
  },
  areaServed: {
    '@type': 'Country',
    name: 'Belgium'
  }
});

// Génère les données structurées pour un article de blog
export const getBlogPostSchema = (title: string, description: string, datePublished: string, author: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: title,
  description: description,
  datePublished: datePublished,
  author: {
    '@type': 'Person',
    name: author
  },
  publisher: {
    '@type': 'Organization',
    name: 'AInspiration',
    logo: {
      '@type': 'ImageObject',
      url: `${defaultSEO.siteUrl}/logo.png`
    }
  }
});

// Génère les données structurées pour la FAQ
export const getFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
});

// Génère les données structurées BreadcrumbList pour le fil d'Ariane
export const getBreadcrumbSchema = (path: string, lang: SupportedLanguage = 'fr') => {
  const baseUrl = defaultSEO.siteUrl;
  const segments = path.split('/').filter(Boolean);

  const breadcrumbNames: Record<string, Record<string, string>> = {
    'pourquoi-ia': { fr: 'Pourquoi l\'IA', en: 'Why AI', nl: 'Waarom AI' },
    'pour-qui-ia': { fr: 'Pour qui', en: 'For Who', nl: 'Voor wie' },
    'solutions': { fr: 'Solutions', en: 'Solutions', nl: 'Oplossingen' },
    'analyse-ia': { fr: 'Analyse IA', en: 'AI Analysis', nl: 'AI Analyse' },
    'transformation': { fr: 'Transformation', en: 'Transformation', nl: 'Transformatie' },
    'creation-visuelle': { fr: 'Création visuelle', en: 'Visual Creation', nl: 'Visuele Creatie' },
    'automatisation': { fr: 'Automatisation', en: 'Automation', nl: 'Automatisering' },
    'assistants': { fr: 'Assistants', en: 'Assistants', nl: 'Assistenten' },
    'prompts': { fr: 'Prompts', en: 'Prompts', nl: 'Prompts' },
    'creativite': { fr: 'Créativité', en: 'Creativity', nl: 'Creativiteit' },
    'crm': { fr: 'CRM', en: 'CRM', nl: 'CRM' },
    'produits': { fr: 'Produits', en: 'Products', nl: 'Producten' },
    'etudes-de-cas': { fr: 'Études de cas', en: 'Case Studies', nl: 'Casestudies' },
    'conseil': { fr: 'Conseil', en: 'Consulting', nl: 'Advies' },
    'formation': { fr: 'Formation', en: 'Training', nl: 'Opleiding' },
    'accompagnement': { fr: 'Accompagnement', en: 'Support', nl: 'Begeleiding' },
    'recommandations': { fr: 'Recommandations', en: 'Recommendations', nl: 'Aanbevelingen' },
    'a-propos': { fr: 'À propos', en: 'About', nl: 'Over ons' },
    'contact': { fr: 'Contact', en: 'Contact', nl: 'Contact' },
    'blog': { fr: 'Blog', en: 'Blog', nl: 'Blog' },
    'privacy': { fr: 'Confidentialité', en: 'Privacy', nl: 'Privacy' },
  };

  const homeName = { fr: 'Accueil', en: 'Home', nl: 'Home' };

  const items = [
    { '@type': 'ListItem', position: 1, name: homeName[lang], item: baseUrl + '/' }
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += '/' + segment;
    const name = breadcrumbNames[segment]?.[lang] || segment;
    items.push({
      '@type': 'ListItem',
      position: index + 2,
      name,
      item: baseUrl + currentPath
    });
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items
  };
};

// Génère les données structurées pour les avis/témoignages
export const getReviewSchema = (reviews: Array<{ author: string; rating: number; text: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'AInspiration',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1),
    reviewCount: reviews.length
  },
  review: reviews.map(review => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating
    },
    reviewBody: review.text
  }))
});
