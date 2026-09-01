import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Newsletter from './Newsletter';

const CONTACT_EMAIL = 'info@ainspiration.eu';
const CONTACT_PHONE = '+32 477 94 28 65';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation('common');

  return (
    <footer className="bg-night text-indigo-100/70 border-t border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <span className="text-xl font-extrabold tracking-tighter mb-4 block">
              <span className="text-indigo-400">AI</span>
              <span className="text-white">nspiration</span>
            </span>
            <p className="text-sm text-indigo-100/70 leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-medium text-indigo-200/60 uppercase tracking-[0.15em] mb-5">{t('footer.sections.features')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/analyse-ia" className="text-indigo-100/70 hover:text-indigo-300 text-sm transition-colors">
                  {t('footer.links.aiAnalysis')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-indigo-100/70 hover:text-indigo-300 text-sm transition-colors">
                  {t('footer.links.aiAudit')}
                </Link>
              </li>
              <li>
                <Link to="/prompts" className="text-indigo-100/70 hover:text-indigo-300 text-sm transition-colors">
                  {t('footer.links.promptMaster')}
                </Link>
              </li>
              <li>
                <Link to="/automatisation" className="text-indigo-100/70 hover:text-indigo-300 text-sm transition-colors">
                  Automatisation IA
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-indigo-100/70 hover:text-indigo-300 text-sm transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium text-indigo-200/60 uppercase tracking-[0.15em] mb-5">{t('footer.sections.legal')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-indigo-100/70 hover:text-indigo-300 text-sm transition-colors">
                  {t('footer.links.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/mentions-legales" className="text-indigo-100/70 hover:text-indigo-300 text-sm transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/cgv" className="text-indigo-100/70 hover:text-indigo-300 text-sm transition-colors">
                  {t('footer.links.terms')}
                </Link>
              </li>
              <li>
                <Link to="/cgu" className="text-indigo-100/70 hover:text-indigo-300 text-sm transition-colors">
                  CGU
                </Link>
              </li>
              <li className="text-indigo-100/70 text-sm">
                {t('footer.vat')}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium text-indigo-200/60 uppercase tracking-[0.15em] mb-5">{t('footer.sections.contact')}</h3>
            <address className="not-italic space-y-3">
              <div className="flex items-start gap-3 text-sm text-indigo-100/70">
                <MapPin className="w-4 h-4 flex-shrink-0 text-indigo-300/60 mt-0.5" />
                <div>
                  <p>{t('footer.address.street')}</p>
                  <p>{t('footer.address.city')}</p>
                  <p>{t('footer.address.country')}</p>
                </div>
              </div>
              <p className="flex items-center gap-3 text-sm text-indigo-100/70">
                <Phone className="w-4 h-4 text-indigo-300/60" />
                <a href={`tel:${CONTACT_PHONE}`} className="hover:text-indigo-300 transition-colors">
                  {CONTACT_PHONE}
                </a>
              </p>
              <p className="flex items-center gap-3 text-sm text-indigo-100/70">
                <Mail className="w-4 h-4 text-indigo-300/60" />
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-indigo-300 transition-colors">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* Newsletter */}
        <div className="max-w-md mx-auto mb-12">
          <Newsletter />
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-indigo-200/60">
              © {currentYear} {t('footer.company')} — {t('footer.rights')}
            </div>
            <div className="text-xs text-indigo-200/60">
              {t('footer.vat')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
