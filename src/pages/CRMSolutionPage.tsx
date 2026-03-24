import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import {
  Users,
  LineChart,
  BarChart,
  MessageSquare,
  Calendar,
  Database,
  Zap,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Clock,
  ArrowRight,
  Star
} from 'lucide-react';
import AuditForm from '../components/AuditForm';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '../components/ui/OptimizedImage';

const CRMSolutionPage: React.FC = () => {
  const { t } = useTranslation('crm');
  const [showStartForm, setShowStartForm] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<number | null>(1);
  const navigate = useNavigate();

  const toggleFaq = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const featureIcons = [Users, LineChart, Calendar, MessageSquare, Database, BarChart];

  const features = (t('page.features.items', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    benefits: string[];
  }>).map((item, index) => ({ ...item, icon: featureIcons[index] }));

  const keyBenefits = t('page.keyBenefits.items', { returnObjects: true }) as Array<{
    title: string;
    value: string;
    description: string;
  }>;

  const testimonials = t('page.testimonials.items', { returnObjects: true }) as Array<{
    quote: string;
    name: string;
    position: string;
    company: string;
  }>;

  const testimonialImages = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&auto=format&fit=crop"
  ];

  const screenshots = t('page.screenshots.items', { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>;

  const screenshotImages = [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop"
  ];

  const faqs = (t('page.faq.items', { returnObjects: true }) as Array<{
    question: string;
    answer: string;
  }>).map((item, index) => ({ ...item, id: index + 1 }));

  const pricingPlans = (t('page.pricing.plans', { returnObjects: true }) as Array<{
    name: string;
    price: string;
    period: string;
    features: string[];
    cta: string;
  }>).map((plan, index) => ({ ...plan, popular: index === 1 }));

  const deploySteps = t('page.deployProcess.steps', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    duration: string;
  }>;

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white">
      <SEOHead
        title={t('page.seo.title')}
        description={t('page.seo.description')}
        keywords={t('page.seo.keywords')}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-block bg-indigo-800 bg-opacity-50 px-3 py-1 rounded-full text-sm font-medium">{t('page.hero.badge')}</span>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {t('page.hero.title')}
              </h1>
              <p className="text-xl text-indigo-100">
                {t('page.hero.description')}
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                >
                  {t('page.hero.ctaDemo')}
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
                >
                  {t('page.hero.ctaLearnMore')}
                </button>
              </div>

              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-400 w-5 h-5" />
                  <span className="text-indigo-100">{t('page.hero.check1')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-400 w-5 h-5" />
                  <span className="text-indigo-100">{t('page.hero.check2')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-400 w-5 h-5" />
                  <span className="text-indigo-100">{t('page.hero.check3')}</span>
                </div>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 rounded-3xl blur-3xl"></div>
              <OptimizedImage
                src="https://images.unsplash.com/photo-1551434678-e076c223a692"
                alt={t('page.hero.imageAlt')}
                responsive="half"
                width={1024}
                height={683}
                className="relative rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trusted By Section */}
      <div className="bg-white py-12 border-t border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-lg font-medium text-gray-600">
              {t('page.trustedBy')}
            </h2>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-70">
            <img src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=60&fit=crop&auto=format" alt="Logo client 1" loading="lazy" className="h-8 object-contain grayscale" />
            <img src="https://images.unsplash.com/photo-1603731125990-2c0aec2261f8?w=200&h=60&fit=crop&auto=format" alt="Logo client 2" loading="lazy" className="h-8 object-contain grayscale" />
            <img src="https://images.unsplash.com/photo-1622042349683-caa882b50724?w=200&h=60&fit=crop&auto=format" alt="Logo client 3" loading="lazy" className="h-8 object-contain grayscale" />
            <img src="https://images.unsplash.com/photo-1559130614-8fa487e2d0c0?w=200&h=60&fit=crop&auto=format" alt="Logo client 4" loading="lazy" className="h-8 object-contain grayscale" />
            <img src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=60&fit=crop&auto=format" alt="Logo client 5" loading="lazy" className="h-8 object-contain grayscale" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
            {t('page.features.badge')}
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
            {t('page.features.sectionTitle')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('page.features.sectionDescription')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Screenshots Section */}
      <div className="bg-indigo-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
              {t('page.screenshots.badge')}
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
              {t('page.screenshots.sectionTitle')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('page.screenshots.sectionDescription')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {screenshots.map((screenshot, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                data-aos="zoom-in"
                data-aos-delay={index * 150}
              >
                <div className="aspect-w-16 aspect-h-9">
                  <OptimizedImage
                    src={screenshotImages[index]}
                    alt={screenshot.title}
                    responsive="third"
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {screenshot.title}
                  </h3>
                  <p className="text-gray-600">
                    {screenshot.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Benefits Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
            {t('page.keyBenefits.badge')}
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
            {t('page.keyBenefits.sectionTitle')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('page.keyBenefits.sectionDescription')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {keyBenefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="text-3xl font-bold text-indigo-600 mb-3">{benefit.value}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-indigo-300 font-semibold text-sm uppercase tracking-wide">
              {t('page.testimonials.badge')}
            </span>
            <h2 className="text-3xl font-bold text-white mt-2 mb-4">
              {t('page.testimonials.sectionTitle')}
            </h2>
            <p className="text-xl text-indigo-100">
              {t('page.testimonials.sectionDescription')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 150}
              >
                <div className="flex mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-white mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonialImages[index]}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white"
                  />
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-indigo-100 text-sm">{testimonial.position}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
            {t('page.pricing.badge')}
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
            {t('page.pricing.sectionTitle')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('page.pricing.sectionDescription')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-lg p-8 relative hover:shadow-xl transition-all duration-300 flex flex-col ${
                plan.popular ? 'ring-2 ring-indigo-600' : ''
              }`}
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 rounded-bl-xl rounded-tr-xl text-sm font-medium">
                  {t('page.pricing.popular')}
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-indigo-600">{plan.price}</span>
                {plan.period && <span className="text-gray-500">/{plan.period}</span>}
              </div>
              <ul className="mb-8 flex-grow space-y-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  if (index === 2) {
                    navigate('/contact');
                  } else {
                    setShowStartForm(true);
                  }
                }}
                className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                } transition-colors`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-indigo-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
              {t('page.faq.badge')}
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
              {t('page.faq.sectionTitle')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('page.faq.sectionDescription')}
            </p>
          </div>

          <div className="max-w-3xl mx-auto rounded-xl bg-white shadow-lg overflow-hidden">
            {faqs.map((faq) => (
              <div key={faq.id} className="border-b last:border-0 border-gray-100">
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="flex justify-between items-center w-full px-6 py-4 text-left"
                >
                  <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                  {openFaqId === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-indigo-600" />
                  )}
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaqId === faq.id ? 'max-h-96 pb-4' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
            {t('page.deployProcess.badge')}
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
            {t('page.deployProcess.sectionTitle')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('page.deployProcess.sectionDescription')}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {deploySteps.map((step, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600 mb-4">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">
                {step.description}
              </p>
              <div className="flex items-center gap-2 mt-4 text-sm text-indigo-600">
                <Clock className="w-4 h-4" />
                <span>{step.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('page.cta.title')}
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              {t('page.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="bg-white text-indigo-700 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center justify-center gap-2"
              >
                {t('page.cta.ctaDemo')}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition flex items-center justify-center gap-2"
              >
                {t('page.cta.ctaContact')}
                <Phone className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2">
                <Mail className="text-indigo-300 w-5 h-5" />
                <a href="mailto:divers@distr-action.com" className="text-indigo-100 hover:text-white transition">
                  divers@distr-action.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="text-indigo-300 w-5 h-5" />
                <a href="tel:+32477942865" className="text-indigo-100 hover:text-white transition">
                  +32 477 94 28 65
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      <AuditForm
        isOpen={showStartForm}
        onClose={() => setShowStartForm(false)}
      />
    </section>
  );
};

export default CRMSolutionPage;
