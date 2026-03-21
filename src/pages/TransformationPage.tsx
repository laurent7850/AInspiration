import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import { getServiceSchema, getFAQSchema } from '../config/seoConfig';
import {
  Zap,
  RefreshCw,
  TrendingUp,
  Calendar,
  Users,
  ArrowRight,
  CheckCircle,
  BarChart2,
  Rocket,
  Settings,
  Target,
  Monitor
} from 'lucide-react';
import AuditForm from '../components/AuditForm';
import RelatedServices from '../components/ui/RelatedServices';

const TransformationPage: React.FC = () => {
  const { t } = useTranslation('transformation');
  const [showStartForm, setShowStartForm] = useState(false);

  const phaseIcons = [Target, Settings, RefreshCw, TrendingUp];
  const solutionIcons = [Monitor, BarChart2, Rocket];

  const transformationPhases = (t('process.phases', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    activities: string[];
  }>).map((phase, index) => ({ ...phase, icon: phaseIcons[index] }));

  const benefits = t('benefits.items', { returnObjects: true }) as Array<{
    title: string;
    value: string;
    description: string;
  }>;

  const solutions = (t('solutions.items', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    features: string[];
  }>).map((solution, index) => ({ ...solution, icon: solutionIcons[index] }));

  const successStories = t('successStories.items', { returnObjects: true }) as Array<{
    company: string;
    industry: string;
    challenge: string;
    solution: string;
    results: string[];
    quote: string;
    author: string;
  }>;

  const transformationFAQs = [
    { question: "Qu'est-ce que la transformation digitale par l'IA ?", answer: "La transformation digitale par l'IA consiste à intégrer l'intelligence artificielle dans vos processus métier pour automatiser les tâches répétitives, améliorer la prise de décision et augmenter votre productivité." },
    { question: "Combien de temps prend une transformation IA ?", answer: "Les premiers résultats sont visibles en 5 jours. La transformation complète se fait de manière progressive, avec un accompagnement personnalisé à chaque étape." },
    { question: "Quel est le ROI d'une transformation IA pour PME ?", answer: "Nos clients constatent en moyenne un ROI de 180%, une réduction de 60% du temps sur les tâches répétitives et une augmentation de 45% de la productivité." }
  ];

  const transformationSchema = [
    getServiceSchema("Transformation Digitale IA pour PME", "Accompagnement complet pour intégrer l'IA dans votre entreprise : diagnostic, stratégie, déploiement et formation. Premiers résultats en 5 jours."),
    getFAQSchema(transformationFAQs)
  ];

  return (
    <section className="pt-20 bg-gradient-to-b from-gray-50 to-white">
      <SEOHead
        title={t('seo.title')}
        description={t('seo.description')}
        schema={transformationSchema}
      />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex gap-2 items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
              <RefreshCw className="w-4 h-4" />
              <span>{t('hero.badge')}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              {t('hero.title')} <span className="text-indigo-600">{t('hero.titleHighlight')}</span>
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              {t('hero.description')}
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowStartForm(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg"
              >
                {t('hero.ctaStart')}
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowStartForm(true)}
                className="bg-white border border-indigo-200 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                {t('hero.ctaDiagnostic')}
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl"></div>
            <img
              src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80"
              alt={t('hero.imageAlt')}
              loading="lazy"
              className="relative rounded-xl shadow-xl w-full"
            />
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('process.sectionTitle')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('process.sectionDescription')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {transformationPhases.map((phase, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-5">
                <phase.icon className="w-7 h-7 text-indigo-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {phase.title}
              </h3>

              <p className="text-gray-600 mb-5">
                {phase.description}
              </p>

              <ul className="space-y-2">
                {phase.activities.map((activity, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('benefits.sectionTitle')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('benefits.sectionDescription')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl shadow p-8 text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-3">{benefit.value}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
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

      {/* Solutions Section */}
      <div className="container mx-auto px-4 py-16 border-b border-gray-100">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('solutions.sectionTitle')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('solutions.sectionDescription')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-5">
                <solution.icon className="w-7 h-7 text-indigo-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {solution.title}
              </h3>

              <p className="text-gray-600 mb-5">
                {solution.description}
              </p>

              <ul className="space-y-2">
                {solution.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Success Stories Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('successStories.sectionTitle')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('successStories.sectionDescription')}
          </p>
        </div>

        <div className="space-y-12">
          {successStories.map((story, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-8">
                  <div className="inline-flex gap-2 items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                    {story.industry}
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {story.company}
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{t('successStories.challenge')}</h4>
                      <p className="text-gray-600">{story.challenge}</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{t('successStories.solution')}</h4>
                      <p className="text-gray-600">{story.solution}</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{t('successStories.results')}</h4>
                      <ul className="space-y-1">
                        {story.results.map((result, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <blockquote className="italic text-gray-700 border-l-4 border-indigo-500 pl-4 py-1">
                    "{story.quote}"
                    <footer className="mt-2 text-gray-600 not-italic">
                      <strong>{story.author}</strong>
                    </footer>
                  </blockquote>
                </div>

                <div className="bg-indigo-100 flex items-center justify-center p-8">
                  <img
                    src={`https://images.unsplash.com/photo-${index === 0 ? '1576091160550-2173dba999ef' : '1581291518857-4e27b48ff24e'}?w=600&auto=format&fit=crop&q=80`}
                    alt={`${story.company} - ${t('successStories.imageAlt')}`}
                    loading="lazy"
                    className="rounded-lg shadow-lg max-h-80 object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-6">
                {t('cta.title')}
              </h2>
              <p className="text-xl text-indigo-100 mb-8">
                {t('cta.description')}
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-yellow-300" />
                  <span className="text-indigo-100">{t('cta.bullet1')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-yellow-300" />
                  <span className="text-indigo-100">{t('cta.bullet2')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-yellow-300" />
                  <span className="text-indigo-100">{t('cta.bullet3')}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {t('cta.formTitle')}
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{t('cta.check1')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{t('cta.check2')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{t('cta.check3')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{t('cta.check4')}</span>
                </div>
              </div>

              <button
                onClick={() => setShowStartForm(true)}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                {t('cta.button')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Services */}
      <div className="container mx-auto px-4 mt-16 mb-8">
        <RelatedServices links={[
          { path: '/analyse-ia', title: 'Analyse IA', description: 'Exploitez vos données avec l\'IA' },
          { path: '/conseil', title: 'Conseil IA', description: 'Stratégie et accompagnement personnalisé' },
          { path: '/formation', title: 'Formation IA', description: 'Formez vos équipes aux outils IA' },
          { path: '/etudes-de-cas', title: 'Études de cas', description: 'Résultats concrets de nos clients' },
        ]} />
      </div>

      {/* Contact Form Modal */}
      <AuditForm
        isOpen={showStartForm}
        onClose={() => setShowStartForm(false)}
      />
    </section>
  );
};

export default TransformationPage;
