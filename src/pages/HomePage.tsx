import React, { lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';

const Hero = lazy(() => import('../components/Hero'));
const Features = lazy(() => import('../components/Features'));
const Testimonials = lazy(() => import('../components/Testimonials'));
const AuditSection = lazy(() => import('../components/AuditSection'));

const LoadingFallback = () => (
  <div className="h-96 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
  </div>
);

export default function HomePage() {
  return (
    <main>
      <Helmet>
        <title>AInspiration | Solutions d'Intelligence Artificielle pour Entreprises</title>
        <meta name="description" content="Transformez votre entreprise avec nos solutions d'IA. Audit gratuit, recommandations personnalisées et accompagnement expert pour optimiser vos processus." />
      </Helmet>
      <Suspense fallback={<LoadingFallback />}>
        <Hero />
        <Features />
        <Testimonials />
        <AuditSection />
      </Suspense>
    </main>
  );
}