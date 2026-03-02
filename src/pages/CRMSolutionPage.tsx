import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Users, 
  LineChart, 
  BarChart, 
  MessageSquare, 
  Calendar, 
  Settings, 
  Zap, 
  CheckCircle, 
  PlusCircle, 
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Clock,
  Database,
  ArrowRight,
  Star
} from 'lucide-react';
import StartForm from '../components/StartForm';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '../components/ui/OptimizedImage';

const CRMSolutionPage: React.FC = () => {
  const [showStartForm, setShowStartForm] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<number | null>(1);
  const navigate = useNavigate();

  const toggleFaq = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  // Fonctionnalités du CRM
  const features = [
    {
      icon: Users,
      title: "Gestion des contacts",
      description: "Centralisez toutes vos données clients en un seul endroit. Suivez l'historique complet, les préférences et les interactions pour une vision à 360°.",
      benefits: [
        "Fiches contacts complètes et personnalisables",
        "Segmentation avancée",
        "Import/export facilité",
        "Historique d'interactions"
      ]
    },
    {
      icon: LineChart,
      title: "Pipeline de vente",
      description: "Visualisez et gérez efficacement votre processus de vente. Suivez vos prospects et opportunités de la prospection à la conclusion.",
      benefits: [
        "Workflows personnalisables",
        "Prévisions de vente précises",
        "Suivi des conversions",
        "Rapports de performance"
      ]
    },
    {
      icon: Calendar,
      title: "Gestion des tâches et calendrier",
      description: "Ne manquez jamais une échéance importante. Planifiez et suivez vos rendez-vous, tâches et rappels en synchronisation avec votre équipe.",
      benefits: [
        "Synchronisation avec Google Calendar",
        "Alertes et notifications",
        "Assignation de tâches",
        "Vue d'équipe consolidée"
      ]
    },
    {
      icon: MessageSquare,
      title: "Communication omnicanale",
      description: "Gérez tous vos canaux de communication depuis une interface unique : emails, SMS, appels, et réseaux sociaux.",
      benefits: [
        "Historique de conversation unifié",
        "Modèles de messages",
        "Suivi des ouvertures et clics",
        "Intégration avec vos outils préférés"
      ]
    },
    {
      icon: Database,
      title: "Gestion documentaire",
      description: "Stockez et partagez facilement tous vos documents commerciaux : devis, contrats, factures et présentations.",
      benefits: [
        "Stockage sécurisé",
        "Contrôle des versions",
        "Partage sécurisé",
        "Signatures électroniques"
      ]
    },
    {
      icon: BarChart,
      title: "Rapports et tableaux de bord",
      description: "Prenez des décisions éclairées grâce à des analyses visuelles de vos activités commerciales et de la performance de votre équipe.",
      benefits: [
        "Tableaux de bord personnalisables",
        "KPIs en temps réel",
        "Exportation facile",
        "Visualisations interactives"
      ]
    }
  ];

  // Avantages clés
  const keyBenefits = [
    {
      title: "Augmentation du taux de conversion",
      value: "+35%",
      description: "Des prospects qualifiés jusqu'à la conclusion, optimisez chaque étape de votre parcours client."
    },
    {
      title: "Gain de productivité",
      value: "+40%",
      description: "Libérez du temps précieux en automatisant vos tâches répétitives et focalisez-vous sur la relation client."
    },
    {
      title: "Réduction des coûts opérationnels",
      value: "-25%",
      description: "Optimisez vos processus et réduisez les erreurs manuelles pour un ROI rapide et mesurable."
    },
    {
      title: "Amélioration de la satisfaction client",
      value: "+45%",
      description: "Offrez une expérience personnalisée qui fidélise vos clients et génère des recommandations."
    }
  ];

  // Témoignages clients
  const testimonials = [
    {
      quote: "Le CRM d'AInspiration a révolutionné notre approche commerciale. Nos équipes sont plus réactives et notre taux de conversion a augmenté de 32% en seulement 3 mois.",
      name: "Marie Dupont",
      position: "Directrice Commerciale",
      company: "TechSolutions",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&auto=format&fit=crop"
    },
    {
      quote: "L'implémentation a été rapide et l'accompagnement exceptionnel. Notre retour sur investissement a été atteint en moins de 6 mois grâce à l'augmentation des ventes et l'optimisation de nos processus.",
      name: "Thomas Lefebvre",
      position: "CEO",
      company: "GrowthMarketing",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&auto=format&fit=crop"
    },
    {
      quote: "La vue à 360° de nos clients nous permet enfin d'offrir une expérience véritablement personnalisée à chacun de nos 10 000+ clients. Un outil indispensable pour notre croissance.",
      name: "Sophie Moreau",
      position: "Responsable Relation Client",
      company: "EleganCE",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&auto=format&fit=crop"
    }
  ];

  // Screenshots du CRM
  const screenshots = [
    {
      title: "Dashboard CRM",
      description: "Vue consolidée de toutes vos activités commerciales",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop"
    },
    {
      title: "Pipeline de vente",
      description: "Suivi visuel de vos opportunités commerciales",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop"
    },
    {
      title: "Gestion des contacts",
      description: "Vue complète de vos interactions client",
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop"
    }
  ];

  // FAQ
  const faqs = [
    {
      id: 1,
      question: "Combien de temps faut-il pour implémenter votre solution CRM ?",
      answer: "Notre solution CRM peut être mise en place en 2 à 4 semaines selon la complexité de votre organisation. Nous offrons un accompagnement complet incluant la migration de vos données, la configuration selon vos processus, et la formation de vos équipes pour assurer une adoption rapide et efficace."
    },
    {
      id: 2,
      question: "Votre CRM est-il compatible avec nos outils existants ?",
      answer: "Absolument ! Notre CRM s'intègre nativement avec plus de 150 outils (Office 365, Gmail, Outlook, Mailchimp, etc.) et dispose d'une API ouverte pour des intégrations personnalisées. Nous avons conçu notre solution pour s'adapter à votre écosystème technologique, pas l'inverse."
    },
    {
      id: 3,
      question: "Comment garantissez-vous la sécurité de nos données ?",
      answer: "La sécurité est notre priorité absolue. Nous utilisons un chiffrement de bout en bout, des centres de données conformes aux normes ISO 27001, des sauvegardes quotidiennes, et des contrôles d'accès granulaires. Notre solution est entièrement conforme au RGPD et nos processus sont régulièrement audités par des experts indépendants."
    },
    {
      id: 4,
      question: "Quelle est la tarification de votre solution CRM ?",
      answer: "Notre tarification est transparente et modulaire, commençant à 29€/utilisateur/mois pour l'offre Essentielle. Nous proposons également des forfaits Business (49€) et Enterprise (sur mesure) selon vos besoins. Tous nos forfaits incluent le support et les mises à jour, sans frais cachés. Contactez-nous pour un devis personnalisé."
    },
    {
      id: 5,
      question: "Proposez-vous une formation pour notre équipe ?",
      answer: "Oui, chaque déploiement inclut un programme de formation adapté à vos besoins. Nous proposons des sessions individuelles ou en groupe, des webinaires, une documentation complète, et un centre de ressources en ligne. Notre équipe de success managers vous accompagne également après le déploiement pour maximiser votre utilisation du CRM."
    },
    {
      id: 6,
      question: "Puis-je essayer votre CRM avant de m'engager ?",
      answer: "Absolument ! Nous proposons une démo personnalisée suivie d'un essai gratuit de 14 jours avec accès à toutes les fonctionnalités. Vous pouvez également demander une preuve de concept (POC) pour tester la solution dans votre environnement spécifique avant tout engagement."
    }
  ];

  // Forfaits de prix
  const pricingPlans = [
    {
      name: "Essentiel",
      price: "29€",
      period: "utilisateur / mois",
      features: [
        "Gestion des contacts et entreprises",
        "Pipeline de vente basique",
        "Email et calendrier",
        "Applications mobiles (iOS, Android)",
        "5 Go de stockage / utilisateur",
        "Support par email"
      ],
      cta: "Commencer l'essai gratuit",
      popular: false
    },
    {
      name: "Business",
      price: "49€",
      period: "utilisateur / mois",
      features: [
        "Toutes les fonctionnalités Essentiel",
        "Automatisations avancées",
        "Rapports et tableaux de bord personnalisés",
        "Intégration avec 150+ applications",
        "20 Go de stockage / utilisateur",
        "Support prioritaire 24/5"
      ],
      cta: "Commencer l'essai gratuit",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Sur mesure",
      period: "",
      features: [
        "Toutes les fonctionnalités Business",
        "Sécurité renforcée et SSO",
        "API complète et webhooks",
        "Environnements de test",
        "Stockage illimité",
        "Support dédié 24/7 et SLA"
      ],
      cta: "Contacter l'équipe commerciale",
      popular: false
    }
  ];

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white">
      <Helmet>
        <title>Solution CRM Intelligente | AInspiration</title>
        <meta name="description" content="Transformez votre relation client avec notre CRM nouvelle génération. Automatisation intelligente, vision 360° de vos clients et augmentation prouvée des conversions." />
        <meta name="keywords" content="CRM, gestion relation client, pipeline vente, automatisation, logiciel CRM" />
      </Helmet>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-block bg-indigo-800 bg-opacity-50 px-3 py-1 rounded-full text-sm font-medium">Solution CRM</span>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Transformez chaque interaction en opportunité de croissance
              </h1>
              <p className="text-xl text-indigo-100">
                Notre CRM intelligent unifie vos données, automatise vos processus et révèle les insights qui font la différence.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setShowStartForm(true)} 
                  className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                >
                  Demander une démo
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => navigate('/contact')}
                  className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
                >
                  En savoir plus
                </button>
              </div>

              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-400 w-5 h-5" />
                  <span className="text-indigo-100">Déploiement en 14 jours</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-400 w-5 h-5" />
                  <span className="text-indigo-100">ROI en 3 mois</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-400 w-5 h-5" />
                  <span className="text-indigo-100">Support 24/7</span>
                </div>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 rounded-3xl blur-3xl"></div>
              <OptimizedImage
                src="https://images.unsplash.com/photo-1551434678-e076c223a692"
                alt="Interface CRM intelligente"
                responsive="half"
                width={1024}
                height={683}
                className="relative rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trusted By Section */}
      <div className="bg-white py-12 border-t border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-lg font-medium text-gray-600">
              Ils nous font confiance pour leur gestion de la relation client
            </h2>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-70">
            <img src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=60&fit=crop&auto=format" alt="Logo client 1" loading="lazy" className="h-8 object-contain grayscale" />
            <img src="https://images.unsplash.com/photo-1603731125990-2c0aec2261f8?w=200&h=60&fit=crop&auto=format" alt="Logo client 2" loading="lazy" className="h-8 object-contain grayscale" />
            <img src="https://images.unsplash.com/photo-1622042349683-caa882b50724?w=200&h=60&fit=crop&auto=format" alt="Logo client 3" loading="lazy" className="h-8 object-contain grayscale" />
            <img src="https://images.unsplash.com/photo-1559130614-8fa487e2d0c0?w=200&h=60&fit=crop&auto=format" alt="Logo client 4" loading="lazy" className="h-8 object-contain grayscale" />
            <img src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=60&fit=crop&auto=format" alt="Logo client 5" loading="lazy" className="h-8 object-contain grayscale" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
            Fonctionnalités
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
            Un CRM complet pour chaque aspect de votre relation client
          </h2>
          <p className="text-xl text-gray-600">
            Découvrez comment notre solution transforme votre approche commerciale et fidélise vos clients
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Screenshots Section */}
      <div className="bg-indigo-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
              Interface intuitive
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
              Une expérience utilisateur optimale
            </h2>
            <p className="text-xl text-gray-600">
              Interface épurée, navigation fluide et personnalisation avancée pour une adoption rapide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {screenshots.map((screenshot, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                data-aos="zoom-in"
                data-aos-delay={index * 150}
              >
                <div className="aspect-w-16 aspect-h-9">
                  <OptimizedImage
                    src={screenshot.image}
                    alt={screenshot.title}
                    responsive="third"
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {screenshot.title}
                  </h3>
                  <p className="text-gray-600">
                    {screenshot.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Benefits Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
            Avantages
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
            Des résultats mesurables pour votre entreprise
          </h2>
          <p className="text-xl text-gray-600">
            Notre CRM offre un retour sur investissement rapide et significatif
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {keyBenefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="text-3xl font-bold text-indigo-600 mb-3">{benefit.value}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-indigo-300 font-semibold text-sm uppercase tracking-wide">
              Témoignages
            </span>
            <h2 className="text-3xl font-bold text-white mt-2 mb-4">
              Ce que nos clients disent
            </h2>
            <p className="text-xl text-indigo-100">
              Découvrez comment notre CRM a transformé l'activité de nos clients
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 150}
              >
                <div className="flex mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-white mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white"
                  />
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-indigo-200 text-sm">{testimonial.position}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
            Tarification
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
            Des forfaits adaptés à chaque besoin
          </h2>
          <p className="text-xl text-gray-600">
            Solutions flexibles qui évoluent avec votre entreprise
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-lg p-8 relative hover:shadow-xl transition-all duration-300 flex flex-col ${
                plan.popular ? 'ring-2 ring-indigo-600' : ''
              }`}
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 rounded-bl-xl rounded-tr-xl text-sm font-medium">
                  Le plus populaire
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-indigo-600">{plan.price}</span>
                {plan.period && <span className="text-gray-500">/{plan.period}</span>}
              </div>
              <ul className="mb-8 flex-grow space-y-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => {
                  if (plan.name === "Enterprise") {
                    navigate('/contact');
                  } else {
                    setShowStartForm(true);
                  }
                }}
                className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                  plan.popular 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                } transition-colors`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-indigo-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
              FAQ
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
              Questions fréquemment posées
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir sur notre solution CRM
            </p>
          </div>

          <div className="max-w-3xl mx-auto rounded-xl bg-white shadow-lg overflow-hidden">
            {faqs.map((faq) => (
              <div key={faq.id} className="border-b last:border-0 border-gray-100">
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="flex justify-between items-center w-full px-6 py-4 text-left"
                >
                  <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                  {openFaqId === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-indigo-600" />
                  )}
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaqId === faq.id ? 'max-h-96 pb-4' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
            Notre process
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
            Un déploiement rapide et sans stress
          </h2>
          <p className="text-xl text-gray-600">
            Notre méthodologie éprouvée garantit une mise en œuvre réussie
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600 mb-4">1</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Audit et analyse</h3>
            <p className="text-gray-600">
              Compréhension approfondie de vos processus actuels et de vos objectifs commerciaux.
            </p>
            <div className="flex items-center gap-2 mt-4 text-sm text-indigo-600">
              <Clock className="w-4 h-4" />
              <span>1-2 jours</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600 mb-4">2</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Configuration</h3>
            <p className="text-gray-600">
              Personnalisation de la solution selon vos processus et intégration à vos outils.
            </p>
            <div className="flex items-center gap-2 mt-4 text-sm text-indigo-600">
              <Clock className="w-4 h-4" />
              <span>3-5 jours</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600 mb-4">3</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Formation</h3>
            <p className="text-gray-600">
              Formation complète de vos équipes pour une adoption rapide et efficace.
            </p>
            <div className="flex items-center gap-2 mt-4 text-sm text-indigo-600">
              <Clock className="w-4 h-4" />
              <span>1-3 jours</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600 mb-4">4</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Accompagnement</h3>
            <p className="text-gray-600">
              Support continu et optimisations régulières pour maximiser votre ROI.
            </p>
            <div className="flex items-center gap-2 mt-4 text-sm text-indigo-600">
              <Clock className="w-4 h-4" />
              <span>Continu</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à transformer votre relation client ?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Rejoignez plus de 1 200 entreprises qui ont déjà révolutionné leur approche commerciale avec notre solution CRM.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setShowStartForm(true)}
                className="bg-white text-indigo-700 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center justify-center gap-2"
              >
                Demander une démo
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition flex items-center justify-center gap-2"
              >
                Contactez-nous
                <Phone className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2">
                <Mail className="text-indigo-300 w-5 h-5" />
                <a href="mailto:divers@distr-action.com" className="text-indigo-100 hover:text-white transition">
                  divers@distr-action.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="text-indigo-300 w-5 h-5" />
                <a href="tel:+32477942865" className="text-indigo-100 hover:text-white transition">
                  +32 477 94 28 65
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      <StartForm 
        isOpen={showStartForm} 
        onClose={() => setShowStartForm(false)} 
        productId="crm-solution"
      />
    </section>
  );
};

export default CRMSolutionPage;