import React from 'react';
import { Brain, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Newsletter from './Newsletter';

const CONTACT_EMAIL = 'info@ainspiration.eu';
const CONTACT_PHONE = '+32 477 94 28 65';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation('common');

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-8 w-8 text-indigo-400" />
              <span className="text-xl font-bold text-white">{t('footer.company')}</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.sections.features')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-gray-400 hover:text-indigo-400 text-sm">
                  {t('footer.links.aiAnalysis')}
                </a>
              </li>
              <li>
                <a href="#audit" className="text-gray-400 hover:text-indigo-400 text-sm">
                  {t('footer.links.aiAudit')}
                </a>
              </li>
              <li>
                <a href="#prompts" className="text-gray-400 hover:text-indigo-400 text-sm">
                  {t('footer.links.promptMaster')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.sections.legal')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="text-gray-400 hover:text-indigo-400 text-sm">
                  {t('footer.links.privacy')}
                </a>
              </li>
              <li>
                <a href="#terms" className="text-gray-400 hover:text-indigo-400 text-sm">
                  {t('footer.links.terms')}
                </a>
              </li>
              <li className="text-gray-400 text-sm">
                {t('footer.vat')}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.sections.contact')}</h3>
            <address className="not-italic">
              <div className="flex items-start gap-2 text-sm text-gray-400 mb-2">
                <MapPin className="w-5 h-5 flex-shrink-0 text-indigo-400" />
                <div>
                  <p>{t('footer.address.street')}</p>
                  <p>{t('footer.address.city')}</p>
                  <p>{t('footer.address.country')}</p>
                </div>
              </div>
              <p className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Phone className="w-5 h-5 text-indigo-400" />
                <a href={`tel:${CONTACT_PHONE}`} className="hover:text-indigo-400">
                  {CONTACT_PHONE}
                </a>
              </p>
              <p className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-5 h-5 text-indigo-400" />
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-indigo-400">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="max-w-md mx-auto mb-10">
          <Newsletter />
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              © {currentYear} {t('footer.company')} - {t('footer.rights')}
            </div>
            <div className="text-sm text-gray-400">
              {t('footer.vat')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}