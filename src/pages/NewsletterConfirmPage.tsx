import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, AlertCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { useLocalizedPath } from '../hooks/useLocalizedPath';

/**
 * Landing page of the newsletter confirmation link
 * (GET /api/newsletter-subscribers/confirm redirects here with ?status=ok|invalid|error).
 */
export default function NewsletterConfirmPage() {
  const { t } = useTranslation('forms');
  const { localizedPath } = useLocalizedPath();
  const [params] = useSearchParams();
  const ok = params.get('status') === 'ok';

  return (
    <>
      <SEOHead title={t('newsletter.confirmPage.seoTitle')} description={t('newsletter.confirmPage.seoDescription')} noindex />
      <section className="bg-canvas min-h-[60vh] pt-32 pb-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <div
            className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${
              ok ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {ok ? <CheckCircle className="h-8 w-8" aria-hidden="true" /> : <AlertCircle className="h-8 w-8" aria-hidden="true" />}
          </div>
          <h1 className="font-display font-light text-3xl sm:text-4xl text-ink leading-[1.1] mb-4">
            {ok ? t('newsletter.confirmPage.okTitle') : t('newsletter.confirmPage.invalidTitle')}
          </h1>
          <p className="text-lg text-secondary leading-relaxed mb-8">
            {ok ? t('newsletter.confirmPage.okBody') : t('newsletter.confirmPage.invalidBody')}
          </p>
          <Link
            to={localizedPath('/')}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-medium text-white transition-colors hover:bg-accent-light"
          >
            {t('newsletter.confirmPage.back')}
          </Link>
        </div>
      </section>
    </>
  );
}
