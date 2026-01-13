import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Zap, 
  RefreshCw, 
  TrendingUp,
  Calendar,
  Users,
  ArrowRight,
  CheckCircle,
  BarChart2,
  Rocket,
  Settings,
  Target,
  Monitor
} from 'lucide-react';
import StartForm from '../components/StartForm';

const TransformationPage: React.FC = () => {
  const [showStartForm, setShowStartForm] = useState(false);
  
  // Phases of the transformation process
  const transformationPhases = [
    {
      title: "Diagnostic digital",
      description: "Évaluation complète de votre maturité digitale et identification des opportunités",
      icon: Target,
      activities: [
        "Audit des outils et systèmes existants",
        "Analyse des processus métier",
        "Identification des goulets d'étranglement",
        "Cartographie des opportunités d'innovation"
      ]
    },
    {
      title: "Stratégie & Feuille de route",
      description: "Élaboration d'un plan de transformation pragmatique et réaliste",
      icon: Settings,
      activities: [
        "Définition des objectifs et KPIs",
        "Priorisation des initiatives",
        "Allocation des ressources",
        "Planning de déploiement"
      ]
    },
    {
      title: "Implémentation agile",
      description: "Déploiement progressif des solutions avec une approche itérative",
      icon: RefreshCw,
      activities: [
        "Sélection des technologies adaptées",
        "Développement et intégration",
        "Tests et validation",
        "Formation des équipes"
      ]
    },
    {
      title: "Optimisation continue",
      description: "Mesure des résultats et amélioration permanente des solutions",
      icon: TrendingUp,
      activities: [
        "Suivi des KPIs en temps réel",
        "Recueil des retours utilisateurs",
        "Analyse des performances",
        "Ajustements et évolutions"
      ]
    }
  ];

  // Benefits of digital transformation
  const benefits = [
    {
      title: "Efficacité opérationnelle",
      value: "+40%",
      description: "Automatisation des processus et réduction des tâches manuelles"
    },
    {
      title: "Satisfaction client",
      value: "+35%",
      description: "Expériences fluides et personnalisées"
    },
    {
      title: "Agilité organisationnelle",
      value: "3x",
      description: "Capacité à s'adapter rapidement aux changements"
    },
    {
      title: "Réduction des coûts",
      value: "-25%",
      description: "Optimisation des processus et des ressources"
    }
  ];

  // Success stories
  const successStories = [
    {
      company: "MediPharma",
      industry: "Santé",
      challenge: "Processus administratifs lents et communication fragmentée entre les services",
      solution: "Déploiement d'une plateforme collaborative intégrée et automatisation des workflows",
      results: [
        "Réduction de 65% du temps de traitement administratif",
        "Amélioration de la coordination entre équipes",
        "Augmentation de 28% de la satisfaction patient"
      ],
      quote: "La transformation numérique a non seulement optimisé nos processus, mais elle a également redonné du temps à nos équipes pour se concentrer sur ce qui compte vraiment : nos patients.",
      author: "Dr. Marie Laurent, Directrice"
    },
    {
      company: "TechnoPlast",
      industry: "Industrie manufacturière",
      challenge: "Difficultés à suivre la production en temps réel et problèmes de qualité récurrents",
      solution: "Implémentation d'un système IoT de suivi en temps réel et analyse prédictive de maintenance",
      results: [
        "Réduction de 42% des temps d'arrêt non planifiés",
        "Amélioration de 23% de la qualité produit",
        "Diminution de 18% des coûts de maintenance"
      ],
      quote: "Nous pouvons désormais anticiper les problèmes avant qu'ils n'impactent notre production. Cette visibilité en temps réel a transformé notre façon de travailler.",
      author: "Thomas Dubois, Responsable Production"
    }
  ];

  // Solutions implemented
  const solutions = [
    {
      icon: Monitor,
      title: "Plateforme collaborative",
      description: "Espace de travail digital unifié pour fluidifier la communication et centraliser l'information",
      features: ["Interface personnalisable", "Intégration avec vos outils", "Gestion documentaire", "Workflows automatisés"]
    },
    {
      icon: BarChart2,
      title: "Tableaux de bord intelligents",
      description: "Visualisation en temps réel de vos indicateurs clés pour piloter efficacement votre activité",
      features: ["KPIs personnalisés", "Alertes automatiques", "Analyses prédictives", "Partage sécurisé"]
    },
    {
      icon: Rocket,
      title: "Automatisation des processus",
      description: "Robotisation des tâches répétitives pour libérer vos équipes et réduire les erreurs",
      features: ["Workflows intelligents", "Traitement documentaire", "Intégration multi-systèmes", "Validation intelligente"]
    }
  ];

  return (
    <section className="pt-20 bg-gradient-to-b from-gray-50 to-white">
      <Helmet>
        <title>Transformation Numérique | AInspiration</title>
        <meta name="description" content="Accélérez votre transformation numérique grâce à notre expertise. Accompagnement sur-mesure pour optimiser vos processus et innover efficacement." />
      </Helmet>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex gap-2 items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
              <RefreshCw className="w-4 h-4" />
              <span>Transformation Numérique</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Accélérez votre <span className="text-indigo-600">transformation digitale</span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Nous accompagnons votre organisation dans sa mutation numérique, avec une approche progressive 
              et pragmatique pour des résultats concrets et mesurables.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setShowStartForm(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg"
              >
                Démarrer votre transformation
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setShowStartForm(true)}
                className="bg-white border border-indigo-200 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Demander un diagnostic
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl"></div>
            <img 
              src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80"
              alt="Transformation numérique en entreprise"
              className="relative rounded-xl shadow-xl w-full"
            />
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Notre méthodologie de transformation
          </h2>
          <p className="text-lg text-gray-600">
            Une approche structurée en 4 phases pour garantir une transformation maîtrisée et efficace
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {transformationPhases.map((phase, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-5">
                <phase.icon className="w-7 h-7 text-indigo-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {phase.title}
              </h3>
              
              <p className="text-gray-600 mb-5">
                {phase.description}
              </p>
              
              <ul className="space-y-2">
                {phase.activities.map((activity, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Les bénéfices de la transformation numérique
            </h2>
            <p className="text-lg text-gray-600">
              Des améliorations mesurables qui impactent directement votre performance
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl shadow p-8 text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-3">{benefit.value}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Solutions Section */}
      <div className="container mx-auto px-4 py-16 border-b border-gray-100">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Nos solutions de transformation
          </h2>
          <p className="text-lg text-gray-600">
            Des outils adaptés pour chaque aspect de votre transformation numérique
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-5">
                <solution.icon className="w-7 h-7 text-indigo-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {solution.title}
              </h3>
              
              <p className="text-gray-600 mb-5">
                {solution.description}
              </p>
              
              <ul className="space-y-2">
                {solution.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Success Stories Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Études de cas
          </h2>
          <p className="text-lg text-gray-600">
            Découvrez comment nos clients ont réussi leur transformation numérique
          </p>
        </div>
        
        <div className="space-y-12">
          {successStories.map((story, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-8">
                  <div className="inline-flex gap-2 items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                    {story.industry}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {story.company}
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">Le défi</h4>
                      <p className="text-gray-600">{story.challenge}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">Notre solution</h4>
                      <p className="text-gray-600">{story.solution}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">Résultats</h4>
                      <ul className="space-y-1">
                        {story.results.map((result, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <blockquote className="italic text-gray-700 border-l-4 border-indigo-500 pl-4 py-1">
                    "{story.quote}"
                    <footer className="mt-2 text-gray-600 not-italic">
                      <strong>{story.author}</strong>
                    </footer>
                  </blockquote>
                </div>
                
                <div className="bg-indigo-100 flex items-center justify-center p-8">
                  <img 
                    src={`https://images.unsplash.com/photo-${index === 0 ? '1576091160550-2173dba999ef' : '1581291518857-4e27b48ff24e'}?w=600&auto=format&fit=crop&q=80`}
                    alt={`${story.company} - Transformation numérique`}
                    className="rounded-lg shadow-lg max-h-80 object-contain"
                  />
                </div>
              </div>
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
                Prêt à engager votre transformation ?
              </h2>
              <p className="text-xl text-indigo-100 mb-8">
                Commencez par un diagnostic gratuit de votre maturité digitale et recevez
                des recommandations personnalisées pour votre organisation.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-yellow-300" />
                  <span className="text-indigo-100">Diagnostic complet en 1 semaine</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-yellow-300" />
                  <span className="text-indigo-100">Accompagnement personnalisé</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-yellow-300" />
                  <span className="text-indigo-100">Résultats rapides et concrets</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Demander un diagnostic gratuit
              </h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Évaluation de votre maturité digitale</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Cartographie de vos opportunités</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Recommandations prioritaires</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Estimation des gains potentiels</span>
                </div>
              </div>
              
              <button 
                onClick={() => setShowStartForm(true)}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                Démarrer mon diagnostic
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

export default TransformationPage;