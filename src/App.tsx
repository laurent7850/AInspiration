import { Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import routes from './config/routes';
import LanguageHandler from './components/LanguageHandler';
import MainLayout from './components/layout/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import Analytics from './components/Analytics';
import PrivateRoute from './components/PrivateRoute';
import { PageSkeleton } from './components/ui/Skeleton';

// Fallback de chargement avec skeleton
const LoadingFallback = () => <PageSkeleton />;

const LANG_PREFIXES = ['en', 'nl'];

/**
 * Keeps i18n language and <html lang> in sync with the URL prefix.
 * - /en/* → English
 * - /nl/* → Dutch
 * - everything else → French (default)
 */
function LanguageSync() {
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const urlLang = LANG_PREFIXES.includes(segments[0]) ? segments[0] : 'fr';
    if (i18n.language !== urlLang) {
      i18n.changeLanguage(urlLang);
    }
    document.documentElement.lang = urlLang;
  }, [location.pathname, i18n]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Analytics />
      <LanguageSync />
      <MainLayout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* English routes under /en/* */}
            <Route path="/en/*" element={<LanguageHandler />} />
            {/* Dutch routes under /nl/* */}
            <Route path="/nl/*" element={<LanguageHandler />} />
            {/* Default French routes (no prefix) */}
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  route.private
                    ? <PrivateRoute><route.component /></PrivateRoute>
                    : <route.component />
                }
              />
            ))}
          </Routes>
        </Suspense>
      </MainLayout>
    </ErrorBoundary>
  );
}
