import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Zap, TrendingUp, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StartForm from '../StartForm';

interface BlogCTAProps {
  variant?: 'audit' | 'consultation' | 'formation' | 'default';
}

const BlogCTA: React.FC<BlogCTAProps> = ({ variant = 'default' }) => {
  const [showStartForm, setShowStartForm] = useState(false);
  const { t } = useTranslation('blog');

  const iconMap = {
    audit: Target,
    consultation: Zap,
    formation: TrendingUp,
    default: Zap
  };

  const productIdMap = {
    audit: 'audit-ia',
    consultation: 'conseil-ia',
    formation: 'formation-ia',
    default: 'audit-ia'
  };

  const Icon = iconMap[variant];
  const productId = productIdMap[variant];

  return (
    <>
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-8 md:p-12 text-white my-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/20 p-3 rounded-full">
              <Icon className="w-8 h-8" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            {t(`cta.${variant}.title`)}
          </h2>

          <p className="text-xl text-indigo-100 text-center mb-8 max-w-2xl mx-auto">
            {t(`cta.${variant}.description`)}
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-indigo-300 flex-shrink-0 mt-0.5" />
                <span className="text-indigo-50">{t(`cta.${variant}.benefits.${num}`)}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowStartForm(true)}
              className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-lg"
            >
              {t(`cta.${variant}.button`)}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-center text-indigo-200 text-sm mt-6">
            {t('cta.footer')}
          </p>
        </div>
      </div>

      <StartForm
        isOpen={showStartForm}
        onClose={() => setShowStartForm(false)}
        productId={productId}
      />
    </>
  );
};

export default BlogCTA;
