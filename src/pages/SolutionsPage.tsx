import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bot,
  Wand2,
  Zap,
  Brain,
  MessageSquare,
  Settings,
  Globe,
  Shield,
  Target,
  Sparkles,
  FileText,
  ArrowRight,
  CheckCircle,
  BarChart,
  RefreshCw,
  Image,
  PenTool
} from 'lucide-react';
import AuditForm from '../components/AuditForm';
import AnimatedStats from '../components/AnimatedStats';
import RelatedServices from '../components/ui/RelatedServices';
import SEOHead from '../components/SEOHead';
import { getSEOConfig } from '../config/seoConfig';
import { createServiceSchema } from '../utils/structuredData';

const SolutionsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const seoConfig = getSEOConfig('/solutions', i18n.language as 'fr' | 'en');
  const [showStartForm, setShowStartForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  const serviceSchema = createServiceSchema({
    name: "Solutions IA complètes",
    description: "Solutions d'intelligence artificielle pour entreprises : analyse, automatisation, assistants virtuels et création visuelle",
    provider: "Aimagination",
    areaServed: ["Belgium", "France", "Luxembourg", "Netherlands"]
  });

  const categories = [
    { id: 'all', name: 'Toutes les solutions' },
    { id: 'data', name: 'Analyse de données' },
    { id: 'automation', name: 'Automatisation' },
    { id: 'communication', name: 'Communication' },
    { id: 'creative', name: 'Création & Design' }
  ];

  const mainSolutions = [
    {
      icon: Brain,
      title: "Analyse de données IA",
      description: "Transformez vos données en insights stratégiques pour prendre des décisions éclairées",
      benefits: [
        "Prédictions et tendances futures",
        "Segmentation client avancée",
        "Détection d'anomalies",
        "Tableaux de bord personnalisés"
      ],
      path: "/analyse-ia",
      categories: ['data']
    },
    {
      icon: RefreshCw,
      title: "Transformation numérique",
      description: "Accompagnement global pour accélérer votre transition digitale et optimiser vos processus",
      benefits: [
        "Diagnostic de maturité digitale",
        "Feuille de route personnalisée",
        "Implémentation progressive",
        "Formation des équipes"
      ],
      path: "/transformation",
      categories: ['data', 'automation']
    },
    {
      icon: Settings,
      title: "Automatisation intelligente",
      description: "Libérez votre équipe des tâches répétitives et concentrez-vous sur l'essentiel",
      benefits: [
        "Workflows intelligents",
        "Intégration facile",
        "ROI immédiat",
        "Gain de temps x3"
      ],
      path: "/automatisation",
      categories: ['automation']
    },
    {
      icon: Bot,
      title: "Assistants virtuels",
      description: "Des assistants intelligents qui comprennent vraiment vos besoins et ceux de vos clients",
      benefits: [
        "Support client 24/7",
        "Réponses instantanées",
        "Multi-langues",
        "Personnalisation avancée"
      ],
      path: "/assistants",
      categories: ['communication']
    },
    {
      icon: BarChart,
      title: "CRM intelligent",
      description: "Une solution complète pour gérer et optimiser votre relation client",
      benefits: [
        "Vision 360° de vos clients",
        "Automatisation des tâches",
        "Prévisions de ventes",
        "Reporting personnalisé"
      ],
      path: "/crm",
      categories: ['automation', 'communication']
    },
    {
      icon: MessageSquare,
      title: "Prompts optimisés",
      description: "Création de prompts performants pour maximiser les résultats de vos interactions IA",
      benefits: [
        "Prompts testés et validés",
        "Optimisation continue",
        "Bibliothèque spécialisée",
        "Résultats mesurables"
      ],
      path: "/prompts",
      categories: ['communication']
    },
    {
      icon: Image,
      title: "Création visuelle IA",
      description: "Générez des images professionnelles pour tous vos supports de communication",
      benefits: [
        "Images sur mesure",
        "Haute résolution",
        "Droits d'utilisation inclus",
        "Styles variés"
      ],
      path: "/creation-visuelle",
      categories: ['creative']
    },
    {
      icon: PenTool,
      title: "Génération de contenu",
      description: "Créez du contenu engageant pour tous vos canaux de communication",
      benefits: [
        "Articles optimisés SEO",
        "Emails marketing",
        "Posts réseaux sociaux",
        "Descriptions produits"
      ],
      path: "/creativite",
      categories: ['creative', 'communication']
    }
  ];

  // Filter solutions based on selected category
  const filteredSolutions = selectedCategory === 'all' 
    ? mainSolutions 
    : mainSolutions.filter(solution => solution.categories.includes(selectedCategory));

  const benefits = [
    {
      icon: Brain,
      title: "IA de pointe",
      description: "Les dernières avancées technologiques au service de votre entreprise"
    },
    {
      icon: Globe,
      title: "Support multi-langues",
      description: "Une portée internationale pour votre business"
    },
    {
      icon: Shield,
      title: "Sécurité maximale",
      description: "Protection et confidentialité garanties"
    },
    {
      icon: Target,
      title: "Résultats mesurables",
      description: "Des objectifs clairs et des résultats concrets"
    }
  ];

  return (
    <>
      <SEOHead
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        schema={serviceSchema}
      />
      <section className="pt-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Solutions d'Intelligence Artificielle
          </h1>
          <p className="text-xl text-gray-600">
            Des solutions innovantes et accessibles pour transformer votre entreprise
          </p>
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Solutions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
          {filteredSolutions.map((solution, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <solution.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {solution.title}
              </h2>
              <p className="text-gray-600 mb-4 flex-grow">
                {solution.description}
              </p>
              <ul className="space-y-2 mb-6">
                {solution.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-600 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate(solution.path)}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                En savoir plus
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        
        {/* Integration Benefits */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="bg-indigo-50 rounded-2xl p-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Une approche intégrée pour des résultats optimaux
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Nos solutions sont conçues pour fonctionner ensemble, créant un écosystème IA 
                qui maximise votre productivité et votre ROI
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6">
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
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-white mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Vous ne trouvez pas ce que vous cherchez ?
              </h2>
              <p className="text-indigo-100 mb-6">
                Nos experts peuvent créer une solution personnalisée adaptée à vos besoins spécifiques
              </p>
              <button 
                onClick={() => setShowStartForm(true)}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2"
              >
                Discuter de vos besoins
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <AnimatedStats variant="dark" className="grid-cols-2" />
          </div>
        </div>
        
        {/* Expert Guidance Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Un accompagnement expert à chaque étape
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Nos consultants vous accompagnent tout au long de votre parcours d'adoption de l'IA,
            de l'identification de vos besoins à l'optimisation continue de vos solutions.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600 mx-auto mb-4">1</div>
              <h3 className="font-semibold text-gray-900 mb-2">Audit personnalisé</h3>
              <p className="text-gray-600 text-sm">Analyse de vos besoins et identification des opportunités</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600 mx-auto mb-4">2</div>
              <h3 className="font-semibold text-gray-900 mb-2">Implémentation</h3>
              <p className="text-gray-600 text-sm">Déploiement progressif et formation de vos équipes</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600 mx-auto mb-4">3</div>
              <h3 className="font-semibold text-gray-900 mb-2">Optimisation</h3>
              <p className="text-gray-600 text-sm">Suivi des résultats et amélioration continue</p>
            </div>
          </div>
        </div>

        {/* Related Services */}
        <div className="mt-16 mb-8">
          <RelatedServices links={[
            { path: '/audit', title: 'Audit IA Gratuit', description: 'Analyse complète de votre activité en 24h' },
            { path: '/automatisation', title: 'Automatisation IA', description: 'Réduisez 60% de vos tâches répétitives' },
            { path: '/assistants', title: 'Assistants Virtuels', description: 'Chatbots et assistants IA 24/7' },
            { path: '/analyse-ia', title: 'Analyse IA', description: 'Exploitez vos données avec l\'IA' },
          ]} />
        </div>
      </div>

      <AuditForm
        isOpen={showStartForm}
        onClose={() => setShowStartForm(false)}
      />
      </section>
    </>
  );
};

export default SolutionsPage;