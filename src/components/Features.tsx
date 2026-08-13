import React, { memo } from 'react';
import { Brain, BarChart3, Users, Pencil, MessageSquare, LineChart, BookOpen, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Features = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    {
      icon: Brain,
      titleKey: 'features:analysis.title',
      descKey: 'features:analysis.desc',
      path: '/analyse-ia'
    },
    {
      icon: BarChart3,
      titleKey: 'features:recommendations.title',
      descKey: 'features:recommendations.desc',
      path: '/recommandations'
    },
    {
      icon: LineChart,
      titleKey: 'features:dashboard.title',
      descKey: 'features:dashboard.desc',
      path: '/crm'
    },
    {
      icon: BookOpen,
      titleKey: 'features:prompts.title',
      descKey: 'features:prompts.desc',
      path: '/prompts'
    },
    {
      icon: Users,
      titleKey: 'collaboration:title',
      descKey: 'collaboration:subtitle',
      path: '/assistants'
    },
    {
      icon: Award,
      titleKey: 'training:title',
      descKey: 'training:subtitle',
      path: '/formation'
    },
    {
      icon: Pencil,
      titleKey: 'content:title',
      descKey: 'content:subtitle',
      path: '/creativite'
    },
    {
      icon: MessageSquare,
      titleKey: 'support:title',
      descKey: 'support:subtitle',
      path: '/accompagnement'
    }
  ];

  return (
    <section id="features" className="py-16 lg:py-24 bg-canvas">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header — left-aligned, not centered */}
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight mb-4">
            {t('features:title')}
          </h2>
          <p className="text-lg text-secondary leading-relaxed max-w-[55ch]">
            {t('features:subtitle')}
          </p>
        </div>

        {/* Bento grid — asymmetric layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            // First 2 items span wider on large screens
            const isLarge = index < 2;

            return (
              <div
                key={index}
                onClick={() => feature.path && navigate(feature.path)}
                className={`
                  group cursor-pointer bg-white rounded-card p-8 lg:p-10
                  shadow-lift hover:shadow-diffuse
                  transition-all duration-300 hover:-translate-y-1
                  ${isLarge ? 'lg:col-span-1 lg:first:col-span-2' : ''}
                `}
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5 group-hover:bg-indigo-100 transition-colors">
                  <feature.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-ink mb-2 tracking-tight">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-secondary text-sm leading-relaxed">
                  {t(feature.descKey)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default memo(Features);
