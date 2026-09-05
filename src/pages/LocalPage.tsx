import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, MapPin, Wrench, Languages, ShieldCheck, CalendarDays } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import AuditForm from '../components/AuditForm';
import Reveal from '../components/ui/Reveal';
import RealisationCard from '../components/realisations/RealisationCard';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { realisations } from '../data/realisations';
import { env } from '../config/environment';

/**
 * Local landing page — "PME du Hainaut et de Bruxelles".
 *
 * The audit found the site claiming four different anchors (Hainaut, Enghien,
 * Givry, Belgique) without owning any of them, while "automatisation IA PME
 * Hainaut" is a search space nobody occupies. This page owns it: local proof
 * (real builds), local arguments (on site, tools Belgian SMEs use, three
 * languages, EU data) and the two conversion paths, audit and booking.
 *
 * Copy lives in the `local` namespace (fr/en/nl). Server-side, the route is
 * in KNOWN_ROUTES and SERVICE_NS so crawlers get the full copy.
 */
const WHY_ICONS = [MapPin, Wrench, Languages, ShieldCheck];
const FEATURED_SLUGS = ['reconciliation-caisse', 'tl-services', 'artpero', 'facturation-automatisee'];

type Item = { title: string; body: string };
type Sector = { name: string; body: string };
type Faq = { q: string; a: string };

export default function LocalPage() {
  const { t } = useTranslation('local');
  const { localizedPath } = useLocalizedPath();
  const [showAudit, setShowAudit] = useState(false);

  const why = (t('why.items', { returnObjects: true }) as Item[]) || [];
  const sectors = (t('sectors.items', { returnObjects: true }) as Sector[]) || [];
  const faq = (t('faq.items', { returnObjects: true }) as Faq[]) || [];
  const featured = FEATURED_SLUGS
    .map((slug) => realisations.find((r) => r.slug === slug))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (Array.isArray(faq) ? faq : []).map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <SEOHead title={t('seo.title')} description={t('seo.description')} schema={faqSchema} />

      {/* Hero */}
      <section className="relative bg-aurora text-white overflow-hidden pt-28 lg:pt-32 pb-16 lg:pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-100/80 mb-4">{t('hero.eyebrow')}</p>
            <h1 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl leading-[1.06] mb-6">{t('hero.title')}</h1>
            <p className="text-lg text-indigo-100/85 leading-relaxed max-w-2xl mb-8">{t('hero.subtitle')}</p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setShowAudit(true)}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-medium text-white shadow-[0_18px_45px_-12px_rgba(79,70,229,0.65)] transition-colors hover:bg-accent-light"
              >
                {t('hero.cta')}
                <ArrowRight className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
              </button>
              {env.bookingUrl && (
                <a
                  href={env.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3.5 font-medium text-white hover:bg-white/10"
                >
                  <CalendarDays className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                  {t('cta.book')}
                </a>
              )}
            </div>
            <p className="mt-3 text-sm text-indigo-100/85">{t('hero.ctaSub')}</p>
          </div>
        </div>
      </section>

      {/* Why local */}
      <section className="bg-surface py-16 lg:py-20" aria-labelledby="local-why">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="local-why" className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-ink leading-[1.1] mb-10 max-w-2xl">
            {t('why.title')}
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {why.map((item, i) => {
              const Icon = WHY_ICONS[i % WHY_ICONS.length];
              return (
                <Reveal as="li" key={item.title} delay={i * 90} className="flex gap-4 rounded-card bg-canvas p-6 lg:p-8">
                  <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent-dark">
                    <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-ink mb-2">{item.title}</h3>
                    <p className="text-base leading-relaxed text-secondary">{item.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Sectors */}
      <section className="bg-canvas py-16 lg:py-20" aria-labelledby="local-sectors">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 id="local-sectors" className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-ink leading-[1.1] mb-4">{t('sectors.title')}</h2>
            <p className="text-lg text-secondary leading-relaxed">{t('sectors.subtitle')}</p>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sectors.map((s) => (
              <div key={s.name} className="rounded-card bg-surface p-6 shadow-lift">
                <dt className="text-lg font-semibold tracking-tight text-ink mb-2">{s.name}</dt>
                <dd className="text-base leading-relaxed text-secondary">{s.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Proof */}
      <section className="bg-surface py-16 lg:py-20" aria-labelledby="local-proof">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-10">
            <div className="max-w-2xl">
              <h2 id="local-proof" className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-ink leading-[1.1] mb-4">{t('proof.title')}</h2>
              <p className="text-lg text-secondary leading-relaxed">{t('proof.subtitle')}</p>
            </div>
            <Link to={localizedPath('/realisations')} className="inline-flex items-center gap-2 self-start text-accent-dark font-medium hover:gap-3 transition-all">
              {t('proof.link')}
              <ArrowRight className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
            {featured.map((r, i) => (
              <Reveal as="li" key={r.slug} delay={i * 90} className="h-full">
                <RealisationCard realisation={r} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Funding */}
      <section className="bg-canvas py-16 lg:py-20" aria-labelledby="local-aid">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="local-aid" className="font-display font-light text-3xl sm:text-4xl text-ink leading-[1.1] mb-4">{t('aid.title')}</h2>
          <p className="text-lg text-secondary leading-relaxed mb-3">{t('aid.body')}</p>
          <p className="text-sm text-muted">{t('aid.note')}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface py-16 lg:py-20" aria-labelledby="local-faq">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="local-faq" className="font-display font-light text-3xl sm:text-4xl text-ink leading-[1.1] mb-8">{t('faq.title')}</h2>
          <dl className="divide-y divide-zinc-200">
            {faq.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="font-medium text-ink mb-2">{f.q}</dt>
                <dd className="text-secondary leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-aurora-teal text-white py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mb-5">{t('cta.title')}</h2>
            <p className="text-lg text-indigo-100/85 leading-relaxed mb-8">{t('cta.body')}</p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => setShowAudit(true)}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-medium text-white shadow-[0_18px_45px_-12px_rgba(79,70,229,0.65)] transition-colors hover:bg-accent-light"
              >
                {t('cta.audit')}
                <ArrowRight className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
              </button>
              {env.bookingUrl && (
                <a href={env.bookingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3.5 font-medium text-white hover:bg-white/10">
                  <CalendarDays className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                  {t('cta.book')}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <AuditForm isOpen={showAudit} onClose={() => setShowAudit(false)} />
    </>
  );
}
