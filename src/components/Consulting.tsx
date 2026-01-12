import React, { useState } from 'react';
import { 
  Lightbulb,
  Target,
  TrendingUp,
  Shield,
  ArrowRight,
  Users,
  Zap,
  CheckCircle,
  Brain,
  LineChart,
  Compass
} from 'lucide-react';
import StartForm from './StartForm';

export default function Consulting() {
  const [showStartForm, setShowStartForm] = useState(false);

  const expertises = [
    {
      icon: Brain,
      title: "Stratégie IA",
      description: "Définition de votre feuille de route IA alignée avec vos objectifs business"
    },
    {
      icon: Target,
      title: "Optimisation des processus",
      description: "Identification et implémentation des opportunités d'automatisation"
    },
    {
      icon: LineChart,
      title: "Performance & ROI",
      description: "Maximisation du retour sur investissement de vos solutions IA"
    },
    {
      icon: Compass,
      title: "Innovation guidée",
      description: "Exploration des technologies émergentes adaptées à vos besoins"
    }
  ];

  const methodology = [
    {
      phase: "Diagnostic",
      activities: [
        "Audit des processus existants",
        "Analyse des opportunités",
        "Évaluation de la maturité IA"
      ],
      duration: "2-3 semaines"
    },
    {
      phase: "Stratégie",
      activities: [
        "Définition des objectifs",
        "Priorisation des initiatives",
        "Plan d'implémentation"
      ],
      duration: "3-4 semaines"
    },
    {
      phase: "Exécution",
      activities: [
        "Pilotes et POC",
        "Déploiement progressif",
        "Mesure des résultats"
      ],
      duration: "2-6 mois"
    }
  ];

  const benefits = [
    {
      title: "Vision claire",
      description: "Stratégie IA alignée avec vos objectifs business",
      icon: Lightbulb,
      stats: "+180% ROI moyen"
    },
    {
      title: "Efficacité prouvée",
      description: "Optimisation mesurable des processus",
      icon: TrendingUp,
      stats: "-30% coûts opérationnels"
    },
    {
      title: "Risques maîtrisés",
      description: "Approche sécurisée et conforme",
      icon: Shield,
      stats: "100% conformité RGPD"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Conseil en Intelligence Artificielle
          </h1>
          <p className="text-xl text-gray-600">
            Transformez votre entreprise avec une stratégie IA sur mesure
          </p>
        </div>

        {/* Expertises */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {expertises.map((expertise, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <expertise.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {expertise.title}
              </h3>
              <p className="text-gray-600">
                {expertise.description}
              </p>
            </div>
          ))}
        </div>

        {/* Méthodologie */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Notre méthodologie
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {methodology.map((phase, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-600">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{phase.phase}</h3>
                    <span className="text-sm text-indigo-600">{phase.duration}</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {phase.activities.map((activity, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bénéfices */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 mb-3">
                {benefit.description}
              </p>
              <div className="text-sm font-semibold text-indigo-600">
                {benefit.stats}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-indigo-600 rounded-2xl p-8 lg:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">
                Prêt à définir votre stratégie IA ?
              </h3>
              <p className="text-indigo-100 mb-6">
                Réservez une session de consultation stratégique gratuite
              </p>
              <button 
                onClick={() => setShowStartForm(true)}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2"
              >
                Planifier ma consultation
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Zap className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">15+</div>
                <div className="text-indigo-100">Années d'expertise</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Users className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">500+</div>
                <div className="text-indigo-100">Projets réussis</div>
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