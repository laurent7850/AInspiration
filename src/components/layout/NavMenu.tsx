import { useState, useMemo } from 'react';
import { Menu, X, LogOut, ChevronDown, Database, Languages, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import NotificationCenter from '../ui/NotificationCenter';
import { useLocalizedPath } from '../../hooks/useLocalizedPath';

interface NavMenuProps {
  onAuditClick: () => void;
}

const NavMenu: React.FC<NavMenuProps> = ({ onAuditClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenuIndex, setOpenSubmenuIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useTranslation('common');
  const { switchLanguageTo, currentLang, localizedPath } = useLocalizedPath();

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
      labelKey: 'nav.realisations',
      path: '/realisations'
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

  const handleMenuItemClick = (path?: string, action?: string) => {
    if (action === 'audit') {
      onAuditClick();
    } else if (path) {
      navigate(localizedPath(path));
    }
    setIsOpen(false);
    setOpenSubmenuIndex(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate(localizedPath('/'));
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
          onClick={() => navigate(localizedPath('/'))}
        >
          <img
            src="/brain-icon.webp"
            alt=""
            className="h-8 md:h-10 w-auto"
            width={80}
            height={80}
            decoding="async"
          />
          {/* Le mot-marque est re-composé et NON repris du fichier logo :
              public/logo-ainspiration.png est amputé du « i » d'« inspiration »
              (14 pixels opaques là où une lettre voisine en compte 18 000) et
              lit « AInsp ration ». Graisse et chasse calées sur l'original :
              son ratio largeur / hauteur de capitale vaut 7,95 une fois le « i »
              rétabli — Outfit 700 + tracking-tight y tombe, 800 + tracking-tighter
              donnait 7,50, soit nettement trop resserré. À remplacer par l'asset
              le jour où un fichier propre existe. */}
          <span className="ml-2 text-lg md:text-xl font-bold tracking-tight">
            <span className="text-accent">AI</span>
            <span className="text-ink">nspiration</span>
            <sup className="text-[8px] text-secondary ml-0.5">®</sup>
          </span>
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
                  <button
                    type="button"
                    aria-haspopup="true"
                    className="flex items-center gap-1 text-secondary hover:text-ink transition-colors py-2 cursor-pointer text-sm font-medium"
                  >
                    {t(item.labelKey)}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute top-full left-0 w-64 py-3 mt-1 bg-white rounded-soft shadow-diffuse border border-line opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all z-50">
                    {item.items?.map((category, catIndex) => (
                      <div key={catIndex} className="px-4 py-2">
                        <h3 className="font-semibold text-secondary text-xs uppercase tracking-wider mb-2">{t(category.labelKey)}</h3>
                        <div className="space-y-1">
                          {category.items?.map((subItem, subIndex) => (
                            <button
                              key={subIndex}
                              className="w-full px-2 py-1.5 text-left text-secondary hover:bg-surface hover:text-accent transition-colors rounded-lg text-sm"
                              onClick={() => handleMenuItemClick(subItem.path, subItem.action)}
                            >
                              {t(subItem.labelKey)}
                            </button>
                          ))}
                        </div>
                        {catIndex < (item.items?.length || 0) - 1 && (
                          <div className="my-2 border-b border-line"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <button
                  className="text-secondary hover:text-ink transition-colors py-2 text-sm font-medium"
                  onClick={() => item.path && handleMenuItemClick(item.path)}
                >
                  {t(item.labelKey)}
                </button>
              )}
            </div>
          ))}

          <button
            onClick={onAuditClick}
            className="bg-accent text-white px-5 py-2 rounded-button text-sm font-semibold hover:bg-accent-dark transition-colors duration-200 active:translate-y-px"
          >
            {t('button.startAudit', 'Audit gratuit')}
          </button>

          <div className="relative group">
            <button
              type="button"
              aria-haspopup="true"
              className="flex items-center gap-1 text-secondary hover:text-ink transition-colors py-2 cursor-pointer text-sm"
            >
              <span className="uppercase font-medium tracking-wide">{currentLang}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <div className="absolute top-full right-0 w-20 py-2 mt-1 bg-white rounded-soft shadow-diffuse border border-line opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all z-50">
              <button
                onClick={() => switchLanguageTo('fr')}
                className={`w-full px-4 py-1.5 text-center text-sm hover:bg-surface transition-colors ${currentLang === 'fr' ? 'bg-surface text-ink font-semibold' : 'text-secondary'}`}
              >
                FR
              </button>
              <button
                onClick={() => switchLanguageTo('en')}
                className={`w-full px-4 py-1.5 text-center text-sm hover:bg-surface transition-colors ${currentLang === 'en' ? 'bg-surface text-ink font-semibold' : 'text-secondary'}`}
              >
                EN
              </button>
              <button
                onClick={() => switchLanguageTo('nl')}
                className={`w-full px-4 py-1.5 text-center text-sm hover:bg-surface transition-colors ${currentLang === 'nl' ? 'bg-surface text-ink font-semibold' : 'text-secondary'}`}
              >
                NL
              </button>
            </div>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <NotificationCenter />

              <div className="group relative">
                <button
                  type="button"
                  aria-haspopup="true"
                  className="flex items-center gap-2 text-secondary hover:text-ink cursor-pointer text-sm"
                >
                  <span className="truncate max-w-[140px]">{user.email}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown menu */}
                <div className="absolute right-0 w-48 mt-2 bg-white rounded-soft shadow-diffuse border border-line overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all z-50">
                  <button
                    onClick={() => navigate(localizedPath('/crm-dashboard'))}
                    className="w-full px-4 py-2 text-left text-secondary hover:bg-surface hover:text-accent flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    <span>{t('nav.crmDashboard')}</span>
                  </button>
                  <button
                    onClick={() => navigate(localizedPath('/newsletter-admin'))}
                    className="w-full px-4 py-2 text-left text-secondary hover:bg-surface hover:text-accent flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Newsletter</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-secondary hover:bg-surface hover:text-accent flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('button.signOut')}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate(localizedPath('/login'))}
              className="text-secondary hover:text-ink transition-colors text-sm"
            >
              {t('button.signIn')}
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-ink"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden py-4 border-t border-line bg-canvas/95 backdrop-blur-xl">
          <div className="px-2 pb-3 mb-2 border-b border-line">
            <button
              onClick={() => { onAuditClick(); setIsOpen(false); }}
              className="w-full bg-accent text-white px-4 py-2.5 rounded-button text-sm font-semibold hover:bg-accent-dark transition-colors"
            >
              {t('button.startFreeAudit')}
            </button>
          </div>
          <div className="px-2 py-2 mb-2 border-b border-line">
            <div className="flex items-center gap-2 text-secondary mb-2">
              <Languages className="w-4 h-4" />
              <span className="text-sm font-semibold">{t('nav.language')}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => switchLanguageTo('fr')}
                className={`flex-1 px-3 py-1.5 rounded-md transition-colors ${currentLang === 'fr' ? 'bg-accent text-white font-semibold' : 'bg-surface text-secondary border border-line'}`}
              >
                FR
              </button>
              <button
                onClick={() => switchLanguageTo('en')}
                className={`flex-1 px-3 py-1.5 rounded-md transition-colors ${currentLang === 'en' ? 'bg-accent text-white font-semibold' : 'bg-surface text-secondary border border-line'}`}
              >
                EN
              </button>
              <button
                onClick={() => switchLanguageTo('nl')}
                className={`flex-1 px-3 py-1.5 rounded-md transition-colors ${currentLang === 'nl' ? 'bg-accent text-white font-semibold' : 'bg-surface text-secondary border border-line'}`}
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
                    className="flex items-center justify-between w-full font-medium text-ink px-2 py-1.5"
                    onClick={() => toggleSubmenu(index)}
                  >
                    {t(item.labelKey)}
                    <ChevronDown className={`w-4 h-4 transition-transform ${openSubmenuIndex === index ? 'rotate-180' : ''}`} />
                  </button>

                  {openSubmenuIndex === index && item.items?.map((category, catIndex) => (
                    <div key={catIndex} className="mt-1 mb-3 pl-4">
                      <h3 className="font-semibold text-ink text-sm px-2 py-1">{t(category.labelKey)}</h3>
                      <div className="space-y-1 pl-2">
                        {category.items?.map((subItem, subIndex) => (
                          <button
                            key={subIndex}
                            className="w-full text-left text-secondary hover:text-ink px-2 py-1.5"
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
                  className="w-full text-left font-medium text-secondary hover:text-ink px-2 py-1.5"
                  onClick={() => item.path && handleMenuItemClick(item.path)}
                >
                  {t(item.labelKey)}
                </button>
              )}
            </div>
          ))}

          {user ? (
            <div className="mt-4 space-y-2 px-2 border-t border-line pt-4">
              <div className="text-secondary">{user.email}</div>
              <button
                onClick={() => navigate(localizedPath('/crm-dashboard'))}
                className="flex items-center gap-2 text-secondary hover:text-ink transition-colors w-full text-left py-1.5"
              >
                <Database className="w-5 h-5" />
                <span>{t('nav.crmDashboard')}</span>
              </button>
              <button
                onClick={() => navigate(localizedPath('/newsletter-admin'))}
                className="flex items-center gap-2 text-secondary hover:text-ink transition-colors w-full text-left py-1.5"
              >
                <Mail className="w-5 h-5" />
                <span>Newsletter</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-secondary hover:text-ink transition-colors w-full text-left py-1.5"
              >
                <LogOut className="w-5 h-5" />
                <span>{t('button.signOut')}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                navigate(localizedPath('/login'));
                setIsOpen(false);
              }}
              className="mt-4 w-full text-secondary hover:text-ink transition-colors text-sm text-left px-2"
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