import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import HomeButton from '../HomeButton';
import ScrollToTop from '../ScrollToTop';
import CookieBanner from '../CookieBanner';
import ChatbotN8n from '../ChatbotN8n';
import PopupNewsletter from '../PopupNewsletter';
import Breadcrumbs from './Breadcrumbs';
import NotificationToast from '../ui/NotificationToast';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollToTop />
      
      {/* Header fixe */}
      <Header />
      <HomeButton />
      
      {/* Contenu principal */}
      <main className="flex-grow pt-16"> {/* pt-16 pour compenser la hauteur du header fixe */}
        {!isHomePage && (
          <div className="container mx-auto px-4 py-4">
            <Breadcrumbs />
          </div>
        )}
        
        {children}
      </main>
      
      {/* Footer et éléments flottants */}
      <Footer />
      <CookieBanner />
      <ChatbotN8n />
      <PopupNewsletter />
      <NotificationToast />
    </div>
  );
};

export default MainLayout;