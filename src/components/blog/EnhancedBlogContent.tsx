import React, { useMemo } from 'react';
import { sanitizeHtml } from '../../utils/validation';
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

/**
 * Auto-enhance HTML content for blog readability:
 * - Tags paragraphs starting with 👉 as .blog-callout (highlighted)
 * - Removes the duplicated H1 if present (the page already shows the title)
 * - Adds rel="noopener" to external links
 */
const enhanceBlogHtml = (html: string): string => {
  if (!html) return '';
  if (typeof window === 'undefined') return html;

  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Strip leading H1 (avoid duplicating the article title shown above the content)
  const firstH1 = doc.querySelector('h1');
  if (firstH1) firstH1.remove();

  // Tag 👉 paragraphs as callouts
  doc.querySelectorAll('p').forEach((p) => {
    const text = (p.textContent || '').trim();
    if (text.startsWith('👉') || text.startsWith('💡') || text.startsWith('⚠️') || text.startsWith('✅')) {
      p.classList.add('blog-callout');
    }
  });

  // Secure external links
  doc.querySelectorAll('a[href^="http"]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (!href.includes('ainspiration.eu')) {
      a.setAttribute('rel', 'noopener noreferrer');
      if (!a.hasAttribute('target')) a.setAttribute('target', '_blank');
    }
  });

  return doc.body.innerHTML;
};

interface StepSection {
  title: string;
  subsections: Array<{ title: string; content: string }>;
}

export default function EnhancedBlogContent({ content }: EnhancedBlogContentProps) {
  const sanitizedContent = useMemo(() => sanitizeHtml(content), [content]);
  const enhancedContent = useMemo(() => enhanceBlogHtml(sanitizedContent), [sanitizedContent]);

  const isStepByStepGuide = useMemo(() => {
    const lower = sanitizedContent.toLowerCase();
    return (
      /étape\s*\d|step\s*\d|stap\s*\d/i.test(lower) ||
      (lower.includes('étape') && lower.includes('guide'))
    );
  }, [sanitizedContent]);

  const extractStepSections = (htmlContent: string): { intro: string; steps: StepSection[]; conclusion: string } => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const steps: StepSection[] = [];
    let conclusion = '';

    // Get intro (everything before first H2)
    let intro = '';
    let node = doc.body.firstChild;
    while (node) {
      if (node instanceof HTMLElement && node.tagName === 'H2') break;
      if (node instanceof HTMLElement) intro += node.outerHTML;
      else if (node.textContent?.trim()) intro += node.textContent;
      node = node.nextSibling;
    }

    // Group H2 > H3 hierarchy
    const h2s = doc.querySelectorAll('h2');
    h2s.forEach((h2) => {
      const stepTitle = h2.textContent || '';
      const isConclusion = stepTitle.toLowerCase().includes('conclusion');

      if (isConclusion) {
        let el = h2.nextElementSibling;
        while (el && el.tagName !== 'H2') {
          conclusion += el.outerHTML;
          el = el.nextElementSibling;
        }
        return;
      }

      const subsections: Array<{ title: string; content: string }> = [];
      let el = h2.nextElementSibling;

      // Collect content directly under H2 (before first H3)
      let directContent = '';
      while (el && el.tagName !== 'H2' && el.tagName !== 'H3') {
        directContent += el.outerHTML;
        el = el.nextElementSibling;
      }
      if (directContent) {
        subsections.push({ title: '', content: directContent });
      }

      // Collect H3 subsections
      while (el && el.tagName !== 'H2') {
        if (el.tagName === 'H3') {
          const subTitle = el.textContent || '';
          let subContent = '';
          el = el.nextElementSibling;
          while (el && el.tagName !== 'H2' && el.tagName !== 'H3') {
            subContent += el.outerHTML;
            el = el.nextElementSibling;
          }
          subsections.push({ title: subTitle, content: subContent });
        } else {
          el = el.nextElementSibling;
        }
      }

      steps.push({ title: stepTitle, subsections });
    });

    return { intro, steps, conclusion };
  };

  // Removed: extractMetrics. It used to scrape any "%" from the article and
  // labelled them all as "Amélioration" without any context, producing
  // misleading banners like "30 % Amélioration / 4 % Amélioration / 35 % Amélioration"
  // that didn't reflect the actual article content.
  // Percentages stay in the prose where they have their proper context.

  const getIconForSection = (title: string, index: number) => {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('avantage') || lowerTitle.includes('bénéfice')) return CheckCircle;
    if (lowerTitle.includes('roi') || lowerTitle.includes('coût') || lowerTitle.includes('suivi')) return DollarSign;
    if (lowerTitle.includes('temps') || lowerTitle.includes('rapide')) return Clock;
    if (lowerTitle.includes('performance') || lowerTitle.includes('résultat')) return TrendingUp;
    if (lowerTitle.includes('utilisateur') || lowerTitle.includes('client') || lowerTitle.includes('équipe')) return Users;
    if (lowerTitle.includes('analyse') || lowerTitle.includes('données') || lowerTitle.includes('évaluation')) return BarChart3;
    if (lowerTitle.includes('innovation') || lowerTitle.includes('créativité') || lowerTitle.includes('amélioration')) return Lightbulb;
    if (lowerTitle.includes('sécurité') || lowerTitle.includes('protection') || lowerTitle.includes('infrastructure')) return Shield;
    if (lowerTitle.includes('global') || lowerTitle.includes('international')) return Globe;
    if (lowerTitle.includes('intelligence') || lowerTitle.includes('ai') || lowerTitle.includes('ia') || lowerTitle.includes('technologie') || lowerTitle.includes('sélection')) return Brain;
    if (lowerTitle.includes('mise en') || lowerTitle.includes('pilote') || lowerTitle.includes('déploiement')) return Zap;
    if (lowerTitle.includes('objectif') || lowerTitle.includes('besoin')) return Target;

    const icons = [Target, Zap, CheckCircle, TrendingUp, Lightbulb, BarChart3];
    return icons[index % icons.length];
  };

  const stepColors = [
    { bg: 'bg-blue-600', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', ring: 'ring-blue-100' },
    { bg: 'bg-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600', ring: 'ring-indigo-100' },
    { bg: 'bg-purple-600', light: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', ring: 'ring-purple-100' },
    { bg: 'bg-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', ring: 'ring-emerald-100' },
    { bg: 'bg-orange-600', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', ring: 'ring-orange-100' },
    { bg: 'bg-pink-600', light: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600', ring: 'ring-pink-100' },
  ];

  // ── Step-by-step guide layout ──
  if (isStepByStepGuide) {
    const { intro, steps, conclusion } = extractStepSections(sanitizedContent);

    return (
      <div className="space-y-10">
        {/* Introduction */}
        {intro && (
          <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-8 md:p-12 border border-primary-100">
            <div
              className="blog-prose"
              dangerouslySetInnerHTML={{ __html: intro }}
            />
          </div>
        )}

        {/* Steps timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block" />

          <div className="space-y-8">
            {steps.map((step, index) => {
              const color = stepColors[index % stepColors.length];
              const Icon = getIconForSection(step.title, index);
              const stepNumber = index + 1;

              return (
                <div key={index} className="relative md:pl-16">
                  {/* Step number circle */}
                  <div className={`hidden md:flex absolute left-0 top-0 w-12 h-12 ${color.bg} text-white rounded-full items-center justify-center font-bold text-lg shadow-lg ring-4 ${color.ring} z-10`}>
                    {stepNumber}
                  </div>

                  {/* Step card */}
                  <div className={`${color.light} rounded-xl border ${color.border} overflow-hidden`}>
                    {/* Step header */}
                    <div className="px-6 py-5 md:px-8 md:py-6">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`md:hidden inline-flex items-center justify-center w-8 h-8 ${color.bg} text-white rounded-full font-bold text-sm`}>
                          {stepNumber}
                        </span>
                        <Icon className={`w-5 h-5 ${color.text} hidden md:block`} />
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                          {step.title}
                        </h2>
                      </div>
                    </div>

                    {/* Step content */}
                    <div className="bg-white px-6 py-6 md:px-8 md:py-8">
                      {step.subsections.map((sub, subIdx) => (
                        <div key={subIdx} className={subIdx > 0 ? 'mt-6 pt-6 border-t border-gray-100' : ''}>
                          {sub.title && (
                            <h3 className={`text-lg font-semibold ${color.text} mb-3`}>
                              {sub.title}
                            </h3>
                          )}
                          <div
                            className="blog-prose"
                            dangerouslySetInnerHTML={{ __html: sub.content }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conclusion */}
        {conclusion && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Conclusion</h2>
            <div
              className="blog-prose blog-prose-invert"
              dangerouslySetInnerHTML={{ __html: conclusion }}
            />
          </div>
        )}
      </div>
    );
  }

  // ── Single-column readable layout (default for all non step-by-step articles) ──
  return (
    <div className="space-y-10">
      {/* Article body — single column, optimal reading width, clear typography */}
      <article
        className="blog-prose"
        dangerouslySetInnerHTML={{ __html: enhancedContent }}
      />
    </div>
  );
}
