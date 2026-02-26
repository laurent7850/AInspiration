import React, { useState } from 'react';
import { 
  Brain, 
  MessageSquare, 
  Zap, 
  ArrowRight, 
  Users,
  Star,
  Target,
  Clock
} from 'lucide-react';
import StartForm from './StartForm';

export default function PromptOptimization() {
  const [showStartForm, setShowStartForm] = useState(false);

  const promptComparison = [
    {
      critere: "Précision",
      basique: "45%",
      optimise: "85%",
      amelioration: "+40%"
    },
    {
      critere: "Temps de réponse",
      basique: "3-4 itérations",
      optimise: "1-2 itérations",
      amelioration: "-60%"
    },
    {
      critere: "Pertinence",
      basique: "50%",
      optimise: "90%",
      amelioration: "+40%"
    },
    {
      critere: "Satisfaction utilisateur",
      basique: "60%",
      optimise: "95%",
      amelioration: "+35%"
    },
    {
      critere: "Taux de réutilisation",
      basique: "30%",
      optimise: "80%",
      amelioration: "+50%"
    }
  ];

  const features = [
    {
      icon: Brain,
      title: "IA Contextuelle",
      description: "Prompts adaptés à votre secteur d'activité"
    },
    {
      icon: Target,
      title: "Optimisation Continue",
      description: "Amélioration basée sur les résultats"
    },
    {
      icon: MessageSquare,
      title: "Bibliothèque de Prompts",
      description: "Accès à des milliers de prompts testés"
    },
    {
      icon: Star,
      title: "Qualité Garantie",
      description: "Résultats validés par nos experts"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Prompts Optimisés
          </h1>
          <p className="text-xl text-gray-600">
            Maximisez l'efficacité de vos interactions avec l'IA
          </p>
        </div>

        {/* Argumentaire principal */}
        <div className="bg-indigo-50 rounded-2xl p-8 mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Pourquoi optimiser vos prompts ?
            </h2>
            <div className="space-y-4 text-gray-700 mb-8">
              <p>
                Dans un monde où l'IA devient incontournable, la qualité de vos prompts fait toute la différence. Un prompt optimisé n'est pas qu'une simple question, c'est une instruction précise qui guide l'IA vers exactement ce dont vous avez besoin.
              </p>
              <p>
                Nos experts ont analysé plus de 100 000 interactions pour identifier les patterns qui fonctionnent. Le résultat ? Des prompts qui génèrent des réponses pertinentes dès la première tentative, vous faisant gagner un temps précieux.
              </p>
            </div>

            {/* Témoignages intégrés */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop"
                    alt="Sophie M."
                    loading="lazy"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Sophie M.</p>
                    <p className="text-sm text-gray-600">Directrice Marketing Digital</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Avant d'utiliser les prompts optimisés, je passais des heures à reformuler mes demandes. Maintenant, j'obtiens exactement ce que je veux en quelques minutes. C'est un gain de temps incroyable !"
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
                    alt="Marc L."
                    loading="lazy"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Marc L.</p>
                    <p className="text-sm text-gray-600">Chef de Projet Innovation</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "La différence entre un prompt basique et un prompt optimisé est stupéfiante. Nous avons réduit de 60% le temps passé à interagir avec l'IA tout en obtenant des résultats nettement supérieurs."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau comparatif */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-16">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            Comparaison des Performances
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Critère</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Prompt Basique</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Prompt Optimisé</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amélioration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {promptComparison.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{row.critere}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.basique}</td>
                    <td className="px-6 py-4 text-sm text-indigo-600 font-medium">{row.optimise}</td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">{row.amelioration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fonctionnalités */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
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

        {/* CTA */}
        <div className="bg-indigo-600 rounded-2xl p-8 lg:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Optimisez vos prompts dès maintenant
              </h2>
              <p className="text-indigo-100 mb-6">
                Découvrez la puissance des prompts optimisés
              </p>
              <button 
                onClick={() => setShowStartForm(true)}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2"
              >
                Commencer
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Clock className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">-60%</div>
                <div className="text-indigo-100">Temps gagné</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Users className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">10k+</div>
                <div className="text-indigo-100">Utilisateurs</div>
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