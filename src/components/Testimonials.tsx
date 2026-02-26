import React, { useState } from 'react';
import { Star, Quote, TrendingDown, TrendingUp, Bot, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StartForm from './StartForm';

interface TestimonialData {
  id: string;
  name: string;
  role: string;
  city: string;
  text: string;
  badge: {
    icon: typeof TrendingDown;
    text: string;
    color: string;
  };
  image?: string;
}

const Testimonials: React.FC = () => {
  const { t } = useTranslation();
  const [showStartForm, setShowStartForm] = useState(false);

  const testimonials: TestimonialData[] = [
    {
      id: 'thierry-restaurant',
      name: t('testimonials.thierry.name'),
      role: t('testimonials.thierry.role'),
      city: t('testimonials.thierry.city'),
      text: t('testimonials.thierry.text'),
      badge: {
        icon: TrendingDown,
        text: t('testimonials.thierry.badge'),
        color: 'from-green-500 to-emerald-600'
      }
    },
    {
      id: 'sophie-marketing',
      name: t('testimonials.sophie.name'),
      role: t('testimonials.sophie.role'),
      city: t('testimonials.sophie.city'),
      text: t('testimonials.sophie.text'),
      badge: {
        icon: TrendingUp,
        text: t('testimonials.sophie.badge'),
        color: 'from-blue-500 to-indigo-600'
      }
    },
    {
      id: 'marc-ecommerce',
      name: t('testimonials.marc.name'),
      role: t('testimonials.marc.role'),
      city: t('testimonials.marc.city'),
      text: t('testimonials.marc.text'),
      badge: {
        icon: Bot,
        text: t('testimonials.marc.badge'),
        color: 'from-purple-500 to-violet-600'
      }
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="max-w-6xl mx-auto mb-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => {
            const BadgeIcon = testimonial.badge.icon;

            return (
              <div
                key={testimonial.id}
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 p-8 md:p-10 relative overflow-hidden"
              >
                {/* Quote decoration */}
                <div className="absolute top-6 right-6 opacity-5">
                  <Quote className="w-32 h-32 text-indigo-600" />
                </div>

                {/* Content */}
                <div className="relative z-10">

                  {/* Header */}
                  <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {testimonial.name.charAt(0)}
                      </div>

                      {/* Name & Role */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {testimonial.name}
                        </h3>
                        <p className="text-gray-600">
                          {testimonial.role} • {testimonial.city}
                        </p>
                      </div>
                    </div>

                    {/* Badge */}
                    <div className={`bg-gradient-to-r ${testimonial.badge.color} text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg`}>
                      <BadgeIcon className="w-5 h-5" />
                      <span className="font-semibold text-sm">
                        {testimonial.badge.text}
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <blockquote className="text-gray-700 text-lg leading-relaxed italic">
                    "{testimonial.text}"
                  </blockquote>

                  {/* Trust indicators */}
                  <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{t('testimonials.indicators.easySetup')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>{t('testimonials.indicators.timeSaving')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-8 md:p-10 text-center shadow-xl">
            <h3 className="text-3xl font-bold text-white mb-3">
              {t('testimonials.cta.title')}
            </h3>
            <p className="text-indigo-100 text-lg mb-6">
              {t('testimonials.cta.subtitle')}
            </p>

            <button
              onClick={() => setShowStartForm(true)}
              className="bg-white text-indigo-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center gap-3"
            >
              {t('testimonials.cta.button')}
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-indigo-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{t('testimonials.cta.badges.freeAnalysis')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{t('testimonials.cta.badges.customRecommendations')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{t('testimonials.cta.badges.noCommitment')}</span>
              </div>
            </div>

            {/* Alternative CTAs */}
            <div className="mt-8 pt-6 border-t border-indigo-500/30">
              <p className="text-indigo-200 text-sm mb-3">{t('testimonials.cta.alternative.title')}</p>
              <div className="flex flex-wrap justify-center gap-3">
                {/* Sympa */}
                <button
                  onClick={() => setShowStartForm(true)}
                  className="bg-indigo-500/30 hover:bg-indigo-500/50 text-white px-4 py-2 rounded-lg text-sm transition-all"
                >
                  {t('testimonials.cta.alternative.discuss')}
                </button>

                {/* Direct */}
                <button
                  onClick={() => setShowStartForm(true)}
                  className="bg-indigo-500/30 hover:bg-indigo-500/50 text-white px-4 py-2 rounded-lg text-sm transition-all"
                >
                  {t('testimonials.cta.alternative.direct')}
                </button>

                {/* Premium */}
                <button
                  onClick={() => setShowStartForm(true)}
                  className="bg-indigo-500/30 hover:bg-indigo-500/50 text-white px-4 py-2 rounded-lg text-sm transition-all"
                >
                  {t('testimonials.cta.alternative.premium')}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Start Form Modal */}
      <StartForm
        isOpen={showStartForm}
        onClose={() => setShowStartForm(false)}
        productId="audit-ia"
      />
    </section>
  );
};

export default Testimonials;
