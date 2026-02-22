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
  const [value, setValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

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

    setTimeout(() => requestAnimationFrame(tick), delay);
  }, [end, duration, delay]);

  useEffect(() => {
    const node = ref.current;
    if (!node || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animate();
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [animate, hasAnimated, threshold]);

  const displayed = decimals > 0 ? value.toFixed(decimals) : Math.round(value);
  const formattedValue = `${prefix}${displayed}${suffix}`;

  return { ref, value, formattedValue, hasAnimated };
}
