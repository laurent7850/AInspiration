import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Play, Pause, CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuditForm from './AuditForm';
import AnimatedStats from './AnimatedStats';
import { env } from '../config/environment';

const VIDEO_SOURCES: Record<string, { webm: string; mp4: string }> = {
  fr: { webm: '/videos/intro-fr.webm', mp4: '/videos/intro-fr.mp4' },
  en: { webm: '/videos/intro-en.webm', mp4: '/videos/intro-en.mp4' },
  nl: { webm: '/videos/intro-nl.webm', mp4: '/videos/intro-nl.mp4' },
};

/**
 * Met en évidence le mot-clé du titre (« 10h », « 10 Hours », « 10 uur ») par un
 * surlignage : Voile Bleu en fond, Bleu Encre en texte. Le mot vient de la
 * traduction (`hero.titleAccent`) : si la clé manque ou ne figure pas dans le
 * titre, le titre s'affiche tel quel plutôt que de casser une langue.
 */
function HighlightedTitle({ title, accent }: { title: string; accent: string }) {
  const at = accent ? title.indexOf(accent) : -1;
  if (at === -1) return <>{title}</>;

  return (
    <>
      {title.slice(0, at)}
      <span className="title-mark">{accent}</span>
      {title.slice(at + accent.length)}
    </>
  );
}

export default function Hero() {
  const [showStartForm, setShowStartForm] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t, i18n } = useTranslation('common');

  useEffect(() => {
    // Reduced-motion users keep the still image — no autoplaying video.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setTimeout(() => setVideoReady(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Force autoplay once video element is mounted
  useEffect(() => {
    if (!videoReady) return;
    const video = videoRef.current;
    if (!video) return;
    const tryPlay = () => {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay blocked by browser policy — show play button
        setIsPlaying(false);
      });
    };
    // Try immediately and also on canplay
    video.addEventListener('canplay', tryPlay, { once: true });
    if (video.readyState >= 3) tryPlay();
    return () => video.removeEventListener('canplay', tryPlay);
  }, [videoReady]);

  const lang = i18n.language?.substring(0, 2) || 'fr';
  const videoSource = VIDEO_SOURCES[lang] || VIDEO_SOURCES.fr;

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (hasEnded) {
      video.currentTime = 0;
      video.play();
      setHasEnded(false);
      setIsPlaying(true);
    } else if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section className="relative bg-canvas text-ink pt-24 lg:pt-32 pb-14 lg:pb-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Asymmetric grid — text 7 cols, visual 5 cols */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">

          {/* Left — Text content */}
          <div className="lg:col-span-7">
            <p className="flex items-center gap-3 text-sm font-semibold text-accent mb-5">
              <span className="w-7 h-[3px] rounded-full bg-accent" aria-hidden="true" />
              {t('hero.kicker')}
            </p>

            {/* leading-[1.16] : le mot surligné dépasse la hauteur de sa ligne
                (fond + padding), il lui faut cet interlignage pour respirer. */}
            <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-[4.5rem] text-ink leading-[1.16] mb-6">
              <HighlightedTitle title={t('hero.title')} accent={t('hero.titleAccent', '')} />
            </h1>
            <p className="text-lg sm:text-xl text-secondary max-w-[50ch] leading-relaxed mb-9">
              {t('hero.subtitle')}
            </p>

            <button
              onClick={() => setShowStartForm(true)}
              className="group inline-flex items-center gap-3 bg-accent text-white px-8 py-4 rounded-button font-semibold text-lg hover:bg-accent-dark transition-colors duration-200 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <span>
                {t('button.startFreeAudit')}
                <span className="block text-sm font-normal text-white/85 mt-0.5">{t('hero.ctaSubtext')}</span>
              </span>
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/15 group-hover:bg-white/25 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </span>
            </button>

            {env.bookingUrl && (
              <a
                href={env.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-ink underline-offset-4 hover:underline"
              >
                <CalendarDays className="w-4 h-4" aria-hidden="true" />
                {t('hero.bookCall')}
              </a>
            )}

            {/* Trust indicators — horizontal, minimal */}
            <div className="mt-11 flex flex-wrap gap-x-8 gap-y-3">
              {(['simple', 'secure', 'support'] as const).map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-[7px] h-[7px] rounded-full bg-accent" aria-hidden="true" />
                  <span className="text-sm text-secondary">{t(`hero.features.${key}`)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Video/Image, floating frame over the aurora */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="relative rounded-card overflow-hidden border border-line">
              <div className={`relative transition-opacity duration-700 ${hasEnded ? 'opacity-0' : 'opacity-100'}`}>
                {/* Stable LCP element — stays mounted so the largest paint is never
                    invalidated by a DOM swap. The video (loaded after 2s) overlays it. */}
                <img
                  src="/images/hero-ai-business.webp"
                  srcSet="/images/hero-ai-business-480.webp 480w, /images/hero-ai-business-800.webp 800w, /images/hero-ai-business.webp 1000w"
                  sizes="(max-width: 1024px) 90vw, 40vw"
                  alt={t('hero.imageAlt')}
                  className="w-full rounded-card"
                  // @ts-expect-error -- fetchpriority is valid HTML but not yet in React types
                  fetchpriority="high"
                  decoding="async"
                  width={600}
                  height={400}
                />
                {videoReady && (
                  <video
                    ref={videoRef}
                    key={videoSource.mp4}
                    className="absolute inset-0 w-full h-full object-cover rounded-card cursor-pointer"
                    poster="/images/hero-ai-business.webp"
                    preload="metadata"
                    playsInline
                    autoPlay
                    muted
                    onClick={handlePlayPause}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => { setIsPlaying(false); setHasEnded(true); }}
                  >
                    <source src={videoSource.mp4} type="video/mp4" />
                    <source src={videoSource.webm} type="video/webm" />
                  </video>
                )}
                {videoReady && !hasEnded && (
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 cursor-pointer ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
                    onClick={handlePlayPause}
                  >
                    <div className="bg-canvas/95 backdrop-blur-sm rounded-full p-4 border border-line transition-transform duration-200 hover:scale-110 active:scale-95">
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-indigo-600" />
                      ) : (
                        <Play className="w-6 h-6 text-indigo-600 ml-0.5" />
                      )}
                    </div>
                  </div>
                )}
              </div>
              {hasEnded && (
                <div className="absolute inset-0 transition-opacity duration-700 opacity-100">
                  <img
                    src="/images/hero-ai-business.webp"
                    alt={t('hero.imageAlt')}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar — clean dividers, no card */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="border-t border-line pt-10">
          <AnimatedStats variant="light" />
        </div>
      </div>

      <AuditForm
        isOpen={showStartForm}
        onClose={() => setShowStartForm(false)}
      />
    </section>
  );
}
