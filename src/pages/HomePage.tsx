import { lazy, Suspense } from 'react';
import SEOHead from '../components/SEOHead';
import Hero from '../components/Hero';
import {
  FeaturesSkeleton,
  TestimonialsSkeleton,
  CardSkeleton
} from '../components/ui/Skeleton';
import { getOrganizationSchema, getFAQSchema, getReviewSchema } from '../config/seoConfig';

const SocialProof = lazy(() => import('../components/SocialProof'));
const DarwinQuote = lazy(() => import('../components/DarwinQuote'));
const SEOIntro = lazy(() => import('../components/SEOIntro'));
const Features = lazy(() => import('../components/Features'));
const Testimonials = lazy(() => import('../components/Testimonials'));
const FAQ = lazy(() => import('../components/FAQ'));
const AuditSection = lazy(() => import('../components/AuditSection'));

// Skeleton pour la section Audit
const AuditSkeleton = () => (
  <section className="py-16 bg-indigo-600">
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-indigo-400 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-indigo-400 rounded w-full mb-2"></div>
          <div className="h-4 bg-indigo-400 rounded w-2/3 mx-auto mb-8"></div>
          <div className="h-12 bg-white/20 rounded-lg w-48 mx-auto"></div>
        </div>
      </div>
    </div>
  </section>
);

const faqData = [
  { question: "Faut-il des compétences techniques pour utiliser vos solutions ?", answer: "Absolument pas ! Nos solutions sont conçues pour être simples d'utilisation. Nous nous occupons de toute la partie technique." },
  { question: "Combien de temps faut-il pour mettre en place une solution IA ?", answer: "La plupart de nos solutions sont opérationnelles en 48h. L'audit gratuit prend 24h." },
  { question: "L'audit est-il vraiment gratuit et sans engagement ?", answer: "Oui, 100% gratuit et sans engagement. Nous analysons votre activité et vous livrons un plan d'action concret." },
  { question: "Mes données sont-elles en sécurité ?", answer: "Absolument. Nous sommes conformes RGPD et toutes les données sont hébergées en Europe." },
  { question: "Quel type d'entreprise peut bénéficier de vos services ?", answer: "Toute PME peut en bénéficier ! Restaurants, e-commerces, agences marketing, cabinets de conseil, artisans..." }
];

const reviewData = [
  { author: "Thierry", rating: 5, text: "On a divisé par deux les no-shows, je gagne au moins 1h par jour." },
  { author: "Sophie M.", rating: 5, text: "Notre taux d'engagement a bondi de 40% et on publie 3 fois plus souvent." },
  { author: "Marc D.", rating: 5, text: "70% des demandes sont traitées automatiquement. Le ROI a été visible dès le premier mois." }
];

const combinedSchema = [
  getOrganizationSchema(),
  getFAQSchema(faqData),
  getReviewSchema(reviewData)
];

export default function HomePage() {
  return (
    <main>
      <SEOHead
        includeOrganizationSchema={true}
        schema={combinedSchema}
      />

      {/* Hero Section - chargement direct, pas de lazy (LCP critique) */}
      <Hero />

      {/* Social Proof Bar */}
      <Suspense fallback={null}>
        <SocialProof />
      </Suspense>

      {/* Darwin Quote */}
      <Suspense fallback={null}>
        <DarwinQuote />
      </Suspense>

      {/* SEO Intro Section */}
      <Suspense fallback={null}>
        <SEOIntro />
      </Suspense>

      {/* Features Section */}
      <Suspense fallback={<FeaturesSkeleton />}>
        <Features />
      </Suspense>

      {/* Testimonials Section */}
      <Suspense fallback={<TestimonialsSkeleton />}>
        <Testimonials />
      </Suspense>

      {/* FAQ Section */}
      <Suspense fallback={null}>
        <FAQ />
      </Suspense>

      {/* Audit CTA Section */}
      <Suspense fallback={<AuditSkeleton />}>
        <AuditSection />
      </Suspense>
    </main>
  );
}
