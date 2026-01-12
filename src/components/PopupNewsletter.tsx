import React, { useState, useEffect } from 'react';
import { X, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { isValidEmail, checkRateLimit, sanitizeString } from '../utils/validation';
import { useTranslation } from 'react-i18next';

export default function PopupNewsletter() {
  const { t } = useTranslation('forms');
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if the user has already seen the popup
    const hasSeenPopup = localStorage.getItem('newsletter_popup_seen');
    
    // Show popup after 15 seconds if user hasn't seen it before
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        // Mark as seen for 7 days
        localStorage.setItem('newsletter_popup_seen', new Date().toISOString());
      }, 15000);
      
      return () => clearTimeout(timer);
    }
    
    // If more than 7 days have passed, show the popup again
    if (hasSeenPopup) {
      const lastSeen = new Date(hasSeenPopup).getTime();
      const now = new Date().getTime();
      const daysSinceLastSeen = (now - lastSeen) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastSeen > 7) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          // Update the last seen date
          localStorage.setItem('newsletter_popup_seen', new Date().toISOString());
        }, 15000);
        
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limiting check
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
      // Store email in Supabase
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: sanitizedEmail }]);

      if (error) throw error;

      setStatus('success');
      setMessage(t('newsletter.success'));
      setEmail('');

      // Close popup after 3 seconds
      setTimeout(() => {
        setIsOpen(false);
        // Reset form
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 500);
      }, 3000);
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      setStatus('error');
      setMessage(t('newsletter.error.general'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[999] bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('newsletter.title')}
          </h2>
          <p className="text-gray-600">
            {t('newsletter.description')}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
              placeholder={t('newsletter.placeholder')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{message}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-semibold"
          >
            {status === 'loading' ? t('newsletter.subscribing') : t('newsletter.subscribe')}
          </button>

          <p className="text-xs text-gray-500 text-center">
            {t('newsletter.privacy')}
          </p>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-indigo-600 text-sm"
          >
            {t('newsletter.dismiss', 'Non merci')}
          </button>
        </div>
      </div>
    </div>
  );
}