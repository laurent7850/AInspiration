import { useEffect, useRef, useState, useCallback } from 'react';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  threshold?: number;
}

/**
 * Hook that animates a number from 0 to `end` when the element
 * scrolls into view (IntersectionObserver).
 * Returns { ref, value, formattedValue }.
 */
export function useCountUp({
  end,
  duration = 2000,
  delay = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
  threshold = 0.3,
}: UseCountUpOptions) {
  const ref = useRef<HTMLDivElement>(null);
  // Reduced-motion users see the final value immediately, no count-up.
  // Resolved in a lazy initializer so the effect below never has to set state
  // synchronously (react-hooks/set-state-in-effect).
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [value, setValue] = useState(() => (reducedMotion ? end : 0));
  const [hasAnimated, setHasAnimated] = useState(reducedMotion);
  // Guards against starting the animation twice; a ref (not state) so the
  // effect does not need to re-run when the animation starts.
  const startedRef = useRef(reducedMotion);

  const animate = useCallback(() => {
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // ease-out cubic for a smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * end);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setValue(end);
      }
    };

    setTimeout(() => {
      setHasAnimated(true);
      requestAnimationFrame(tick);
    }, delay);
  }, [end, duration, delay]);

  useEffect(() => {
    const node = ref.current;
    if (!node || startedRef.current) return;

    const start = () => {
      startedRef.current = true;
      animate();
    };

    // Already visible at mount (above the fold): animate now rather than
    // waiting on an IntersectionObserver notification.
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      start();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          start();
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [animate, threshold]);

  const displayed = decimals > 0 ? value.toFixed(decimals) : Math.round(value);
  const formattedValue = `${prefix}${displayed}${suffix}`;

  return { ref, value, formattedValue, hasAnimated };
}
