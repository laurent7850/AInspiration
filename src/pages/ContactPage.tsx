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
      value: "Grand place 50, 7850 Enghien, Belgique",
      link: "https://maps.google.com/?q=Grand+place+50,+7850+Enghien,+Belgique"
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
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={t('contact.pageTitle')}
            subtitle={t('contact.pageSubtitle')}
            centered
            as="h1"
          />

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {contactInfo.map((info, index) => (
            <a
              key={index}
              href={info.link}
              target={info.icon === MapPin ? "_blank" : undefined}
              rel={info.icon === MapPin ? "noopener noreferrer" : undefined}
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <info.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {info.title}
              </h3>
              <p className="text-blue-600">
                {info.value}
              </p>
            </a>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-600" />
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
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('contact.fullName')}
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('contact.email')}
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('contact.company')}
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      required
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('contact.subject')}
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">{t('contact.selectSubject')}</option>
                      {subjects.map((subject) => (
                        <option key={subject.key} value={subject.label}>{subject.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('contact.message')}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.message ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {fieldErrors.message && <p className="text-red-500 text-xs mt-1">{fieldErrors.message}</p>}
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">* {t('common.required')}</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? t('common.sending') : t('common.send')}
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            <div className="relative h-full min-h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2532.058093133317!2d3.9830214!3d50.6931661!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c3a7b9ee0baf3d%3A0x70d731af6746a8f5!2sGrand%20Place%2050%2C%207850%20Enghien%2C%20Belgium!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
                title={t('contact.info.mapTitle')}
              ></iframe>
              <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white p-4">
                <p className="font-semibold">Distr'Action SPRL</p>
                <p className="text-sm">Grand place 50, 7850 Enghien, Belgique</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">{t('contact.faq.title')}</h2>
        <div className="space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <details key={i} className="bg-white border border-gray-200 rounded-lg p-4 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                {t(`contact.faq.items.${i}.q`)}
                <span className="text-indigo-600 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="mt-3 text-gray-600 leading-relaxed">{t(`contact.faq.items.${i}.a`)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
    </>
  );
};

export default ContactPage;
