import React, { useState } from 'react';
import { TrendingDown, TrendingUp, Bot, ArrowRight, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuditForm from './AuditForm';

interface ScenarioData {
  id: string;
  sector: string;
  scenario: string;
  text: string;
  badge: {
    icon: typeof TrendingDown;
    text: string;
    bgColor: string;
    textColor: string;
  };
}

const Testimonials: React.FC = () => {
  const { t } = useTranslation();
  const [showStartForm, setShowStartForm] = useState(false);

  const scenarios: ScenarioData[] = [
    {
      id: 'restaurant',
      sector: t('testimonials.restaurant.sector'),
      scenario: t('testimonials.restaurant.scenario'),
      text: t('testimonials.restaurant.text'),
      badge: {
        icon: TrendingDown,
        text: t('testimonials.restaurant.badge'),
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
      }
    },
    {
      id: 'marketing',
      sector: t('testimonials.marketing.sector'),
      scenario: t('testimonials.marketing.scenario'),
      text: t('testimonials.marketing.text'),
      badge: {
        icon: TrendingUp,
        text: t('testimonials.marketing.badge'),
        bgColor: 'bg-sky-50',
        textColor: 'text-sky-700',
      }
    },
    {
      id: 'ecommerce',
      sector: t('testimonials.ecommerce.sector'),
      scenario: t('testimonials.ecommerce.scenario'),
      text: t('testimonials.ecommerce.text'),
      badge: {
        icon: Bot,
        text: t('testimonials.ecommerce.badge'),
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-700',
      }
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header — left-aligned */}
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-lg text-secondary leading-relaxed">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Masonry-style grid — featured card larger */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 mb-16">
          {scenarios.map((item, index) => {
            const BadgeIcon = item.badge.icon;
            const isFeatured = index === 0;

            return (
              <div
                key={item.id}
                className={`
                  bg-canvas rounded-[2rem] p-8 lg:p-10
                  transition-all duration-300 hover:shadow-diffuse
                  ${isFeatured ? 'lg:col-span-5 lg:row-span-1' : 'lg:col-span-7'}
                  ${index === 2 ? 'lg:col-span-12' : ''}
                `}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-ink tracking-tight">
                        {item.sector}
                      </h3>
                      <p className="text-sm text-secondary">
                        {item.scenario}
                      </p>
                    </div>
                  </div>

                  {/* Badge — pastel, no gradient */}
                  <div className={`${item.badge.bgColor} ${item.badge.textColor} px-3 py-1.5 rounded-lg flex items-center gap-1.5`}>
                    <BadgeIcon className="w-4 h-4" />
                    <span className="font-medium text-xs">
                      {item.badge.text}
                    </span>
                  </div>
                </div>

                <p className="text-ink leading-relaxed">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA — dark, clean */}
        <div className="bg-indigo-600 rounded-[2rem] p-10 lg:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mb-2">
              {t('testimonials.cta.title')}
            </h3>
            <p className="text-indigo-100 text-lg max-w-[50ch]">
              {t('testimonials.cta.subtitle')}
            </p>
          </div>

          <button
            onClick={() => setShowStartForm(true)}
            className="group inline-flex items-center gap-3 bg-white text-indigo-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex-shrink-0"
          >
            {t('testimonials.cta.button')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      <AuditForm
        isOpen={showStartForm}
        onClose={() => setShowStartForm(false)}
      />
    </section>
  );
};

export default Testimonials;
