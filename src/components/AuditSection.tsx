import React, { useState } from 'react';
import {
  Scan,
  FileSearch,
  PieChart,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StartForm from './StartForm';

export default function AuditSection() {
  const { t } = useTranslation('common');
  const [showStartForm, setShowStartForm] = useState(false);

  const auditSteps = [
    {
      id: 1,
      icon: Scan,
      title: t('audit.steps.analysis.title', 'Analyse initiale'),
      description: t('audit.steps.analysis.description', 'Évaluation complète de vos processus actuels')
    },
    {
      id: 2,
      icon: FileSearch,
      title: t('audit.steps.diagnostic.title', 'Diagnostic approfondi'),
      description: t('audit.steps.diagnostic.description', 'Identification des opportunités d\'amélioration')
    },
    {
      id: 3,
      icon: PieChart,
      title: t('audit.steps.impact.title', 'Analyse d\'impact'),
      description: t('audit.steps.impact.description', 'Estimation des bénéfices potentiels')
    },
    {
      id: 4,
      icon: Lightbulb,
      title: t('audit.steps.plan.title', 'Plan d\'action'),
      description: t('audit.steps.plan.description', 'Recommandations détaillées et feuille de route')
    }
  ];

  return (
    <section id="audit" className="py-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Clock className="w-4 h-4" />
            {t('audit.badge', 'Audit offert — Places limitées ce mois-ci')}
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('audit.title', 'Découvrez votre potentiel IA en 24h')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('audit.subtitle', 'Un expert analyse votre activité et vous livre un plan d\'action concret, gratuitement.')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {auditSteps.map((step) => (
            <div
              key={step.id}
              className="relative flex flex-col p-6 rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                {step.id}
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => setShowStartForm(true)}
            className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center gap-3"
          >
            {t('audit.cta', 'Demander mon audit gratuit')}
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{t('audit.badges.free', '100% gratuit')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{t('audit.badges.fast', 'Résultats sous 24h')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{t('audit.badges.noCommitment', 'Sans engagement')}</span>
            </div>
          </div>
        </div>
      </div>

      <StartForm
        isOpen={showStartForm}
        onClose={() => setShowStartForm(false)}
        productId="audit-ia"
      />
    </section>
  );
}
