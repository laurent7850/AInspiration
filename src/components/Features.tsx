import React, { memo } from 'react';
import { Brain, BarChart3, Users, Pencil, MessageSquare, LineChart, BookOpen, Award, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Reveal from './ui/Reveal';

const Features = () => {
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
        <Reveal className="max-w-2xl mb-16">
          <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-6xl text-ink mb-4">
            {t('features:title')}
          </h2>
          <p className="text-lg text-secondary leading-relaxed max-w-[55ch]">
            {t('features:subtitle')}
          </p>
        </Reveal>

        {/* Bento grid — asymmetric layout with three material steps:
            aurora lead, a night card and a teal card breaking the white run */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const tone: 'aurora' | 'night' | 'teal' | 'white' =
              index === 0 ? 'aurora' : index === 3 ? 'teal' : index === 5 ? 'night' : 'white';
            const isDark = tone === 'aurora' || tone === 'night';
            const cardClass = {
              aurora: 'bg-aurora text-white shadow-[0_30px_60px_-20px_rgba(6,6,25,0.5)]',
              night: 'bg-night text-white shadow-[0_30px_60px_-20px_rgba(6,6,25,0.4)]',
              teal: 'bg-teal-50 shadow-lift hover:shadow-diffuse',
              white: 'bg-white shadow-lift hover:shadow-diffuse',
            }[tone];
            const iconClass = {
              aurora: 'text-aurora-teal',
              night: 'text-aurora-teal',
              teal: 'text-teal-700',
              white: 'text-indigo-600',
            }[tone];
            return (
              <Reveal key={feature.path} delay={(index % 3) * 90} className={tone === 'aurora' ? 'lg:col-span-2' : ''}>
                <Link
                  to={feature.path}
                  className={`
                    group relative block h-full rounded-card p-8 lg:p-10
                    transition-all duration-300 hover:-translate-y-1
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
                    ${cardClass}
                  `}
                >
                  <ArrowUpRight
                    aria-hidden="true"
                    className={`absolute top-8 right-8 w-5 h-5 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:opacity-100 transition-all duration-300 ${isDark ? 'text-white/70' : 'text-muted'}`}
                  />
                  <feature.icon strokeWidth={1.5} className={`h-8 w-8 mb-5 ${iconClass}`} />
                  <h3 className={`text-lg font-semibold mb-2 tracking-tight ${isDark ? 'text-white' : 'text-ink'}`}>
                    {t(feature.titleKey)}
                  </h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-indigo-100/85' : tone === 'teal' ? 'text-teal-900/85' : 'text-secondary'}`}>
                    {t(feature.descKey)}
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default memo(Features);
