import React from 'react';
import SectionHeader from '../components/ui/SectionHeader';
import SEOHead from '../components/SEOHead';
import {
  Building,
  Users,
  TrendingUp,
  Clock,
  BarChart3,
  DollarSign,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OptimizedImage from '../components/ui/OptimizedImage';
import RelatedServices from '../components/ui/RelatedServices';

const CaseStudiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('caseStudies');

  const caseStudies = [
    {
      title: t('study1.title'),
      company: "CommerceXpress",
      industry: t('study1.industry'),
      employees: "11-50",
      challenge: t('study1.challenge'),
      solution: t('study1.solution'),
      results: [
        t('study1.result1'),
        t('study1.result2'),
        t('study1.result3'),
        t('study1.result4')
      ],
      testimonial: {
        quote: t('study1.quote'),
        author: t('study1.author')
      },
      image: "https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=1600&auto=format&fit=crop"
    },
    {
      title: t('study2.title'),
      company: "TechnoServic",
      industry: t('study2.industry'),
      employees: "51-200",
      challenge: t('study2.challenge'),
      solution: t('study2.solution'),
      results: [
        t('study2.result1'),
        t('study2.result2'),
        t('study2.result3'),
        t('study2.result4')
      ],
      testimonial: {
        quote: t('study2.quote'),
        author: t('study2.author')
      },
      image: "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?q=80&w=1600&auto=format&fit=crop"
    },
    {
      title: t('study3.title'),
      company: "MobiliFrance",
      industry: t('study3.industry'),
      employees: "201-500",
      challenge: t('study3.challenge'),
      solution: t('study3.solution'),
      results: [
        t('study3.result1'),
        t('study3.result2'),
        t('study3.result3'),
        t('study3.result4')
      ],
      testimonial: {
        quote: t('study3.quote'),
        author: t('study3.author')
      },
      image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1600&auto=format&fit=crop"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <SEOHead canonical="/etudes-de-cas" />
      <div className="container mx-auto px-4">
        <SectionHeader
          title={t('pageTitle')}
          subtitle={t('pageSubtitle')}
          centered
          as="h1"
        />

        <div className="space-y-16 mb-12">
          {caseStudies.map((study, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="grid md:grid-cols-12 gap-0">
                {/* Image - 5 columns */}
                <div className="md:col-span-5 h-full">
                  <OptimizedImage
                    src={study.image}
                    alt={study.title}
                    responsive="half"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content - 7 columns */}
                <div className="md:col-span-7 p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-5 h-5 text-indigo-600" />
                    <span className="text-indigo-600 font-medium">{study.company}</span>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-600">{study.industry}</span>
                    <span className="text-gray-500">|</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-600 text-sm">{study.employees}</span>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {study.title}
                  </h2>

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('labels.challenge')}</h3>
                    <p className="text-gray-600">{study.challenge}</p>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('labels.solution')}</h3>
                    <p className="text-gray-600">{study.solution}</p>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('labels.results')}</h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {study.results.map((result, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{result}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                    <blockquote className="italic text-gray-700 mb-2">
                      "{study.testimonial.quote}"
                    </blockquote>
                    <p className="text-sm font-medium text-gray-900">
                      — {study.testimonial.author}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <TrendingUp className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-indigo-600 mb-2">+45%</div>
            <div className="text-lg font-medium text-gray-900">{t('stats.productivity')}</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Clock className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-indigo-600 mb-2">-60%</div>
            <div className="text-lg font-medium text-gray-900">{t('stats.processing')}</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <DollarSign className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-indigo-600 mb-2">+25%</div>
            <div className="text-lg font-medium text-gray-900">{t('stats.revenue')}</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <BarChart3 className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-indigo-600 mb-2">50+</div>
            <div className="text-lg font-medium text-gray-900">{t('stats.clients')}</div>
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
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
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
