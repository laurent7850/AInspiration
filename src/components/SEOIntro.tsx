import { useTranslation } from 'react-i18next';

export default function SEOIntro() {
  const { t } = useTranslation('common');

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-ink tracking-tight mb-8">
          {t('seoIntro.title')}
        </h2>
        <div className="space-y-8 text-secondary leading-relaxed">
          <p className="text-lg">{t('seoIntro.p1')}</p>

          <div>
            <h3 className="text-xl font-semibold text-ink tracking-tight mb-3">
              {t('seoIntro.subtitle1')}
            </h3>
            <p>{t('seoIntro.p2')}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-ink tracking-tight mb-3">
              {t('seoIntro.subtitle2')}
            </h3>
            <p>{t('seoIntro.p3')}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-ink tracking-tight mb-3">
              {t('seoIntro.subtitle3')}
            </h3>
            <p>{t('seoIntro.p4')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
