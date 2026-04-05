import React, { useState } from 'react';
import {
  Brain,
  MessageSquare,
  Zap,
  ArrowRight,
  Users,
  Star,
  Target,
  Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuditForm from './AuditForm';

export default function PromptOptimization() {
  const [showStartForm, setShowStartForm] = useState(false);
  const { t } = useTranslation('prompts');

  const promptComparison = [
    {
      critere: t('optimization.comparison.rows.accuracy.criterion'),
      basique: t('optimization.comparison.rows.accuracy.basic'),
      optimise: t('optimization.comparison.rows.accuracy.optimised'),
      amelioration: t('optimization.comparison.rows.accuracy.improvement')
    },
    {
      critere: t('optimization.comparison.rows.responseTime.criterion'),
      basique: t('optimization.comparison.rows.responseTime.basic'),
      optimise: t('optimization.comparison.rows.responseTime.optimised'),
      amelioration: t('optimization.comparison.rows.responseTime.improvement')
    },
    {
      critere: t('optimization.comparison.rows.relevance.criterion'),
      basique: t('optimization.comparison.rows.relevance.basic'),
      optimise: t('optimization.comparison.rows.relevance.optimised'),
      amelioration: t('optimization.comparison.rows.relevance.improvement')
    },
    {
      critere: t('optimization.comparison.rows.userSatisfaction.criterion'),
      basique: t('optimization.comparison.rows.userSatisfaction.basic'),
      optimise: t('optimization.comparison.rows.userSatisfaction.optimised'),
      amelioration: t('optimization.comparison.rows.userSatisfaction.improvement')
    },
    {
      critere: t('optimization.comparison.rows.reuse.criterion'),
      basique: t('optimization.comparison.rows.reuse.basic'),
      optimise: t('optimization.comparison.rows.reuse.optimised'),
      amelioration: t('optimization.comparison.rows.reuse.improvement')
    }
  ];

  const features = [
    {
      icon: Brain,
      title: t('optimization.featureCards.contextualAI.title'),
      description: t('optimization.featureCards.contextualAI.description')
    },
    {
      icon: Target,
      title: t('optimization.featureCards.continuousOpt.title'),
      description: t('optimization.featureCards.continuousOpt.description')
    },
    {
      icon: MessageSquare,
      title: t('optimization.featureCards.library.title'),
      description: t('optimization.featureCards.library.description')
    },
    {
      icon: Star,
      title: t('optimization.featureCards.quality.title'),
      description: t('optimization.featureCards.quality.description')
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('optimization.hero.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('optimization.hero.subtitle')}
          </p>
        </div>

        {/* Argumentaire principal */}
        <div className="bg-indigo-50 rounded-2xl p-8 mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('optimization.whyTitle')}
            </h2>
            <div className="space-y-4 text-gray-700 mb-8">
              <p>
                {t('optimization.whyText1')}
              </p>
              <p>
                {t('optimization.whyText2')}
              </p>
            </div>

            {/* Témoignages intégrés */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop"
                    alt={t('optimization.testimonials.sophie.name')}
                    loading="lazy"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{t('optimization.testimonials.sophie.name')}</p>
                    <p className="text-sm text-gray-600">{t('optimization.testimonials.sophie.role')}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "{t('optimization.testimonials.sophie.quote')}"
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
                    alt={t('optimization.testimonials.marc.name')}
                    loading="lazy"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{t('optimization.testimonials.marc.name')}</p>
                    <p className="text-sm text-gray-600">{t('optimization.testimonials.marc.role')}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "{t('optimization.testimonials.marc.quote')}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau comparatif */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-16">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            {t('optimization.comparison.title')}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('optimization.comparison.criterion')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('optimization.comparison.basic')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('optimization.comparison.optimised')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('optimization.comparison.improvement')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {promptComparison.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{row.critere}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.basique}</td>
                    <td className="px-6 py-4 text-sm text-indigo-600 font-medium">{row.optimise}</td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">{row.amelioration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fonctionnalités */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-indigo-600 rounded-2xl p-8 lg:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                {t('optimization.cta.title')}
              </h2>
              <p className="text-indigo-100 mb-6">
                {t('optimization.cta.subtitle')}
              </p>
              <button
                onClick={() => setShowStartForm(true)}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2"
              >
                {t('optimization.cta.button')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Clock className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">-60%</div>
                <div className="text-indigo-100">{t('optimization.cta.timeSavedLabel')}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Users className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">10k+</div>
                <div className="text-indigo-100">{t('optimization.cta.usersLabel')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">{t('optimization.faq.title')}</h2>
        <div className="space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <details key={i} className="bg-white border border-gray-200 rounded-lg p-4 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                {t(`optimization.faq.items.${i}.q`)}
                <span className="text-indigo-600 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="mt-3 text-gray-600 leading-relaxed">{t(`optimization.faq.items.${i}.a`)}</p>
            </details>
          ))}
        </div>
      </div>

      <AuditForm
        isOpen={showStartForm}
        onClose={() => setShowStartForm(false)}
      />
    </section>
  );
}
