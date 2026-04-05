import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { unsubscribe, getSubscriberByToken } from '../services/newsletterService';
import SEOHead from '../components/SEOHead';

type Status = 'loading' | 'confirming' | 'success' | 'error' | 'not_found';

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>('loading');
  const [email, setEmail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { t } = useTranslation('pages');

  useEffect(() => {
    if (!token) {
      setStatus('not_found');
      setErrorMessage(t('unsubscribe.error_invalid_link'));
      return;
    }

    // Verify token and get subscriber info
    const verifyToken = async () => {
      try {
        const subscriber = await getSubscriberByToken(token);
        if (subscriber) {
          setEmail(subscriber.email);
          if (subscriber.status === 'unsubscribed') {
            setStatus('success');
          } else {
            setStatus('confirming');
          }
        } else {
          setStatus('not_found');
          setErrorMessage(t('unsubscribe.error_link_used'));
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage(t('unsubscribe.error_generic'));
      }
    };

    verifyToken();
  }, [token, t]);

  const handleUnsubscribe = async () => {
    if (!token) return;

    setStatus('loading');
    try {
      const success = await unsubscribe(token);
      if (success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(t('unsubscribe.error_unsubscribe'));
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(t('unsubscribe.error_generic'));
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <RefreshCw className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">{t('unsubscribe.loading')}</p>
          </div>
        );

      case 'confirming':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {t('unsubscribe.confirm_title')}
            </h1>
            <p className="text-gray-600 mb-2">
              {t('unsubscribe.confirm_intro')}
            </p>
            {email && (
              <p className="text-gray-500 mb-6">
                {t('unsubscribe.confirm_email')} <strong>{email}</strong>
              </p>
            )}
            <p className="text-sm text-gray-500 mb-8">
              {t('unsubscribe.confirm_warning')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleUnsubscribe}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('unsubscribe.confirm_button')}
              </button>
              <Link
                to="/"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('unsubscribe.cancel')}
              </Link>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {t('unsubscribe.success_title')}
            </h1>
            <p className="text-gray-600 mb-6">
              {t('unsubscribe.success_message')}
            </p>
            <p className="text-sm text-gray-500 mb-8">
              {t('unsubscribe.success_note')}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('unsubscribe.back_home')}
            </Link>
          </div>
        );

      case 'error':
      case 'not_found':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {status === 'not_found' ? t('unsubscribe.error_invalid_title') : t('unsubscribe.error_generic_title')}
            </h1>
            <p className="text-gray-600 mb-8">
              {errorMessage}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('unsubscribe.back_home')}
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('unsubscribe.contact_us')}
              </Link>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <SEOHead
        title={t('unsubscribe.seo.title')}
        description={t('unsubscribe.seo.description')}
        noindex={true}
      />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8">
            {renderContent()}
          </div>
        </div>
      </main>
    </>
  );
}
