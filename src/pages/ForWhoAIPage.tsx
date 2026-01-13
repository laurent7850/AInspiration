import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Users, 
  User, 
  Building, 
  ShoppingCart, 
  Briefcase, 
  Hammer, 
  Factory, 
  Clipboard, 
  Check, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Shield,
  Zap
} from 'lucide-react';
import StartForm from '../components/StartForm';

const ForWhoAIPage: React.FC = () => {
  const [showStartForm, setShowStartForm] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Pour qui l'IA ? | AInspiration</title>
        <meta name="description" content="Découvrez comment l'IA peut transformer votre entreprise, quelle que soit sa taille ou son secteur d'activité." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl mb-8">
          Pour qui l'IA ?
        </h1>

        {/* Introduction avec accent sur les petites structures */}
        <div className="bg-indigo-50 rounded-xl p-8 mb-12">
          <p className="text-xl text-gray-700 mb-4 max-w-3xl">
            <span className="font-semibold text-indigo-700">En tant que partenaire privilégié des indépendants, TPE et PME</span>, nous adaptons l'ensemble de nos services pour répondre spécifiquement aux besoins et enjeux des petites structures.
          </p>
          <p className="text-lg text-gray-600">
            Chaque solution présentée sur ce site est conçue et optimisée pour accompagner votre développement, que vous soyez entrepreneur individuel ou dirigeant d'une PME, avec des offres flexibles et accessibles qui s'ajustent à votre réalité entrepreneuriale.
          </p>
        </div>
        
        {/* Section taille d'entreprise */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Une solution adaptée à chaque taille d'entreprise</h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Indépendants & Freelances</h3>
              <p className="text-gray-600 mb-4">
                Multipliez votre productivité et proposez des services à plus forte valeur ajoutée sans augmenter votre charge de travail. L'IA vous permet de vous concentrer sur votre expertise tout en automatisant les tâches chronophages.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Automatisation des tâches administratives</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Création de contenu de qualité</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Support client 24/7</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Building className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">TPE (moins de 10 employés)</h3>
              <p className="text-gray-600 mb-4">
                Concurrencez efficacement les plus grandes structures en optimisant vos processus et en augmentant votre réactivité. L'IA vous donne accès à des outils auparavant réservés aux grandes entreprises.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Analyse de données clients</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Marketing personnalisé</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Optimisation des stocks</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">PME (jusqu'à 250 employés)</h3>
              <p className="text-gray-600 mb-4">
                Transformez en profondeur votre organisation pour gagner en efficacité et en rentabilité. L'IA vous permet de libérer le potentiel de vos équipes et d'optimiser l'ensemble de vos processus.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Automatisation des workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Prédiction des tendances</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Assistance à la décision</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
        
        {/* Nouvelle section: Notre adaptation à votre réalité */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Comment nous adaptons nos services à votre réalité</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Solutions dimensionnées à votre échelle</h3>
              </div>
              <p className="text-gray-600 mb-3">
                Nous n'imposons pas de solutions surdimensionnées et coûteuses. Nos offres sont modulaires et s'adaptent précisément à la taille de votre structure.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Démarrage avec un périmètre ciblé à fort impact</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Évolution progressive selon vos résultats</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Modèle économique sans risque</h3>
              </div>
              <p className="text-gray-600 mb-3">
                Notre approche est conçue pour minimiser les risques financiers des petites structures, avec des investissements progressifs et un ROI rapide.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Audit gratuit et plan d'action personnalisé</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Mesure concrète des résultats obtenus</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
        
        {/* Section secteurs d'activité */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Des applications concrètes pour chaque secteur</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Commerce</h3>
              </div>
              <p className="text-gray-600">
                Optimisation des stocks, personnalisation des recommandations produits, prévision des ventes et amélioration de l'expérience client par chatbot 24/7.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Services</h3>
              </div>
              <p className="text-gray-600">
                Automatisation des tâches administratives, génération de devis personnalisés, gestion intelligente des rendez-vous et analyse prédictive de la demande.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Hammer className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Artisanat</h3>
              </div>
              <p className="text-gray-600">
                Gestion optimisée des approvisionnements, création de designs assistée par IA, estimation précise des délais et coûts, valorisation du savoir-faire par le digital.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Factory className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Industrie</h3>
              </div>
              <p className="text-gray-600">
                Maintenance prédictive, contrôle qualité automatisé, optimisation des lignes de production et réduction des déchets grâce à l'analyse en temps réel.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clipboard className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Professions libérales</h3>
              </div>
              <p className="text-gray-600">
                Analyse documentaire intelligente, automatisation de la prise de notes, recherche juridique ou médicale assistée, et rédaction de rapports et synthèses.
              </p>
            </div>
          </div>
        </section>
        
        {/* Section avantages clés */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Les avantages clés de l'IA pour votre entreprise</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Accessibilité</h3>
              <p className="text-gray-600">
                Des solutions IA abordables et faciles à mettre en place, quelle que soit la taille de votre structure.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gain de temps</h3>
              <p className="text-gray-600">
                Automatisation des tâches répétitives pour vous concentrer sur ce qui compte vraiment pour votre business.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ROI rapide</h3>
              <p className="text-gray-600">
                Un retour sur investissement mesurable dès les premiers mois d'utilisation de nos solutions.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Adaptabilité</h3>
              <p className="text-gray-600">
                Des solutions sur mesure qui évoluent avec vos besoins et s'adaptent à votre croissance.
              </p>
            </div>
          </div>
        </section>
        
        {/* Témoignages */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ils ont transformé leur activité avec nos solutions</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-600 italic mb-4">
                "En tant que consultant indépendant, l'IA m'a permis d'offrir des services d'analyse que seuls les grands cabinets proposaient jusqu'ici. Mon chiffre d'affaires a augmenté de 40% la première année."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Thomas D.</p>
                  <p className="text-sm text-gray-500">Consultant en stratégie</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-600 italic mb-4">
                "Avec 8 salariés, notre boutique en ligne faisait face à des géants. L'IA nous a permis d'offrir une expérience personnalisée à nos clients et d'optimiser nos stocks. Nous avons réduit nos coûts de 30% tout en augmentant nos ventes."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Building className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Marie L.</p>
                  <p className="text-sm text-gray-500">Propriétaire d'une boutique de vêtements</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <div className="bg-indigo-600 rounded-xl p-8 text-white">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Prêt à transformer votre entreprise avec l'IA ?</h2>
            <p className="text-indigo-100 mb-6">
              En tant que partenaire privilégié des indépendants, TPE et PME, nous vous proposons un audit gratuit pour identifier les opportunités d'optimisation spécifiques à votre activité.
            </p>
            <button 
              onClick={() => setShowStartForm(true)}
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
            >
              Démarrer votre audit gratuit
            </button>
          </div>
        </div>
      </div>
      
      {/* Formulaire d'audit */}
      <StartForm 
        isOpen={showStartForm} 
        onClose={() => setShowStartForm(false)}
        productId="audit-ia"
      />
    </div>
  );
};

export default ForWhoAIPage;