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
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <SEOHead canonical="/a-propos" />
      <div className="container mx-auto px-4">
        <SectionHeader
          title={t('pageTitle')}
          subtitle={t('pageSubtitle')}
          centered
        />

        {/* Mission */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('mission.title')}</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {t('mission.p1')}
          </p>
          <p className="text-lg text-gray-600 leading-relaxed mt-4">
            {t('mission.p2')}
          </p>
        </div>

        {/* Approche */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('approach.title')}</h2>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {approachPillars.map((pillar, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-5">
                <pillar.icon className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{pillar.title}</h3>
              <p className="text-gray-600 leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>

        {/* Valeurs */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('values.title')}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {values.map((value, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <value.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {value.title}
              </h3>
              <p className="text-gray-600">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        {/* Histoire */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('history.title')}</h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-indigo-100"></div>

          <div className="space-y-12 relative">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex justify-center">
                <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'order-last text-left pl-8'}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>

                <div className="w-2/12 flex justify-center">
                  <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-10">
                    {milestone.year}
                  </div>
                </div>

                <div className={`w-5/12 ${index % 2 === 0 ? 'order-last text-left pl-8' : 'text-right pr-8'}`}></div>
              </div>
            ))}
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
