import React, { useState } from 'react';
import {
  Users,
  Target,
  Compass,
  ArrowRight,
  Zap,
  CheckCircle,
  Calendar,
  MessageSquare,
  LineChart,
  Shield
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuditForm from './AuditForm';

export default function CustomSupport() {
  const [showStartForm, setShowStartForm] = useState(false);
  const { t } = useTranslation('support');

  const approaches = [
    {
      icon: Target,
      title: t('custom.approaches.diagnostic.title'),
      description: t('custom.approaches.diagnostic.description')
    },
    {
      icon: Compass,
      title: t('custom.approaches.plan.title'),
      description: t('custom.approaches.plan.description')
    },
    {
      icon: Users,
      title: t('custom.approaches.expert.title'),
      description: t('custom.approaches.expert.description')
    },
    {
      icon: LineChart,
      title: t('custom.approaches.followup.title'),
      description: t('custom.approaches.followup.description')
    }
  ];

  const benefits = [
    {
      title: t('custom.benefits.support.title'),
      description: t('custom.benefits.support.description'),
      icon: MessageSquare
    },
    {
      title: t('custom.benefits.sessions.title'),
      description: t('custom.benefits.sessions.description'),
      icon: Calendar
    },
    {
      title: t('custom.benefits.protection.title'),
      description: t('custom.benefits.protection.description'),
      icon: Shield
    }
  ];

  const milestones = [
    {
      phase: t('custom.journey.phase1.phase'),
      title: t('custom.journey.phase1.title'),
      duration: t('custom.journey.phase1.duration'),
      activities: [
        t('custom.journey.phase1.activities.0'),
        t('custom.journey.phase1.activities.1'),
        t('custom.journey.phase1.activities.2')
      ]
    },
    {
      phase: t('custom.journey.phase2.phase'),
      title: t('custom.journey.phase2.title'),
      duration: t('custom.journey.phase2.duration'),
      activities: [
        t('custom.journey.phase2.activities.0'),
        t('custom.journey.phase2.activities.1'),
        t('custom.journey.phase2.activities.2')
      ]
    },
    {
      phase: t('custom.journey.phase3.phase'),
      title: t('custom.journey.phase3.title'),
      duration: t('custom.journey.phase3.duration'),
      activities: [
        t('custom.journey.phase3.activities.0'),
        t('custom.journey.phase3.activities.1'),
        t('custom.journey.phase3.activities.2')
      ]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('custom.hero.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('custom.hero.subtitle')}
          </p>
        </div>

        {/* Notre approche */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {approaches.map((approach, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <approach.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {approach.title}
              </h3>
              <p className="text-gray-600">
                {approach.description}
              </p>
            </div>
          ))}
        </div>

        {/* Phases du projet */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t('custom.journey.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-600">
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-sm text-indigo-600 font-medium">{milestone.phase}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                    {milestone.duration}
                  </span>
                </div>
                <ul className="space-y-2">
                  {milestone.activities.map((activity, idx) => (
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
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-indigo-600 rounded-2xl p-8 lg:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">
                {t('custom.cta.title')}
              </h3>
              <p className="text-indigo-100 mb-6">
                {t('custom.cta.subtitle')}
              </p>
              <button
                onClick={() => setShowStartForm(true)}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2"
              >
                {t('custom.cta.button')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Zap className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">5j</div>
                <div className="text-indigo-100">{t('custom.cta.firstResultLabel')}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Users className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">98%</div>
                <div className="text-indigo-100">{t('custom.cta.satisfactionLabel')}</div>
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
