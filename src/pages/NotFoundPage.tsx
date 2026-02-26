import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function NotFoundPage() {
  return (
    <>
      <SEOHead title="Page non trouvée | AInspiration" description="Cette page n'existe pas." noindex />
      <section className="py-20 bg-gradient-to-b from-indigo-50 to-white min-h-[60vh] flex items-center">
        <div className="container mx-auto px-4 text-center max-w-lg">
          <div className="text-8xl font-bold text-indigo-200 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page non trouvée</h1>
          <p className="text-gray-600 mb-8">
            La page que vous cherchez n'existe pas ou a été déplacée.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Accueil
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Page précédente
            </button>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Search className="w-4 h-4" />
              Contact
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
