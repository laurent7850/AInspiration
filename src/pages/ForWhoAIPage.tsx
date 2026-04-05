import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import {
  Users,
  User,
  Building,
  ShoppingCart,
  Briefcase,
  Hammer,
  Factory,
  Clipboard,
  Check,
  TrendingUp,
  Clock,
  DollarSign,
  Shield,
  Zap
} from 'lucide-react';
import AuditForm from '../components/AuditForm';

const ForWhoAIPage: React.FC = () => {
  const { t } = useTranslation('forWho');
  const [showStartForm, setShowStartForm] = useState(false);

  const freelanceBenefits = t('sizes.freelance.benefits', { returnObjects: true }) as string[];
  const tpeBenefits = t('sizes.tpe.benefits', { returnObjects: true }) as string[];
  const pmeBenefits = t('sizes.pme.benefits', { returnObjects: true }) as string[];
  const scalableBenefits = t('adaptation.scalable.benefits', { returnObjects: true }) as string[];
  const riskFreeBenefits = t('adaptation.riskFree.benefits', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={t('seo.title')}
        description={t('seo.description')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl mb-8">
          {t('hero.title')}
        </h1>

        {/* Introduction */}
        <div className="bg-indigo-50 rounded-xl p-8 mb-12">
          <p className="text-xl text-gray-700 mb-4 max-w-3xl">
            <span className="font-semibold text-indigo-700">{t('hero.introBold')}</span>{t('hero.introText')}
          </p>
          <p className="text-lg text-gray-600">
            {t('hero.introSub')}
          </p>
        </div>

        {/* Business Size Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('sizes.sectionTitle')}</h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('sizes.freelance.title')}</h3>
              <p className="text-gray-600 mb-4">
                {t('sizes.freelance.description')}
              </p>
              <ul className="space-y-2">
                {freelanceBenefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Building className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('sizes.tpe.title')}</h3>
              <p className="text-gray-600 mb-4">
                {t('sizes.tpe.description')}
              </p>
              <ul className="space-y-2">
                {tpeBenefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('sizes.pme.title')}</h3>
              <p className="text-gray-600 mb-4">
                {t('sizes.pme.description')}
              </p>
              <ul className="space-y-2">
                {pmeBenefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Adaptation Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('adaptation.sectionTitle')}</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t('adaptation.scalable.title')}</h3>
              </div>
              <p className="text-gray-600 mb-3">
                {t('adaptation.scalable.description')}
              </p>
              <ul className="space-y-2">
                {scalableBenefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t('adaptation.riskFree.title')}</h3>
              </div>
              <p className="text-gray-600 mb-3">
                {t('adaptation.riskFree.description')}
              </p>
              <ul className="space-y-2">
                {riskFreeBenefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Sectors Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('sectors.sectionTitle')}</h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t('sectors.commerce.title')}</h3>
              </div>
              <p className="text-gray-600">{t('sectors.commerce.description')}</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t('sectors.services.title')}</h3>
              </div>
              <p className="text-gray-600">{t('sectors.services.description')}</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Hammer className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t('sectors.craft.title')}</h3>
              </div>
              <p className="text-gray-600">{t('sectors.craft.description')}</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Factory className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t('sectors.industry.title')}</h3>
              </div>
              <p className="text-gray-600">{t('sectors.industry.description')}</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clipboard className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t('sectors.liberal.title')}</h3>
              </div>
              <p className="text-gray-600">{t('sectors.liberal.description')}</p>
            </div>
          </div>
        </section>

        {/* Key Benefits Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('keyBenefits.sectionTitle')}</h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('keyBenefits.accessibility.title')}</h3>
              <p className="text-gray-600">{t('keyBenefits.accessibility.description')}</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('keyBenefits.timeSaving.title')}</h3>
              <p className="text-gray-600">{t('keyBenefits.timeSaving.description')}</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('keyBenefits.roi.title')}</h3>
              <p className="text-gray-600">{t('keyBenefits.roi.description')}</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('keyBenefits.adaptability.title')}</h3>
              <p className="text-gray-600">{t('keyBenefits.adaptability.description')}</p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('testimonials.sectionTitle')}</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-600 italic mb-4">
                "{t('testimonials.thomas.quote')}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('testimonials.thomas.name')}</p>
                  <p className="text-sm text-gray-500">{t('testimonials.thomas.role')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-600 italic mb-4">
                "{t('testimonials.marie.quote')}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Building className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('testimonials.marie.name')}</p>
                  <p className="text-sm text-gray-500">{t('testimonials.marie.role')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-indigo-600 rounded-xl p-8 text-white">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">{t('cta.title')}</h2>
            <p className="text-indigo-100 mb-6">
              {t('cta.description')}
            </p>
            <button
              onClick={() => setShowStartForm(true)}
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
            >
              {t('cta.button')}
            </button>
          </div>
        </div>
      </div>

      <AuditForm
        isOpen={showStartForm}
        onClose={() => setShowStartForm(false)}
      />
    </div>
  );
};

export default ForWhoAIPage;
