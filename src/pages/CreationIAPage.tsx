import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import { getServiceSchema } from '../config/seoConfig';
import {
  Image,
  Palette,
  Wand2,
  PenTool,
  Layers,
  Eye,
  ArrowRight,
  CheckCircle,
  Layout,
  CircleDollarSign,
  Clock,
  FileText,
  Brain
} from 'lucide-react';
import AuditForm from '../components/AuditForm';
import OptimizedImage from '../components/ui/OptimizedImage';
import ImageFeature from '../components/creativity/ImageFeature';
import ImageGallery from '../components/creativity/ImageGallery';
import CreativeContent from '../components/creativity/CreativeContent';
import { features, creativeTools, sampleImages, contentTypes } from '../components/creativity/data';

type Tab = 'contenu' | 'visuel';

const CreationIAPage: React.FC = () => {
  const { t } = useTranslation('content');
  const [activeTab, setActiveTab] = useState<Tab>('contenu');
  const [showStartForm, setShowStartForm] = useState(false);

  const capabilityIcons = [Wand2, Palette, Layout, Layers];

  const capabilities = (t('page.visualTab.capabilities.items', { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>).map((item, index) => ({ ...item, icon: capabilityIcons[index] }));

  const galleryImageUrls = [
    "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583508915901-b5f84c1dcde1?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1637611331620-51149c7ceb94?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1664575599736-c5197c684de0?w=800&auto=format&fit=crop&q=80"
  ];

  const galleryPrompts = t('page.visualTab.gallery.prompts', { returnObjects: true }) as string[];

  const useCaseImageUrls = [
    "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1633174524827-db00a6b7bc74?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=800&auto=format&fit=crop&q=80"
  ];

  const useCases = (t('page.visualTab.useCases.items', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    examples: string[];
  }>).map((item, index) => ({ ...item, image: useCaseImageUrls[index] }));

  const samplePrompts = t('page.visualTab.prompts.items', { returnObjects: true }) as string[];

  return (
    <section className="pt-20 bg-gradient-to-b from-gray-50 to-white">
      <SEOHead
        title={t('page.seo.title')}
        description={t('page.seo.description')}
        schema={getServiceSchema("Création de Contenu IA pour PME", "Génération de contenu marketing par IA : articles de blog, posts réseaux sociaux, newsletters, visuels. Contenu optimisé SEO et adapté à votre marque.")}
      />

      {/* Hero */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex gap-2 items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
            <Brain className="w-4 h-4" />
            <span>{t('page.hero.badge')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            {t('page.hero.title')} <span className="text-indigo-600">{t('page.hero.titleHighlight')}</span> {t('page.hero.titleSuffix')}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {t('page.hero.description')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              type="button"
              onClick={() => setShowStartForm(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg"
            >
              {t('page.hero.ctaTry')}
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowStartForm(true)}
              className="bg-white border border-indigo-200 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              {t('page.hero.ctaExamples')}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 mb-12">
        <div className="flex justify-center gap-2 bg-gray-100 rounded-2xl p-1 max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('contenu')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'contenu'
                ? 'bg-white text-indigo-700 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            {t('page.tabs.text')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('visuel')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'visuel'
                ? 'bg-white text-indigo-700 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Image className="w-4 h-4" />
            {t('page.tabs.visual')}
          </button>
        </div>
      </div>

      {/* TEXT CONTENT TAB */}
      {activeTab === 'contenu' && (
        <>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
                {t('page.textTab.badge')}
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
                {t('page.textTab.sectionTitle')}
              </h2>
              <p className="text-xl text-gray-600">
                {t('page.textTab.sectionDescription')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {features.map((feature, index) => (
                <ImageFeature
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>

            {/* Creative Tools */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                {t('page.textTab.creativeToolsTitle')}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {creativeTools.map((tool, index) => (
                  <ImageFeature
                    key={index}
                    icon={tool.icon}
                    title={tool.title}
                    description={tool.description}
                  />
                ))}
              </div>
            </div>

            {/* Gallery */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                {t('page.textTab.galleryTitle')}
              </h2>
              <ImageGallery images={sampleImages} />
            </div>

            {/* Content Types */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                {t('page.textTab.contentTypesTitle')}
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {contentTypes.map((content, index) => (
                  <CreativeContent
                    key={index}
                    title={content.title}
                    description={content.description}
                    wordCount={content.wordCount}
                    languages={content.languages}
                  />
                ))}
              </div>
            </div>

            {/* CTA contenu */}
            <div className="bg-indigo-600 rounded-2xl p-8 lg:p-12 text-white">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-3xl font-bold mb-4">
                    {t('page.textTab.cta.title')}
                  </h3>
                  <p className="text-indigo-100 mb-6">
                    {t('page.textTab.cta.description')}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowStartForm(true)}
                    className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2"
                  >
                    {t('page.textTab.cta.button')}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <Image className="w-8 h-8 text-white mx-auto mb-2" />
                    <div className="text-3xl font-bold mb-1">4K</div>
                    <div className="text-indigo-100">{t('page.textTab.cta.stat1Label')}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <FileText className="w-8 h-8 text-white mx-auto mb-2" />
                    <div className="text-3xl font-bold mb-1">10+</div>
                    <div className="text-indigo-100">{t('page.textTab.cta.stat2Label')}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <Brain className="w-8 h-8 text-white mx-auto mb-2" />
                    <div className="text-3xl font-bold mb-1">IA</div>
                    <div className="text-indigo-100">{t('page.textTab.cta.stat3Label')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* VISUAL CREATION TAB */}
      {activeTab === 'visuel' && (
        <>
          {/* Key Capabilities */}
          <div className="container mx-auto px-4 py-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('page.visualTab.capabilities.sectionTitle')}
              </h2>
              <p className="text-lg text-gray-600">
                {t('page.visualTab.capabilities.sectionDescription')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {capabilities.map((capability, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-5">
                    <capability.icon className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {capability.title}
                  </h3>
                  <p className="text-gray-600">
                    {capability.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery Section */}
          <div className="bg-indigo-50 py-16">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {t('page.visualTab.gallery.sectionTitle')}
                </h2>
                <p className="text-lg text-gray-600">
                  {t('page.visualTab.gallery.sectionDescription')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryImageUrls.map((url, index) => (
                  <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="aspect-w-16 aspect-h-9 h-48 w-full">
                      <OptimizedImage
                        src={url}
                        alt={`${t('page.visualTab.gallery.imageAlt')} #${index + 1}`}
                        responsive="third"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600 text-sm italic">
                        "{galleryPrompts[index]}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="container mx-auto px-4 py-16">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('page.visualTab.useCases.sectionTitle')}
              </h2>
              <p className="text-lg text-gray-600">
                {t('page.visualTab.useCases.sectionDescription')}
              </p>
            </div>

            <div className="space-y-16">
              {useCases.map((useCase, index) => (
                <div key={index} className="grid md:grid-cols-2 gap-8 items-center">
                  <div className={index % 2 === 0 ? "order-1" : "order-1 md:order-2"}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Eye className="w-6 h-6 text-indigo-600" />
                      {useCase.title}
                    </h3>
                    <p className="text-gray-600 mb-6 text-lg">
                      {useCase.description}
                    </p>
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <PenTool className="w-5 h-5 text-indigo-600" />
                        {t('page.visualTab.useCases.examplesLabel')}
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
                    <button
                      type="button"
                      onClick={() => setShowStartForm(true)}
                      className="text-indigo-600 font-semibold flex items-center gap-2 hover:text-indigo-800"
                    >
                      {t('page.visualTab.useCases.learnMore')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className={index % 2 === 0 ? "order-2" : "order-2 md:order-1"}>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl"></div>
                      <OptimizedImage
                        src={useCase.image}
                        alt={useCase.title}
                        responsive="half"
                        className="relative rounded-xl shadow-xl w-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt Examples */}
          <div className="bg-indigo-50 py-16">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {t('page.visualTab.prompts.sectionTitle')}
                </h2>
                <p className="text-lg text-gray-600">
                  {t('page.visualTab.prompts.sectionDescription')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {samplePrompts.map((prompt, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow">
                    <p className="text-gray-700 italic">"{prompt}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Overview */}
          <div className="container mx-auto px-4 py-16">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('page.visualTab.pricing.sectionTitle')}
              </h2>
              <p className="text-lg text-gray-600">
                {t('page.visualTab.pricing.sectionDescription')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-8 border border-transparent hover:border-indigo-100 transition-all">
                <div className="flex items-center gap-3 mb-5">
                  <CircleDollarSign className="w-7 h-7 text-indigo-600" />
                  <h3 className="text-2xl font-bold text-gray-900">{t('page.visualTab.pricing.payg.title')}</h3>
                </div>
                <p className="text-gray-600 mb-5">{t('page.visualTab.pricing.payg.description')}</p>
                <div className="text-3xl font-bold text-indigo-600 mb-5">
                  {t('page.visualTab.pricing.payg.price')} <span className="text-base font-normal text-gray-600">{t('page.visualTab.pricing.payg.priceUnit')}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {(t('page.visualTab.pricing.payg.features', { returnObjects: true }) as string[]).map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setShowStartForm(true)}
                  className="w-full py-2.5 px-4 bg-white border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  {t('page.visualTab.pricing.payg.button')}
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-indigo-600 relative transform scale-105">
                <div className="absolute -top-4 right-8 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  {t('page.visualTab.pricing.popular')}
                </div>
                <div className="flex items-center gap-3 mb-5">
                  <Image className="w-7 h-7 text-indigo-600" />
                  <h3 className="text-2xl font-bold text-gray-900">{t('page.visualTab.pricing.pro.title')}</h3>
                </div>
                <p className="text-gray-600 mb-5">{t('page.visualTab.pricing.pro.description')}</p>
                <div className="text-3xl font-bold text-indigo-600 mb-5">
                  {t('page.visualTab.pricing.pro.price')} <span className="text-base font-normal text-gray-600">{t('page.visualTab.pricing.pro.priceUnit')}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {(t('page.visualTab.pricing.pro.features', { returnObjects: true }) as string[]).map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setShowStartForm(true)}
                  className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {t('page.visualTab.pricing.pro.button')}
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border border-transparent hover:border-indigo-100 transition-all">
                <div className="flex items-center gap-3 mb-5">
                  <Layers className="w-7 h-7 text-indigo-600" />
                  <h3 className="text-2xl font-bold text-gray-900">{t('page.visualTab.pricing.business.title')}</h3>
                </div>
                <p className="text-gray-600 mb-5">{t('page.visualTab.pricing.business.description')}</p>
                <div className="text-3xl font-bold text-indigo-600 mb-5">
                  {t('page.visualTab.pricing.business.price')} <span className="text-base font-normal text-gray-600">{t('page.visualTab.pricing.business.priceUnit')}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {(t('page.visualTab.pricing.business.features', { returnObjects: true }) as string[]).map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setShowStartForm(true)}
                  className="w-full py-2.5 px-4 bg-white border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  {t('page.visualTab.pricing.business.button')}
                </button>
              </div>
            </div>
          </div>

          {/* CTA visuel */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 py-16">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-white">
                  <h2 className="text-3xl font-bold mb-6">
                    {t('page.visualTab.cta.title')}
                  </h2>
                  <p className="text-xl text-indigo-100 mb-8">
                    {t('page.visualTab.cta.description')}
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-yellow-300" />
                      <span className="text-indigo-100">{t('page.visualTab.cta.bullet1')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CircleDollarSign className="w-6 h-6 text-yellow-300" />
                      <span className="text-indigo-100">{t('page.visualTab.cta.bullet2')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <PenTool className="w-6 h-6 text-yellow-300" />
                      <span className="text-indigo-100">{t('page.visualTab.cta.bullet3')}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {t('page.visualTab.cta.formTitle')}
                  </h3>
                  <div className="space-y-4 mb-8">
                    {([
                      t('page.visualTab.cta.check1'),
                      t('page.visualTab.cta.check2'),
                      t('page.visualTab.cta.check3'),
                      t('page.visualTab.cta.check4')
                    ]).map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowStartForm(true)}
                    className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    {t('page.visualTab.cta.button')}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <AuditForm
        isOpen={showStartForm}
        onClose={() => setShowStartForm(false)}
      />
    </section>
  );
};

export default CreationIAPage;
