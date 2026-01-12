import React, { useState } from 'react';
import { ArrowRight, Zap, Image, FileText, Brain } from 'lucide-react';
import StartForm from './StartForm';
import ImageFeature from './creativity/ImageFeature';
import ImageGallery from './creativity/ImageGallery';
import CreativeContent from './creativity/CreativeContent';
import { features, creativeTools, sampleImages, contentTypes } from './creativity/data';

export default function Creativity() {
  const [showStartForm, setShowStartForm] = useState(false);

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
            Solutions créatives
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
            Créativité Assistée par IA
          </h1>
          <p className="text-xl text-gray-600">
            Donnez vie à vos idées avec nos outils créatifs
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
            Outils créatifs
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
            Exemples de créations visuelles
          </h2>
          <ImageGallery images={sampleImages} />
        </div>

        {/* Types de contenus */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Types de contenus
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
                Libérez votre créativité
              </h3>
              <p className="text-indigo-100 mb-6">
                Des outils puissants pour tous vos besoins créatifs
              </p>
              <button 
                onClick={() => setShowStartForm(true)}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2"
              >
                Commencer maintenant
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Image className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">4K</div>
                <div className="text-indigo-100">Résolution</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <FileText className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">10+</div>
                <div className="text-indigo-100">Formats</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Brain className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">IA</div>
                <div className="text-indigo-100">Avancée</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StartForm 
        isOpen={showStartForm} 
        onClose={() => setShowStartForm(false)} 
      />
    </section>
  );
}