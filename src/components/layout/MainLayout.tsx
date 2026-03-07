import React, { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import HomeButton from '../HomeButton';
import ScrollToTop from '../ScrollToTop';
import CookieBanner from '../CookieBanner';
import Breadcrumbs from './Breadcrumbs';
import NotificationToast from '../ui/NotificationToast';

// Deferred: not needed for initial render
const ChatbotN8n = lazy(() => import('../ChatbotN8n'));
const PopupNewsletter = lazy(() => import('../PopupNewsletter'));

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  // Match /, /en, /en/, /nl, /nl/
  const isHomePage = /^\/(en|nl)?\/?$/.test(location.pathname);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollToTop />

      {/* Skip to content - Accessibilité */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg"
      >
        Aller au contenu principal
      </a>

      {/* Header fixe */}
      <Header />
      <HomeButton />

      {/* Contenu principal */}
      <main id="main-content" role="main" className="flex-grow pt-16">
        {!isHomePage && (
          <nav aria-label="Fil d'Ariane" className="container mx-auto px-4 py-4">
            <Breadcrumbs />
          </nav>
        )}

        {children}
      </main>

      {/* Footer et éléments flottants */}
      <Footer />
      <CookieBanner />
      <Suspense fallback={null}>
        <ChatbotN8n />
      </Suspense>
      <Suspense fallback={null}>
        <PopupNewsletter />
      </Suspense>
      <NotificationToast />
    </div>
  );
};

export default MainLayout;
