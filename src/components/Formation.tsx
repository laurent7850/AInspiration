import React, { useState } from 'react';
import { 
  MessageSquare,
  Image,
  ArrowRight,
  Users,
  Brain,
  CheckCircle,
  Star,
  Target
} from 'lucide-react';
import StartForm from './StartForm';

export default function Formation() {
  const [showStartForm, setShowStartForm] = useState(false);

  const courses = [
    {
      title: "ChatGPT Avancé",
      level: "Tous niveaux",
      duration: "1 jour",
      icon: MessageSquare,
      topics: [
        "Rédaction de prompts efficaces",
        "Analyse et synthèse de documents",
        "Création de contenus originaux",
        "Trucs et astuces pour de meilleurs résultats"
      ]
    },
    {
      title: "Génération d'Images IA",
      level: "Débutant",
      duration: "1 jour",
      icon: Image,
      topics: [
        "Midjourney et DALL-E",
        "Description d'images précises",
        "Styles et variations",
        "Optimisation des résultats"
      ]
    }
  ];

  const benefits = [
    {
      title: "Pratique immédiate",
      description: "Exercices concrets sur des cas réels",
      icon: Target,
      examples: [
        "Rédaction d'emails professionnels",
        "Création de présentations",
        "Analyse de documents",
        "Génération de visuels"
      ]
    },
    {
      title: "Résultats garantis",
      description: "Amélioration visible dès le premier jour",
      icon: Star,
      examples: [
        "Gain de temps x3",
        "Qualité améliorée",
        "Plus de créativité",
        "Meilleure organisation"
      ]
    }
  ];

  const testimonials = [
    {
      name: "Marie L.",
      role: "Responsable Marketing",
      text: "J'ai gagné 2h par jour grâce aux techniques apprises !",
      rating: 5
    },
    {
      name: "Thomas D.",
      role: "Entrepreneur",
      text: "Formation très pratique, directement applicable",
      rating: 5
    },
    {
      name: "Sophie M.",
      role: "Assistante de Direction",
      text: "Enfin une formation IA sans jargon technique",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Maîtrisez les outils IA en 3 jours
          </h1>
          <p className="text-xl text-gray-600">
            Formations pratiques pour utiliser l'IA au quotidien
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {courses.map((course, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <course.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-indigo-600">{course.level}</p>
                </div>
              </div>
              <div className="mb-4">
                <span className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                  {course.duration}
                </span>
              </div>
              <ul className="space-y-2">
                {course.topics.map((topic, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {benefit.description}
              </p>
              <ul className="space-y-2">
                {benefit.examples.map((example, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">
                "{testimonial.text}"
              </p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-indigo-600 rounded-2xl p-8 lg:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">
                Prêt à maîtriser l'IA ?
              </h3>
              <p className="text-indigo-100 mb-6">
                Rejoignez nos apprenants satisfaits
              </p>
              <button 
                onClick={() => setShowStartForm(true)}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2"
              >
                Je réserve ma formation
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Brain className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">3 jours</div>
                <div className="text-indigo-100">Pour maîtriser l'IA</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Users className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">98%</div>
                <div className="text-indigo-100">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StartForm 
        isOpen={showStartForm} 
        onClose={() => setShowStartForm(false)} 
        productId="formation-ia"
      />
    </section>
  );
}