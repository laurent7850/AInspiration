import { lazy, Suspense } from 'react';
import SEOHead from '../components/SEOHead';
import {
  HeroSkeleton,
  FeaturesSkeleton,
  TestimonialsSkeleton,
  CardSkeleton
} from '../components/ui/Skeleton';
import { getOrganizationSchema } from '../config/seoConfig';

const Hero = lazy(() => import('../components/Hero'));
const Features = lazy(() => import('../components/Features'));
const Testimonials = lazy(() => import('../components/Testimonials'));
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

export default function HomePage() {
  return (
    <main>
      <SEOHead
        includeOrganizationSchema={true}
        schema={getOrganizationSchema()}
      />

      {/* Hero Section - priorité haute, pas de lazy loading excessif */}
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>

      {/* Features Section */}
      <Suspense fallback={<FeaturesSkeleton />}>
        <Features />
      </Suspense>

      {/* Testimonials Section */}
      <Suspense fallback={<TestimonialsSkeleton />}>
        <Testimonials />
      </Suspense>

      {/* Audit CTA Section */}
      <Suspense fallback={<AuditSkeleton />}>
        <AuditSection />
      </Suspense>
    </main>
  );
}
