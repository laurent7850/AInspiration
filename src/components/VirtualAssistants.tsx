import React, { useState } from 'react';
import { 
  Bot, 
  MessageSquare, 
  Brain, 
  Settings, 
  ArrowRight, 
  Zap,
  Users,
  Clock,
  Globe,
  Shield
} from 'lucide-react';
import StartForm from './StartForm';

export default function VirtualAssistants() {
  const [showStartForm, setShowStartForm] = useState(false);

  const assistantTypes = [
    {
      title: "Assistant Service Client",
      description: "Réponses instantanées 24/7 à vos clients",
      features: [
        "Réponses en temps réel",
        "Multi-langues",
        "Personnalisation des réponses",
        "Transfert vers un humain si nécessaire"
      ],
      icon: MessageSquare,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Assistant Analyse",
      description: "Analyse et interprétation de données en temps réel",
      features: [
        "Tableaux de bord en direct",
        "Alertes intelligentes",
        "Recommandations d'actions",
        "Rapports automatisés"
      ],
      icon: Brain,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Assistant Process",
      description: "Automatisation des tâches répétitives",
      features: [
        "Workflows automatisés",
        "Intégration avec vos outils",
        "Suivi des tâches",
        "Optimisation continue"
      ],
      icon: Settings,
      color: "bg-green-100 text-green-600"
    }
  ];

  const benefits = [
    {
      title: "Disponibilité 24/7",
      description: "Service continu sans interruption",
      icon: Clock
    },
    {
      title: "Multi-langues",
      description: "Support en plus de 30 langues",
      icon: Globe
    },
    {
      title: "Sécurité maximale",
      description: "Protection des données garantie",
      icon: Shield
    }
  ];

  const metrics = [
    {
      value: "90%",
      label: "Taux de résolution",
      description: "Des demandes résolues automatiquement"
    },
    {
      value: "-60%",
      label: "Réduction des coûts",
      description: "Sur le support client"
    },
    {
      value: "24/7",
      label: "Disponibilité",
      description: "Service continu"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Assistants Virtuels IA
          </h1>
          <p className="text-xl text-gray-600">
            Des assistants intelligents qui comprennent vraiment vos besoins
          </p>
        </div>

        {/* Types d'assistants */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {assistantTypes.map((type, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mb-4`}>
                <type.icon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {type.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {type.description}
              </p>
              <ul className="space-y-2">
                {type.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-600">
                    <Bot className="w-4 h-4 text-indigo-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
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
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Prêt à automatiser votre support ?
              </h2>
              <p className="text-indigo-100 mb-6">
                Découvrez la puissance des assistants IA
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
                <div className="text-3xl font-bold mb-1">5min</div>
                <div className="text-indigo-100">Configuration</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Users className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">24/7</div>
                <div className="text-indigo-100">Disponibilité</div>
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