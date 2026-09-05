import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Reveal from '../components/ui/Reveal';
import RealisationCard from '../components/realisations/RealisationCard';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import {
  realisations,
  REALISATION_CATEGORIES,
  type RealisationCategory,
} from '../data/realisations';

const isCategory = (value: string | null): value is RealisationCategory =>
  value !== null && (REALISATION_CATEGORIES as string[]).includes(value);

/**
 * Réalisations index.
 *
 * Filters are plain links carrying `?filtre=`, not buttons holding React state.
 * The brief requires them to work without JavaScript and to produce shareable
 * URLs; reading the filter from the query string gives both for free, and the
 * server-rendered HTML stays a real page with real internal links — which is
 * what the SEO incident of August taught us to care about.
 */
const RealisationsPage: React.FC = () => {
  const { t } = useTranslation('realisations');
  const { t: tc } = useTranslation('caseStudies');
  const { localizedPath } = useLocalizedPath();
  const [searchParams] = useSearchParams();

  const raw = searchParams.get('filtre');
  const active = isCategory(raw) ? raw : null;

  const visible = active
    ? realisations.filter((r) => r.categories.includes(active))
    : realisations;

  const filterHref = (category: RealisationCategory | null) =>
    category
      ? `${localizedPath('/realisations')}?filtre=${category}`
      : localizedPath('/realisations');

  const steps = [
    { title: t('method.step1Title'), body: t('method.step1Body') },
    { title: t('method.step2Title'), body: t('method.step2Body') },
    { title: t('method.step3Title'), body: t('method.step3Body') },
  ];

  return (
    <>
      <SEOHead
        canonical="/realisations"
        title={t('seo.title')}
        description={t('seo.description')}
        keywords={t('seo.keywords')}
      />

      {/* Hero — aurora ground, Jost-light display, teal highlight */}
      <section className="relative bg-aurora text-white overflow-hidden pt-28 lg:pt-32 pb-16 lg:pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl leading-[1.06] mb-6">
              {t('hero.title')}{' '}
              <span className="text-aurora-teal">{t('hero.highlight')}</span>{' '}
              {t('hero.titleSuffix')}
            </h1>
            <p className="text-lg text-indigo-100/85 leading-relaxed max-w-2xl mb-8">
              {t('hero.description')}
            </p>
            <Link
              to={localizedPath('/audit')}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-medium text-white shadow-[0_18px_45px_-12px_rgba(79,70,229,0.65)] transition-colors hover:bg-accent-light"
            >
              {t('hero.cta')}
              <ArrowRight className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </Link>
            <p className="mt-3 text-sm text-indigo-100/85">{t('hero.ctaSub')}</p>
          </div>

          {/* Consolidated figures — deliberately modest. The brief proposed
              "plus de 30 automatisations"; Phase 0 could not source it, so we
              only claim what this page itself demonstrates. */}
          <dl className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-night-line pt-10 max-w-4xl">
            {[
              { value: t('band.count'), label: t('band.countLabel') },
              { value: t('band.families'), label: t('band.familiesLabel') },
              { value: t('band.sourced'), label: t('band.sourcedLabel') },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display font-light text-5xl text-aurora-teal leading-none">
                    {stat.value}
                  </span>
                  <span className="mt-2 block text-sm text-indigo-100/85">{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="bg-canvas py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label={t('filters.legend')} className="mb-10">
            {/* A real h2: the card grid's h3 titles would otherwise follow the
                hero's h1 with no level-2 in between (WCAG 1.3.1 heading order). */}
            <h2 className="mb-4 text-sm font-medium text-secondary">{t('filters.legend')}</h2>
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link
                  to={filterHref(null)}
                  aria-current={active === null ? 'true' : undefined}
                  className={`inline-block rounded-full px-4 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    active === null
                      ? 'bg-accent text-white'
                      : 'bg-surface text-secondary shadow-lift hover:text-ink'
                  }`}
                >
                  {t('filters.all')}
                </Link>
              </li>
              {REALISATION_CATEGORIES.map((category) => (
                <li key={category}>
                  <Link
                    to={filterHref(category)}
                    aria-current={active === category ? 'true' : undefined}
                    className={`inline-block rounded-full px-4 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      active === category
                        ? 'bg-accent text-white'
                        : 'bg-surface text-secondary shadow-lift hover:text-ink'
                    }`}
                  >
                    {t(`filters.${category}`)}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted" aria-live="polite">
              {visible.length === 1
                ? t('filters.resultsOne')
                : t('filters.resultsOther', { count: visible.length })}
            </p>
          </nav>

          {visible.length === 0 ? (
            <p className="text-secondary">{t('filters.empty')}</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {visible.map((realisation, index) => (
                <Reveal as="li" key={realisation.slug} delay={(index % 3) * 90} className="h-full">
                  <RealisationCard realisation={realisation} />
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Scenarios — the former /etudes-de-cas page, merged here on 2026-09-05.
          Explicitly illustrative (no real client behind them), placed after
          the real builds so the proof comes before the projection. */}
      <section className="bg-canvas py-16 lg:py-20" aria-labelledby="scenarios-title">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-secondary mb-3">{tc('labels.scenario')}</p>
            <h2 id="scenarios-title" className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-ink leading-[1.1] mb-4">
              {tc('pageTitle')}
            </h2>
            <p className="text-lg text-secondary leading-relaxed">{tc('pageSubtitle')}</p>
          </div>
          <ul className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {(['study1', 'study2', 'study3'] as const).map((study, index) => (
              <Reveal as="li" key={study} delay={index * 90} className="h-full">
                <article className="flex h-full flex-col rounded-card bg-surface p-8 shadow-lift">
                  <span className="inline-flex self-start rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent-dark mb-4">
                    {tc(`${study}.industry`)}
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight text-ink mb-4">{tc(`${study}.title`)}</h3>
                  <dl className="space-y-4 text-sm leading-relaxed">
                    <div>
                      <dt className="font-medium text-ink">{tc('labels.challenge')}</dt>
                      <dd className="text-secondary">{tc(`${study}.challenge`)}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-ink">{tc('labels.solution')}</dt>
                      <dd className="text-secondary">{tc(`${study}.solution`)}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-ink">{tc('labels.results')}</dt>
                      <dd>
                        <ul className="mt-1 space-y-1 text-secondary">
                          {(['result1', 'result2', 'result3', 'result4'] as const).map((r) => (
                            <li key={r}>{tc(`${study}.${r}`)}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Method — three steps */}
      <section className="bg-surface py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-ink leading-[1.1] mb-4">
              {t('method.title')}
            </h2>
            <p className="text-lg text-secondary leading-relaxed">{t('method.description')}</p>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <Reveal as="li" key={step.title} delay={index * 90}>
                <span className="block font-display font-light text-3xl text-teal-700 leading-none mb-4">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-lg font-semibold tracking-tight text-ink mb-2">{step.title}</h3>
                <p className="text-base text-secondary leading-relaxed">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing CTA — aurora band, the Aurora world's CTA motif */}
      <section className="bg-aurora-teal text-white py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mb-5">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-indigo-100/85 leading-relaxed mb-8">{t('cta.body')}</p>
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

    </>
  );
};

export default RealisationsPage;
