import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation('common');

  useEffect(() => {
    const consent = Cookies.get('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptAll = () => {
    Cookies.set('cookie-consent', 'all', { expires: 365 });
    Cookies.set('analytics-enabled', 'true', { expires: 365 });
    Cookies.set('marketing-enabled', 'true', { expires: 365 });
    setIsVisible(false);
  };

  const acceptEssential = () => {
    Cookies.set('cookie-consent', 'essential', { expires: 365 });
    Cookies.set('analytics-enabled', 'false', { expires: 365 });
    Cookies.set('marketing-enabled', 'false', { expires: 365 });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('cookies.title')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('cookies.description')}{' '}
              <a href="/privacy" className="text-indigo-600 hover:text-indigo-700">
                {t('cookies.privacyPolicy')}
              </a>.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={acceptEssential}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {t('cookies.acceptEssential')}
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              {t('cookies.acceptAll')}
            </button>
          </div>
          <button
            onClick={acceptEssential}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            aria-label={t('cookies.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}