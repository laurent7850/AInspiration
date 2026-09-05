import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Reveal from '../components/ui/Reveal';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { getRealisation, realisations } from '../data/realisations';

/**
 * One réalisation, in full.
 *
 * Section order is imposed by the brief (§5.3) and is not cosmetic: context and
 * problem are written from the manager's point of view, the technical detail is
 * folded away in a `<details>` so the manager never meets it and the engineer
 * still finds it, and "ce que ça peut donner chez vous" sits last because it is
 * the section that actually converts.
 *
 * A `reduit` slug has no detail page by design, so it redirects to the index
 * rather than rendering a thin page.
 */
const RealisationDetailPage: React.FC = () => {
  const { slug = '' } = useParams();
  const { t } = useTranslation('realisations');
  const { localizedPath } = useLocalizedPath();

  const realisation = getRealisation(slug);

  if (!realisation || realisation.format !== 'complet') {
    return <Navigate to={localizedPath('/realisations')} replace />;
  }

  const base = `items.${slug}`;
  const neighbours = realisations.filter((r) => r.format === 'complet');
  const position = neighbours.findIndex((r) => r.slug === slug);
  const previous = position > 0 ? neighbours[position - 1] : null;
  const next = position < neighbours.length - 1 ? neighbours[position + 1] : null;

  const meta = [
    { label: t('detail.sector'), value: t(`${base}.sector`) },
    { label: t('detail.year'), value: String(realisation.year) },
    ...(realisation.duration
      ? [{ label: t('detail.duration'), value: realisation.duration }]
      : []),
    { label: t('detail.status'), value: t(`card.${realisation.status}`) },
  ];

  return (
    <>
      <SEOHead
        canonical={`/realisations/${slug}`}
        title={`${t(`${base}.title`)} | ${t('seo.title')}`}
        description={t(`${base}.summary`)}
      />

      {/* Header */}
      <section className="relative bg-aurora-quiet text-white overflow-hidden pt-28 lg:pt-32 pb-14 lg:pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to={localizedPath('/realisations')}
            className="inline-flex items-center gap-2 text-sm text-indigo-100/85 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            {t('detail.backToIndex')}
          </Link>

          <div className="max-w-3xl">
            <h1 className="font-display font-light text-3xl sm:text-4xl lg:text-6xl leading-[1.06] mb-5">
              {t(`${base}.title`)}
            </h1>
            <p className="text-lg text-indigo-100/85 leading-relaxed max-w-2xl">
              {t(`${base}.summary`)}
            </p>
          </div>

          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-night-line pt-6">
            {meta.map((entry) => (
              <div key={entry.label}>
                <dt className="text-xs uppercase tracking-[0.2em] text-indigo-100/85">
                  {entry.label}
                </dt>
                <dd className="mt-1 text-base text-white">{entry.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Narrative */}
      <article className="bg-canvas py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[55ch] space-y-12">
            {(['context', 'problem', 'solution'] as const).map((section) => (
              <Reveal key={section}>
                <h2 className="font-display font-light text-2xl sm:text-3xl text-ink leading-tight mb-4">
                  {t(`detail.${section}`)}
                </h2>
                <p className="text-lg text-secondary leading-relaxed">{t(`${base}.${section}`)}</p>
              </Reveal>
            ))}
          </div>

          {/* Results — at most three, each one measured or stated. */}
          {realisation.metrics.length > 0 && (
            <Reveal className="mt-16">
              <h2 className="font-display font-light text-2xl sm:text-3xl text-ink leading-tight mb-8 max-w-[55ch]">
                {t('detail.results')}
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl">
                {realisation.metrics.map((metric) => (
                  <div key={metric.labelKey}>
                    <dt className="sr-only">{t(`${base}.metrics.${metric.labelKey}`)}</dt>
                    <dd>
                      <span className="block font-display font-light text-4xl sm:text-5xl text-teal-700 leading-none">
                        {metric.value}
                      </span>
                      <span className="mt-2 block text-sm text-secondary">
                        {t(`${base}.metrics.${metric.labelKey}`)}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 max-w-[55ch] text-lg text-secondary leading-relaxed">
                {t(`${base}.results`)}
              </p>
            </Reveal>
          )}

          {/* Technical detail — folded by default, on purpose. */}
          <Reveal className="mt-16 max-w-[55ch]">
            <details className="group rounded-card bg-surface p-6 shadow-lift">
              <summary className="cursor-pointer list-none text-lg font-semibold tracking-tight text-ink marker:hidden">
                {t('detail.howItWorks')}
                <span className="mt-1 block text-sm font-normal text-muted">
                  {t('detail.howItWorksHint')}
                </span>
              </summary>
              <p className="mt-5 text-base text-secondary leading-relaxed">
                {t(`${base}.howItWorks`)}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {realisation.technologies.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent-dark"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </details>
          </Reveal>
        </div>
      </article>

      {/* Transposition — the section that converts */}
      <section className="bg-aurora text-white py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[55ch]">
            <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mb-5">
              {t('detail.transposition')}
            </h2>
            <p className="text-lg text-indigo-100/85 leading-relaxed mb-8">
              {t(`${base}.transposition`)}
            </p>
            <Link
              to={localizedPath('/audit')}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-medium text-white shadow-[0_18px_45px_-12px_rgba(79,70,229,0.65)] transition-colors hover:bg-accent-light"
            >
              {t('cta.button')}
              <ArrowRight className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Previous / next */}
      <nav
        aria-label={t('detail.backToIndex')}
        className="bg-surface border-t border-gray-100 py-10"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-start justify-between gap-6">
          {previous ? (
            <Link
              to={localizedPath(`/realisations/${previous.slug}`)}
              className="group max-w-xs"
            >
              <span className="block text-xs uppercase tracking-[0.2em] text-muted">
                {t('detail.previous')}
              </span>
              <span className="mt-1 block text-base font-medium text-ink group-hover:text-accent transition-colors">
                {t(`items.${previous.slug}.title`)}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to={localizedPath(`/realisations/${next.slug}`)}
              className="group max-w-xs text-right"
            >
              <span className="block text-xs uppercase tracking-[0.2em] text-muted">
                {t('detail.next')}
              </span>
              <span className="mt-1 block text-base font-medium text-ink group-hover:text-accent transition-colors">
                {t(`items.${next.slug}.title`)}
              </span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default RealisationDetailPage;
