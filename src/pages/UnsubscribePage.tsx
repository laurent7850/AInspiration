import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { unsubscribe, getSubscriberByToken } from '../services/newsletterService';
import SEOHead from '../components/SEOHead';

type Status = 'loading' | 'confirming' | 'success' | 'error' | 'not_found';

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>('loading');
  const [email, setEmail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('not_found');
      setErrorMessage('Lien de désabonnement invalide.');
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
          setErrorMessage('Ce lien de désabonnement n\'est plus valide ou a déjà été utilisé.');
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
      }
    };

    verifyToken();
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;

    setStatus('loading');
    try {
      const success = await unsubscribe(token);
      if (success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage('Impossible de vous désabonner. Veuillez contacter le support.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <RefreshCw className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Vérification en cours...</p>
          </div>
        );

      case 'confirming':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Confirmer le désabonnement
            </h1>
            <p className="text-gray-600 mb-2">
              Vous êtes sur le point de vous désabonner de la newsletter AInspiration.
            </p>
            {email && (
              <p className="text-gray-500 mb-6">
                Adresse email : <strong>{email}</strong>
              </p>
            )}
            <p className="text-sm text-gray-500 mb-8">
              Vous ne recevrez plus nos actualités sur l'IA et les tendances du secteur.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleUnsubscribe}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirmer le désabonnement
              </button>
              <Link
                to="/"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
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
              Désabonnement réussi
            </h1>
            <p className="text-gray-600 mb-6">
              Vous avez été désabonné de notre newsletter avec succès.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Nous sommes désolés de vous voir partir. Vous pouvez vous réabonner à tout moment depuis notre site.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
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
              {status === 'not_found' ? 'Lien invalide' : 'Une erreur est survenue'}
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
                Retour à l'accueil
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <SEOHead
        title="Désabonnement Newsletter - AInspiration"
        description="Gérez votre abonnement à la newsletter AInspiration"
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
