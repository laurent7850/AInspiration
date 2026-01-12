import React, { useState } from 'react';
import { 
  Bot, 
  Brain, 
  Sparkles, 
  MessageSquare, 
  ArrowRight,
  Zap,
  Globe,
  FileText,
  PenTool,
  BarChart,
  Code,
  Search
} from 'lucide-react';
import StartForm from './StartForm';

export default function Tools() {
  const [showStartForm, setShowStartForm] = useState(false);

  const tools = [
    {
      icon: Bot,
      title: "Assistant IA",
      description: "Assistant virtuel personnalisé pour votre entreprise",
      features: [
        "Réponses en temps réel",
        "Multi-langues",
        "Apprentissage continu",
        "Intégration facile"
      ]
    },
    {
      icon: Brain,
      title: "Analyse IA",
      description: "Analyse approfondie de vos données",
      features: [
        "Insights automatisés",
        "Tableaux de bord",
        "Prédictions avancées",
        "Rapports personnalisés"
      ]
    },
    {
      icon: Sparkles,
      title: "Prompt Master",
      description: "Création et optimisation de prompts",
      features: [
        "Bibliothèque de prompts",
        "Tests A/B",
        "Optimisation continue",
        "Templates sectoriels"
      ]
    },
    {
      icon: PenTool,
      title: "Création de Contenu",
      description: "Génération de contenu optimisé",
      features: [
        "Articles & blogs",
        "Réseaux sociaux",
        "Emails marketing",
        "Descriptions produits"
      ]
    }
  ];

  const features = [
    {
      icon: Globe,
      title: "Multi-langues",
      description: "Support de plus de 30 langues"
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Guides détaillés et exemples"
    },
    {
      icon: Code,
      title: "API",
      description: "Intégration simple via API"
    },
    {
      icon: Search,
      title: "SEO",
      description: "Optimisation pour les moteurs"
    }
  ];

  const metrics = [
    {
      value: "+200%",
      label: "Productivité",
      description: "Augmentation moyenne"
    },
    {
      value: "-40%",
      label: "Coûts",
      description: "Réduction des dépenses"
    },
    {
      value: "24/7",
      label: "Disponibilité",
      description: "Support continu"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nos Outils IA
          </h1>
          <p className="text-xl text-gray-600">
            Une suite complète d'outils pour transformer votre entreprise
          </p>
        </div>

        {/* Outils principaux */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {tools.map((tool, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <tool.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{tool.title}</h2>
                  <p className="text-gray-600">{tool.description}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {tool.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-600">
                    <Zap className="w-4 h-4 text-indigo-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Fonctionnalités communes */}
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Métriques */}
        <div className="bg-indigo-600 rounded-2xl p-8 mb-16">
          <div className="grid md:grid-cols-3 gap-8">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-4xl font-bold mb-2">{metric.value}</div>
                <div className="text-xl font-semibold mb-1">{metric.label}</div>
                <div className="text-indigo-200">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Prêt à transformer votre entreprise ?
              </h2>
              <p className="text-indigo-100 mb-6">
                Découvrez comment nos outils peuvent optimiser vos processus
              </p>
              <button 
                onClick={() => setShowStartForm(true)}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2"
              >
                Démarrer maintenant
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Zap className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">5min</div>
                <div className="text-indigo-100">Installation</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <BarChart className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">ROI</div>
                <div className="text-indigo-100">Immédiat</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StartForm 
        isOpen={showStartForm} 
        onClose={() => setShowStartForm(false)} 
      />
    </section>
  );
}