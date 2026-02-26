import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { isProd, env } from '@/config/environment';

const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // TODO: Replace with actual GA4 ID

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

  // Load GA only if consent given, analytics enabled, and in production
  useEffect(() => {
    if (!isProd || !env.analyticsEnabled) return;
    if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return; // Skip if not configured

    const analyticsConsent = Cookies.get('analytics-enabled');
    if (analyticsConsent === 'true') {
      loadGA();
    }
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
