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
  ArrowRight
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

      {/* Hero — Aurora declension */}
      <section className="relative bg-aurora text-white overflow-hidden pt-28 lg:pt-36 pb-16 lg:pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              <h1 className="font-display font-light text-4xl sm:text-5xl lg:text-7xl text-white leading-[1.06] mb-6">
                {t('page.hero.title')}
              </h1>
              <p className="text-lg sm:text-xl text-indigo-100/85 max-w-[55ch] leading-relaxed mb-10">
                {t('page.hero.description')}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="group inline-flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-500 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_18px_45px_-12px_rgba(79,70,229,0.65)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  {t('page.hero.ctaDemo')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg text-white ring-1 ring-white/25 hover:ring-white/50 hover:bg-white/5 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  {t('page.hero.ctaLearnMore')}
                </button>
              </div>

              <div className="mt-12 flex flex-wrap gap-8">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-aurora-teal" />
                  <span className="text-sm text-indigo-100/80">{t('page.hero.check1')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-aurora-teal" />
                  <span className="text-sm text-indigo-100/80">{t('page.hero.check2')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-aurora-teal" />
                  <span className="text-sm text-indigo-100/80">{t('page.hero.check3')}</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 hidden md:block">
              <div className="relative rounded-[2rem] overflow-hidden ring-1 ring-white/15 shadow-[0_45px_90px_-25px_rgba(6,6,25,0.85)]">
                <OptimizedImage
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692"
                  alt={t('page.hero.imageAlt')}
                  responsive="half"
                  width={1024}
                  height={683}
                  className="w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

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
      <div className="bg-aurora-teal text-white py-16">
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
