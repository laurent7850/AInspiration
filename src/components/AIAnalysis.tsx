import React, { useState } from 'react';
import { Brain, LineChart, Zap, ArrowRight, Users } from 'lucide-react';
import StartForm from './StartForm';

export default function AIAnalysis() {
  const [showStartForm, setShowStartForm] = useState(false);

  const features = [
    {
      title: "Analyse en temps réel",
      description: "Surveillez vos métriques clés en direct",
      icon: LineChart
    },
    {
      title: "Analyse prédictive",
      description: "Anticipez les tendances et opportunités",
      icon: Brain
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Analyse IA Avancée
          </h1>
          <p className="text-xl text-gray-600">
            Découvrez les insights cachés dans vos données
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h2>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-indigo-600 rounded-2xl p-8 lg:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Commencez votre analyse
              </h2>
              <p className="text-indigo-100 mb-6">
                Obtenez des insights actionnables dès aujourd'hui
              </p>
              <button 
                onClick={() => setShowStartForm(true)}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2"
              >
                Commencer maintenant
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Zap className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">99.9%</div>
                <div className="text-indigo-100">Précision</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Users className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">10k+</div>
                <div className="text-indigo-100">Clients satisfaits</div>
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