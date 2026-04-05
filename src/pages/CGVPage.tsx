import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';

export default function CGVPage() {
  const { t } = useTranslation('legal');

  return (
    <>
      <SEOHead
        title={t('cgv.seo.title')}
        description={t('cgv.seo.description')}
        noindex
      />
      <section className="py-20 bg-gradient-to-b from-indigo-50 to-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('cgv.pageTitle')}</h1>

          <div className="prose prose-gray max-w-none space-y-6">
            <p className="text-gray-500 text-sm">{t('cgv.lastUpdated')}</p>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgv.s1_title')}</h2>
            <p className="text-gray-600">
              {t('cgv.s1_body')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgv.s2_title')}</h2>
            <p className="text-gray-600">
              {t('cgv.s2_intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>{t('cgv.s2_li1')}</li>
              <li>{t('cgv.s2_li2')}</li>
              <li>{t('cgv.s2_li3')}</li>
              <li>{t('cgv.s2_li4')}</li>
              <li>{t('cgv.s2_li5')}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgv.s3_title')}</h2>
            <p className="text-gray-600">
              {t('cgv.s3_body1')}
            </p>
            <p className="text-gray-600">
              {t('cgv.s3_body2')}
            </p>
            <p className="text-gray-600">
              {t('cgv.s3_body3')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgv.s4_title')}</h2>
            <p className="text-gray-600">
              {t('cgv.s4_body')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgv.s5_title')}</h2>
            <p className="text-gray-600">
              {t('cgv.s5_body')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgv.s6_title')}</h2>
            <p className="text-gray-600">
              {t('cgv.s6_body')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgv.s7_title')}</h2>
            <p className="text-gray-600">
              {t('cgv.s7_body')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgv.s8_title')}</h2>
            <p className="text-gray-600">
              {t('cgv.s8_body')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgv.s9_title')}</h2>
            <p className="text-gray-600">
              {t('cgv.s9_body')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgv.s10_title')}</h2>
            <p className="text-gray-600">
              {t('cgv.s10_body')}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
