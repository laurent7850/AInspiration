import React, { useState } from 'react';
import {
  Scan,
  FileSearch,
  PieChart,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  Clock,
  Shield,
  Zap,
  Users,
  FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import AuditForm from '../components/AuditForm';
import { getServiceSchema, getFAQSchema } from '../config/seoConfig';

const STEP_ICONS = [Scan, FileSearch, PieChart, Lightbulb];

export default function AuditPage() {
  const { t } = useTranslation('audit');
  const [showAuditForm, setShowAuditForm] = useState(false);

  const guaranteeIcons = [Clock, Shield, FileText, Users];
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

      {/* Hero */}
      <section className="pt-20 pb-16 bg-gradient-to-b from-indigo-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Clock className="w-4 h-4" />
              {t('page.badge')}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              {t('page.heroTitle')}{' '}
              <span className="text-indigo-600">{t('page.heroHighlight')}</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('page.heroDescription')}
            </p>

            <button
              onClick={() => setShowAuditForm(true)}
              className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center gap-3"
            >
              {t('page.ctaButton')}
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              {guaranteeKeys.map((key, i) => {
                const Icon = guaranteeIcons[i];
                return (
                  <div key={key} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-green-500" />
                    <span>{t(`page.guarantees.${key}`)}</span>
                  </div>
                );
              })}
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

      <AuditForm
        isOpen={showAuditForm}
        onClose={() => setShowAuditForm(false)}
      />
    </>
  );
}
