import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import { Calendar, Clock, ArrowRight, CheckCircle, FileText, Bot, Zap, TrendingUp, DollarSign, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuditForm from '../components/AuditForm';
import BlogCTA from '../components/blog/BlogCTA';

const ThierryBlogPage: React.FC = () => {
  const { t } = useTranslation('blog');
  const [showStartForm, setShowStartForm] = useState(false);
  const navigate = useNavigate();

  const problems = t('thierry.challenge.problems', { returnObjects: true }) as string[];
  const successKeys = t('thierry.successKeys.keys', { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>;
  const gettingStartedSteps = t('thierry.gettingStarted.steps', { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>;

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <SEOHead
        title={t('thierry.seo.title')}
        description={t('thierry.seo.description')}
      />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="mb-8 text-sm">
            <ol className="flex items-center space-x-1">
              <li><a href="/" className="text-gray-500 hover:text-indigo-600">{t('thierry.breadcrumb.home')}</a></li>
              <li><span className="text-gray-500 mx-1">/</span></li>
              <li><a href="/blog" className="text-gray-500 hover:text-indigo-600">{t('thierry.breadcrumb.blog')}</a></li>
              <li><span className="text-gray-500 mx-1">/</span></li>
              <li className="text-indigo-600 font-medium">{t('thierry.breadcrumb.current')}</li>
            </ol>
          </nav>

          {/* Blog Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('thierry.header.title')}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {t('thierry.header.date')}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {t('thierry.header.readTime')}
              </span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative h-[400px] rounded-2xl overflow-hidden mb-12 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&auto=format&fit=crop&q=80"
              alt={t('thierry.header.imageAlt')}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* Challenge Section */}
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-8 md:p-12 mb-12 border border-indigo-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('thierry.challenge.title')}</h2>

            <div className="prose prose-lg max-w-none text-gray-700">
              <p>{t('thierry.challenge.intro')}</p>

              <p className="text-xl italic text-indigo-700 bg-white/50 p-4 rounded-lg">
                "{t('thierry.challenge.quote')}"
              </p>

              <p>{t('thierry.challenge.problemsIntro')}</p>

              <ul className="space-y-2">
                {problems.map((problem, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                    <span>{problem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Solution Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('thierry.solution.title')}</h2>

            <p className="text-lg text-gray-700 mb-8">
              {t('thierry.solution.intro')}
            </p>

            <div className="bg-indigo-50 p-6 rounded-lg my-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t('thierry.solution.detailTitle')}</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Bot className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong className="text-gray-900">{t('thierry.solution.extraction.title')}</strong>
                    <p className="text-gray-700">{t('thierry.solution.extraction.description')}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong className="text-gray-900">{t('thierry.solution.generation.title')}</strong>
                    <p className="text-gray-700">{t('thierry.solution.generation.description')}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong className="text-gray-900">{t('thierry.solution.tracking.title')}</strong>
                    <p className="text-gray-700">{t('thierry.solution.tracking.description')}</p>
                  </div>
                </li>
              </ul>
            </div>

            <p className="text-lg text-gray-700">
              {t('thierry.solution.outro')}
            </p>
          </div>

          {/* Results Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('thierry.results.title')}</h2>
            <p className="text-xl text-gray-600">
              {t('thierry.results.subtitle')}
            </p>
          </div>

          {/* Results Section */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-8 md:p-12 mb-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-bold mb-2">{t('thierry.results.time.value')}</div>
                <h3 className="text-xl font-semibold mb-2">{t('thierry.results.time.title')}</h3>
                <p className="text-indigo-100">{t('thierry.results.time.description')}</p>
              </div>
              <div className="text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-bold mb-2">{t('thierry.results.treasury.value')}</div>
                <h3 className="text-xl font-semibold mb-2">{t('thierry.results.treasury.title')}</h3>
                <p className="text-indigo-100">{t('thierry.results.treasury.description')}</p>
              </div>
              <div className="text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-bold mb-2">{t('thierry.results.errors.value')}</div>
                <h3 className="text-xl font-semibold mb-2">{t('thierry.results.errors.title')}</h3>
                <p className="text-indigo-100">{t('thierry.results.errors.description')}</p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-indigo-50 rounded-xl p-8 mb-12">
            <blockquote className="text-xl text-gray-700 italic mb-6">
              "{t('thierry.testimonial.quote')}"
            </blockquote>
            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&auto=format&fit=crop&q=80"
                alt={t('thierry.testimonial.imageAlt')}
                loading="lazy"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">{t('thierry.testimonial.name')}</p>
                <p className="text-gray-600">{t('thierry.testimonial.role')}</p>
              </div>
            </div>
          </div>

          {/* Impact Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('thierry.impact.title')}</h2>

            <p className="text-lg text-gray-700 mb-8">
              {t('thierry.impact.intro')}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                  {t('thierry.impact.clientExperience.title')}
                </h3>
                <p className="text-gray-700">{t('thierry.impact.clientExperience.description')}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  {t('thierry.impact.financialTracking.title')}
                </h3>
                <p className="text-gray-700">{t('thierry.impact.financialTracking.description')}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-purple-600" />
                  {t('thierry.impact.stress.title')}
                </h3>
                <p className="text-gray-700">{t('thierry.impact.stress.description')}</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Target className="w-6 h-6 text-indigo-600" />
                  {t('thierry.impact.focus.title')}
                </h3>
                <p className="text-gray-700">{t('thierry.impact.focus.description')}</p>
              </div>
            </div>
          </div>

          {/* Success Keys */}
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-8 md:p-12 mb-12 border border-indigo-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t('thierry.successKeys.title')}</h2>

            <p className="text-lg text-gray-700 mb-8 text-center">
              {t('thierry.successKeys.subtitle')}
            </p>

            <div className="space-y-4">
              {successKeys.map((key, index) => (
                <div key={index} className="flex items-start gap-4 bg-white p-4 rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{key.title}</h3>
                    <p className="text-gray-700">{key.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Getting Started */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('thierry.gettingStarted.title')}</h2>
            <p className="text-xl text-gray-600">
              {t('thierry.gettingStarted.subtitle')}
            </p>
          </div>

          {/* Steps to Start */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {gettingStartedSteps.map((step, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-full flex items-center justify-center text-xl font-bold text-white mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          <BlogCTA variant="audit" />

          {/* Related Articles */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {t('thierry.relatedArticles.title')}
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=80"
                  alt={t('thierry.relatedArticles.article1.imageAlt')}
                  loading="lazy"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('thierry.relatedArticles.article1.title')}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {t('thierry.relatedArticles.article1.description')}
                  </p>
                  <button
                    onClick={() => navigate('/blog/processus-administratifs-automatisation')}
                    className="text-indigo-600 font-medium flex items-center gap-1"
                  >
                    {t('thierry.relatedArticles.article1.button')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&auto=format&fit=crop&q=80"
                  alt={t('thierry.relatedArticles.article2.imageAlt')}
                  loading="lazy"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('thierry.relatedArticles.article2.title')}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {t('thierry.relatedArticles.article2.description')}
                  </p>
                  <button
                    onClick={() => navigate('/blog/roi-transformation-numerique')}
                    className="text-indigo-600 font-medium flex items-center gap-1"
                  >
                    {t('thierry.relatedArticles.article2.button')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Author Bio */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&auto=format&fit=crop&q=80"
                alt={t('thierry.author.imageAlt')}
                loading="lazy"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-gray-900 mb-1">{t('thierry.author.name')}</p>
                <p className="text-gray-600 text-sm mb-2">{t('thierry.author.role')}</p>
                <p className="text-gray-600 text-sm">
                  {t('thierry.author.bio')}
                </p>
              </div>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center justify-between">
            <div className="text-gray-700 font-medium">
              {t('thierry.share')}
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-blue-600 text-white rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
              </button>
              <button className="p-2 bg-blue-400 text-white rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.053 10.053 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.92 4.92 0 001.522 6.574 4.883 4.883 0 01-2.23-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </button>
              <button className="p-2 bg-blue-700 text-white rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      <AuditForm
        isOpen={showStartForm}
        onClose={() => setShowStartForm(false)}
      />
    </section>
  );
};

export default ThierryBlogPage;
