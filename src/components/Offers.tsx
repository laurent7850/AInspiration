import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check } from 'lucide-react';
import Reveal from './ui/Reveal';
import AuditForm from './AuditForm';
import { useLocalizedPath } from '../hooks/useLocalizedPath';

/**
 * Three packaged offers with prices, third screen of the homepage.
 *
 * Copy and prices come from the `pricing` namespace (the source the FAQ
 * answers already quote: 0 €, 1 490 € HTVA, 290 €/mois) — one place to
 * change a price. Anchoring a price on the homepage was the audit's main
 * marketing recommendation: it filters the curious and reassures buyers.
 */
type PlanKey = 'audit' | 'express' | 'managed';

const PLANS: Array<{ key: PlanKey; featured?: boolean }> = [
  { key: 'audit' },
  { key: 'express', featured: true },
  { key: 'managed' },
];

export default function Offers() {
  const { t } = useTranslation('pricing');
  const { t: tc } = useTranslation('common');
  const { localizedPath } = useLocalizedPath();
  const [showAudit, setShowAudit] = useState(false);

  return (
    <section className="bg-surface py-16 lg:py-24" aria-labelledby="offers-title">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10 lg:mb-12">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-secondary mb-3">
            {tc('offers.eyebrow')}
          </p>
          <h2 id="offers-title" className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-ink leading-[1.1] mb-4">
            {tc('offers.title')}
          </h2>
          <p className="text-lg text-secondary leading-relaxed">{tc('offers.subtitle')}</p>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {PLANS.map((plan, index) => {
            const features = t(`plans.${plan.key}.features`, { returnObjects: true }) as string[];
            const priceNote = t(`plans.${plan.key}.priceNote`, '');
            return (
              <Reveal as="li" key={plan.key} delay={index * 90} className="h-full">
                <article
                  className={`flex h-full flex-col rounded-card p-8 ${
                    plan.featured
                      ? 'bg-night text-white shadow-diffuse-lg'
                      : 'bg-canvas text-ink border border-gray-100'
                  }`}
                >
                  {plan.featured && (
                    <span className="mb-4 inline-flex self-start rounded-full bg-accent/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-indigo-200">
                      {t('popular')}
                    </span>
                  )}
                  <h3 className="text-lg font-semibold tracking-tight">{t(`plans.${plan.key}.name`)}</h3>
                  <p className={`mt-2 text-base leading-relaxed ${plan.featured ? 'text-indigo-100/85' : 'text-secondary'}`}>
                    {t(`plans.${plan.key}.description`)}
                  </p>
                  <p className="mt-6 flex items-baseline gap-2">
                    <span className="font-display font-light text-4xl sm:text-5xl leading-none tabular-nums">
                      {t(`plans.${plan.key}.price`)}
                    </span>
                    {priceNote && (
                      <span className={`text-sm ${plan.featured ? 'text-indigo-100/85' : 'text-secondary'}`}>{priceNote}</span>
                    )}
                  </p>
                  <ul className="mt-6 space-y-2.5 flex-1">
                    {(Array.isArray(features) ? features : []).map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm leading-relaxed">
                        <Check
                          className={`mt-0.5 h-4 w-4 shrink-0 ${plan.featured ? 'text-aurora-teal' : 'text-teal-700'}`}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        <span className={plan.featured ? 'text-indigo-100/90' : 'text-ink'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    {plan.key === 'audit' ? (
                      <button
                        type="button"
                        onClick={() => setShowAudit(true)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 font-medium text-white transition-colors hover:bg-accent-light"
                      >
                        {t('cta.startFreeAudit')}
                        <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                      </button>
                    ) : (
                      <Link
                        to={localizedPath('/contact')}
                        className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 font-medium transition-colors ${
                          plan.featured
                            ? 'bg-white text-accent-dark hover:bg-indigo-50'
                            : 'border border-gray-300 text-ink hover:border-accent hover:text-accent-dark'
                        }`}
                      >
                        {plan.key === 'express' ? t('cta.orderExpress') : t('cta.contactUs')}
                        <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ul>

        <p className="mt-8 max-w-3xl text-sm text-secondary leading-relaxed">{t('mandatorySubscription')}</p>
      </div>

      <AuditForm isOpen={showAudit} onClose={() => setShowAudit(false)} />
    </section>
  );
}
