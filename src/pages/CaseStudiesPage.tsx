import React from 'react';
import SectionHeader from '../components/ui/SectionHeader';
import SEOHead from '../components/SEOHead';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OptimizedImage from '../components/ui/OptimizedImage';
import RelatedServices from '../components/ui/RelatedServices';

const CaseStudiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('caseStudies');

  const scenarios = [
    {
      title: t('study1.title'),
      industry: t('study1.industry'),
      challenge: t('study1.challenge'),
      solution: t('study1.solution'),
      results: [
        t('study1.result1'),
        t('study1.result2'),
        t('study1.result3'),
        t('study1.result4')
      ],
      image: "https://images.unsplash.com/photo-1556155092-490a1ba16284?q=75&w=800&auto=format&fit=crop"
    },
    {
      title: t('study2.title'),
      industry: t('study2.industry'),
      challenge: t('study2.challenge'),
      solution: t('study2.solution'),
      results: [
        t('study2.result1'),
        t('study2.result2'),
        t('study2.result3'),
        t('study2.result4')
      ],
      image: "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?q=75&w=800&auto=format&fit=crop"
    },
    {
      title: t('study3.title'),
      industry: t('study3.industry'),
      challenge: t('study3.challenge'),
      solution: t('study3.solution'),
      results: [
        t('study3.result1'),
        t('study3.result2'),
        t('study3.result3'),
        t('study3.result4')
      ],
      image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=75&w=800&auto=format&fit=crop"
    }
  ];

  const ownCaseFacts = [
    { value: t('ownCase.fact1value'), label: t('ownCase.fact1label') },
    { value: t('ownCase.fact2value'), label: t('ownCase.fact2label') },
    { value: t('ownCase.fact3value'), label: t('ownCase.fact3label') },
    { value: t('ownCase.fact4value'), label: t('ownCase.fact4label') }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <SEOHead canonical="/etudes-de-cas" title={t('seo.title')} description={t('seo.description')} />
      <div className="container mx-auto px-4">
        <SectionHeader
          title={t('pageTitle')}
          subtitle={t('pageSubtitle')}
          centered
          as="h1"
        />

        <div className="space-y-16 mb-16">
          {scenarios.map((scenario, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="grid md:grid-cols-12 gap-0">
                {/* Image - 5 columns */}
                <div className="md:col-span-5 h-full">
                  <OptimizedImage
                    src={scenario.image}
                    alt={scenario.title}
                    responsive="half"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content - 7 columns */}
                <div className="md:col-span-7 p-8">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="inline-flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                      {t('labels.scenario')}
                    </span>
                    <span className="text-gray-600">{scenario.industry}</span>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {scenario.title}
                  </h2>

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('labels.challenge')}</h3>
                    <p className="text-gray-600">{scenario.challenge}</p>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('labels.solution')}</h3>
                    <p className="text-gray-600">{scenario.solution}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('labels.results')}</h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {scenario.results.map((result, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{result}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Our own, verifiable case */}
        <div className="bg-indigo-600 rounded-[2rem] p-10 lg:p-14 mb-16">
          <div className="max-w-3xl mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mb-3">
              {t('ownCase.title')}
            </h2>
            <p className="text-indigo-100 text-lg">
              {t('ownCase.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {ownCaseFacts.map((fact, idx) => (
              <div key={idx}>
                <div className="text-4xl font-bold text-white mb-2 tabular-nums">{fact.value}</div>
                <p className="text-indigo-100 text-sm leading-relaxed">{fact.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {t('cta.subtitle')}
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-colors"
          >
            {t('cta.button')}
          </button>
        </div>

        {/* Related Services */}
        <div className="mt-16 mb-8">
          <RelatedServices links={[
            { path: '/audit', title: 'Audit IA Gratuit', description: 'Analyse complète de votre activité en 24h' },
            { path: '/solutions', title: 'Nos Solutions', description: 'Découvrez toutes nos solutions IA' },
            { path: '/blog', title: 'Blog', description: 'Articles et guides sur l\'IA pour PME' },
            { path: '/contact', title: 'Contact', description: 'Parlons de votre projet IA' },
          ]} />
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesPage;
