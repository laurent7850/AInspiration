import React, { useState } from 'react';
import {
  Scan,
  FileSearch,
  PieChart,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  Shield,
  Zap,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import AuditForm from '../components/AuditForm';
import { getServiceSchema, getFAQSchema } from '../config/seoConfig';

const STEP_ICONS = [Scan, FileSearch, PieChart, Lightbulb];

export default function AuditPage() {
  const { t } = useTranslation('audit');
  const [showAuditForm, setShowAuditForm] = useState(false);

  const guaranteeKeys = ['results', 'free', 'report', 'expert'] as const;

  const auditFAQs = [
    { question: "L'audit IA est-il vraiment gratuit ?", answer: "Oui, l'audit est 100% gratuit et sans engagement. Nous analysons votre activité et vous livrons un plan d'action concret avec les gains estimés." },
    { question: "Combien de temps dure l'audit IA ?", answer: "L'audit complet est livré en 24h. Nous analysons vos processus, identifions les tâches automatisables et estimons le ROI potentiel." },
    { question: "Que contient le rapport d'audit ?", answer: "Un diagnostic complet de vos processus, l'identification des tâches automatisables par l'IA, une estimation du ROI et un plan d'action détaillé." },
    { question: "Faut-il des compétences techniques ?", answer: "Non, aucune compétence technique n'est requise. Nous nous occupons de tout et vous accompagnons à chaque étape." }
  ];

  const auditSchema = [
    getServiceSchema("Audit IA Gratuit pour PME", "Analyse complète de votre activité en 24h : identification des processus automatisables, estimation du ROI et plan d'action personnalisé. 100% gratuit, sans engagement."),
    getFAQSchema(auditFAQs)
  ];

  return (
    <>
      <SEOHead
        title={t('page.seoTitle')}
        description={t('page.seoDescription')}
        schema={auditSchema}
      />

      {/* Hero — Aurora declension (teal ground: the action page) */}
      <section className="relative bg-aurora-teal text-white overflow-hidden pt-28 lg:pt-36 pb-16 lg:pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-display font-light text-4xl sm:text-5xl lg:text-7xl text-white leading-[1.06] mb-6">
              {t('page.heroTitle')}{' '}
              <span className="text-aurora-teal">{t('page.heroHighlight')}</span>
            </h1>

            <p className="text-lg sm:text-xl text-indigo-100/85 max-w-[55ch] leading-relaxed mb-10">
              {t('page.heroDescription')}
            </p>

            <button
              onClick={() => setShowAuditForm(true)}
              className="group inline-flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-500 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_18px_45px_-12px_rgba(79,70,229,0.65)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {t('page.ctaButton')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <div className="mt-10 flex flex-wrap gap-8">
              {guaranteeKeys.map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-aurora-teal" />
                  <span className="text-sm text-indigo-100/80">{t(`page.guarantees.${key}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            {t('page.howTitle')}
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            {t('page.howSubtitle')}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3, 4].map((id) => {
              const Icon = STEP_ICONS[id - 1];
              return (
                <div
                  key={id}
                  className="relative flex flex-col p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                    {id}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t(`page.stepsDetailed.${id}.title`)}</h3>
                  <p className="text-gray-600">{t(`page.stepsDetailed.${id}.desc`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ce que vous recevez */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              {t('page.receiveTitle')}
            </h2>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {t('page.reportTitle')}
                  </h3>
                  <ul className="space-y-3">
                    {(t('page.reportItems', { returnObjects: true }) as string[]).map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {t('page.goFurtherTitle')}
                  </h3>
                  <div className="bg-indigo-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-indigo-900 mb-2">
                      {t('page.packTitle')}
                    </h4>
                    <p className="text-indigo-700 mb-3">
                      {t('page.packPrice')}
                    </p>
                    <p className="text-sm text-indigo-600">
                      {t('page.packDescription')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secteurs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            {t('page.whoTitle')}
          </h2>
          <div className="max-w-2xl mx-auto">
            <ul className="space-y-3">
              {(t('page.whoSectors', { returnObjects: true }) as string[]).map((sector: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-lg">
                  <CheckCircle className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{sector}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 bg-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('page.finalCtaTitle')}
          </h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
            {t('page.finalCtaSubtitle')}
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm text-center min-w-[120px]">
              <Zap className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">24h</div>
              <div className="text-indigo-100 text-sm">{t('page.stats.delivery')}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm text-center min-w-[120px]">
              <Shield className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">0 €</div>
              <div className="text-indigo-100 text-sm">{t('page.stats.noCommitment')}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm text-center min-w-[120px]">
              <Users className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">50+</div>
              <div className="text-indigo-100 text-sm">{t('page.stats.smeHelped')}</div>
            </div>
          </div>

          <button
            onClick={() => setShowAuditForm(true)}
            className="bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all duration-200 shadow-lg inline-flex items-center gap-3"
          >
            {t('page.ctaButton')}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">{t('page.faq.title')}</h2>
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <details key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4 group">
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                  {t(`page.faq.items.${i}.q`)}
                  <span className="text-indigo-600 group-open:rotate-180 transition-transform">&#9660;</span>
                </summary>
                <p className="mt-3 text-gray-600 leading-relaxed">{t(`page.faq.items.${i}.a`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <AuditForm
        isOpen={showAuditForm}
        onClose={() => setShowAuditForm(false)}
      />
    </>
  );
}
