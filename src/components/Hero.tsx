import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Play, Pause } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuditForm from './AuditForm';
import AnimatedStats from './AnimatedStats';

const VIDEO_SOURCES: Record<string, { webm: string; mp4: string }> = {
  fr: { webm: '/videos/intro-fr.webm', mp4: '/videos/intro-fr.mp4' },
  en: { webm: '/videos/intro-en.webm', mp4: '/videos/intro-en.mp4' },
  nl: { webm: '/videos/intro-nl.webm', mp4: '/videos/intro-nl.mp4' },
};

export default function Hero() {
  const [showStartForm, setShowStartForm] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t, i18n } = useTranslation('common');

  useEffect(() => {
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
    <section className="relative bg-canvas pt-24 lg:pt-32 pb-16 lg:pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Asymmetric grid — text 7 cols, visual 5 cols */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">

          {/* Left — Text content */}
          <div className="lg:col-span-7">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-ink tracking-tighter leading-[1.05] mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-lg sm:text-xl text-secondary max-w-[50ch] leading-relaxed mb-10">
              {t('hero.subtitle')}
            </p>

            <button
              onClick={() => setShowStartForm(true)}
              className="group inline-flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/25"
            >
              <span>
                {t('button.startFreeAudit')}
                <span className="block text-sm font-normal text-zinc-400 mt-0.5">{t('hero.ctaSubtext')}</span>
              </span>
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </span>
            </button>

            {/* Trust indicators — horizontal, minimal */}
            <div className="mt-12 flex flex-wrap gap-8">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm text-secondary">{t('hero.features.simple')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '200ms' }} />
                <span className="text-sm text-secondary">{t('hero.features.secure')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '400ms' }} />
                <span className="text-sm text-secondary">{t('hero.features.support')}</span>
              </div>
            </div>
          </div>

          {/* Right — Video/Image */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="relative rounded-[2rem] overflow-hidden shadow-diffuse-lg">
              <div className={`relative transition-opacity duration-700 ${hasEnded ? 'opacity-0' : 'opacity-100'}`}>
                {/* Stable LCP element — stays mounted so the largest paint is never
                    invalidated by a DOM swap. The video (loaded after 2s) overlays it. */}
                <img
                  src="/images/hero-ai-business.webp"
                  srcSet="/images/hero-ai-business-480.webp 480w, /images/hero-ai-business.webp 1000w"
                  sizes="(max-width: 1024px) 90vw, 40vw"
                  alt={t('hero.imageAlt')}
                  className="w-full rounded-[2rem]"
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
                    className="absolute inset-0 w-full h-full object-cover rounded-[2rem] cursor-pointer"
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
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-diffuse transition-transform duration-200 hover:scale-110 active:scale-95">
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
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&auto=format&fit=crop&q=80"
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
        <div className="border-t border-zinc-200/60 pt-10">
          <AnimatedStats />
        </div>
      </div>

      <AuditForm
        isOpen={showStartForm}
        onClose={() => setShowStartForm(false)}
      />
    </section>
  );
}
