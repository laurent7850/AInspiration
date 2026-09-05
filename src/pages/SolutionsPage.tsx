import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bot,
  Brain,
  MessageSquare,
  Settings,
  Globe,
  Shield,
  Target,
  ArrowRight,
  CheckCircle,
  BarChart,
  RefreshCw,
  PenTool,
} from 'lucide-react';
import AuditForm from '../components/AuditForm';
import AnimatedStats from '../components/AnimatedStats';
import RelatedServices from '../components/ui/RelatedServices';
import SEOHead from '../components/SEOHead';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { createServiceSchema } from '../utils/structuredData';

type Category = 'all' | 'data' | 'automation' | 'communication' | 'creative';

const CATEGORIES: Category[] = ['all', 'data', 'automation', 'communication', 'creative'];

/**
 * Structural data only — every visible string lives in the `solutions`
 * namespace (public/locales/<lang>/solutions.json), so EN and NL render
 * translated text instead of the French this page used to hard-code.
 */
const SOLUTIONS: Array<{ key: string; icon: React.ComponentType<{ className?: string }>; path: string; categories: Category[] }> = [
  { key: 'analysis', icon: Brain, path: '/analyse-ia', categories: ['data'] },
  { key: 'transformation', icon: RefreshCw, path: '/transformation', categories: ['data', 'automation'] },
  { key: 'automation', icon: Settings, path: '/automatisation', categories: ['automation'] },
  { key: 'assistants', icon: Bot, path: '/assistants', categories: ['communication'] },
  { key: 'crm', icon: BarChart, path: '/crm', categories: ['automation', 'communication'] },
  { key: 'prompts', icon: MessageSquare, path: '/prompts', categories: ['communication'] },
  { key: 'content', icon: PenTool, path: '/creation-ia', categories: ['creative', 'communication'] },
];

const APPROACH: Array<{ key: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: 'expertise', icon: Brain },
  { key: 'multilingual', icon: Globe },
  { key: 'security', icon: Shield },
  { key: 'results', icon: Target },
];

const GUIDANCE_STEPS = ['audit', 'implementation', 'optimization'] as const;

const SolutionsPage: React.FC = () => {
  const { t } = useTranslation('solutions');
  const { localizedPath } = useLocalizedPath();
  const [showStartForm, setShowStartForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  const serviceSchema = createServiceSchema({
    name: t('schema.name'),
    description: t('schema.description'),
    provider: 'AInspiration',
    areaServed: ['Belgium', 'France', 'Luxembourg', 'Netherlands'],
  });

  const filteredSolutions =
    selectedCategory === 'all'
      ? SOLUTIONS
      : SOLUTIONS.filter((solution) => solution.categories.includes(selectedCategory));

  return (
    <>
      {/* Title/description come from seoConfig per language via SEOHead */}
      <SEOHead schema={serviceSchema} />

      <section className="relative bg-aurora-quiet text-white overflow-hidden pt-28 lg:pt-32 pb-12 lg:pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-display font-light text-3xl sm:text-4xl lg:text-6xl text-white leading-[1.06] mb-5">
              {t('hero.titlePrefix')}
              <span className="text-aurora-teal">{t('hero.titleHighlight')}</span>
              {t('hero.titleSuffix', '') ? ` ${t('hero.titleSuffix')}` : ''}
            </h1>
            <p className="text-lg sm:text-xl text-indigo-100/85 max-w-[55ch] leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-gray-50 to-white pt-12">
        <div className="container mx-auto px-4">
          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12" role="group" aria-label={t('categories.all')}>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t(`categories.${category}`)}
              </button>
            ))}
          </div>

          {/* Solutions grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
            {filteredSolutions.map((solution) => {
              const benefits = t(`solutions.${solution.key}.benefits`, { returnObjects: true }) as string[];
              return (
                <article
                  key={solution.key}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                >
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <solution.icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{t(`solutions.${solution.key}.title`)}</h2>
                  <p className="text-gray-600 mb-4 flex-grow">{t(`solutions.${solution.key}.description`)}</p>
                  <ul className="space-y-2 mb-6">
                    {(Array.isArray(benefits) ? benefits : []).map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-gray-600 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" aria-hidden="true" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={localizedPath(solution.path)}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {t('learnMore')}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>

          {/* Integrated approach */}
          <div className="max-w-6xl mx-auto mb-16">
            <div className="bg-indigo-50 rounded-2xl p-8">
              <div className="text-center mb-10">
                <h2 className="font-display font-light text-3xl sm:text-5xl text-ink mb-4">{t('approach.title')}</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t('approach.subtitle')}</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {APPROACH.map((item) => (
                  <div key={item.key} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t(`approach.items.${item.key}.title`)}</h3>
                    <p className="text-gray-600">{t(`approach.items.${item.key}.description`)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-aurora-teal rounded-2xl p-8 lg:p-12 text-white mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
                <p className="text-indigo-100 mb-6">{t('cta.body')}</p>
                <button
                  type="button"
                  onClick={() => setShowStartForm(true)}
                  className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2"
                >
                  {t('cta.button')}
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
              <AnimatedStats variant="dark" className="grid-cols-2" />
            </div>
          </div>

          {/* Guidance */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="font-display font-light text-3xl sm:text-5xl text-ink mb-4">{t('guidance.title')}</h2>
            <p className="text-lg text-gray-600 mb-8">{t('guidance.body')}</p>
            <ol className="grid md:grid-cols-3 gap-6">
              {GUIDANCE_STEPS.map((step, index) => (
                <li key={step} className="bg-white p-6 rounded-xl shadow">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600 mx-auto mb-4">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t(`guidance.steps.${step}.title`)}</h3>
                  <p className="text-gray-600 text-sm">{t(`guidance.steps.${step}.description`)}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Related services */}
          <div className="mt-16 mb-8">
            <RelatedServices
              links={[
                { path: '/audit', title: t('related.audit.title'), description: t('related.audit.description') },
                { path: '/automatisation', title: t('related.automation.title'), description: t('related.automation.description') },
                { path: '/assistants', title: t('related.assistants.title'), description: t('related.assistants.description') },
                { path: '/analyse-ia', title: t('related.analysis.title'), description: t('related.analysis.description') },
              ]}
            />
          </div>
        </div>

        <AuditForm isOpen={showStartForm} onClose={() => setShowStartForm(false)} />
      </section>
    </>
  );
};

export default SolutionsPage;
