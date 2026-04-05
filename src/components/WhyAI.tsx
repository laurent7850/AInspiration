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
import { useTranslation } from 'react-i18next';
import AuditForm from './AuditForm';
import OptimizedImage from './ui/OptimizedImage';
import CallToAction from './ui/CallToAction';

export default function WhyAI() {
  const [showStartForm, setShowStartForm] = useState(false);
  const { t } = useTranslation('features');

  const benefits = [
    {
      title: t('whyai.benefits.productivity.title'),
      description: t('whyai.benefits.productivity.description'),
      icon: Clock,
      stat: "+45%"
    },
    {
      title: t('whyai.benefits.cost.title'),
      description: t('whyai.benefits.cost.description'),
      icon: DollarSign,
      stat: "-30%"
    },
    {
      title: t('whyai.benefits.satisfaction.title'),
      description: t('whyai.benefits.satisfaction.description'),
      icon: Users,
      stat: "+25%"
    },
    {
      title: t('whyai.benefits.revenue.title'),
      description: t('whyai.benefits.revenue.description'),
      icon: ChartBar,
      stat: "+20%"
    }
  ];

  const usesCases = [
    {
      title: t('whyai.usecases.admin.title'),
      description: t('whyai.usecases.admin.description'),
      icon: FileText,
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=75&w=800&auto=format&fit=crop",
      examples: [
        t('whyai.usecases.admin.examples.0'),
        t('whyai.usecases.admin.examples.1'),
        t('whyai.usecases.admin.examples.2')
      ],
      callToAction: t('whyai.usecases.admin.callToAction')
    },
    {
      title: t('whyai.usecases.marketing.title'),
      description: t('whyai.usecases.marketing.description'),
      icon: Sparkles,
      image: "https://images.unsplash.com/photo-1541560052-5e137f229371?q=75&w=800&auto=format&fit=crop",
      examples: [
        t('whyai.usecases.marketing.examples.0'),
        t('whyai.usecases.marketing.examples.1'),
        t('whyai.usecases.marketing.examples.2')
      ],
      callToAction: t('whyai.usecases.marketing.callToAction')
    },
    {
      title: t('whyai.usecases.service.title'),
      description: t('whyai.usecases.service.description'),
      icon: MessageSquare,
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=75&w=800&auto=format&fit=crop",
      examples: [
        t('whyai.usecases.service.examples.0'),
        t('whyai.usecases.service.examples.1'),
        t('whyai.usecases.service.examples.2')
      ],
      callToAction: t('whyai.usecases.service.callToAction')
    },
    {
      title: t('whyai.usecases.sales.title'),
      description: t('whyai.usecases.sales.description'),
      icon: BarChart3,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=75&w=800&auto=format&fit=crop",
      examples: [
        t('whyai.usecases.sales.examples.0'),
        t('whyai.usecases.sales.examples.1'),
        t('whyai.usecases.sales.examples.2')
      ],
      callToAction: t('whyai.usecases.sales.callToAction')
    }
  ];

  const nextSteps = [
    t('whyai.cta.nextSteps.0'),
    t('whyai.cta.nextSteps.1'),
    t('whyai.cta.nextSteps.2')
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              {t('whyai.hero.title')}
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-indigo-600 mb-6">
            {t('whyai.hero.subtitle')}
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            {t('whyai.hero.description')}
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
            {t('whyai.usecases.sectionTitle')}
          </h2>

          <div className="space-y-16">
            {usesCases.map((useCase, index) => (
              <div key={index} className={`grid md:grid-cols-2 gap-8 items-center ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 rounded-2xl blur-3xl"></div>
                  <OptimizedImage
                    src={useCase.image}
                    alt={useCase.title}
                    responsive="half"
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
                    {t('whyai.usecases.learnMore')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <CallToAction
          title={t('whyai.cta.title')}
          subtitle={t('whyai.cta.subtitle')}
          buttonText={t('whyai.cta.button')}
          buttonAction={() => setShowStartForm(true)}
          className="mb-20"
          leftContent={
            <>
              <h3 className="text-xl font-semibold mb-4">{t('whyai.cta.nextStepsTitle')}</h3>
              <ul className="space-y-4">
                {nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold">{index + 1}</span>
                    </div>
                    <span className="text-indigo-50">{step}</span>
                  </li>
                ))}
              </ul>
            </>
          }
          rightContent={
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6" />
                {t('whyai.cta.contactTitle')}
              </h3>
              <p className="mb-6">
                {t('whyai.cta.contactDesc')}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-indigo-100">{t('whyai.cta.satisfactionLabel')}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">7 jours</div>
                  <div className="text-indigo-100">{t('whyai.cta.installLabel')}</div>
                </div>
              </div>
            </div>
          }
        />

        {/* Final CTA */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {t('whyai.finalCta.title')}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {t('whyai.finalCta.subtitle')}
          </p>
          <button
            onClick={() => setShowStartForm(true)}
            className="bg-indigo-600 text-white px-10 py-4 rounded-xl shadow-lg font-semibold hover:bg-indigo-700 transition-colors text-lg"
          >
            {t('whyai.finalCta.button')}
          </button>
        </div>
      </div>

      <AuditForm
        isOpen={showStartForm}
        onClose={() => setShowStartForm(false)}
      />
    </section>
  );
}
