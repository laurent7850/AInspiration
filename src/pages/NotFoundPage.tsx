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
      <section className="py-20 bg-gradient-to-b from-indigo-50 to-white min-h-[60vh] flex items-center">
        <div className="container mx-auto px-4 text-center max-w-lg">
          <div className="text-8xl font-bold text-indigo-100 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('notFound.title')}</h1>
          <p className="text-gray-600 mb-8">
            {t('notFound.message')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              {t('notFound.home')}
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('notFound.back')}
            </button>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
