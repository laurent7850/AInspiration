import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { isProd, env } from '@/config/environment';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

function loadGA() {
  if (document.getElementById('ga-script')) return;

  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
  });

  (window as unknown as Record<string, unknown>).gtag = gtag;
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export default function Analytics() {
  const location = useLocation();

  // Load GA only if consent given, analytics enabled, and in production.
  // Re-check on 'consent-updated' so accepting cookies starts GA immediately,
  // without waiting for a page reload (loadGA is idempotent).
  useEffect(() => {
    if (!isProd || !env.analyticsEnabled) return;
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return;

    const loadIfConsented = () => {
      if (Cookies.get('analytics-enabled') === 'true') {
        loadGA();
      }
    };

    loadIfConsented();
    window.addEventListener('consent-updated', loadIfConsented);
    return () => window.removeEventListener('consent-updated', loadIfConsented);
  }, []);

  // Track page views
  useEffect(() => {
    if (!isProd || !env.analyticsEnabled) return;
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname,
        page_title: document.title,
      });
    }
  }, [location.pathname]);

  return null;
}
