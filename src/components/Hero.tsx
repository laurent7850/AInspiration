import React, { useState, useRef, useEffect } from 'react';
import { Brain, ShieldCheck, Users, Play, Pause } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import AuditForm from './AuditForm';
import AnimatedStats from './AnimatedStats';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&auto=format&fit=crop&q=80';

const VIDEO_SOURCES: Record<string, string> = {
  fr: '/videos/intro-fr.mp4',
  en: '/videos/intro-en.mp4',
  nl: '/videos/intro-nl.mp4',
};

export default function Hero() {
  const [showStartForm, setShowStartForm] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t, i18n } = useTranslation('common');

  // Defer video loading after LCP — start loading after 2s
  useEffect(() => {
    const timer = setTimeout(() => {
      setVideoReady(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const lang = i18n.language?.substring(0, 2) || 'fr';
  const videoSrc = VIDEO_SOURCES[lang] || VIDEO_SOURCES.fr;

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
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white pt-20 lg:pt-32 pb-12 lg:pb-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
              {t('hero.title')}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => setShowStartForm(true)}
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition-all font-semibold shadow-lg shadow-indigo-500/25 text-lg transform hover:-translate-y-0.5"
              >
                {t('button.startFreeAudit')}
                <span className="block text-sm font-normal opacity-80 mt-0.5">{t('hero.ctaSubtext')}</span>
              </button>
              <Link
                to="/etudes-de-cas"
                className="group relative px-8 py-4 rounded-lg font-semibold text-center text-indigo-600 border-2 border-indigo-300 hover:border-indigo-500 bg-white/80 backdrop-blur-sm hover:bg-indigo-50 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10"
              >
                <span className="flex items-center justify-center gap-2">
                  {t('button.seeCaseStudies')}
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </span>
                <span className="block text-sm font-normal opacity-60 mt-0.5">{t('hero.caseStudiesSubtext')}</span>
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <Brain className="text-indigo-600 w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-gray-600">{t('hero.features.simple')}</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <ShieldCheck className="text-indigo-600 w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-gray-600">{t('hero.features.secure')}</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <Users className="text-indigo-600 w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-gray-600">{t('hero.features.support')}</span>
              </div>
            </div>
          </div>

          <div className="relative mt-8 lg:mt-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl" aria-hidden="true"></div>
            <div className="relative rounded-2xl shadow-2xl overflow-hidden">
              {/* Video layer — deferred loading for LCP optimization */}
              <div className={`transition-opacity duration-700 ${hasEnded ? 'opacity-0' : 'opacity-100'}`}>
                {/* Poster image as LCP element — loads immediately */}
                {!videoReady && (
                  <img
                    src="/images/hero-ai-business.webp"
                    alt={t('hero.imageAlt')}
                    className="w-full rounded-2xl"
                    fetchPriority="high"
                    width={600}
                    height={400}
                  />
                )}
                {videoReady && (
                  <video
                    ref={videoRef}
                    key={videoSrc}
                    className="w-full rounded-2xl cursor-pointer"
                    poster="/images/hero-ai-business.webp"
                    preload="auto"
                    playsInline
                    autoPlay
                    muted
                    onClick={handlePlayPause}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => { setIsPlaying(false); setHasEnded(true); }}
                  >
                    <source src={videoSrc} type="video/mp4" />
                  </video>
                )}
                {/* Pause overlay (visible on hover during playback) */}
                {videoReady && !hasEnded && (
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 cursor-pointer ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
                    onClick={handlePlayPause}
                  >
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg transition-transform duration-200 hover:scale-110">
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-indigo-600" />
                      ) : (
                        <Play className="w-8 h-8 text-indigo-600 ml-1" />
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* Image layer - fades in when video ends */}
              <div className={`absolute inset-0 transition-opacity duration-700 ${hasEnded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <img
                  src={HERO_IMAGE}
                  alt={t('hero.imageAlt')}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Stats Bar */}
      <div className="container mx-auto px-4 mt-16">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10">
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
