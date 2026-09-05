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
import ServiceHero from '../components/ui/ServiceHero';

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
    title: string;
    industry: string;
    challenge: string;
    solution: string;
    results: string[];
  }>;

  const transformationFAQs = [
    { question: "Qu'est-ce que la transformation digitale par l'IA ?", answer: "La transformation digitale par l'IA consiste à intégrer l'intelligence artificielle dans vos processus métier pour automatiser les tâches répétitives, améliorer la prise de décision et augmenter votre productivité." },
    { question: "Combien de temps prend une transformation IA ?", answer: "Les premiers résultats sont visibles en 5 jours. La transformation complète se fait de manière progressive, avec un accompagnement personnalisé à chaque étape." },
    { question: "Quel est le ROI d'une transformation IA pour PME ?", answer: "Cela dépend de vos processus. Les automatisations que nous déployons visent jusqu'à 60% de temps en moins sur les tâches répétitives ; l'audit gratuit chiffre le potentiel concret de votre cas avant tout engagement." }
  ];

  const transformationSchema = [
    getServiceSchema("Transformation Digitale IA pour PME", "Accompagnement complet pour intégrer l'IA dans votre entreprise : diagnostic, stratégie, déploiement et formation. Premiers résultats en 5 jours."),
    getFAQSchema(transformationFAQs)
  ];

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white">
      <SEOHead
        title={t('seo.title')}
        description={t('seo.description')}
        schema={transformationSchema}
      />

      {/* Hero — Aurora declension */}
      <ServiceHero
        title={t('hero.title')}
        highlight={t('hero.titleHighlight')}
        description={t('hero.description')}
        primary={{ label: t('hero.ctaStart'), onClick: () => setShowStartForm(true) }}
        secondary={{ label: t('hero.ctaDiagnostic'), onClick: () => setShowStartForm(true) }}
        image="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80"
        imageAlt={t('hero.imageAlt')}
      />

      {/* Process Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display font-light text-3xl sm:text-5xl text-ink mb-4">
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
            <h2 className="font-display font-light text-3xl sm:text-5xl text-ink mb-4">
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
          <h2 className="font-display font-light text-3xl sm:text-5xl text-ink mb-4">
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
          <h2 className="font-display font-light text-3xl sm:text-5xl text-ink mb-4">
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
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="inline-flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                      {t('successStories.scenarioLabel')}
                    </span>
                    <span className="text-gray-600 text-sm">{story.industry}</span>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {story.title}
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

                </div>

                <div className="bg-indigo-100 flex items-center justify-center p-8">
                  <img
                    src={`https://images.unsplash.com/photo-${index === 0 ? '1576091160550-2173dba999ef' : '1581291518857-4e27b48ff24e'}?w=600&auto=format&fit=crop&q=80`}
                    alt={`${story.title} - ${t('successStories.imageAlt')}`}
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
      <div className="bg-aurora-teal py-16">
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
          { path: '/realisations', title: 'Réalisations', description: 'Automatisations et applications en service' },
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
