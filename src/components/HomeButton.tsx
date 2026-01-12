import React from 'react';
import { Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function HomeButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Ne pas afficher le bouton sur la page d'accueil
  if (location.pathname === '/') {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/')}
      className="fixed left-4 top-24 z-50 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-200 group"
      aria-label="Retour à l'accueil"
    >
      <Home className="w-6 h-6 text-indigo-600" />
      <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        Retour à l'accueil
      </span>
    </button>
  );
}