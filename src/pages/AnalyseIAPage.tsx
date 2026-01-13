import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Brain, 
  LineChart, 
  PieChart, 
  BarChart2, 
  TrendingUp, 
  Zap,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Database,
  Eye
} from 'lucide-react';
import StartForm from '../components/StartForm';

const AnalyseIAPage: React.FC = () => {
  const [showStartForm, setShowStartForm] = useState(false);

  const mainFeatures = [
    {
      icon: LineChart,
      title: "Analyse prédictive",
      description: "Anticipez les tendances futures grâce à des algorithmes avancés d'apprentissage automatique qui identifient les patterns dans vos données historiques",
      benefits: [
        "Prévisions de ventes précises",
        "Anticipation des comportements clients",
        "Identification précoce des opportunités"
      ]
    },
    {
      icon: PieChart,
      title: "Segmentation intelligente",
      description: "Découvrez des segments de clients invisibles à l'œil nu grâce à des algorithmes de clustering qui révèlent des groupes homogènes dans vos données",
      benefits: [
        "Personnalisation ultra-ciblée",
        "Optimisation des campagnes marketing",
        "Découverte de niches inexploitées"
      ]
    },
    {
      icon: BarChart2,
      title: "Tableaux de bord dynamiques",
      description: "Visualisez vos KPIs en temps réel dans des interfaces interactives qui s'adaptent à vos besoins et vous alertent des changements significatifs",
      benefits: [
        "Vue d'ensemble instantanée",
        "Alertes intelligentes automatisées",
        "Personnalisation complète des vues"
      ]
    },
    {
      icon: Eye,
      title: "Détection d'anomalies",
      description: "Identifiez automatiquement les valeurs aberrantes et événements inhabituels dans vos données qui pourraient signaler des problèmes ou opportunités",
      benefits: [
        "Détection précoce des fraudes",
        "Identification des dysfonctionnements",
        "Repérage d'opportunités uniques"
      ]
    }
  ];

  const useCases = [
    {
      title: "Commerce & Distribution",
      description: "Optimisez vos stocks, prévoyez les ventes et personnalisez l'expérience client grâce à l'analyse prédictive de données.",
      examples: [
        "Prévision de la demande par produit et par magasin",
        "Optimisation des prix en temps réel",
        "Personnalisation des recommandations produits",
        "Analyse du comportement client en magasin et en ligne"
      ],
      testimonial: {
        quote: "Grâce à l'analyse prédictive d'AInspiration, nous avons réduit nos ruptures de stock de 78% tout en diminuant notre stock global de 15%.",
        author: "Marie Deschamps",
        role: "Directrice Supply Chain, MeubleExpress"
      }
    },
    {
      title: "Services financiers",
      description: "Détectez les fraudes, évaluez les risques et identifiez de nouvelles opportunités d'investissement grâce à l'analyse avancée.",
      examples: [
        "Scoring crédit automatisé et personnalisé",
        "Détection de fraudes en temps réel",
        "Analyse des tendances de marché",
        "Optimisation de portefeuilles d'investissement"
      ],
      testimonial: {
        quote: "L'implémentation du système de détection d'anomalies nous a permis d'identifier 34% plus de transactions frauduleuses, tout en réduisant les faux positifs de 56%.",
        author: "Thomas Lefèvre",
        role: "RSSI, CréditPro"
      }
    }
  ];

  const metrics = [
    {
      value: "+67%",
      label: "Précision prédictive",
      description: "Par rapport aux méthodes conventionnelles"
    },
    {
      value: "10x",
      label: "Plus rapide",
      description: "Analyses en temps réel"
    },
    {
      value: "98%",
      label: "Satisfaction client",
      description: "Solutions adaptées"
    },
    {
      value: "ROI +245%",
      label: "Retour sur investissement",
      description: "En moyenne sur 12 mois"
    }
  ];

  const process = [
    {
      step: 1,
      title: "Audit des données",
      description: "Évaluation de vos sources de données, identification des lacunes et des opportunités d'enrichissement"
    },
    {
      step: 2,
      title: "Conception de la solution",
      description: "Définition des objectifs d'analyse, sélection des algorithmes et création d'une architecture sur mesure"
    },
    {
      step: 3,
      title: "Implémentation & Test",
      description: "Développement de la solution, intégration à vos systèmes et validation des résultats"
    },
    {
      step: 4,
      title: "Déploiement & Suivi",
      description: "Mise en production, formation des équipes et optimisation continue des performances"
    }
  ];

  return (
    <section className="pt-20 bg-gradient-to-b from-gray-50 to-white">
      <Helmet>
        <title>Analyse IA - Solutions analytiques avancées | AInspiration</title>
        <meta name="description" content="Transformez vos données en insights stratégiques avec nos solutions d'analyse IA. Prédictions, détection d'anomalies, segmentation et tableaux de bord personnalisés." />
      </Helmet>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex gap-2 items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
              <Brain className="w-4 h-4" />
              <span>Solution d'analyse avancée</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Transformez vos données en <span className="text-indigo-600">décisions stratégiques</span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Notre solution d'analyse IA transforme vos données brutes en insights actionnables, 
              révélant les tendances cachées et prédisant les évolutions futures pour vous donner 
              un avantage concurrentiel décisif.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setShowStartForm(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg"
              >
                Demander une démo
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setShowStartForm(true)}
                className="bg-white border border-indigo-200 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Consulter la documentation
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl"></div>
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80"
              alt="Tableau de bord d'analyse de données"
              className="relative rounded-xl shadow-xl w-full"
            />
          </div>
        </div>
      </div>

      {/* Main Features Section */}
      <div className="container mx-auto px-4 py-16 border-b border-gray-100">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Des fonctionnalités analytiques puissantes
          </h2>
          <p className="text-lg text-gray-600">
            Notre plateforme combine des algorithmes avancés et une interface intuitive 
            pour rendre l'analyse de données accessible à tous les niveaux de votre organisation.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {mainFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-5">
                <feature.icon className="w-7 h-7 text-indigo-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 mb-5">
                {feature.description}
              </p>
              
              <ul className="space-y-2">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics Section */}
      <div className="bg-indigo-600 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-12">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-4xl font-bold mb-2">{metric.value}</div>
                <div className="text-xl font-semibold mb-1">{metric.label}</div>
                <div className="text-indigo-200">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="container mx-auto px-4 py-16 border-b border-gray-100">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Applications sectorielles
          </h2>
          <p className="text-lg text-gray-600">
            Découvrez comment notre solution d'analyse IA transforme les industries
          </p>
        </div>
        
        <div className="space-y-16">
          {useCases.map((useCase, index) => (
            <div key={index} className="grid md:grid-cols-2 gap-8 items-center">
              <div className={`order-2 ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-indigo-600" />
                  {useCase.title}
                </h3>
                
                <p className="text-gray-600 mb-6 text-lg">
                  {useCase.description}
                </p>
                
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-600" />
                    Applications concrètes
                  </h4>
                  
                  <ul className="space-y-2">
                    {useCase.examples.map((example, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <blockquote className="bg-indigo-50 p-5 rounded-lg border-l-4 border-indigo-600">
                  <p className="text-gray-700 italic mb-4">"{useCase.testimonial.quote}"</p>
                  <footer className="font-medium">
                    <span className="text-indigo-600">{useCase.testimonial.author}</span>, {useCase.testimonial.role}
                  </footer>
                </blockquote>
              </div>
              
              <div className={`order-1 ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl"></div>
                  <img 
                    src={`https://images.unsplash.com/photo-${index === 0 ? '1551288049-bebda4e38f71' : '1460925895917-afdab827c52f'}?w=800&auto=format&fit=crop&q=80`}
                    alt={`${useCase.title} - Analyse IA`}
                    className="relative rounded-xl shadow-xl w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Process Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Notre processus d'implémentation
          </h2>
          <p className="text-lg text-gray-600">
            Une approche structurée pour garantir des résultats concrets
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {process.map((step) => (
            <div key={step.step} className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                {step.step}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {step.title}
              </h3>
              
              <p className="text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-6">
                Prêt à exploiter la puissance de vos données ?
              </h2>
              <p className="text-xl text-indigo-100 mb-8">
                Découvrez comment notre solution d'analyse IA peut transformer votre approche métier 
                et vous donner un avantage concurrentiel décisif.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-yellow-300" />
                  <span className="text-indigo-100">Mise en place en moins de 2 semaines</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-yellow-300" />
                  <span className="text-indigo-100">ROI mesurable dès le premier mois</span>
                </div>
                <div className="flex items-center gap-3">
                  <Database className="w-6 h-6 text-yellow-300" />
                  <span className="text-indigo-100">Compatible avec toutes vos sources de données</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Planifiez votre démo gratuite
              </h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Présentation personnalisée de la solution</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Analyse de vos besoins spécifiques</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Exemple concret avec vos données</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Proposition sur mesure en 48h</span>
                </div>
              </div>
              
              <button 
                onClick={() => setShowStartForm(true)}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                Planifier ma démo
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      <StartForm 
        isOpen={showStartForm} 
        onClose={() => setShowStartForm(false)} 
      />
    </section>
  );
};

export default AnalyseIAPage;