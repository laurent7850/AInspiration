import React, { useState } from 'react';
import {
  Bot,
  Brain,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Zap,
  Globe,
  FileText,
  PenTool,
  BarChart,
  Code,
  Search
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuditForm from './AuditForm';

export default function Tools() {
  const [showStartForm, setShowStartForm] = useState(false);
  const { t } = useTranslation('features');

  const tools = [
    {
      icon: Bot,
      title: t('tools.list.assistant.title'),
      description: t('tools.list.assistant.description'),
      features: [
        t('tools.list.assistant.features.0'),
        t('tools.list.assistant.features.1'),
        t('tools.list.assistant.features.2'),
        t('tools.list.assistant.features.3')
      ]
    },
    {
      icon: Brain,
      title: t('tools.list.analysis.title'),
      description: t('tools.list.analysis.description'),
      features: [
        t('tools.list.analysis.features.0'),
        t('tools.list.analysis.features.1'),
        t('tools.list.analysis.features.2'),
        t('tools.list.analysis.features.3')
      ]
    },
    {
      icon: Sparkles,
      title: t('tools.list.promptMaster.title'),
      description: t('tools.list.promptMaster.description'),
      features: [
        t('tools.list.promptMaster.features.0'),
        t('tools.list.promptMaster.features.1'),
        t('tools.list.promptMaster.features.2'),
        t('tools.list.promptMaster.features.3')
      ]
    },
    {
      icon: PenTool,
      title: t('tools.list.content.title'),
      description: t('tools.list.content.description'),
      features: [
        t('tools.list.content.features.0'),
        t('tools.list.content.features.1'),
        t('tools.list.content.features.2'),
        t('tools.list.content.features.3')
      ]
    }
  ];

  const features = [
    {
      icon: Globe,
      title: t('tools.commonFeatures.multilingual.title'),
      description: t('tools.commonFeatures.multilingual.description')
    },
    {
      icon: FileText,
      title: t('tools.commonFeatures.documentation.title'),
      description: t('tools.commonFeatures.documentation.description')
    },
    {
      icon: Code,
      title: t('tools.commonFeatures.api.title'),
      description: t('tools.commonFeatures.api.description')
    },
    {
      icon: Search,
      title: t('tools.commonFeatures.seo.title'),
      description: t('tools.commonFeatures.seo.description')
    }
  ];

  const metrics = [
    {
      value: "+200%",
      label: t('tools.metrics.productivity.label'),
      description: t('tools.metrics.productivity.description')
    },
    {
      value: "-40%",
      label: t('tools.metrics.cost.label'),
      description: t('tools.metrics.cost.description')
    },
    {
      value: "24/7",
      label: t('tools.metrics.availability.label'),
      description: t('tools.metrics.availability.description')
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('tools.hero.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('tools.hero.subtitle')}
          </p>
        </div>

        {/* Outils principaux */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {tools.map((tool, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <tool.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{tool.title}</h2>
                  <p className="text-gray-600">{tool.description}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {tool.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-600">
                    <Zap className="w-4 h-4 text-indigo-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Fonctionnalités communes */}
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
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

        {/* CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                {t('tools.cta.title')}
              </h2>
              <p className="text-indigo-100 mb-6">
                {t('tools.cta.subtitle')}
              </p>
              <button
                onClick={() => setShowStartForm(true)}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2"
              >
                {t('tools.cta.button')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Zap className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">5min</div>
                <div className="text-indigo-100">{t('tools.cta.installLabel')}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <BarChart className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">ROI</div>
                <div className="text-indigo-100">{t('tools.cta.roiLabel')}</div>
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
