import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';

export default function CGUPage() {
  const { t } = useTranslation('legal');

  return (
    <>
      <SEOHead
        title={t('cgu.seo.title')}
        description={t('cgu.seo.description')}
        noindex
      />
      <div className="relative bg-aurora-quiet text-white overflow-hidden pt-28 lg:pt-32 pb-10 lg:pb-14">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-white leading-[1.06]">{t('cgu.pageTitle')}</h1>
        </div>
      </div>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">

          <div className="prose prose-gray max-w-none space-y-6">
            <p className="text-gray-500 text-sm">{t('cgu.lastUpdated')}</p>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgu.s1_title')}</h2>
            <p className="text-gray-600">
              {t('cgu.s1_body')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgu.s2_title')}</h2>
            <p className="text-gray-600">
              {t('cgu.s2_body')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgu.s3_title')}</h2>
            <p className="text-gray-600">
              {t('cgu.s3_body')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgu.s4_title')}</h2>
            <p className="text-gray-600">
              {t('cgu.s4_intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>{t('cgu.s4_li1')}</li>
              <li>{t('cgu.s4_li2')}</li>
              <li>{t('cgu.s4_li3')}</li>
              <li>{t('cgu.s4_li4')}</li>
              <li>{t('cgu.s4_li5')}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgu.s5_title')}</h2>
            <p className="text-gray-600">
              {t('cgu.s5_body')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgu.s6_title')}</h2>
            <p className="text-gray-600">
              {t('cgu.s6_body')}{' '}
              <a href="/privacy" className="text-indigo-600 hover:underline">{t('cgu.s6_link')}</a>.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgu.s7_title')}</h2>
            <p className="text-gray-600">
              {t('cgu.s7_body')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgu.s8_title')}</h2>
            <p className="text-gray-600">
              {t('cgu.s8_body')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgu.s9_title')}</h2>
            <p className="text-gray-600">
              {t('cgu.s9_body')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgu.s10_title')}</h2>
            <p className="text-gray-600">
              {t('cgu.s10_body')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('cgu.s11_title')}</h2>
            <p className="text-gray-600">
              {t('cgu.s11_body')}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
