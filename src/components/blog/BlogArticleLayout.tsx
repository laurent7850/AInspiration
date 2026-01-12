import React, { useMemo } from 'react';
import { LucideIcon } from 'lucide-react';
import { sanitizeHtml } from '../../utils/validation';

export interface ArticleSection {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  features?: string[];
  content?: string;
}

export interface ArticleMetric {
  value: string;
  label: string;
  description: string;
}

export interface ArticleBenefit {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface BlogArticleLayoutProps {
  title: string;
  subtitle: string;
  heroImage?: string;
  sections?: ArticleSection[];
  metrics?: ArticleMetric[];
  benefits?: ArticleBenefit[];
  content?: string;
  children?: React.ReactNode;
}

export default function BlogArticleLayout({
  title,
  subtitle,
  heroImage,
  sections,
  metrics,
  benefits,
  content,
  children
}: BlogArticleLayoutProps) {
  return (
    <div className="space-y-16">
      {heroImage && (
        <div className="relative h-[400px] rounded-2xl overflow-hidden">
          <img
            src={heroImage}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">{title}</h1>
              <p className="text-xl text-gray-200">{subtitle}</p>
            </div>
          </div>
        </div>
      )}

      {!heroImage && (
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h1>
          <p className="text-xl text-gray-600">
            {subtitle}
          </p>
        </div>
      )}

      {sections && sections.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className={`w-12 h-12 ${section.color} rounded-lg flex items-center justify-center mb-4`}>
                <section.icon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {section.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {section.description}
              </p>
              {section.features && section.features.length > 0 && (
                <ul className="space-y-2">
                  {section.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600">
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.content && (
                <div className="text-gray-600 mt-4 prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.content) }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {metrics && metrics.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-8 md:p-12">
          <div className={`grid md:grid-cols-${Math.min(metrics.length, 4)} gap-8`}>
            {metrics.map((metric, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-4xl md:text-5xl font-bold mb-2">{metric.value}</div>
                <div className="text-xl font-semibold mb-1">{metric.label}</div>
                <div className="text-indigo-200">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {content && (
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
          />
        </div>
      )}

      {benefits && benefits.length > 0 && (
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
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
      )}

      {children}
    </div>
  );
}
