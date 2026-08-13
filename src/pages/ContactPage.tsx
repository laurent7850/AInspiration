import React, { useState } from 'react';
import SectionHeader from '../components/ui/SectionHeader';
import { Mail, Phone, MapPin, MessageSquare, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import { getSEOConfig } from '../config/seoConfig';
import { validateContactForm, checkRateLimit } from '../utils/validation';

// Proxy backend — le webhook n8n est appelé via le serveur Express
const CONTACT_WEBHOOK_URL = "/api/webhook/contact";

const CONTACT_EMAIL = 'divers@distr-action.com';
const CONTACT_PHONE = '+32 477 94 28 65';

const ContactPage: React.FC = () => {
  const { t, i18n } = useTranslation('forms');
  const seoConfig = getSEOConfig('/contact', i18n.language as 'fr' | 'en');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Rate limiting check
    if (!checkRateLimit('contactpage', 3, 60000)) {
      setError(t('contact.error.rateLimit'));
      return;
    }

    // Validate form data
    const validation = validateContactForm({
      name: formData.name,
      email: formData.email,
      company: formData.company,
      message: formData.message,
      subject: formData.subject
    });

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Send data to n8n webhook
      const webhookData = {
        name: validation.sanitizedData.name,
        email: validation.sanitizedData.email,
        company: validation.sanitizedData.company,
        subject: validation.sanitizedData.subject,
        message: validation.sanitizedData.message,
        timestamp: new Date().toISOString(),
        source: 'contact_page'
      };

      const response = await fetch(CONTACT_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de l'envoi du formulaire: ${response.status}`);
      }

      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
      });
      setFieldErrors({});
    } catch (err) {
      setError(t('contact.error.general'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: t('contact.info.email'),
      value: CONTACT_EMAIL,
      link: `mailto:${CONTACT_EMAIL}`
    },
    {
      icon: Phone,
      title: t('contact.info.phone'),
      value: CONTACT_PHONE,
      link: `tel:${CONTACT_PHONE.replace(/\s/g, '')}`
    },
    {
      icon: MapPin,
      title: t('contact.info.address'),
      value: "Chauss\u00e9e Brunehault 7041 Givry",
      link: null
    }
  ];

  const subjects = [
    { key: 'generalInfo', label: t('contact.subjects.generalInfo') },
    { key: 'demo', label: t('contact.subjects.demo') },
    { key: 'support', label: t('contact.subjects.support') },
    { key: 'partnership', label: t('contact.subjects.partnership') },
    { key: 'other', label: t('contact.subjects.other') }
  ];

  return (
    <>
      <SEOHead
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
      />
      <section className="py-24 lg:py-32 bg-canvas">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="max-w-2xl mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tighter leading-[1.05] mb-4">
              {t('contact.pageTitle')}
            </h1>
            <p className="text-xl text-secondary leading-relaxed">
              {t('contact.pageSubtitle')}
            </p>
          </div>

        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {contactInfo.map((info, index) => {
            const cardContent = (
              <>
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                  <info.icon className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-sm font-medium text-ink mb-1">
                  {info.title}
                </h3>
                <p className="text-secondary text-sm">
                  {info.value}
                </p>
              </>
            );

            if (!info.link) {
              return (
                <div
                  key={index}
                  className="bg-white rounded-card p-6 shadow-lift"
                >
                  {cardContent}
                </div>
              );
            }

            return (
              <a
                key={index}
                href={info.link}
                className="bg-white rounded-card p-6 shadow-lift hover:shadow-diffuse transition-all duration-300 hover:-translate-y-1"
              >
                {cardContent}
              </a>
            );
          })}
        </div>

        <div className="bg-white rounded-[2rem] shadow-diffuse overflow-hidden">
          <div>
            <div className="p-8 lg:p-12">
              <h2 className="text-2xl font-bold text-ink tracking-tight mb-6">
                {t('contact.sendMessage')}
              </h2>

              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-xl text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-xl mb-2">{t('contact.success.title')}</h3>
                  <p className="mb-4">{t('contact.success.message')}</p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-sm text-green-700 underline hover:text-green-900"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >

                  {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-ink mb-1.5">
                        {t('contact.fullName')}
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
                        {t('contact.email')}
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-ink mb-1.5">
                      {t('contact.company')}
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      required
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-ink mb-1.5">
                      {t('contact.subject')}
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400"
                    >
                      <option value="">{t('contact.selectSubject')}</option>
                      {subjects.map((subject) => (
                        <option key={subject.key} value={subject.label}>{subject.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-ink mb-1.5">
                      {t('contact.message')}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 ${fieldErrors.message ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {fieldErrors.message && <p className="text-red-500 text-xs mt-1">{fieldErrors.message}</p>}
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">* {t('common.required')}</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 font-medium"
                  >
                    {isSubmitting ? t('common.sending') : t('common.send')}
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-ink tracking-tight mb-10">{t('contact.faq.title')}</h2>
        <div className="divide-y divide-zinc-200">
          {[0, 1, 2, 3, 4].map((i) => (
            <details key={i} className="group py-5">
              <summary className="font-medium text-ink cursor-pointer list-none flex justify-between items-center">
                {t(`contact.faq.items.${i}.q`)}
                <span className="text-zinc-400 group-open:rotate-180 transition-transform duration-300">&#9660;</span>
              </summary>
              <p className="mt-3 text-secondary text-sm leading-relaxed">{t(`contact.faq.items.${i}.a`)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
    </>
  );
};

export default ContactPage;
