import { lazy, Suspense } from 'react';
import SEOHead from '../components/SEOHead';
import Hero from '../components/Hero';
import { CardSkeleton } from '../components/ui/Skeleton';
import { getOrganizationSchema, getFAQSchema } from '../config/seoConfig';
import { faqFallback } from '../data/faq';

/**
 * Homepage — six screens, one thread (redesign of 2026-09-05).
 *
 *   Hero (promise + audit CTA)
 *   → four real builds (the proof, was buried in the menu)
 *   → three offers with prices (the anchor the page never had)
 *   → how it works (the four audit steps)
 *   → FAQ
 *   → final CTA
 *
 * Removed on purpose: the "Fonctionnalités" SaaS-style feature grid (this is a
 * services company, not a software product), the Darwin quote and the 400-word
 * SEO block (filler the visitor had to scroll through; crawlers still get the
 * server-injected copy), and the self-declared "social proof" bar.
 */
const RealisationsShowcase = lazy(() => import('../components/RealisationsShowcase'));
const Offers = lazy(() => import('../components/Offers'));
const AuditSection = lazy(() => import('../components/AuditSection'));
const FAQ = lazy(() => import('../components/FAQ'));
const Testimonials = lazy(() => import('../components/Testimonials'));

const SectionSkeleton = () => (
  <section className="py-16 bg-canvas">
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  </section>
);

const combinedSchema = [
  getOrganizationSchema(),
  getFAQSchema(faqFallback)
];

export default function HomePage() {
  return (
    <main>
      <SEOHead includeOrganizationSchema={true} schema={combinedSchema} />

      {/* Hero — eager: LCP critical */}
      <Hero />

      {/* 2. Proof: four real builds */}
      <Suspense fallback={<SectionSkeleton />}>
        <RealisationsShowcase />
      </Suspense>

      {/* 3. Offers with prices */}
      <Suspense fallback={<SectionSkeleton />}>
        <Offers />
      </Suspense>

      {/* 4. How it works — the four audit steps + CTA */}
      <Suspense fallback={null}>
        <AuditSection />
      </Suspense>

      {/* 5. What it changes — illustrative scenarios, labelled as such */}
      <Suspense fallback={null}>
        <Testimonials />
      </Suspense>

      {/* 6. FAQ */}
      <Suspense fallback={null}>
        <FAQ />
      </Suspense>
    </main>
  );
}
