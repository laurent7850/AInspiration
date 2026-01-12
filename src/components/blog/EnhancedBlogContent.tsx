import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle,
  TrendingUp,
  Target,
  Zap,
  Users,
  Clock,
  DollarSign,
  BarChart3,
  Lightbulb,
  Shield,
  Globe,
  Brain
} from 'lucide-react';

interface EnhancedBlogContentProps {
  content: string;
  title: string;
}

export default function EnhancedBlogContent({ content, title }: EnhancedBlogContentProps) {
  const { t } = useTranslation('blog');

  const extractSections = (htmlContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const sections: Array<{ title: string; content: string; isHighlight?: boolean }> = [];

    const headings = doc.querySelectorAll('h2, h3');

    headings.forEach((heading, index) => {
      const title = heading.textContent || '';
      let content = '';
      let currentElement = heading.nextElementSibling;

      while (currentElement && !currentElement.matches('h2, h3')) {
        content += currentElement.outerHTML;
        currentElement = currentElement.nextElementSibling;
      }

      const isHighlight =
        title.toLowerCase().includes('avantage') ||
        title.toLowerCase().includes('bénéfice') ||
        title.toLowerCase().includes('solution') ||
        title.toLowerCase().includes('comment') ||
        title.toLowerCase().includes('pourquoi');

      sections.push({ title, content, isHighlight });
    });

    return sections;
  };

  const extractMetrics = (htmlContent: string) => {
    const metrics: Array<{ value: string; label: string }> = [];
    const percentageRegex = /(\d+%)/g;
    const matches = htmlContent.match(percentageRegex);

    if (matches && matches.length > 0) {
      matches.slice(0, 3).forEach((match) => {
        metrics.push({
          value: match,
          label: t('enhancedContent.improvement')
        });
      });
    }

    return metrics;
  };

  const getIconForSection = (title: string, index: number) => {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('avantage') || lowerTitle.includes('bénéfice')) return CheckCircle;
    if (lowerTitle.includes('roi') || lowerTitle.includes('coût')) return DollarSign;
    if (lowerTitle.includes('temps') || lowerTitle.includes('rapide')) return Clock;
    if (lowerTitle.includes('performance') || lowerTitle.includes('résultat')) return TrendingUp;
    if (lowerTitle.includes('utilisateur') || lowerTitle.includes('client')) return Users;
    if (lowerTitle.includes('analyse') || lowerTitle.includes('données')) return BarChart3;
    if (lowerTitle.includes('innovation') || lowerTitle.includes('créativité')) return Lightbulb;
    if (lowerTitle.includes('sécurité') || lowerTitle.includes('protection')) return Shield;
    if (lowerTitle.includes('global') || lowerTitle.includes('international')) return Globe;
    if (lowerTitle.includes('intelligence') || lowerTitle.includes('ai') || lowerTitle.includes('ia')) return Brain;

    const icons = [Target, Zap, CheckCircle, TrendingUp, Lightbulb, BarChart3];
    return icons[index % icons.length];
  };

  const getColorForSection = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-indigo-100 text-indigo-600',
      'bg-purple-100 text-purple-600',
      'bg-green-100 text-green-600',
      'bg-orange-100 text-orange-600',
      'bg-pink-100 text-pink-600'
    ];
    return colors[index % colors.length];
  };

  const sections = extractSections(content);
  const metrics = extractMetrics(content);

  const introduction = content.split('<h2')[0] || content.split('<h3')[0];

  return (
    <div className="space-y-12">
      {introduction && (
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-8 md:p-12 border border-indigo-100">
          <div
            className="prose prose-lg max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: introduction }}
          />
        </div>
      )}

      {metrics.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            {t('enhancedContent.measurableResults')}
          </h2>
          <div className={`grid md:grid-cols-${Math.min(metrics.length, 3)} gap-8`}>
            {metrics.map((metric, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-5xl font-bold mb-2">{metric.value}</div>
                <div className="text-xl text-indigo-200">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sections.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-8">
          {sections.map((section, index) => {
            const Icon = getIconForSection(section.title, index);
            const colorClass = getColorForSection(index);

            return (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 ${
                  section.isHighlight ? 'lg:col-span-2' : ''
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    {section.title}
                  </h2>
                </div>
                <div
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      )}
    </div>
  );
}
