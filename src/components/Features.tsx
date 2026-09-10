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
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-6xl text-ink mb-4">
            {t('features:title')}
          </h2>
          <p className="text-lg text-secondary leading-relaxed max-w-[55ch]">
            {t('features:subtitle')}
          </p>
        </Reveal>

        {/* Grille bento — une seule carte accent en tête, le reste en cartes
            cernées d'un filet. Un seul aplat d'accent par écran (DESIGN.md). */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const isLead = index === 0;
            const cardClass = isLead
              ? 'bg-accent text-white'
              : 'bg-canvas border border-line hover:border-ink/25';
            const iconClass = isLead ? 'text-white' : 'text-accent';
            return (
              <Reveal key={feature.path} delay={(index % 3) * 90} className={isLead ? 'lg:col-span-2' : ''}>
                <Link
                  to={feature.path}
                  className={`
                    group relative block h-full rounded-card p-8 lg:p-10
                    transition-colors duration-200
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
                    ${cardClass}
                  `}
                >
                  <ArrowUpRight
                    aria-hidden="true"
                    className={`absolute top-8 right-8 w-5 h-5 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:opacity-100 transition-all duration-300 ${isLead ? 'text-white/70' : 'text-secondary'}`}
                  />
                  <feature.icon strokeWidth={1.5} className={`h-8 w-8 mb-5 ${iconClass}`} />
                  <h3 className={`text-lg font-semibold mb-2 tracking-tight ${isLead ? 'text-white' : 'text-ink'}`}>
                    {t(feature.titleKey)}
                  </h3>
                  <p className={`text-sm leading-relaxed ${isLead ? 'text-white/85' : 'text-secondary'}`}>
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
