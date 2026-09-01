import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';

export default function NotFoundPage() {
  const { t } = useTranslation('pages');

  return (
    <>
      <SEOHead
        title={t('notFound.seo.title')}
        description={t('notFound.seo.description')}
        noindex
      />
      <section className="bg-aurora-quiet pt-28 py-20 min-h-[60vh] flex items-center">
        <div className="container mx-auto px-4 text-center max-w-lg">
          <div className="font-display font-light text-8xl text-white/15 mb-4">404</div>
          <h1 className="font-display font-light text-2xl sm:text-3xl text-white mb-4">{t('notFound.title')}</h1>
          <p className="text-indigo-100/80 mb-8">
            {t('notFound.message')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-500 transition-colors"
            >
              <Home className="w-4 h-4" />
              {t('notFound.home')}
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white ring-1 ring-white/25 hover:ring-white/50 hover:bg-white/5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('notFound.back')}
            </button>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white ring-1 ring-white/25 hover:ring-white/50 hover:bg-white/5 transition-all"
            >
              <Search className="w-4 h-4" />
              {t('notFound.contact')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
