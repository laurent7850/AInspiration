import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, Mail, Building2, Phone, MapPin } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useTranslation } from 'react-i18next';

export const CONTACT_EMAIL = 'info@aimagination.eu';
const CONTACT_PHONE = '+32 477 94 28 65';

interface StartFormProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
}

export default function StartForm({ isOpen, onClose, productId }: StartFormProps) {
  const { t } = useTranslation('forms');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Add styles to body
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
      document.body.classList.add('modal-open');
      
      // Return function to clean up
      return () => {
        // Remove styles from body
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        document.body.classList.remove('modal-open');
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const countries = [
    { code: 'BE', name: t('contact.countries.BE') },
    { code: 'FR', name: t('contact.countries.FR') },
    { code: 'LU', name: t('contact.countries.LU') },
    { code: 'NL', name: t('contact.countries.NL') },
    { code: 'DE', name: t('contact.countries.DE') },
    { code: 'CH', name: t('contact.countries.CH') },
    { code: 'MC', name: t('contact.countries.MC') },
    { code: 'AD', name: t('contact.countries.AD') },
    { code: 'OTHER', name: t('contact.countries.OTHER') }
  ];

  const getFormContent = (id?: string) => {
    if (!id) return { title: t('products.default.title'), description: t('products.default.description') };

    const productMap: Record<string, string> = {
      'audit-ia': 'auditIA',
      'pack-demarrage': 'packDemarrage',
      'formation-ia': 'formationIA',
      'abonnement-ia': 'abonnementIA',
      'custom': 'custom',
      'crm-solution': 'crmSolution'
    };

    const key = productMap[id] || 'default';
    return {
      title: t(`products.${key}.title`),
      description: t(`products.${key}.description`)
    };
  };

  const formContent = getFormContent(productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const subject = formContent.title;
      const messageWithDetails = `${formData.message}${formData.phone ? `\n\n${t('contact.phone')}: ${formData.phone}` : ''}${formData.country ? `\n${t('contact.country')}: ${formData.country}` : ''}`;

      const { error: insertError } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            company: formData.company,
            subject: subject,
            message: messageWithDetails,
          }
        ]);

      if (insertError) {
        throw insertError;
      }

      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
        setFormData({
          name: '',
          company: '',
          email: '',
          phone: '',
          country: '',
          message: ''
        });
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error(t('contact.error.title'), error);
      setError(t('contact.error.message'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/60 modal-overlay">
        <div className="bg-white rounded-2xl max-w-md mx-auto p-6 text-center shadow-2xl transform animate-fadeIn max-h-[90vh] overflow-auto">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {t('contact.success.title')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('contact.success.message')}
          </p>
          <button
            onClick={onClose}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {t('contact.close')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/60 modal-overlay p-4 md:p-0">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl mx-auto shadow-2xl transform animate-fadeIn max-h-[90vh] overflow-auto w-full max-w-md"
      >
        <div className="relative p-5 md:p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 z-10 bg-white rounded-full shadow-sm"
            aria-label={t('contact.close')}
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold text-gray-900 mb-1 pr-8">
            {formContent.title}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {formContent.description}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('contact.fullName')}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={t('contact.placeholders.fullName')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('contact.company')}
              </label>
              <div className="relative">
                <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t('contact.placeholders.company')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('contact.country')}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                  >
                    <option value="">{t('common.select')}</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('contact.phone')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={t('contact.placeholders.phone')}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('contact.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t('contact.placeholders.email')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('contact.message')}
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                rows={3}
                placeholder={t('contact.placeholders.message')}
              />
            </div>

            <p className="text-xs text-gray-500">* {t('common.required')}</p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-indigo-600 text-white px-4 py-1.5 text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? t('common.sending') : t('common.send')}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}