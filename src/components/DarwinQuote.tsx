import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function DarwinQuote() {
  const { t } = useTranslation('common');
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 py-16 sm:py-20"
    >
      {/* Decorative quotes */}
      <div className="absolute top-4 left-6 text-indigo-500/10 text-[10rem] leading-none font-serif select-none" aria-hidden>
        &ldquo;
      </div>
      <div className="absolute bottom-0 right-6 text-indigo-500/10 text-[10rem] leading-none font-serif select-none" aria-hidden>
        &rdquo;
      </div>

      <div className={`container mx-auto px-6 sm:px-8 max-w-3xl relative z-10 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Thin decorative line */}
        <div className="w-12 h-0.5 bg-indigo-400 mx-auto mb-8" />

        <blockquote className="text-center">
          <p className="text-xl sm:text-2xl lg:text-3xl font-light italic text-white/90 leading-relaxed tracking-wide">
            {t('darwinQuote.text')}
          </p>
          <footer className="mt-6 flex items-center justify-center gap-3">
            <div className="w-8 h-px bg-indigo-400/60" />
            <cite className="not-italic text-indigo-300 font-medium text-sm sm:text-base tracking-wider uppercase">
              Charles Darwin
            </cite>
            <div className="w-8 h-px bg-indigo-400/60" />
          </footer>
        </blockquote>

        {/* Thin decorative line */}
        <div className="w-12 h-0.5 bg-indigo-400 mx-auto mt-8" />
      </div>
    </section>
  );
}
