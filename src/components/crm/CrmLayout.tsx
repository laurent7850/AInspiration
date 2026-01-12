import React, { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart2,
  Users,
  Building2,
  Package,
  FileText,
  CheckSquare,
  ChevronRight,
  Menu,
  X,
  DollarSign
} from 'lucide-react';

interface CrmLayoutProps {
  children: ReactNode;
}

const CrmLayout: React.FC<CrmLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems = [
    {
      path: '/crm-dashboard',
      labelKey: 'crm:menu.dashboard',
      icon: BarChart2
    },
    {
      path: '/opportunities',
      labelKey: 'crm:menu.opportunities',
      icon: DollarSign
    },
    {
      path: '/contacts',
      labelKey: 'crm:menu.contacts',
      icon: Users,
      disabled: false
    },
    {
      path: '/companies',
      labelKey: 'crm:menu.companies',
      icon: Building2,
      disabled: false
    },
    {
      path: '/products',
      labelKey: 'crm:menu.products',
      icon: Package,
      disabled: false
    },
    {
      path: '/tasks',
      labelKey: 'crm:menu.tasks',
      icon: CheckSquare,
      disabled: false
    },
    {
      path: '/reports',
      labelKey: 'crm:menu.reports',
      icon: FileText,
      disabled: false
    }
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex h-full">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-20">
        <button
          onClick={toggleSidebar}
          className="bg-indigo-600 text-white p-3 rounded-full shadow-lg"
          aria-label={sidebarOpen ? t('crm:common.close', 'Fermer le menu') : t('crm:common.open', 'Ouvrir le menu')}
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      
      {/* Sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-10"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 w-64 z-20 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">CRM AImagination</h2>
          
          <nav className="mt-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  if (!item.disabled) {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }
                }}
                disabled={item.disabled}
                className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                  isActivePath(item.path)
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                } ${
                  item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{t(item.labelKey)}</span>
                {item.disabled && (
                  <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded-full">
                    {t('crm:quickLinks.comingSoon')}
                  </span>
                )}
                {!item.disabled && isActivePath(item.path) && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 bg-gray-50 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default CrmLayout;