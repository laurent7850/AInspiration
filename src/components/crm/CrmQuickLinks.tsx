import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusSquare,
  Users,
  Building2,
  DollarSign,
  Package,
  BarChart2,
  CheckSquare,
  Mail
} from 'lucide-react';

const CrmQuickLinks: React.FC = () => {
  const navigate = useNavigate();
  
  const quickLinks = [
    {
      title: 'Nouvelle opportunité',
      icon: DollarSign,
      onClick: () => navigate('/opportunities/new'),
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Nouvelle tâche',
      icon: CheckSquare,
      onClick: () => navigate('/tasks/new'),
      color: 'bg-blue-100 text-blue-600',
      disabled: false
    },
    {
      title: 'Nouveau contact',
      icon: Users,
      onClick: () => navigate('/contacts/new'),
      color: 'bg-purple-100 text-purple-600',
      disabled: false
    },
    {
      title: 'Nouvelle entreprise',
      icon: Building2,
      onClick: () => navigate('/companies/new'),
      color: 'bg-indigo-100 text-indigo-600',
      disabled: false
    },
    {
      title: 'Nouveau produit',
      icon: Package,
      onClick: () => navigate('/products/new'),
      color: 'bg-orange-100 text-orange-600',
      disabled: false
    },
    {
      title: 'Messages',
      icon: Mail,
      onClick: () => navigate('/messages'),
      color: 'bg-pink-100 text-pink-600',
      disabled: false
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <PlusSquare className="w-5 h-5 text-indigo-600" />
        Accès rapides
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {quickLinks.map((link, index) => (
          <button
            key={index}
            onClick={link.onClick}
            disabled={link.disabled}
            className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors hover:shadow ${
              link.disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-gray-50 cursor-pointer'
            }`}
          >
            <div className={`w-10 h-10 ${link.color} rounded-full flex items-center justify-center mb-2`}>
              <link.icon className="w-5 h-5" />
            </div>
            <span className="text-sm text-center text-gray-700">
              {link.title}
            </span>
            {link.disabled && (
              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded mt-1">Bientôt</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CrmQuickLinks;