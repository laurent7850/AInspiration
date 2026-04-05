import React, { useState } from 'react';
import { ArrowRight, Zap, Image, FileText, Brain, Paintbrush, Pencil, MessageSquare, Wand2, Layers, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuditForm from './AuditForm';
import ImageFeature from './creativity/ImageFeature';
import ImageGallery from './creativity/ImageGallery';
import CreativeContent from './creativity/CreativeContent';

export default function Creativity() {
  const [showStartForm, setShowStartForm] = useState(false);
  const { t } = useTranslation('content');

  const features = [
    {
      icon: Paintbrush,
      title: t('creativity.features.imageGen.title'),
      description: t('creativity.features.imageGen.description')
    },
    {
      icon: Pencil,
      title: t('creativity.features.contentWriting.title'),
      description: t('creativity.features.contentWriting.description')
    },
    {
      icon: MessageSquare,
      title: t('creativity.features.creativeDialogues.title'),
      description: t('creativity.features.creativeDialogues.description')
    },
    {
      icon: Brain,
      title: t('creativity.features.ideation.title'),
      description: t('creativity.features.ideation.description')
    }
  ];

  const creativeTools = [
    {
      icon: Wand2,
      title: t('creativity.tools.styleAI.title'),
      description: t('creativity.tools.styleAI.description')
    },
    {
      icon: Layers,
      title: t('creativity.tools.multiFormat.title'),
      description: t('creativity.tools.multiFormat.description')
    },
    {
      icon: Settings,
      title: t('creativity.tools.creativeControl.title'),
      description: t('creativity.tools.creativeControl.description')
    },
    {
      icon: FileText,
      title: t('creativity.tools.templates.title'),
      description: t('creativity.tools.templates.description')
    }
  ];

  const sampleImages = [
    {
      url: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=60",
      title: t('creativity.gallery.productDesign.title'),
      description: t('creativity.gallery.productDesign.description')
    },
    {
      url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
      title: t('creativity.gallery.digitalMarketing.title'),
      description: t('creativity.gallery.digitalMarketing.description')
    },
    {
      url: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&auto=format&fit=crop&q=60",
      title: t('creativity.gallery.advertising.title'),
      description: t('creativity.gallery.advertising.description')
    }
  ];

  const contentTypes = [
    {
      title: t('creativity.contentTypes.blog.title'),
      description: t('creativity.contentTypes.blog.description'),
      wordCount: t('creativity.contentTypes.blog.wordCount'),
      languages: t('creativity.contentTypes.blog.languages')
    },
    {
      title: t('creativity.contentTypes.social.title'),
      description: t('creativity.contentTypes.social.description'),
      wordCount: t('creativity.contentTypes.social.wordCount'),
      languages: t('creativity.contentTypes.social.languages')
    },
    {
      title: t('creativity.contentTypes.email.title'),
      description: t('creativity.contentTypes.email.description'),
      wordCount: t('creativity.contentTypes.email.wordCount'),
      languages: t('creativity.contentTypes.email.languages')
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
            {t('creativity.hero.badge')}
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
            {t('creativity.hero.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('creativity.hero.subtitle')}
          </p>
        </div>

        {/* Fonctionnalités principales */}
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

        {/* Outils créatifs */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t('creativity.toolsTitle')}
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

        {/* Exemples d'images */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t('creativity.galleryTitle')}
          </h2>
          <ImageGallery images={sampleImages} />
        </div>

        {/* Types de contenus */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t('creativity.contentTypesTitle')}
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

        {/* CTA */}
        <div className="bg-indigo-600 rounded-2xl p-8 lg:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">
                {t('creativity.cta.title')}
              </h3>
              <p className="text-indigo-100 mb-6">
                {t('creativity.cta.subtitle')}
              </p>
              <button
                onClick={() => setShowStartForm(true)}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2"
              >
                {t('creativity.cta.button')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Image className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">4K</div>
                <div className="text-indigo-100">{t('creativity.cta.resolutionLabel')}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <FileText className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">10+</div>
                <div className="text-indigo-100">{t('creativity.cta.formatsLabel')}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Brain className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">IA</div>
                <div className="text-indigo-100">{t('creativity.cta.aiLabel')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuditForm
        isOpen={showStartForm}
        onClose={() => setShowStartForm(false)}
      />
    </section>
  );
}
