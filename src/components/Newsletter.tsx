import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { isValidEmail, checkRateLimit, sanitizeString } from '../utils/validation';
import { useTranslation } from 'react-i18next';

export default function Newsletter() {
  const { t } = useTranslation('forms');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limiting check
    if (!checkRateLimit('newsletter', 3, 60000)) {
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

      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      setStatus('error');
      setMessage(t('newsletter.error.general'));
    }
  };

  return (
    <div className="bg-indigo-50 rounded-xl p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Mail className="w-5 h-5 text-indigo-600" />
        {t('newsletter.title')}
      </h3>

      <p className="text-gray-600 mb-4">
        {t('newsletter.description')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading' || status === 'success'}
            placeholder={t('newsletter.placeholder')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? t('newsletter.subscribing') : t('newsletter.subscribe')}
        </button>

        <p className="text-xs text-gray-500">
          {t('newsletter.privacy')}
        </p>
      </form>
    </div>
  );
}