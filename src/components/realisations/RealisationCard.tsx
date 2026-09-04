import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OptimizedImage from '../ui/OptimizedImage';
import { useLocalizedPath } from '../../hooks/useLocalizedPath';
import type { Realisation } from '../../data/realisations';

interface RealisationCardProps {
  realisation: Realisation;
}

/**
 * Index card for one réalisation.
 *
 * Two design constraints from the brief, both load-bearing:
 *  - the card must stay readable and convincing **even if the capture does not
 *    load** (§5.2). Captures do not exist yet (Phase 4), so the media slot falls
 *    back to a typographic panel built from the first metric — which is the part
 *    that sells anyway. Nothing looks broken while we wait for screenshots.
 *  - `reduit` entries own no detail page. They render the same card without a
 *    link, rather than a dead "Voir le détail" — a link to nowhere would be
 *    noticed immediately and would cost more credibility than it buys.
 */
const RealisationCard: React.FC<RealisationCardProps> = ({ realisation }) => {
  const { t } = useTranslation('realisations');
  const { localizedPath } = useLocalizedPath();
  const base = `items.${realisation.slug}`;

  const hasDetail = realisation.format === 'complet';
  const to = localizedPath(`/realisations/${realisation.slug}`);
  const lead = realisation.metrics[0];
  // The fallback panel below only prints the sector text itself when there is
  // neither a cover nor a metric to show instead — that's the one case where
  // the header badge would repeat it. Once a cover exists, the metric is
  // irrelevant to what's on screen, so gating the badge on `lead` alone (the
  // original rule) silently drops it from every real photo whose item has no
  // metric — Artpéro, Audityo, DreamOracle, the site chat.
  const sectorShownInMedia = !realisation.cover && !lead;

  const media = realisation.cover ? (
    <OptimizedImage
      src={realisation.cover}
      alt={t(`${base}.title`)}
      className="w-full h-full object-cover"
      width={800}
      height={500}
    />
  ) : (
    // Typographic stand-in — the metric, set large on the night ground.
    <div className="w-full h-full bg-aurora-quiet flex items-center justify-center px-6 text-center">
      {lead ? (
        <span className="font-display font-light text-4xl sm:text-5xl text-aurora-teal leading-none">
          {lead.value}
        </span>
      ) : (
        <span className="font-display font-light text-2xl text-indigo-100/85 leading-snug">
          {t(`${base}.sector`)}
        </span>
      )}
    </div>
  );

  const body = (
    <>
      <div className="aspect-[16/10] overflow-hidden rounded-t-card">{media}</div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {!sectorShownInMedia && (
            <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent-dark">
              {t(`${base}.sector`)}
            </span>
          )}
          <span className="text-xs text-muted">{t(`card.${realisation.status}`)}</span>
        </div>

        <h3 className="text-lg font-semibold tracking-tight text-ink">{t(`${base}.title`)}</h3>

        <p className="mt-2 text-base leading-relaxed text-secondary">
          {t(`${base}.summary`)}
        </p>

        <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
          {realisation.technologies.slice(0, 3).map((tech) => (
            <li key={tech} className="text-xs text-muted">
              {tech}
            </li>
          ))}
        </ul>

        <div className="mt-5 pt-4 border-t border-gray-100 text-sm font-medium">
          {hasDetail ? (
            <span className="inline-flex items-center gap-1.5 text-accent group-hover:gap-2.5 transition-all duration-300">
              {t('card.detail')}
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </span>
          ) : (
            <span className="text-muted">{t('card.noDetail')}</span>
          )}
        </div>
      </div>
    </>
  );

  const shell =
    'group flex h-full flex-col overflow-hidden rounded-card bg-surface shadow-lift transition-shadow duration-300';

  if (!hasDetail) {
    return <article className={shell}>{body}</article>;
  }

  return (
    <article className={`${shell} hover:shadow-diffuse-lg`}>
      <Link to={to} className="flex h-full flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        {body}
      </Link>
    </article>
  );
};

export default RealisationCard;
