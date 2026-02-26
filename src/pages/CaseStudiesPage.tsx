import React from 'react';
import SectionHeader from '../components/ui/SectionHeader';
import { 
  Building, 
  Users, 
  TrendingUp, 
  Clock, 
  BarChart3,
  DollarSign,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CaseStudiesPage: React.FC = () => {
  const navigate = useNavigate();
  
  const caseStudies = [
    {
      title: "Optimisation du service client avec un chatbot IA",
      company: "CommerceXpress",
      industry: "E-commerce",
      employees: "11-50",
      challenge: "Face à une croissance rapide, CommerceXpress peinait à répondre efficacement aux demandes clients, entraînant des délais de réponse longs et une satisfaction client en baisse.",
      solution: "Mise en place d'un chatbot IA capable de traiter 80% des demandes courantes, intégré au site web et aux réseaux sociaux, avec transfert intelligent vers les agents humains.",
      results: [
        "Réduction de 75% du temps de réponse",
        "Augmentation de 30% de la satisfaction client",
        "Économie de 45k€ annuels en coûts de support",
        "Disponibilité du support 24/7"
      ],
      testimonial: {
        quote: "Notre chatbot IA est devenu indispensable. Il répond instantanément aux questions fréquentes, libérant nos équipes pour les demandes complexes. La satisfaction client a bondi et nos coûts ont diminué.",
        author: "Marie Lefèvre, Directrice Service Client"
      },
      image: "https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=1600&auto=format&fit=crop"
    },
    {
      title: "Automatisation de la gestion des factures",
      company: "TechnoServic",
      industry: "Services IT",
      employees: "51-200",
      challenge: "TechnoServic traitait manuellement plus de 500 factures par mois, entraînant des retards de paiement, des erreurs coûteuses et mobilisant deux employés à temps plein.",
      solution: "Déploiement d'une solution IA d'extraction automatique des données de factures, intégrée au système comptable existant, avec validation intelligente et classification automatique.",
      results: [
        "Réduction de 90% du temps de traitement",
        "Diminution de 95% des erreurs de saisie",
        "Économie de 65k€ annuels",
        "Redéploiement de 1,5 ETP vers des tâches à valeur ajoutée"
      ],
      testimonial: {
        quote: "Notre département comptable a été transformé. L'IA extrait et traite les données des factures avec une précision remarquable, libérant nos équipes pour des analyses plus stratégiques.",
        author: "Thomas Dubois, DAF"
      },
      image: "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?q=80&w=1600&auto=format&fit=crop"
    },
    {
      title: "Optimisation des stocks grâce à l'analyse prédictive",
      company: "MobiliFrance",
      industry: "Mobilier",
      employees: "201-500",
      challenge: "MobiliFrance souffrait de ruptures de stock fréquentes sur les articles populaires tout en immobilisant trop de capital dans des produits à faible rotation.",
      solution: "Implémentation d'un système d'analyse prédictive basé sur l'IA intégrant les données historiques, les tendances saisonnières, et les facteurs externes pour optimiser la gestion des stocks.",
      results: [
        "Réduction de 85% des ruptures de stock",
        "Diminution de 25% du stock global",
        "Augmentation de 15% du taux de rotation des stocks",
        "ROI de 180% sur la première année"
      ],
      testimonial: {
        quote: "L'IA prédictive a révolutionné notre gestion des stocks. Nous anticipons maintenant précisément la demande, évitant les ruptures tout en optimisant nos niveaux d'inventaire.",
        author: "Julie Moreau, Responsable Supply Chain"
      },
      image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1600&auto=format&fit=crop"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Études de cas"
          subtitle="Découvrez comment des entreprises comme la vôtre transforment leur activité grâce à nos solutions IA"
          centered
        />

        <div className="space-y-16 mb-12">
          {caseStudies.map((study, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="grid md:grid-cols-12 gap-0">
                {/* Image - 5 columns */}
                <div className="md:col-span-5 h-full">
                  <img
                    src={study.image}
                    alt={study.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Content - 7 columns */}
                <div className="md:col-span-7 p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-5 h-5 text-indigo-600" />
                    <span className="text-indigo-600 font-medium">{study.company}</span>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-600">{study.industry}</span>
                    <span className="text-gray-500">|</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-600 text-sm">{study.employees}</span>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {study.title}
                  </h2>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Défi</h3>
                    <p className="text-gray-600">{study.challenge}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Solution</h3>
                    <p className="text-gray-600">{study.solution}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Résultats</h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {study.results.map((result, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{result}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                    <blockquote className="italic text-gray-700 mb-2">
                      "{study.testimonial.quote}"
                    </blockquote>
                    <p className="text-sm font-medium text-gray-900">
                      — {study.testimonial.author}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <TrendingUp className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-indigo-600 mb-2">+45%</div>
            <div className="text-lg font-medium text-gray-900">Augmentation de la productivité</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Clock className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-indigo-600 mb-2">-60%</div>
            <div className="text-lg font-medium text-gray-900">Réduction du temps de traitement</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <DollarSign className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-indigo-600 mb-2">+25%</div>
            <div className="text-lg font-medium text-gray-900">Augmentation du CA</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <BarChart3 className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-indigo-600 mb-2">180%</div>
            <div className="text-lg font-medium text-gray-900">ROI moyen</div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Prêt à transformer votre entreprise ?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Découvrez comment nos solutions IA peuvent résoudre vos défis spécifiques
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Discutons de votre projet
          </button>
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesPage;