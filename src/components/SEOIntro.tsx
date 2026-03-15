import { useTranslation } from 'react-i18next';

export default function SEOIntro() {
  const { t } = useTranslation('common');

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
          {t('seoIntro.title')}
        </h2>
        <div className="prose prose-lg prose-gray max-w-none text-gray-600 space-y-6">
          <p>{t('seoIntro.p1')}</p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8">
            {t('seoIntro.subtitle1')}
          </h3>
          <p>{t('seoIntro.p2')}</p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8">
            {t('seoIntro.subtitle2')}
          </h3>
          <p>{t('seoIntro.p3')}</p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8">
            {t('seoIntro.subtitle3')}
          </h3>
          <p>{t('seoIntro.p4')}</p>
        </div>
      </div>
    </section>
  );
}
