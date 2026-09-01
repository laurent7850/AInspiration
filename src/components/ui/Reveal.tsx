import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  /** Extra classes on the wrapper (layout classes welcome) */
  className?: string;
  /** Stagger delay in ms, applied once the element enters the viewport */
  delay?: number;
  /** Wrapper element — defaults to div */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Scroll-reveal wrapper — the Aurora world's single motion grammar.
 * Fades + lifts content as it enters the viewport (see .reveal in index.css).
 * Respects prefers-reduced-motion via CSS, so no JS branch is needed here.
 */
export default function Reveal({ children, className = '', delay = 0, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Already in the viewport at mount (above the fold, anchor navigation,
    // or an environment that starves IntersectionObserver): show immediately.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-revealed' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
