import React, { useState } from 'react';
import {
  Settings,
  Repeat,
  Workflow,
  Zap,
  Clock,
  TrendingUp,
  Shield,
  Bot,
  FileText,
  Database,
  Mail,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuditForm from './AuditForm';
import CallToAction from './ui/CallToAction';

export default function Automation() {
  const [showStartForm, setShowStartForm] = useState(false);
  const { t } = useTranslation();

  const mainFeatures = [
    {
      titleKey: "automation:mainFeatures.workflows.title",
      descKey: "automation:mainFeatures.workflows.description",
      icon: Workflow,
      examplesKey: "automation:mainFeatures.workflows.examples"
    },
    {
      titleKey: "automation:mainFeatures.integration.title",
      descKey: "automation:mainFeatures.integration.description",
      icon: Settings,
      examplesKey: "automation:mainFeatures.integration.examples"
    },
    {
      titleKey: "automation:mainFeatures.realtime.title",
      descKey: "automation:mainFeatures.realtime.description",
      icon: Zap,
      examplesKey: "automation:mainFeatures.realtime.examples"
    }
  ];

  const useCases = [
    {
      icon: FileText,
      titleKey: "automation:useCases.documents.title",
      tasksKey: "automation:useCases.documents.tasks"
    },
    {
      icon: Database,
      titleKey: "automation:useCases.processes.title",
      tasksKey: "automation:useCases.processes.tasks"
    },
    {
      icon: MessageSquare,
      titleKey: "automation:useCases.communication.title",
      tasksKey: "automation:useCases.communication.tasks"
    }
  ];

  const metrics = t('automation:metrics', { returnObjects: true }) as Array<{value: string, label: string, description: string}>;

  const schedule = [
    { icon: Calendar, index: 0 },
    { icon: Bot, index: 1 },
    { icon: Mail, index: 2 }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('automation:title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('automation:subtitle')}
          </p>
        </div>

        {/* Fonctionnalités principales */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {mainFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t(feature.titleKey)}
              </h2>
              <p className="text-gray-600 mb-4">
                {t(feature.descKey)}
              </p>
              <ul className="space-y-2">
                {(t(feature.examplesKey, { returnObjects: true }) as string[]).map((example, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-600">
                    <Zap className="w-4 h-4 text-indigo-600" />
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Métriques */}
        <div className="bg-indigo-600 rounded-2xl p-8 mb-16">
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

        {/* Cas d'usage */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t('automation:useCases.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <useCase.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t(useCase.titleKey)}
                </h3>
                <ul className="space-y-2">
                  {(t(useCase.tasksKey, { returnObjects: true }) as string[]).map((task, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-600">
                      <Repeat className="w-4 h-4 text-indigo-600" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Fonctionnement */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {schedule.map((item, index) => {
            const scheduleItem = (t('automation:schedule', { returnObjects: true }) as Array<{title: string, description: string}>)[item.index];
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {scheduleItem.title}
                </h3>
                <p className="text-gray-600">
                  {scheduleItem.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <CallToAction
          title={t('automation:cta.title')}
          subtitle={t('automation:cta.subtitle')}
          buttonText={t('automation:cta.button')}
          buttonAction={() => setShowStartForm(true)}
          stats={[
            { value: t('automation:quickStats.setup.value'), label: t('automation:quickStats.setup.label'), icon: Clock },
            { value: t('automation:quickStats.roi.value'), label: t('automation:quickStats.roi.label'), icon: TrendingUp },
          ]}
        />
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">{t('automation:faq.title')}</h2>
        <div className="space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <details key={i} className="bg-white border border-gray-200 rounded-lg p-4 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                {t(`automation:faq.items.${i}.q`)}
                <span className="text-indigo-600 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="mt-3 text-gray-600 leading-relaxed">{t(`automation:faq.items.${i}.a`)}</p>
            </details>
          ))}
        </div>
      </div>

      <AuditForm
        isOpen={showStartForm}
        onClose={() => setShowStartForm(false)}
      />
    </section>
  );
}