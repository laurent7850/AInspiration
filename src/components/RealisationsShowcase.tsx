import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import RealisationCard from './realisations/RealisationCard';
import Reveal from './ui/Reveal';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { realisations } from '../data/realisations';

/**
 * Homepage proof block — four real builds, second screen after the hero.
 *
 * The audit of 2026-09-05 found the only real proof the site has (sixteen
 * shipped automations and apps) buried in the menu, while the homepage showed
 * self-declared engagements. This puts the proof where the promise is.
 * Cards and copy come from the same data/i18n as /realisations, so nothing
 * here can drift from the detail pages.
 */
const FEATURED_SLUGS = ['facturation-automatisee', 'reconciliation-caisse', 'factures-fournisseurs', 'audityo'];

export default function RealisationsShowcase() {
  const { t } = useTranslation('common');
  const { localizedPath } = useLocalizedPath();
  const featured = FEATURED_SLUGS
    .map((slug) => realisations.find((r) => r.slug === slug))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  return (
    <section className="bg-canvas py-16 lg:py-24" aria-labelledby="showcase-title">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-10 lg:mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-secondary mb-3">
              {t('showcase.eyebrow')}
            </p>
            <h2 id="showcase-title" className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-ink leading-[1.1] mb-4">
              {t('showcase.title')}
            </h2>
            <p className="text-lg text-secondary leading-relaxed">{t('showcase.subtitle')}</p>
          </div>
          <Link
            to={localizedPath('/realisations')}
            className="inline-flex items-center gap-2 self-start text-accent-dark font-medium hover:gap-3 transition-all"
          >
            {t('showcase.link')}
            <ArrowRight className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {featured.map((realisation, index) => (
            <Reveal as="li" key={realisation.slug} delay={index * 90} className="h-full">
              <RealisationCard realisation={realisation} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
