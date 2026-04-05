import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';

export default function MentionsLegalesPage() {
  const { t } = useTranslation('legal');

  return (
    <>
      <SEOHead
        title={t('mentions.seo.title')}
        description={t('mentions.seo.description')}
        noindex
      />
      <section className="py-20 bg-gradient-to-b from-indigo-50 to-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('mentions.pageTitle')}</h1>

          <div className="prose prose-gray max-w-none space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('mentions.s1_title')}</h2>
            <p className="text-gray-600">
              {t('mentions.s1_intro')}<br />
              <strong>Distr'Action SPRL</strong><br />
              Chauss\u00e9e Brunehault 27, 7041 Givry, Belgique<br />
              {t('mentions.s1_tva')}<br />
              {t('mentions.s1_email_label')} : <a href="mailto:info@ainspiration.eu" className="text-indigo-600 hover:underline">info@ainspiration.eu</a><br />
              {t('mentions.s1_phone_label')} : +32 477 94 28 65
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('mentions.s2_title')}</h2>
            <p className="text-gray-600">
              {t('mentions.s2_body')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('mentions.s3_title')}</h2>
            <p className="text-gray-600">
              {t('mentions.s3_intro')}<br />
              <strong>Hostinger International Ltd</strong><br />
              {t('mentions.s3_host_address')}<br />
              {t('mentions.s3_host_web')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('mentions.s4_title')}</h2>
            <p className="text-gray-600">
              {t('mentions.s4_body')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('mentions.s5_title')}</h2>
            <p className="text-gray-600">
              {t('mentions.s5_body')}{' '}
              <a href="/privacy" className="text-indigo-600 hover:underline">{t('mentions.s5_link')}</a>.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('mentions.s6_title')}</h2>
            <p className="text-gray-600">
              {t('mentions.s6_body')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900">{t('mentions.s7_title')}</h2>
            <p className="text-gray-600">
              {t('mentions.s7_body')}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
