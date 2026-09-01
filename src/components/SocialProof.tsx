import { useTranslation } from 'react-i18next';

const proofItems = [
  { labelKey: 'stats.acceleration' },
  { labelKey: 'stats.accuracy' },
  { labelKey: 'stats.clients' },
  { labelKey: 'stats.uptime' },
];

export default function SocialProof() {
  const { t } = useTranslation('common');

  return (
    <section className="py-6 bg-night border-b border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-0 md:divide-x md:divide-white/10">
          {proofItems.map(({ labelKey }) => (
            <span
              key={labelKey}
              className="px-4 md:px-8 text-xs font-medium text-indigo-100/70 uppercase tracking-[0.15em]"
            >
              {t(labelKey)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
