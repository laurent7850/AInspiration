import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SEOHead from './SEOHead';
import AuditForm from './AuditForm';
import CallToAction from './ui/CallToAction';
import OptimizedImage from './ui/OptimizedImage';
import { getServiceSchema } from '../config/seoConfig';

interface MediaServiceProps {
  /** i18n namespace ('audio' | 'video') */
  ns: string;
  /** canonical path, e.g. '/audio' */
  canonical: string;
  /** Hero illustration (Unsplash) */
  heroImage: string;
  /** Schema.org service name + description (FR, for SEO) */
  schemaName: string;
  schemaDescription: string;
  /** 4 icons for the feature cards */
  featureIcons: LucideIcon[];
  /** 3 icons for the use-case rows */
  useCaseIcons: LucideIcon[];
  /** 3 images (Unsplash) for the use-case rows */
  useCaseImages: string[];
  /** Accent icon shown in the hero badge */
  badgeIcon: LucideIcon;
}

interface FeatureItem {
  title: string;
  description: string;
}
interface UseCaseItem {
  title: string;
  description: string;
  examples: string[];
}
interface Metric {
  value: string;
  label: string;
  description: string;
}

const MediaService: React.FC<MediaServiceProps> = ({
  ns,
  canonical,
  heroImage,
  schemaName,
  schemaDescription,
  featureIcons,
  useCaseIcons,
  useCaseImages,
  badgeIcon: BadgeIcon,
}) => {
  const { t } = useTranslation(ns);
  const [showForm, setShowForm] = useState(false);

  const features = (t('features.items', { returnObjects: true }) as FeatureItem[])
    .map((item, i) => ({ ...item, icon: featureIcons[i % featureIcons.length] }));
  const useCases = (t('useCases.items', { returnObjects: true }) as UseCaseItem[])
    .map((item, i) => ({
      ...item,
      icon: useCaseIcons[i % useCaseIcons.length],
      image: useCaseImages[i % useCaseImages.length],
    }));
  const metrics = t('metrics', { returnObjects: true }) as Metric[];

  return (
    <section className="pt-20 bg-gradient-to-b from-gray-50 to-white">
      <SEOHead
        title={t('seo.title')}
        description={t('seo.description')}
        canonical={canonical}
        schema={getServiceSchema(schemaName, schemaDescription, { url: canonical })}
      />

      {/* Hero */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <div className="inline-flex gap-2 items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
              <BadgeIcon className="w-4 h-4" />
              <span>{t('hero.badge')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              {t('hero.title')}{' '}
              <span className="text-indigo-600">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">{t('hero.description')}</p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg"
              >
                {t('hero.ctaPrimary')}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="bg-white border border-indigo-200 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                {t('hero.ctaSecondary')}
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-2xl blur-2xl" />
            <OptimizedImage
              src={heroImage}
              alt={t('hero.imageAlt')}
              responsive="half"
              className="relative rounded-2xl shadow-2xl w-full h-[320px] md:h-[400px] object-cover"
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('features.title')}</h2>
          <p className="text-lg text-gray-600">{t('features.subtitle')}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-5">
                <feature.icon className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-indigo-600 rounded-2xl p-8">
          <div className="grid md:grid-cols-3 gap-8">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-4xl font-bold mb-2">{metric.value}</div>
                <div className="text-xl font-semibold mb-1">{metric.label}</div>
                <div className="text-indigo-100">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Use cases */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('useCases.title')}</h2>
          <p className="text-lg text-gray-600">{t('useCases.subtitle')}</p>
        </div>

        <div className="space-y-16">
          {useCases.map((useCase, index) => (
            <div key={index} className="grid md:grid-cols-2 gap-8 items-center">
              <div className={index % 2 === 0 ? 'order-1' : 'order-1 md:order-2'}>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <useCase.icon className="w-6 h-6 text-indigo-600" />
                  {useCase.title}
                </h3>
                <p className="text-gray-600 mb-6 text-lg">{useCase.description}</p>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {t('useCases.examplesLabel')}
                  </h4>
                  <ul className="space-y-2">
                    {useCase.examples.map((example, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className={index % 2 === 0 ? 'order-2' : 'order-2 md:order-1'}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl" />
                  <OptimizedImage
                    src={useCase.image}
                    alt={useCase.title}
                    responsive="half"
                    className="relative rounded-xl shadow-xl w-full h-[280px] object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 pb-20">
        <CallToAction
          title={t('cta.title')}
          subtitle={t('cta.subtitle')}
          buttonText={t('cta.button')}
          buttonAction={() => setShowForm(true)}
          stats={[
            { value: t('cta.stat1Value'), label: t('cta.stat1Label'), icon: Clock },
            { value: t('cta.stat2Value'), label: t('cta.stat2Label'), icon: TrendingUp },
          ]}
        />
      </div>

      <AuditForm isOpen={showForm} onClose={() => setShowForm(false)} />
    </section>
  );
};

export default MediaService;
