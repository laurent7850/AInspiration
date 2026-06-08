import React, { useState } from 'react';
import {
  Scan,
  FileSearch,
  PieChart,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuditForm from './AuditForm';

export default function AuditSection() {
  const { t } = useTranslation('common');
  const [showStartForm, setShowStartForm] = useState(false);

  const auditSteps = [
    { id: 1, icon: Scan, title: t('audit.steps.analysis.title'), description: t('audit.steps.analysis.description') },
    { id: 2, icon: FileSearch, title: t('audit.steps.diagnostic.title'), description: t('audit.steps.diagnostic.description') },
    { id: 3, icon: PieChart, title: t('audit.steps.impact.title'), description: t('audit.steps.impact.description') },
    { id: 4, icon: Lightbulb, title: t('audit.steps.plan.title'), description: t('audit.steps.plan.description') },
  ];

  return (
    <section id="audit" className="py-16 lg:py-24 bg-canvas">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <span className="inline-block text-xs font-medium text-secondary uppercase tracking-[0.15em] mb-3">
            {t('audit.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight mb-4">
            {t('audit.title')}
          </h2>
          <p className="text-lg text-secondary leading-relaxed">
            {t('audit.subtitle')}
          </p>
        </div>

        {/* Steps — horizontal on desktop */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {auditSteps.map((step) => (
            <div
              key={step.id}
              className="relative bg-white rounded-card p-8 shadow-lift hover:shadow-diffuse transition-all duration-300"
            >
              <span className="text-xs font-mono text-secondary tracking-wider mb-4 block">
                0{step.id}
              </span>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-4">
                <step.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-ink mb-2 tracking-tight">
                {step.title}
              </h3>
              <p className="text-sm text-secondary leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA — dark block */}
        <div className="bg-indigo-600 rounded-[2rem] p-10 lg:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mb-2">
              {t('audit.cta')}
            </h3>
            <div className="flex flex-wrap gap-4 text-sm text-indigo-100">
              <span>{t('audit.badges.free')}</span>
              <span className="text-indigo-300">|</span>
              <span>{t('audit.badges.fast')}</span>
              <span className="text-indigo-300">|</span>
              <span>{t('audit.badges.noCommitment')}</span>
            </div>
          </div>
          <button
            onClick={() => setShowStartForm(true)}
            className="group inline-flex items-center gap-3 bg-white text-indigo-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex-shrink-0"
          >
            {t('button.startFreeAudit')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      <AuditForm
        isOpen={showStartForm}
        onClose={() => setShowStartForm(false)}
      />
    </section>
  );
}
