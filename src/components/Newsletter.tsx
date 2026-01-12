import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabase';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.match(/^\S+@\S+\.\S+$/)) {
      setStatus('error');
      setMessage('Veuillez entrer une adresse email valide.');
      return;
    }

    setStatus('loading');
    
    try {
      // Store email in Supabase
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);

      if (error) throw error;
      
      setStatus('success');
      setMessage('Merci pour votre inscription !');
      setEmail('');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      setStatus('error');
      setMessage('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <div className="bg-indigo-50 rounded-xl p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Mail className="w-5 h-5 text-indigo-600" />
        Restez informé
      </h3>
      
      <p className="text-gray-600 mb-4">
        Inscrivez-vous à notre newsletter pour recevoir les dernières actualités et conseils sur l'IA.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading' || status === 'success'}
            placeholder="Votre adresse email"
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
          {status === 'loading' ? 'Inscription...' : 'S\'inscrire'}
        </button>
        
        <p className="text-xs text-gray-500">
          Nous respectons votre vie privée et ne partageons jamais vos données. Désinscription facile à tout moment.
        </p>
      </form>
    </div>
  );
}