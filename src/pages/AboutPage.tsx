import React from 'react';
import SectionHeader from '../components/ui/SectionHeader';
import SEOHead from '../components/SEOHead';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Award,
  Shield,
  Globe,
  Lightbulb,
  Target,
  HeartHandshake
} from 'lucide-react';
import RelatedServices from '../components/ui/RelatedServices';

const AboutPage: React.FC = () => {
  const { t } = useTranslation('about');

  const approachPillars = [
    {
      icon: Lightbulb,
      title: t('approach.pillar1_title'),
      description: t('approach.pillar1_desc')
    },
    {
      icon: Target,
      title: t('approach.pillar2_title'),
      description: t('approach.pillar2_desc')
    },
    {
      icon: HeartHandshake,
      title: t('approach.pillar3_title'),
      description: t('approach.pillar3_desc')
    }
  ];

  const values = [
    {
      icon: Globe,
      title: t('values.val1_title'),
      description: t('values.val1_desc')
    },
    {
      icon: Shield,
      title: t('values.val2_title'),
      description: t('values.val2_desc')
    },
    {
      icon: Users,
      title: t('values.val3_title'),
      description: t('values.val3_desc')
    },
    {
      icon: Award,
      title: t('values.val4_title'),
      description: t('values.val4_desc')
    }
  ];

  const milestones = [
    { year: "2019", title: t('history.m2019_title'), description: t('history.m2019_desc') },
    { year: "2020", title: t('history.m2020_title'), description: t('history.m2020_desc') },
    { year: "2021", title: t('history.m2021_title'), description: t('history.m2021_desc') },
    { year: "2022", title: t('history.m2022_title'), description: t('history.m2022_desc') },
    { year: "2023", title: t('history.m2023_title'), description: t('history.m2023_desc') },
    { year: "2024", title: t('history.m2024_title'), description: t('history.m2024_desc') },
    { year: "2025", title: t('history.m2025_title'), description: t('history.m2025_desc') },
    { year: "2026", title: t('history.m2026_title'), description: t('history.m2026_desc') }
  ];

  return (
    <section className="py-24 lg:py-32 bg-canvas">
      <SEOHead canonical="/a-propos" />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-2xl mb-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tighter leading-[1.05] mb-4">
            {t('pageTitle')}
          </h1>
          <p className="text-xl text-secondary leading-relaxed">
            {t('pageSubtitle')}
          </p>
        </div>

        {/* Mission */}
        <div className="max-w-3xl mb-24">
          <h2 className="text-2xl font-bold text-ink tracking-tight mb-4">{t('mission.title')}</h2>
          <p className="text-lg text-secondary leading-relaxed">
            {t('mission.p1')}
          </p>
          <p className="text-lg text-secondary leading-relaxed mt-4">
            {t('mission.p2')}
          </p>
        </div>

        {/* Approche */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-ink tracking-tight mb-10">{t('approach.title')}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {approachPillars.map((pillar, index) => (
              <div key={index} className="bg-white rounded-card p-8 lg:p-10 shadow-lift hover:shadow-diffuse transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-5">
                  <pillar.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-ink tracking-tight mb-3">{pillar.title}</h3>
                <p className="text-secondary leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Valeurs */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-ink tracking-tight mb-10">{t('values.title')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-card p-8 shadow-lift hover:shadow-diffuse transition-all duration-300">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-ink tracking-tight mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-secondary leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Histoire — timeline alternee */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-ink tracking-tight mb-10">{t('history.title')}</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-zinc-200 hidden md:block"></div>
            <div className="space-y-8 relative">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex flex-col md:flex-row justify-center">
                  <div className={`md:w-5/12 ${index % 2 === 0 ? 'md:text-right md:pr-10' : 'md:order-last md:text-left md:pl-10'}`}>
                    <h3 className="text-lg font-semibold text-ink tracking-tight mb-1">{milestone.title}</h3>
                    <p className="text-sm text-secondary leading-relaxed">{milestone.description}</p>
                  </div>

                  <div className="md:w-2/12 flex justify-center my-2 md:my-0">
                    <div className="bg-indigo-600 text-white rounded-full w-11 h-11 flex items-center justify-center text-xs font-mono font-medium z-10">
                      {milestone.year}
                    </div>
                  </div>

                  <div className={`md:w-5/12 ${index % 2 === 0 ? 'md:order-last md:text-left md:pl-10' : 'md:text-right md:pr-10'}`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Services */}
        <div className="mt-16 mb-8">
          <RelatedServices links={[
            { path: '/etudes-de-cas', title: 'Études de cas', description: 'Résultats concrets de nos clients' },
            { path: '/contact', title: 'Contact', description: 'Parlons de votre projet IA' },
            { path: '/blog', title: 'Blog', description: 'Articles et guides sur l\'IA pour PME' },
            { path: '/audit', title: 'Audit IA Gratuit', description: 'Analyse complète de votre activité en 24h' },
          ]} />
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
