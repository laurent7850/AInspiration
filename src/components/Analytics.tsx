import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { isProd, env } from '@/config/environment';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

// gtag.js only interprets dataLayer entries that are genuine `arguments`
// objects. A plain array — what rest parameters produce — is accepted by
// dataLayer.push but never processed: no config, no hit, no data in GA4.
const gtag: (...args: unknown[]) => void = function () {
  // eslint-disable-next-line prefer-rest-params -- the official gtag shim relies on `arguments`
  window.dataLayer.push(arguments);
};

// Last path sent to GA, to avoid double-counting the landing page (the mount
// effect and the route effect both fire for it).
let lastTrackedPath: string | null = null;

function trackPageView(path: string) {
  if (typeof window.gtag !== 'function') return;
  if (lastTrackedPath === path) return;
  lastTrackedPath = path;

  // react-helmet-async applies document.title inside a requestAnimationFrame,
  // so at this point the title is still the previous page's one. Send as soon
  // as it changes, with a timer as fallback — routes can legitimately share a
  // title, and rAF never fires at all while the tab is in the background.
  const previousTitle = document.title;
  let sent = false;

  const send = () => {
    if (sent) return;
    sent = true;
    observer.disconnect();
    clearTimeout(fallback);
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
    });
  };

  const observer = new MutationObserver(() => {
    if (document.title !== previousTitle) send();
  });
  observer.observe(document.head, { subtree: true, childList: true, characterData: true });
  const fallback = setTimeout(send, 400);
}

function loadGA() {
  if (document.getElementById('ga-script')) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
    // SPA: page views are sent manually on every route change, including the
    // first one, so the automatic hit would double-count the landing page.
    send_page_view: false,
  });

  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

export default function Analytics() {
  const location = useLocation();

  // Load GA only if consent given, analytics enabled, and in production.
  // Re-check on 'consent-updated' so accepting cookies starts GA immediately,
  // without waiting for a page reload (loadGA is idempotent).
  useEffect(() => {
    // isProd only says "production build", not "production host": a local
    // `vite preview` or the local-preview server sent 7 localhost page views
    // to the production GA4 property in 30 days (audit 2026-08-13).
    const isLocalHost = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
    if (!isProd || isLocalHost || !env.analyticsEnabled) return;
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return;

    const loadIfConsented = () => {
      if (Cookies.get('analytics-enabled') !== 'true') return;
      loadGA();
      // Consent can be granted mid-visit: the route effect below won't re-run,
      // so send the page view for the page the visitor is currently on.
      trackPageView(window.location.pathname);
    };

    loadIfConsented();
    window.addEventListener('consent-updated', loadIfConsented);
    return () => window.removeEventListener('consent-updated', loadIfConsented);
  }, []);

  // Track page views on every route change
  useEffect(() => {
    if (!isProd || !env.analyticsEnabled) return;
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
}
