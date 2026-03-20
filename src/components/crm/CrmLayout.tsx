import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  DollarSign,
  Brain,
  MessageSquare,
  Mail,
  Linkedin
} from 'lucide-react';

interface CrmLayoutProps {
  children: ReactNode;
}

const CrmLayout: React.FC<CrmLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation('crm');

  const menuItems = [
    {
      path: '/crm-dashboard',
      labelKey: 'menu.dashboard',
      label: 'Dashboard IA',
      icon: Brain,
      highlight: true
    },
    {
      path: '/opportunities',
      labelKey: 'menu.opportunities',
      icon: DollarSign
    },
    {
      path: '/contacts',
      labelKey: 'menu.contacts',
      icon: Users,
      disabled: false
    },
    {
      path: '/companies',
      labelKey: 'menu.companies',
      icon: Building2,
      disabled: false
    },
    {
      path: '/products',
      labelKey: 'menu.products',
      icon: Package,
      disabled: false
    },
    {
      path: '/tasks',
      labelKey: 'menu.tasks',
      icon: CheckSquare,
      disabled: false
    },
    {
      path: '/messages',
      labelKey: 'menu.messages',
      label: 'Messages',
      icon: MessageSquare,
      disabled: false
    },
    {
      path: '/newsletter-admin',
      labelKey: 'menu.newsletter',
      label: 'Newsletter',
      icon: Mail,
      disabled: false
    },
    {
      path: '/linkedin',
      labelKey: 'menu.linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      disabled: false
    },
    {
      path: '/reports',
      labelKey: 'menu.reports',
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
          aria-label={sidebarOpen ? t('common.close', 'Fermer le menu') : t('common.open', 'Ouvrir le menu')}
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
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">CRM Intelligent</h2>
          </div>

          <nav className="mt-6 space-y-2">
            {menuItems.map((item) => {
              if (item.disabled) {
                return (
                  <span
                    key={item.path}
                    className="flex items-center w-full px-3 py-2 rounded-lg opacity-50 cursor-not-allowed text-gray-700"
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.label || t(item.labelKey)}</span>
                    <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded-full">
                      {t('quickLinks.comingSoon')}
                    </span>
                  </span>
                );
              }
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                    isActivePath(item.path)
                      ? item.highlight
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                        : 'bg-indigo-50 text-indigo-600'
                      : item.highlight
                        ? 'text-indigo-700 hover:bg-indigo-50'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.label || t(item.labelKey)}</span>
                  {isActivePath(item.path) && !item.highlight && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </Link>
              );
            })}
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