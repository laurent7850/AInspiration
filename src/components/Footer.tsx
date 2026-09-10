import React from 'react';
import { Mail, Phone, MapPin, CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Newsletter from './Newsletter';
import { env } from '../config/environment';
import { useLocalizedPath } from '../hooks/useLocalizedPath';

const CONTACT_EMAIL = 'info@ainspiration.eu';
const CONTACT_PHONE = '+32 477 94 28 65';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation('common');
  const { localizedPath } = useLocalizedPath();

  return (
    <footer className="bg-canvas text-secondary border-t border-line">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <span className="text-xl font-extrabold tracking-tighter mb-4 block">
              <span className="text-accent">AI</span>
              <span className="text-ink">nspiration</span>
            </span>
            <p className="text-sm text-secondary leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-secondary uppercase tracking-[0.15em] mb-5">{t('footer.sections.features')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to={localizedPath('/analyse-ia')} className="text-secondary hover:text-accent text-sm transition-colors">
                  {t('footer.links.aiAnalysis')}
                </Link>
              </li>
              <li>
                <Link to={localizedPath('/contact')} className="text-secondary hover:text-accent text-sm transition-colors">
                  {t('footer.links.aiAudit')}
                </Link>
              </li>
              <li>
                <Link to={localizedPath('/prompts')} className="text-secondary hover:text-accent text-sm transition-colors">
                  {t('footer.links.promptMaster')}
                </Link>
              </li>
              <li>
                <Link to={localizedPath('/pme-hainaut-bruxelles')} className="text-secondary hover:text-accent text-sm transition-colors">
                  {t('footer.links.local')}
                </Link>
              </li>
              <li>
                <Link to={localizedPath('/automatisation')} className="text-secondary hover:text-accent text-sm transition-colors">
                  Automatisation IA
                </Link>
              </li>
              <li>
                <Link to={localizedPath('/blog')} className="text-secondary hover:text-accent text-sm transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-secondary uppercase tracking-[0.15em] mb-5">{t('footer.sections.legal')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to={localizedPath('/privacy')} className="text-secondary hover:text-accent text-sm transition-colors">
                  {t('footer.links.privacy')}
                </Link>
              </li>
              <li>
                <Link to={localizedPath('/mentions-legales')} className="text-secondary hover:text-accent text-sm transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to={localizedPath('/cgv')} className="text-secondary hover:text-accent text-sm transition-colors">
                  {t('footer.links.terms')}
                </Link>
              </li>
              <li>
                <Link to={localizedPath('/cgu')} className="text-secondary hover:text-accent text-sm transition-colors">
                  CGU
                </Link>
              </li>
              <li className="text-secondary text-sm">
                {t('footer.vat')}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-secondary uppercase tracking-[0.15em] mb-5">{t('footer.sections.contact')}</h3>
            <address className="not-italic space-y-3">
              <div className="flex items-start gap-3 text-sm text-secondary">
                <MapPin className="w-4 h-4 flex-shrink-0 text-accent mt-0.5" />
                <div>
                  <p>{t('footer.address.street')}</p>
                  <p>{t('footer.address.city')}</p>
                  <p>{t('footer.address.country')}</p>
                </div>
              </div>
              <p className="flex items-center gap-3 text-sm text-secondary">
                <Phone className="w-4 h-4 text-accent" />
                <a href={`tel:${CONTACT_PHONE}`} className="hover:text-accent transition-colors">
                  {CONTACT_PHONE}
                </a>
              </p>
              <p className="flex items-center gap-3 text-sm text-secondary">
                <Mail className="w-4 h-4 text-accent" />
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-accent transition-colors">
                  {CONTACT_EMAIL}
                </a>
              </p>
              {env.bookingUrl && (
                <p className="flex items-center gap-3 text-sm text-secondary">
                  <CalendarDays className="w-4 h-4 text-accent" />
                  <a href={env.bookingUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                    {t('footer.bookCall')}
                  </a>
                </p>
              )}
            </address>
          </div>
        </div>

        {/* Newsletter */}
        <div className="max-w-md mx-auto mb-12">
          <Newsletter />
        </div>

        <div className="border-t border-line pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-secondary">
              © {currentYear} {t('footer.company')} — {t('footer.rights')}
            </div>
            <div className="text-xs text-secondary">
              {t('footer.vat')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
