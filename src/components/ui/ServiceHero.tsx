import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';

type AuroraGround = 'aurora' | 'teal' | 'quiet';

interface HeroCta {
  label: string;
  onClick?: () => void;
  to?: string;
  subtext?: string;
}

interface ServiceHeroProps {
  title: string;
  /** Key word(s) of the title, set in the teal data voice */
  highlight?: string;
  /** Optional tail of the title after the highlight */
  titleSuffix?: string;
  description?: string;
  primary?: HeroCta;
  secondary?: HeroCta;
  image?: string;
  imageAlt?: string;
  /** Which aurora ground carries the hero (see DESIGN.md, Three Grounds Rule) */
  ground?: AuroraGround;
  /** Shorter hero for Read surfaces (blog, about, legal) */
  compact?: boolean;
  /** Custom visual slot (replaces image) */
  children?: React.ReactNode;
}

const groundClass: Record<AuroraGround, string> = {
  aurora: 'bg-aurora',
  teal: 'bg-aurora-teal',
  quiet: 'bg-aurora-quiet',
};

/**
 * Aurora hero declension — the homepage hero's grammar applied to inner pages.
 * Jost-light display over the night ground, indigo pill CTA, teal highlight,
 * optional floating media frame. One component, three grounds, two densities.
 */
const ServiceHero: React.FC<ServiceHeroProps> = ({
  title,
  highlight,
  titleSuffix,
  description,
  primary,
  secondary,
  image,
  imageAlt,
  ground = 'aurora',
  compact = false,
  children,
}) => {
  const visual = children ?? (image ? (
    <div className="relative rounded-[2rem] overflow-hidden ring-1 ring-white/15 shadow-[0_45px_90px_-25px_rgba(6,6,25,0.85)]">
      <OptimizedImage
        src={image}
        alt={imageAlt || title}
        responsive="half"
        className="w-full object-cover"
      />
    </div>
  ) : null);

  const primaryButton = primary && (
    primary.to ? (
      <Link
        to={primary.to}
        className="group inline-flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-500 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_18px_45px_-12px_rgba(79,70,229,0.65)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <span>
          {primary.label}
          {primary.subtext && (
            <span className="block text-sm font-normal text-indigo-200 mt-0.5">{primary.subtext}</span>
          )}
        </span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    ) : (
      <button
        onClick={primary.onClick}
        className="group inline-flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-500 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_18px_45px_-12px_rgba(79,70,229,0.65)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <span>
          {primary.label}
          {primary.subtext && (
            <span className="block text-sm font-normal text-indigo-200 mt-0.5">{primary.subtext}</span>
          )}
        </span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    )
  );

  const secondaryButton = secondary && (
    secondary.to ? (
      <Link
        to={secondary.to}
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg text-white ring-1 ring-white/25 hover:ring-white/50 hover:bg-white/5 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        {secondary.label}
      </Link>
    ) : (
      <button
        onClick={secondary.onClick}
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg text-white ring-1 ring-white/25 hover:ring-white/50 hover:bg-white/5 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        {secondary.label}
      </button>
    )
  );

  const heading = (
    <h1 className={`font-display font-light text-white leading-[1.06] ${compact ? 'text-3xl sm:text-4xl lg:text-6xl mb-5' : 'text-4xl sm:text-5xl lg:text-7xl mb-6'}`}>
      {title}
      {highlight && (
        <>
          {' '}
          <span className="text-aurora-teal">{highlight}</span>
        </>
      )}
      {titleSuffix && <> {titleSuffix}</>}
    </h1>
  );

  return (
    <section className={`relative ${groundClass[ground]} text-white overflow-hidden ${compact ? 'pt-28 lg:pt-32 pb-12 lg:pb-16' : 'pt-28 lg:pt-36 pb-16 lg:pb-20'}`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {visual ? (
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              {heading}
              {description && (
                <p className="text-lg sm:text-xl text-indigo-100/85 max-w-[55ch] leading-relaxed mb-10">
                  {description}
                </p>
              )}
              {(primaryButton || secondaryButton) && (
                <div className="flex flex-wrap items-center gap-4">
                  {primaryButton}
                  {secondaryButton}
                </div>
              )}
            </div>
            <div className="lg:col-span-5 mt-8 lg:mt-0">
              {visual}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl">
            {heading}
            {description && (
              <p className="text-lg sm:text-xl text-indigo-100/85 max-w-[55ch] leading-relaxed mb-10">
                {description}
              </p>
            )}
            {(primaryButton || secondaryButton) && (
              <div className="flex flex-wrap items-center gap-4">
                {primaryButton}
                {secondaryButton}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ServiceHero;
