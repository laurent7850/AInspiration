import React, { useState } from 'react';
import {
  MessageSquare,
  Image,
  Users,
  Brain,
  CheckCircle,
  Star,
  Target
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuditForm from './AuditForm';
import CallToAction from './ui/CallToAction';

export default function Formation() {
  const [showStartForm, setShowStartForm] = useState(false);
  const { t } = useTranslation('training');

  const courses = [
    {
      title: t('formation.courses.chatgpt.title'),
      level: t('formation.courses.chatgpt.level'),
      duration: t('formation.courses.chatgpt.duration'),
      icon: MessageSquare,
      topics: [
        t('formation.courses.chatgpt.topics.0'),
        t('formation.courses.chatgpt.topics.1'),
        t('formation.courses.chatgpt.topics.2'),
        t('formation.courses.chatgpt.topics.3')
      ]
    },
    {
      title: t('formation.courses.imageAI.title'),
      level: t('formation.courses.imageAI.level'),
      duration: t('formation.courses.imageAI.duration'),
      icon: Image,
      topics: [
        t('formation.courses.imageAI.topics.0'),
        t('formation.courses.imageAI.topics.1'),
        t('formation.courses.imageAI.topics.2'),
        t('formation.courses.imageAI.topics.3')
      ]
    }
  ];

  const benefits = [
    {
      title: t('formation.benefits.practical.title'),
      description: t('formation.benefits.practical.description'),
      icon: Target,
      examples: [
        t('formation.benefits.practical.examples.0'),
        t('formation.benefits.practical.examples.1'),
        t('formation.benefits.practical.examples.2'),
        t('formation.benefits.practical.examples.3')
      ]
    },
    {
      title: t('formation.benefits.results.title'),
      description: t('formation.benefits.results.description'),
      icon: Star,
      examples: [
        t('formation.benefits.results.examples.0'),
        t('formation.benefits.results.examples.1'),
        t('formation.benefits.results.examples.2'),
        t('formation.benefits.results.examples.3')
      ]
    }
  ];

  const testimonials = [
    {
      name: t('formation.testimonials.marie.name'),
      role: t('formation.testimonials.marie.role'),
      text: t('formation.testimonials.marie.text'),
      rating: 5
    },
    {
      name: t('formation.testimonials.thomas.name'),
      role: t('formation.testimonials.thomas.role'),
      text: t('formation.testimonials.thomas.text'),
      rating: 5
    },
    {
      name: t('formation.testimonials.sophie.name'),
      role: t('formation.testimonials.sophie.role'),
      text: t('formation.testimonials.sophie.text'),
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('formation.hero.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('formation.hero.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {courses.map((course, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <course.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-indigo-600">{course.level}</p>
                </div>
              </div>
              <div className="mb-4">
                <span className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                  {course.duration}
                </span>
              </div>
              <ul className="space-y-2">
                {course.topics.map((topic, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {benefit.description}
              </p>
              <ul className="space-y-2">
                {benefit.examples.map((example, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">
                "{testimonial.text}"
              </p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>

        <CallToAction
          title={t('formation.cta.title')}
          subtitle={t('formation.cta.subtitle')}
          buttonText={t('formation.cta.button')}
          buttonAction={() => setShowStartForm(true)}
          solid
          stats={[
            { value: "3 jours", label: t('formation.cta.stats.duration'), icon: Brain },
            { value: "98%", label: t('formation.cta.stats.satisfaction'), icon: Users },
          ]}
        />
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">{t('formation.faq.title')}</h2>
        <div className="space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <details key={i} className="bg-white border border-gray-200 rounded-lg p-4 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                {t(`formation.faq.items.${i}.q`)}
                <span className="text-indigo-600 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="mt-3 text-gray-600 leading-relaxed">{t(`formation.faq.items.${i}.a`)}</p>
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
