import React, { useState } from 'react';
import { 
  Brain, 
  BarChart as ChartBar, 
  DollarSign, 
  Users, 
  Clock, 
  FileText, 
  MessageSquare, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Zap,
  Sparkles
} from 'lucide-react';
import StartForm from './StartForm';

export default function WhyAI() {
  const [showStartForm, setShowStartForm] = useState(false);

  const benefits = [
    {
      title: "Productivité Accrue",
      description: "Automatisation des tâches répétitives, libérant du temps pour des activités à plus forte valeur ajoutée.",
      icon: Clock,
      stat: "+45%"
    },
    {
      title: "Réduction des Coûts",
      description: "Optimisation des processus internes, diminuant les dépenses opérationnelles.",
      icon: DollarSign,
      stat: "-30%"
    },
    {
      title: "Satisfaction Client Améliorée",
      description: "Services personnalisés et réactifs grâce à des outils intelligents.",
      icon: Users,
      stat: "+25%"
    },
    {
      title: "Augmentation du Chiffre d'Affaires",
      description: "Meilleure anticipation des besoins clients et adaptation rapide aux tendances du marché.",
      icon: ChartBar,
      stat: "+20%"
    }
  ];

  const usesCases = [
    {
      title: "Automatisation des Tâches Administratives",
      description: "Des outils d'IA permettent de générer automatiquement des rapports financiers, d'analyser les performances des campagnes marketing et de suivre les indicateurs clés de performance (KPI), éliminant ainsi le travail manuel et augmentant la précision grâce à l'analyse des données en temps réel.",
      icon: FileText,
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=1600&auto=format&fit=crop",
      examples: ["Génération de rapports", "Analyse des KPIs", "Suivi automatique"],
      callToAction: "Intégrez l'IA dans votre Entreprise"
    },
    {
      title: "Génération de Contenu Marketing",
      description: "L'IA peut produire des articles, des newsletters et des publications sur les réseaux sociaux, personnalisés en fonction des données comportementales et des préférences des clients, augmentant ainsi l'engagement et la fidélité.",
      icon: Sparkles,
      image: "https://images.unsplash.com/photo-1541560052-5e137f229371?q=80&w=1600&auto=format&fit=crop",
      examples: ["Articles de blog", "Newsletters", "Posts réseaux sociaux"],
      callToAction: "Intégrez l'IA dans votre Entreprise"
    },
    {
      title: "Service Client Intelligent",
      description: "Les chatbots et assistants virtuels peuvent répondre aux questions fréquentes, traiter les demandes de renseignements, planifier des réunions et effectuer des tâches simples de service client, offrant une disponibilité 24/7 et améliorant l'expérience client.",
      icon: MessageSquare,
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1600&auto=format&fit=crop",
      examples: ["Chatbots 24/7", "Réponses automatisées", "Planification intelligente"],
      callToAction: "Solutions IA et Formations"
    },
    {
      title: "Prévision des Ventes",
      description: "L'IA permet d'analyser les données historiques pour anticiper les besoins futurs, ajuster les processus d'approvisionnement et optimiser la gestion des stocks, réduisant ainsi les coûts et améliorant la satisfaction des clients.",
      icon: BarChart3,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1600&auto=format&fit=crop",
      examples: ["Prévisions précises", "Gestion des stocks", "Optimisation de la supply chain"],
      callToAction: "ActivDev"
    }
  ];

  const nextSteps = [
    "Identifiez les processus pouvant être automatisés dans votre entreprise.",
    "Testez des outils IA gratuits adaptés aux PME.",
    "Formez vos équipes pour une adoption réussie."
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Pourquoi l'IA ?
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-indigo-600 mb-6">
            Une Opportunité Accessible pour les PME
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            L'intelligence artificielle n'est plus réservée aux grandes entreprises. Aujourd'hui, elle offre aux PME des opportunités concrètes pour gagner en efficacité, en compétitivité et en rentabilité.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <benefit.icon className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                {benefit.title}
                <span className="text-green-500 font-bold">{benefit.stat}</span>
              </h3>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Use Cases */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Exemples Concrets d'Utilisation de l'IA dans les PME
          </h2>
          
          <div className="space-y-16">
            {usesCases.map((useCase, index) => (
              <div key={index} className={`grid md:grid-cols-2 gap-8 items-center ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 rounded-2xl blur-3xl"></div>
                  <img 
                    src={useCase.image}
                    alt={useCase.title}
                    className="relative rounded-xl shadow-xl w-full h-[300px] object-cover"
                  />
                  <div className="absolute bottom-4 right-4 bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-lg">
                    <span className="font-semibold">{useCase.callToAction}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <useCase.icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {index + 1}. {useCase.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {useCase.description}
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    {useCase.examples.map((example, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className="text-indigo-600 font-semibold flex items-center gap-1 hover:text-indigo-800 transition-colors">
                    En savoir plus 
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-white mb-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Pourquoi Attendre ?
              </h2>
              <p className="text-lg mb-6 text-indigo-100">
                L'IA est une opportunité accessible et rentable pour votre PME.
              </p>
              
              <h3 className="text-xl font-semibold mb-4">Prochaines Étapes :</h3>
              <ul className="space-y-4 mb-8">
                {nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold">{index + 1}</span>
                    </div>
                    <span className="text-indigo-50">{step}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => setShowStartForm(true)}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2"
              >
                Démarrer maintenant
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Contactez-Nous
              </h3>
              
              <p className="mb-6">
                Pour une démonstration personnalisée ou un diagnostic gratuit, n'hésitez pas à nous contacter.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-indigo-200">Taux de satisfaction</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">7 jours</div>
                  <div className="text-indigo-200">Installation moyenne</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ne laissez pas vos concurrents prendre l'avantage
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Rejoignez les PME qui ont déjà transformé leur activité grâce à l'IA
          </p>
          <button
            onClick={() => setShowStartForm(true)} 
            className="bg-indigo-600 text-white px-10 py-4 rounded-xl shadow-lg font-semibold hover:bg-indigo-700 transition-colors text-lg"
          >
            Démarrer mon diagnostic gratuit
          </button>
        </div>
      </div>
      
      <StartForm 
        isOpen={showStartForm} 
        onClose={() => setShowStartForm(false)} 
      />
    </section>
  );
}