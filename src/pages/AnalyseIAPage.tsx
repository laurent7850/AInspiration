import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Brain,
  LineChart,
  PieChart,
  BarChart2,
  TrendingUp,
  Zap,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Database,
  Eye
} from 'lucide-react';
import AuditForm from '../components/AuditForm';
import RelatedServices from '../components/ui/RelatedServices';
import SEOHead from '../components/SEOHead';
import { getServiceSchema, getFAQSchema } from '../config/seoConfig';

const AnalyseIAPage: React.FC = () => {
  const { t } = useTranslation('analysis');
  const [showStartForm, setShowStartForm] = useState(false);

  const featureIcons = [LineChart, PieChart, BarChart2, Eye];

  const mainFeatures = (t('mainFeatures', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    benefits: string[];
  }>).map((feature, index) => ({
    ...feature,
    icon: featureIcons[index],
  }));

  const metrics = t('metrics', { returnObjects: true }) as Array<{
    value: string;
    label: string;
    description: string;
  }>;

  const useCaseItems = (t('useCases.items', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    examples: string[];
    testimonialQuote: string;
    testimonialAuthor: string;
    testimonialRole: string;
  }>);

  const processSteps = (t('process.steps', { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>).map((step, index) => ({ ...step, step: index + 1 }));

  const analyseFAQs = [
    { question: "Comment l'IA analyse-t-elle mes données ?", answer: "Nos algorithmes d'IA analysent vos données de ventes, clients et opérations pour identifier des tendances, prédire les comportements et recommander des actions concrètes." },
    { question: "Mes données sont-elles en sécurité ?", answer: "Absolument. Toutes les données sont hébergées en Europe, chiffrées et conformes RGPD. Nous ne partageons jamais vos données avec des tiers." },
    { question: "Quels types de données peut-on analyser ?", answer: "Données de ventes, comportement clients, performance marketing, stocks, flux financiers, activité web — tout type de données structurées ou semi-structurées." }
  ];

  const analyseSchema = [
    getServiceSchema("Analyse de Données IA pour PME", "Tableaux de bord intelligents, prédictions de ventes et segmentation clients avancée grâce à l'intelligence artificielle. Données hébergées en Europe, conformes RGPD."),
    getFAQSchema(analyseFAQs)
  ];

  return (
    <section className="pt-20 bg-gradient-to-b from-gray-50 to-white">
      <SEOHead
        title={t('seo.title')}
        description={t('seo.description')}
        schema={analyseSchema}
      />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex gap-2 items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
              <Brain className="w-4 h-4" />
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
                {t('hero.ctaDemo')}
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowStartForm(true)}
                className="bg-white border border-indigo-200 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                {t('hero.ctaDocs')}
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl"></div>
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80"
              alt={t('hero.imageAlt')}
              loading="lazy"
              className="relative rounded-xl shadow-xl w-full"
            />
          </div>
        </div>
      </div>

      {/* Main Features Section */}
      <div className="container mx-auto px-4 py-16 border-b border-gray-100">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('features.sectionTitle')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('features.sectionDescription')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {mainFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-5">
                <feature.icon className="w-7 h-7 text-indigo-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-600 mb-5">
                {feature.description}
              </p>

              <ul className="space-y-2">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics Section */}
      <div className="bg-indigo-600 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-12">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-4xl font-bold mb-2">{metric.value}</div>
                <div className="text-xl font-semibold mb-1">{metric.label}</div>
                <div className="text-indigo-100">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="container mx-auto px-4 py-16 border-b border-gray-100">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('useCases.sectionTitle')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('useCases.sectionDescription')}
          </p>
        </div>

        <div className="space-y-16">
          {useCaseItems.map((useCase, index) => (
            <div key={index} className="grid md:grid-cols-2 gap-8 items-center">
              <div className={`order-2 ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-indigo-600" />
                  {useCase.title}
                </h3>

                <p className="text-gray-600 mb-6 text-lg">
                  {useCase.description}
                </p>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-600" />
                    {t('useCases.concreteApplications')}
                  </h4>

                  <ul className="space-y-2">
                    {useCase.examples.map((example, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <blockquote className="bg-indigo-50 p-5 rounded-lg border-l-4 border-indigo-600">
                  <p className="text-gray-700 italic mb-4">"{useCase.testimonialQuote}"</p>
                  <footer className="font-medium">
                    <span className="text-indigo-600">{useCase.testimonialAuthor}</span>, {useCase.testimonialRole}
                  </footer>
                </blockquote>
              </div>

              <div className={`order-1 ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl"></div>
                  <img
                    src={`https://images.unsplash.com/photo-${index === 0 ? '1551288049-bebda4e38f71' : '1460925895917-afdab827c52f'}?w=800&auto=format&fit=crop&q=80`}
                    alt={`${useCase.title} - ${t('useCases.imageAlt')}`}
                    loading="lazy"
                    className="relative rounded-xl shadow-xl w-full"
                  />
                </div>
              </div>
            </div>
          ))}
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
          {processSteps.map((step) => (
            <div key={step.step} className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                {step.step}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {step.title}
              </h3>

              <p className="text-gray-600">
                {step.description}
              </p>
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
                  <Zap className="w-6 h-6 text-yellow-300" />
                  <span className="text-indigo-100">{t('cta.bullet1')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-yellow-300" />
                  <span className="text-indigo-100">{t('cta.bullet2')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Database className="w-6 h-6 text-yellow-300" />
                  <span className="text-indigo-100">{t('cta.bullet3')}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {t('cta.demoTitle')}
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
          { path: '/audit', title: 'Audit IA Gratuit', description: 'Analyse complète de votre activité en 24h' },
          { path: '/automatisation', title: 'Automatisation IA', description: 'Réduisez 60% de vos tâches répétitives' },
          { path: '/formation', title: 'Formation IA', description: 'Formez vos équipes aux outils IA' },
          { path: '/solutions', title: 'Nos Solutions', description: 'Découvrez toutes nos solutions IA' },
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

export default AnalyseIAPage;
