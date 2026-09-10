import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';

type HeroGround = 'canvas' | 'surface';

interface HeroCta {
  label: string;
  onClick?: () => void;
  to?: string;
  subtext?: string;
}

interface ServiceHeroProps {
  title: string;
  /** Mot-clé du titre, posé sur le surlignage accent (voir DESIGN.md, la règle du mot unique) */
  highlight?: string;
  /** Suite du titre après le mot surligné */
  titleSuffix?: string;
  description?: string;
  primary?: HeroCta;
  secondary?: HeroCta;
  image?: string;
  imageAlt?: string;
  /** Fond du hero : la craie par défaut, l'établi pour alterner avec la section suivante */
  ground?: HeroGround;
  /** Hero plus court pour les surfaces de lecture (blog, à propos, pages légales) */
  compact?: boolean;
  /** Visuel sur mesure (remplace l'image) */
  children?: React.ReactNode;
}

const groundClass: Record<HeroGround, string> = {
  canvas: 'bg-canvas',
  surface: 'bg-surface',
};

/**
 * Déclinaison du hero d'accueil pour les pages internes — grammaire Atelier clair :
 * fond clair, titre en 700 sur l'encre du logo, mot-clé surligné, CTA en pilule
 * accent, cadre média cerné d'un filet. Un composant, deux fonds, deux densités.
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
  ground = 'canvas',
  compact = false,
  children,
}) => {
  const visual = children ?? (image ? (
    <div className="relative rounded-card overflow-hidden border border-line">
      <OptimizedImage
        src={image}
        alt={imageAlt || title}
        responsive="half"
        className="w-full object-cover"
      />
    </div>
  ) : null);

  const primaryClass = 'group inline-flex items-center gap-3 bg-accent text-white px-8 py-4 rounded-button font-semibold text-lg hover:bg-accent-dark transition-colors duration-200 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent';
  const primaryInner = primary && (
    <>
      <span>
        {primary.label}
        {primary.subtext && (
          <span className="block text-sm font-normal text-white/85 mt-0.5">{primary.subtext}</span>
        )}
      </span>
      <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
    </>
  );

  const primaryButton = primary && (
    primary.to ? (
      <Link to={primary.to} className={primaryClass}>{primaryInner}</Link>
    ) : (
      <button onClick={primary.onClick} className={primaryClass}>{primaryInner}</button>
    )
  );

  const secondaryClass = 'inline-flex items-center gap-2 px-8 py-4 rounded-button font-semibold text-lg text-ink border border-line hover:border-ink hover:bg-surface transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent';
  const secondaryButton = secondary && (
    secondary.to ? (
      <Link to={secondary.to} className={secondaryClass}>{secondary.label}</Link>
    ) : (
      <button onClick={secondary.onClick} className={secondaryClass}>{secondary.label}</button>
    )
  );

  const heading = (
    <h1 className={`font-display font-bold text-ink leading-[1.16] ${compact ? 'text-3xl sm:text-4xl lg:text-5xl mb-5' : 'text-4xl sm:text-5xl lg:text-6xl mb-6'}`}>
      {title}
      {highlight && (
        <>
          {' '}
          <span className="title-mark">{highlight}</span>
        </>
      )}
      {titleSuffix && <> {titleSuffix}</>}
    </h1>
  );

  const body = (
    <>
      {heading}
      {description && (
        <p className="text-lg sm:text-xl text-secondary max-w-[55ch] leading-relaxed mb-10">
          {description}
        </p>
      )}
      {(primaryButton || secondaryButton) && (
        <div className="flex flex-wrap items-center gap-4">
          {primaryButton}
          {secondaryButton}
        </div>
      )}
    </>
  );

  return (
    <section className={`relative ${groundClass[ground]} text-ink ${compact ? 'pt-28 lg:pt-32 pb-12 lg:pb-16' : 'pt-28 lg:pt-36 pb-16 lg:pb-20'}`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {visual ? (
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-7">{body}</div>
            <div className="lg:col-span-5 mt-8 lg:mt-0">{visual}</div>
          </div>
        ) : (
          <div className="max-w-3xl">{body}</div>
        )}
      </div>
    </section>
  );
};

export default ServiceHero;
