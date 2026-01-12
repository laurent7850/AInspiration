import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, ArrowRight, CheckCircle, FileText, Bot, Zap, TrendingUp, DollarSign, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StartForm from '../components/StartForm';
import BlogCTA from '../components/blog/BlogCTA';

const ThierryBlogPage: React.FC = () => {
  const [showStartForm, setShowStartForm] = useState(false);
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <Helmet>
        <title>Comment Thierry a transformé sa facturation grâce à l'IA | AImagination</title>
        <meta name="description" content="Découvrez comment Thierry a gagné 15 heures par mois en automatisant sa facturation avec AImagination. Un cas concret de transformation numérique pour PME." />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="mb-8 text-sm">
            <ol className="flex items-center space-x-1">
              <li><a href="/" className="text-gray-500 hover:text-indigo-600">Accueil</a></li>
              <li><span className="text-gray-500 mx-1">/</span></li>
              <li><a href="/blog" className="text-gray-500 hover:text-indigo-600">Blog</a></li>
              <li><span className="text-gray-500 mx-1">/</span></li>
              <li className="text-indigo-600 font-medium">Transformation de facturation</li>
            </ol>
          </nav>

          {/* Blog Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comment Thierry a transformé sa facturation grâce à l'IA d'AImagination
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                24 mai 2024
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Temps de lecture : 5 min
              </span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative h-[400px] rounded-2xl overflow-hidden mb-12 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&auto=format&fit=crop&q=80"
              alt="Thierry travaillant sur son ordinateur avec des factures"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* Blog Content */}
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-8 md:p-12 mb-12 border border-indigo-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Le défi : une facturation chronophage et source d'erreurs</h2>

            <div className="prose prose-lg max-w-none text-gray-700">
              <p>
                Thierry Martin dirige une entreprise de services informatiques de 15 employés. Comme beaucoup de dirigeants de PME, il se retrouvait régulièrement submergé par les tâches administratives, en particulier la facturation client.
              </p>

              <p className="text-xl italic text-indigo-700 bg-white/50 p-4 rounded-lg">
                "Je passais près de 15 heures par mois à gérer la facturation", explique Thierry. "Entre la saisie manuelle des données, les vérifications, les corrections d'erreurs et les relances, c'était un vrai cauchemar qui me détournait de mon cœur de métier."
              </p>

              <p>
                Les problèmes étaient multiples :
              </p>

              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                  <span>Saisie manuelle des données dans un tableur, source d'erreurs fréquentes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                  <span>Difficultés à suivre les échéances de paiement</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                  <span>Retards dans l'émission des factures</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                  <span>Processus de relance client non structuré</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                  <span>Aucune visibilité en temps réel sur les paiements</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">La solution : une approche d'automatisation intelligente</h2>

            <p className="text-lg text-gray-700 mb-8">
              Après un audit gratuit de son processus de facturation, l'équipe d'AImagination a proposé à Thierry une solution d'automatisation sur mesure, intégrant plusieurs technologies d'IA :
            </p>

            <div className="bg-indigo-50 p-6 rounded-lg my-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">La solution en détail</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Bot className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong className="text-gray-900">Extraction automatique de données</strong>
                    <p className="text-gray-700">Un système d'IA analyse les timesheet des collaborateurs, les contrats clients et les prestations effectuées pour préparer automatiquement les factures.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong className="text-gray-900">Génération standardisée</strong>
                    <p className="text-gray-700">Les factures sont générées automatiquement selon un modèle personnalisé, incluant toutes les informations légales et détails des prestations.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong className="text-gray-900">Suivi intelligent</strong>
                    <p className="text-gray-700">Le système détecte automatiquement les paiements et envoie des relances personnalisées à différentes échéances.</p>
                  </div>
                </li>
              </ul>
            </div>

            <p className="text-lg text-gray-700">
              L'implémentation s'est déroulée en seulement 3 semaines, avec une formation de l'équipe incluse. Contrairement aux craintes de Thierry, le système s'est parfaitement intégré à ses outils existants, sans nécessiter de changement radical.
            </p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Des résultats concrets et mesurables</h2>
            <p className="text-xl text-gray-600">
              Après trois mois d'utilisation, les bénéfices de la solution sont devenus évidents :
            </p>
          </div>

          {/* Results Section */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-8 md:p-12 mb-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-bold mb-2">-90%</div>
                <h3 className="text-xl font-semibold mb-2">Temps consacré</h3>
                <p className="text-indigo-200">De 15h à seulement 1h30 par mois</p>
              </div>
              <div className="text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-bold mb-2">+28%</div>
                <h3 className="text-xl font-semibold mb-2">Trésorerie</h3>
                <p className="text-indigo-200">Amélioration grâce aux paiements plus rapides</p>
              </div>
              <div className="text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-bold mb-2">0</div>
                <h3 className="text-xl font-semibold mb-2">Erreur de facturation</h3>
                <p className="text-indigo-200">Élimination des erreurs humaines</p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-indigo-50 rounded-xl p-8 mb-12">
            <blockquote className="text-xl text-gray-700 italic mb-6">
              "Cette solution a complètement transformé notre approche de la facturation. Non seulement elle m'a libéré un temps précieux que je peux désormais consacrer au développement de l'entreprise, mais elle a également amélioré notre relation client. Les factures sont émises rapidement, elles sont claires, détaillées et les relais automatiques sont faits avec tact. C'est un investissement qui a été rentabilisé en moins de deux mois."
            </blockquote>
            <div className="flex items-center gap-4">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&auto=format&fit=crop&q=80" 
                alt="Thierry Martin" 
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">Thierry Martin</p>
                <p className="text-gray-600">Directeur, TechnoServices</p>
              </div>
            </div>
          </div>

          {/* Impact Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">L'impact au-delà du temps gagné</h2>

            <p className="text-lg text-gray-700 mb-8">
              Au-delà du simple gain de temps, la transformation du processus de facturation a eu des effets en cascade sur l'ensemble de l'entreprise :
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                  Meilleure expérience client
                </h3>
                <p className="text-gray-700">Les factures sont émises immédiatement après la prestation, avec un niveau de détail apprécié par les clients.</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Suivi financier amélioré
                </h3>
                <p className="text-gray-700">La direction dispose maintenant d'un tableau de bord en temps réel sur l'état des paiements et la trésorerie prévisionnelle.</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-purple-600" />
                  Stress réduit
                </h3>
                <p className="text-gray-700">La fin de mois n'est plus une période redoutée par l'équipe administrative.</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Target className="w-6 h-6 text-indigo-600" />
                  Focus stratégique
                </h3>
                <p className="text-gray-700">Thierry peut désormais consacrer plus de temps à la stratégie et au développement commercial.</p>
              </div>
            </div>
          </div>

          {/* Success Keys */}
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-8 md:p-12 mb-12 border border-indigo-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Les clés du succès</h2>

            <p className="text-lg text-gray-700 mb-8 text-center">
              Cette transformation réussie repose sur plusieurs facteurs clés :
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-white p-4 rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Approche sur mesure</h3>
                  <p className="text-gray-700">La solution a été conçue spécifiquement pour répondre aux besoins de TechnoServices, sans fonctionnalités superflues.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-4 rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Intégration progressive</h3>
                  <p className="text-gray-700">L'implémentation s'est faite par étapes, permettant à l'équipe de s'adapter graduellement.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-4 rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Formation adéquate</h3>
                  <p className="text-gray-700">Toute l'équipe a été formée à l'utilisation du nouveau système.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-4 rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">4</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Support continu</h3>
                  <p className="text-gray-700">Un accompagnement régulier a permis d'optimiser continuellement la solution.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Getting Started */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Comment démarrer votre propre transformation</h2>
            <p className="text-xl text-gray-600">
              Si, comme Thierry, vous passez trop de temps sur des tâches administratives qui pourraient être automatisées, voici comment vous pouvez procéder :
            </p>
          </div>

          {/* Steps to Start */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-full flex items-center justify-center text-xl font-bold text-white mb-4">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Audit gratuit</h3>
              <p className="text-gray-600">Identifiez les opportunités d'optimisation dans vos processus actuels.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-full flex items-center justify-center text-xl font-bold text-white mb-4">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Solution personnalisée</h3>
              <p className="text-gray-600">Recevez une proposition adaptée à vos besoins spécifiques.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-full flex items-center justify-center text-xl font-bold text-white mb-4">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Implémentation rapide</h3>
              <p className="text-gray-600">Mise en place en quelques semaines avec formation incluse.</p>
            </div>
          </div>

          <BlogCTA variant="audit" />

          {/* Related Articles */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Articles similaires
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=80" 
                  alt="Automatisation des processus administratifs" 
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    5 processus administratifs à automatiser en priorité
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Découvrez les tâches administratives qui vous font perdre le plus de temps et comment les optimiser.
                  </p>
                  <button 
                    onClick={() => navigate('/blog/processus-administratifs-automatisation')}
                    className="text-indigo-600 font-medium flex items-center gap-1"
                  >
                    Lire l'article
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&auto=format&fit=crop&q=80" 
                  alt="ROI de l'automatisation" 
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Comment calculer le ROI de votre transformation numérique
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Un guide pratique pour mesurer les bénéfices concrets de vos investissements en automatisation.
                  </p>
                  <button 
                    onClick={() => navigate('/blog/roi-transformation-numerique')}
                    className="text-indigo-600 font-medium flex items-center gap-1"
                  >
                    Lire l'article
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Author Bio */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&auto=format&fit=crop&q=80" 
                alt="Sophie Dubois" 
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-gray-900 mb-1">Sophie Dubois</p>
                <p className="text-gray-600 text-sm mb-2">Experte en transformation numérique chez AImagination</p>
                <p className="text-gray-600 text-sm">
                  Sophie accompagne les PME dans leur transition numérique depuis plus de 10 ans, 
                  avec une expertise particulière dans l'optimisation des processus financiers.
                </p>
              </div>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center justify-between">
            <div className="text-gray-700 font-medium">
              Partagez cet article :
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-blue-600 text-white rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
              </button>
              <button className="p-2 bg-blue-400 text-white rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.053 10.053 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.92 4.92 0 001.522 6.574 4.883 4.883 0 01-2.23-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </button>
              <button className="p-2 bg-blue-700 text-white rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      <StartForm 
        isOpen={showStartForm} 
        onClose={() => setShowStartForm(false)} 
        productId="audit-ia"
      />
    </section>
  );
};

export default ThierryBlogPage;