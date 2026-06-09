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
      className="relative bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 py-20 sm:py-28"
    >
      <div className={`max-w-3xl mx-auto px-6 sm:px-8 relative z-10 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="w-10 h-px bg-indigo-400 mx-auto mb-10" />

        <blockquote className="text-center">
          <p className="text-xl sm:text-2xl lg:text-3xl font-light italic text-white/90 leading-relaxed">
            {t('darwinQuote.text')}
          </p>
          <footer className="mt-8">
            <cite className="not-italic text-indigo-300 font-medium text-xs tracking-[0.2em] uppercase">
              Charles Darwin
            </cite>
          </footer>
        </blockquote>

        <div className="w-10 h-px bg-indigo-400 mx-auto mt-10" />
      </div>
    </section>
  );
}
