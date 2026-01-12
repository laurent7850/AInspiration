import React, { useState } from 'react';
import { Brain, ShieldCheck, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StartForm from './StartForm';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

export default function Hero() {
  const [showStartForm, setShowStartForm] = useState(false);
  const { t } = useTranslation('common');

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white pt-20 lg:pt-32 pb-12 lg:pb-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
              {t('hero.title')}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => setShowStartForm(true)}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {t('button.discoverAI')}
              </button>
              <button
                onClick={() => setShowStartForm(true)}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors"
              >
                {t('button.startFreeAudit')}
              </button>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <Brain className="text-indigo-600 w-5 h-5" />
                <span className="text-sm text-gray-600">{t('hero.features.simple')}</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <ShieldCheck className="text-indigo-600 w-5 h-5" />
                <span className="text-sm text-gray-600">{t('hero.features.secure')}</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <Users className="text-indigo-600 w-5 h-5" />
                <span className="text-sm text-gray-600">{t('hero.features.support')}</span>
              </div>
            </div>
          </div>
          
          <div className="relative mt-8 lg:mt-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 rounded-3xl blur-3xl"></div>
            <img 
              src={getOptimizedImageUrl("https://images.unsplash.com/photo-1551434678-e076c223a692", 1024)}
              alt="Intelligence Artificielle en entreprise"
              className="relative rounded-2xl shadow-2xl w-full"
              loading="eager"
              width="1024"
              height="683"
            />
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