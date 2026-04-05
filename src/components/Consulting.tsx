import React, { useState } from 'react';
import {
  Lightbulb,
  Target,
  TrendingUp,
  Shield,
  Users,
  Zap,
  CheckCircle,
  Brain,
  LineChart,
  Compass
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuditForm from './AuditForm';
import CallToAction from './ui/CallToAction';

export default function Consulting() {
  const [showStartForm, setShowStartForm] = useState(false);
  const { t } = useTranslation('features');

  const expertises = [
    {
      icon: Brain,
      title: t('consulting.expertises.strategy.title'),
      description: t('consulting.expertises.strategy.description')
    },
    {
      icon: Target,
      title: t('consulting.expertises.optimization.title'),
      description: t('consulting.expertises.optimization.description')
    },
    {
      icon: LineChart,
      title: t('consulting.expertises.performance.title'),
      description: t('consulting.expertises.performance.description')
    },
    {
      icon: Compass,
      title: t('consulting.expertises.innovation.title'),
      description: t('consulting.expertises.innovation.description')
    }
  ];

  const methodology = [
    {
      phase: t('consulting.phases.diagnostic.phase'),
      activities: [
        t('consulting.phases.diagnostic.activities.0'),
        t('consulting.phases.diagnostic.activities.1'),
        t('consulting.phases.diagnostic.activities.2')
      ],
      duration: t('consulting.phases.diagnostic.duration')
    },
    {
      phase: t('consulting.phases.strategy.phase'),
      activities: [
        t('consulting.phases.strategy.activities.0'),
        t('consulting.phases.strategy.activities.1'),
        t('consulting.phases.strategy.activities.2')
      ],
      duration: t('consulting.phases.strategy.duration')
    },
    {
      phase: t('consulting.phases.execution.phase'),
      activities: [
        t('consulting.phases.execution.activities.0'),
        t('consulting.phases.execution.activities.1'),
        t('consulting.phases.execution.activities.2')
      ],
      duration: t('consulting.phases.execution.duration')
    }
  ];

  const benefits = [
    {
      title: t('consulting.benefits.vision.title'),
      description: t('consulting.benefits.vision.description'),
      icon: Lightbulb,
      stats: t('consulting.benefits.vision.stats')
    },
    {
      title: t('consulting.benefits.efficiency.title'),
      description: t('consulting.benefits.efficiency.description'),
      icon: TrendingUp,
      stats: t('consulting.benefits.efficiency.stats')
    },
    {
      title: t('consulting.benefits.risk.title'),
      description: t('consulting.benefits.risk.description'),
      icon: Shield,
      stats: t('consulting.benefits.risk.stats')
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('consulting.hero.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('consulting.hero.description')}
          </p>
        </div>

        {/* Expertises */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {expertises.map((expertise, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <expertise.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {expertise.title}
              </h3>
              <p className="text-gray-600">
                {expertise.description}
              </p>
            </div>
          ))}
        </div>

        {/* Méthodologie */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t('consulting.methodology.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {methodology.map((phase, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-600">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{phase.phase}</h3>
                    <span className="text-sm text-indigo-600">{phase.duration}</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {phase.activities.map((activity, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
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
              <p className="text-gray-600 mb-3">
                {benefit.description}
              </p>
              <div className="text-sm font-semibold text-indigo-600">
                {benefit.stats}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <CallToAction
          title={t('consulting.cta.title')}
          subtitle={t('consulting.cta.subtitle')}
          buttonText={t('consulting.cta.button')}
          buttonAction={() => setShowStartForm(true)}
          solid
          stats={[
            { value: "15+", label: t('consulting.cta.stats.expertise'), icon: Zap },
            { value: "500+", label: t('consulting.cta.stats.projects'), icon: Users },
          ]}
        />
      </div>

      <AuditForm
        isOpen={showStartForm}
        onClose={() => setShowStartForm(false)}
      />
    </section>
  );
}
