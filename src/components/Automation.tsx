import React, { useState } from 'react';
import {
  Settings,
  Repeat,
  Workflow,
  Zap,
  ArrowRight,
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
import StartForm from './StartForm';

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
                <div className="text-indigo-200">{metric.description}</div>
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
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                {t('automation:cta.title')}
              </h2>
              <p className="text-indigo-100 mb-6">
                {t('automation:cta.subtitle')}
              </p>
              <button
                onClick={() => setShowStartForm(true)}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2"
              >
                {t('automation:cta.button')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Clock className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">{t('automation:quickStats.setup.value')}</div>
                <div className="text-indigo-100">{t('automation:quickStats.setup.label')}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <TrendingUp className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">{t('automation:quickStats.roi.value')}</div>
                <div className="text-indigo-100">{t('automation:quickStats.roi.label')}</div>
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