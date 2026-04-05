import React, { useState } from 'react';
import {
  Bot,
  MessageSquare,
  Brain,
  Settings,
  ArrowRight,
  Zap,
  Users,
  Clock,
  Globe,
  Shield
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuditForm from './AuditForm';

export default function VirtualAssistants() {
  const [showStartForm, setShowStartForm] = useState(false);
  const { t } = useTranslation('features');

  const assistantTypes = [
    {
      title: t('assistants.types.customer.title'),
      description: t('assistants.types.customer.description'),
      features: [
        t('assistants.types.customer.features.0'),
        t('assistants.types.customer.features.1'),
        t('assistants.types.customer.features.2'),
        t('assistants.types.customer.features.3')
      ],
      icon: MessageSquare,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: t('assistants.types.analysis.title'),
      description: t('assistants.types.analysis.description'),
      features: [
        t('assistants.types.analysis.features.0'),
        t('assistants.types.analysis.features.1'),
        t('assistants.types.analysis.features.2'),
        t('assistants.types.analysis.features.3')
      ],
      icon: Brain,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: t('assistants.types.process.title'),
      description: t('assistants.types.process.description'),
      features: [
        t('assistants.types.process.features.0'),
        t('assistants.types.process.features.1'),
        t('assistants.types.process.features.2'),
        t('assistants.types.process.features.3')
      ],
      icon: Settings,
      color: "bg-green-100 text-green-600"
    }
  ];

  const benefits = [
    {
      title: t('assistants.benefits.availability.title'),
      description: t('assistants.benefits.availability.description'),
      icon: Clock
    },
    {
      title: t('assistants.benefits.multilingual.title'),
      description: t('assistants.benefits.multilingual.description'),
      icon: Globe
    },
    {
      title: t('assistants.benefits.security.title'),
      description: t('assistants.benefits.security.description'),
      icon: Shield
    }
  ];

  const metrics = [
    {
      value: "90%",
      label: t('assistants.metrics.resolution.label'),
      description: t('assistants.metrics.resolution.description')
    },
    {
      value: "-60%",
      label: t('assistants.metrics.cost.label'),
      description: t('assistants.metrics.cost.description')
    },
    {
      value: "24/7",
      label: t('assistants.metrics.availability.label'),
      description: t('assistants.metrics.availability.description')
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('assistants.hero.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('assistants.hero.subtitle')}
          </p>
        </div>

        {/* Types d'assistants */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {assistantTypes.map((type, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mb-4`}>
                <type.icon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {type.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {type.description}
              </p>
              <ul className="space-y-2">
                {type.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-600">
                    <Bot className="w-4 h-4 text-indigo-600" />
                    <span>{feature}</span>
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

        {/* Bénéfices */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                {t('assistants.cta.title')}
              </h2>
              <p className="text-indigo-100 mb-6">
                {t('assistants.cta.subtitle')}
              </p>
              <button
                onClick={() => setShowStartForm(true)}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2"
              >
                {t('assistants.cta.button')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Zap className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">5min</div>
                <div className="text-indigo-100">{t('assistants.cta.configLabel')}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Users className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">24/7</div>
                <div className="text-indigo-100">{t('assistants.cta.availabilityLabel')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">{t('assistants.faq.title')}</h2>
        <div className="space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <details key={i} className="bg-white border border-gray-200 rounded-lg p-4 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                {t(`assistants.faq.items.${i}.q`)}
                <span className="text-indigo-600 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="mt-3 text-gray-600 leading-relaxed">{t(`assistants.faq.items.${i}.a`)}</p>
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
