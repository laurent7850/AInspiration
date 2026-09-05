import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
import { isValidEmail, checkRateLimit, sanitizeString } from '../utils/validation';
import { useHoneypot } from '../hooks/useHoneypot';
import { addSubscriber } from '../services/newsletterService';

const SEEN_KEY = 'newsletter_popup_seen';
const SEEN_DAYS = 7;
const SCROLL_TRIGGER = 0.6; // 60 % of the page

/**
 * Newsletter popup.
 *
 * Trigger rules (UX audit, 2026-09-05): never on a timer, never while the
 * cookie banner is still open, never twice in seven days. It opens once the
 * visitor has read 60 % of the page, or on exit intent (pointer leaving
 * through the top edge on desktop) — both are signals of engagement, a
 * 15-second timer was not.
 *
 * Accessibility: real dialog semantics, focus moved inside and trapped,
 * Escape and backdrop close it, close button is a 44 px target.
 */
function hasSeenRecently(): boolean {
  try {
    const seen = localStorage.getItem(SEEN_KEY);
    if (!seen) return false;
    const days = (Date.now() - new Date(seen).getTime()) / (1000 * 60 * 60 * 24);
    return days < SEEN_DAYS;
  } catch {
    return true; // storage unavailable → don't nag
  }
}

function markSeen() {
  try { localStorage.setItem(SEEN_KEY, new Date().toISOString()); } catch { /* ignore */ }
}

export default function PopupNewsletter() {
  const { t } = useTranslation('forms');
  const { honeypotField, honeypotValue } = useHoneypot();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<Element | null>(null);

  const open = useCallback(() => {
    if (hasSeenRecently()) return;
    // The cookie banner must be answered first: two stacked overlays is the
    // worst first impression a page can give.
    if (!Cookies.get('cookie-consent')) return;
    markSeen();
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setStatus('idle');
    setMessage('');
  }, []);

  // Engagement triggers
  useEffect(() => {
    if (hasSeenRecently()) return;

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      if (window.scrollY / scrollable >= SCROLL_TRIGGER) open();
    };
    const onMouseOut = (e: MouseEvent) => {
      // Exit intent: pointer leaves the window through the top edge.
      if (!e.relatedTarget && e.clientY <= 0) open();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('mouseout', onMouseOut);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, [open]);

  // Dialog behaviour: focus management, Escape, focus trap
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement;
    inputRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), a[href]'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused.current instanceof HTMLElement) previouslyFocused.current.focus();
    };
  }, [isOpen, close]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkRateLimit('popup-newsletter', 3, 60000)) {
      setStatus('error');
      setMessage(t('newsletter.error.rateLimit'));
      return;
    }

    const sanitizedEmail = sanitizeString(email.trim().toLowerCase());
    if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
      setStatus('error');
      setMessage(t('newsletter.error.invalidEmail'));
      return;
    }

    setStatus('loading');
    try {
      await addSubscriber(sanitizedEmail, 'popup_newsletter', honeypotValue);
      setStatus('success');
      setMessage(t('newsletter.success'));
      setEmail('');
      setTimeout(close, 4000);
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      setStatus('error');
      setMessage(t('newsletter.error.general'));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-popup-title"
        aria-describedby="newsletter-popup-desc"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fadeIn"
      >
        <button
          type="button"
          onClick={close}
          aria-label={t('newsletter.close', 'Fermer')}
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <X className="h-6 w-6" aria-hidden="true" />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
            <Mail className="h-8 w-8 text-indigo-600" aria-hidden="true" />
          </div>
          <h2 id="newsletter-popup-title" className="mb-2 text-2xl font-bold text-gray-900">
            {t('newsletter.title')}
          </h2>
          <p id="newsletter-popup-desc" className="text-gray-600">
            {t('newsletter.description')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {honeypotField}
          <div className="relative">
            <label htmlFor="newsletter-popup-email" className="sr-only">{t('newsletter.placeholder')}</label>
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              ref={inputRef}
              id="newsletter-popup-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
              placeholder={t('newsletter.placeholder')}
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-sm text-red-600" role="alert">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <span>{message}</span>
            </div>
          )}
          {status === 'success' && (
            <div className="flex items-center gap-2 text-sm text-green-700" role="status">
              <CheckCircle className="h-4 w-4" aria-hidden="true" />
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {status === 'loading' ? t('newsletter.subscribing') : t('newsletter.subscribe')}
          </button>

          <p className="text-center text-xs text-gray-600">
            {t('newsletter.privacy')}
          </p>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-6 text-center">
          <button
            type="button"
            onClick={close}
            className="text-sm text-gray-600 hover:text-indigo-600"
          >
            {t('newsletter.dismiss', 'Non merci')}
          </button>
        </div>
      </div>
    </div>
  );
}
