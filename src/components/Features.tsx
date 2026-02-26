import React, { memo } from 'react';
import { Brain, BarChart3, Users, Pencil, MessageSquare, LineChart, BookOpen, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Features = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    {
      icon: Brain,
      titleKey: 'features:analysis.title',
      descKey: 'features:analysis.desc',
      path: '/analyse-ia'
    },
    {
      icon: BarChart3,
      titleKey: 'features:recommendations.title',
      descKey: 'features:recommendations.desc',
      path: '/recommandations'
    },
    {
      icon: LineChart,
      titleKey: 'features:dashboard.title',
      descKey: 'features:dashboard.desc',
      path: '/crm'
    },
    {
      icon: BookOpen,
      titleKey: 'features:prompts.title',
      descKey: 'features:prompts.desc',
      path: '/prompts'
    },
    {
      icon: Users,
      titleKey: 'collaboration:title',
      descKey: 'collaboration:subtitle',
      path: '/assistants'
    },
    {
      icon: Award,
      titleKey: 'training:title',
      descKey: 'training:subtitle',
      path: '/formation'
    },
    {
      icon: Pencil,
      titleKey: 'content:title',
      descKey: 'content:subtitle',
      path: '/creativite'
    },
    {
      icon: MessageSquare,
      titleKey: 'support:title',
      descKey: 'support:subtitle',
      path: '/accompagnement'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('features:title')}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            {t('features:subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => feature.path && navigate(feature.path)}
              className="p-6 rounded-xl border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition group cursor-pointer"
            >
              <feature.icon className="h-10 w-10 text-indigo-600 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {t(feature.titleKey)}
              </h3>
              <p className="text-gray-600">
                {t(feature.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(Features);