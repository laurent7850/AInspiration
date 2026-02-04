import React, { useState, useMemo } from 'react';
import { Menu, X, LogOut, ChevronDown, Database, Languages, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import NotificationCenter from '../ui/NotificationCenter';

interface NavMenuProps {
  onAuditClick: () => void;
}

const NavMenu: React.FC<NavMenuProps> = ({ onAuditClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenuIndex, setOpenSubmenuIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation('common');

  const currentLanguage = i18n.language || 'fr';

  // Dedicated structure for service navigation - using translations
  const serviceCategories = useMemo(() => [
    {
      labelKey: 'nav.solutions',
      items: [
        { labelKey: 'nav.analysis', path: '/analyse-ia' },
        { labelKey: 'nav.automation', path: '/automatisation' },
        { labelKey: 'nav.virtualAssistants', path: '/assistants' },
        { labelKey: 'nav.crmSolution', path: '/crm' },
      ]
    },
    {
      labelKey: 'nav.consulting',
      items: [
        { labelKey: 'button.startAudit', action: 'audit' },
        { labelKey: 'nav.consulting', path: '/conseil' },
        { labelKey: 'nav.transformation', path: '/transformation' },
        { labelKey: 'nav.formation', path: '/formation' },
      ]
    },
    {
      labelKey: 'nav.creativity',
      items: [
        { labelKey: 'nav.content', path: '/creativite' },
        { labelKey: 'nav.prompts', path: '/prompts' },
        { labelKey: 'nav.visualCreation', path: '/creation-visuelle' },
      ]
    }
  ], []);

  // Main menu structure - using translations
  const menuItems = useMemo(() => [
    {
      labelKey: 'nav.services',
      isDropdown: true,
      items: serviceCategories
    },
    {
      labelKey: 'nav.caseStudies',
      path: '/etudes-de-cas'
    },
    {
      labelKey: 'nav.about',
      path: '/a-propos'
    },
    {
      labelKey: 'nav.blog',
      path: '/blog'
    },
    {
      labelKey: 'nav.contact',
      path: '/contact'
    }
  ], [serviceCategories]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleMenuItemClick = (path?: string, action?: string) => {
    if (action === 'audit') {
      onAuditClick();
    } else if (path) {
      navigate(path);
    }
    setIsOpen(false);
    setOpenSubmenuIndex(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
    setIsOpen(false);
  };

  const toggleSubmenu = (index: number) => {
    setOpenSubmenuIndex(openSubmenuIndex === index ? null : index);
  };

  return (
    <nav className="container mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate('/')}
        >
          <img
            src="/white_logo_-_no_background.svg"
            alt="AIñspiration - AI FOR YOU"
            className="h-10 md:h-12 w-auto"
          />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {menuItems.map((item, index) => (
            <div 
              key={index}
              className="relative group"
            >
              {item.isDropdown ? (
                <>
                  <span
                    className="flex items-center gap-1 text-white hover:text-white/80 transition-colors py-2 cursor-pointer"
                    role="button"
                    tabIndex={0}
                  >
                    {t(item.labelKey)}
                    <ChevronDown className="w-4 h-4" />
                  </span>
                  <div className="absolute top-full left-0 w-64 py-3 mt-1 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    {item.items?.map((category, catIndex) => (
                      <div key={catIndex} className="px-4 py-2">
                        <h3 className="font-semibold text-indigo-600 mb-2">{t(category.labelKey)}</h3>
                        <div className="space-y-1">
                          {category.items?.map((subItem, subIndex) => (
                            <button
                              key={subIndex}
                              className="w-full px-2 py-1.5 text-left text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-md"
                              onClick={() => handleMenuItemClick(subItem.path, subItem.action)}
                            >
                              {t(subItem.labelKey)}
                            </button>
                          ))}
                        </div>
                        {catIndex < (item.items?.length || 0) - 1 && (
                          <div className="my-2 border-b border-gray-100"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <button
                  className="text-white hover:text-white/80 transition-colors py-2"
                  onClick={() => item.path && handleMenuItemClick(item.path)}
                >
                  {t(item.labelKey)}
                </button>
              )}
            </div>
          ))}

          <div className="relative group">
            <span
              className="flex items-center gap-1 text-white hover:text-white/80 transition-colors py-2 cursor-pointer"
              role="button"
              tabIndex={0}
            >
              <span className="uppercase font-semibold">{currentLanguage.substring(0, 2)}</span>
              <ChevronDown className="w-4 h-4" />
            </span>
            <div className="absolute top-full right-0 w-20 py-2 mt-1 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={() => changeLanguage('fr')}
                className={`w-full px-4 py-2 text-center hover:bg-indigo-50 transition-colors ${currentLanguage.startsWith('fr') ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-700'}`}
              >
                FR
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`w-full px-4 py-2 text-center hover:bg-indigo-50 transition-colors ${currentLanguage.startsWith('en') ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-700'}`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('nl')}
                className={`w-full px-4 py-2 text-center hover:bg-indigo-50 transition-colors ${currentLanguage.startsWith('nl') ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-700'}`}
              >
                NL
              </button>
            </div>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <NotificationCenter />

              <div className="group relative">
                <div className="flex items-center gap-2 text-white hover:text-white/80 cursor-pointer">
                  <span className="truncate max-w-[140px]">{user.email}</span>
                  <ChevronDown className="w-4 h-4" />
                </div>

                {/* Dropdown menu */}
                <div className="absolute right-0 w-48 mt-2 bg-white rounded-lg shadow-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button
                    onClick={() => navigate('/crm-dashboard')}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    <span>{t('nav.crmDashboard')}</span>
                  </button>
                  <button
                    onClick={() => navigate('/newsletter-admin')}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Newsletter</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('button.signOut')}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-white/50 hover:text-white/70 transition-colors text-sm"
            >
              {t('button.signIn')}
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-white"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden py-4 border-t border-white/20">
          <div className="px-2 py-2 mb-2 border-b border-white/20">
            <div className="flex items-center gap-2 text-white mb-2">
              <Languages className="w-4 h-4" />
              <span className="text-sm font-semibold">Language</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => changeLanguage('fr')}
                className={`flex-1 px-3 py-1.5 rounded-md transition-colors ${currentLanguage.startsWith('fr') ? 'bg-white text-indigo-600 font-semibold' : 'bg-white/10 text-white'}`}
              >
                FR
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`flex-1 px-3 py-1.5 rounded-md transition-colors ${currentLanguage.startsWith('en') ? 'bg-white text-indigo-600 font-semibold' : 'bg-white/10 text-white'}`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('nl')}
                className={`flex-1 px-3 py-1.5 rounded-md transition-colors ${currentLanguage.startsWith('nl') ? 'bg-white text-indigo-600 font-semibold' : 'bg-white/10 text-white'}`}
              >
                NL
              </button>
            </div>
          </div>

          {menuItems.map((item, index) => (
            <div key={index} className="py-2">
              {item.isDropdown ? (
                <div>
                  <button
                    className="flex items-center justify-between w-full font-medium text-white px-2 py-1.5"
                    onClick={() => toggleSubmenu(index)}
                  >
                    {t(item.labelKey)}
                    <ChevronDown className={`w-4 h-4 transition-transform ${openSubmenuIndex === index ? 'rotate-180' : ''}`} />
                  </button>

                  {openSubmenuIndex === index && item.items?.map((category, catIndex) => (
                    <div key={catIndex} className="mt-1 mb-3 pl-4">
                      <h3 className="font-semibold text-white text-sm px-2 py-1">{t(category.labelKey)}</h3>
                      <div className="space-y-1 pl-2">
                        {category.items?.map((subItem, subIndex) => (
                          <button
                            key={subIndex}
                            className="w-full text-left text-white/80 hover:text-white px-2 py-1.5"
                            onClick={() => handleMenuItemClick(subItem.path, subItem.action)}
                          >
                            {t(subItem.labelKey)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  className="w-full text-left font-medium text-white px-2 py-1.5"
                  onClick={() => item.path && handleMenuItemClick(item.path)}
                >
                  {t(item.labelKey)}
                </button>
              )}
            </div>
          ))}

          {user ? (
            <div className="mt-4 space-y-2 px-2 border-t border-white/20 pt-4">
              <div className="text-white/90">{user.email}</div>
              <button
                onClick={() => navigate('/crm-dashboard')}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors w-full text-left py-1.5"
              >
                <Database className="w-5 h-5" />
                <span>{t('nav.crmDashboard')}</span>
              </button>
              <button
                onClick={() => navigate('/newsletter-admin')}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors w-full text-left py-1.5"
              >
                <Mail className="w-5 h-5" />
                <span>Newsletter</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors w-full text-left py-1.5"
              >
                <LogOut className="w-5 h-5" />
                <span>{t('button.signOut')}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                navigate('/login');
                setIsOpen(false);
              }}
              className="mt-4 w-full text-white/50 hover:text-white/70 transition-colors text-sm text-left px-2"
            >
              {t('button.signIn')}
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavMenu;