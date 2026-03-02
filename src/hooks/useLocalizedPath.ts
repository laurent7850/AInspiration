import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

const LANG_PREFIXES = ['en', 'nl'] as const;
type LangPrefix = (typeof LANG_PREFIXES)[number];

/**
 * Hook for language-aware navigation.
 *
 * Detects the current language from the URL prefix (/en/*, /nl/*).
 * French (fr) is the default language and uses no prefix.
 *
 * Returns:
 * - localizedPath(path) — prepends the current language prefix to a path
 * - switchLanguageTo(lang) — navigates to the equivalent page in another language
 * - currentLang — 'fr' | 'en' | 'nl'
 * - langPrefix — 'en' | 'nl' | null (null for French)
 */
export function useLocalizedPath() {
  const location = useLocation();
  const navigate = useNavigate();

  const segments = useMemo(
    () => location.pathname.split('/').filter(Boolean),
    [location.pathname]
  );

  const langPrefix: LangPrefix | null = LANG_PREFIXES.includes(
    segments[0] as LangPrefix
  )
    ? (segments[0] as LangPrefix)
    : null;

  const currentLang = langPrefix || 'fr';

  /** Prepend the current language prefix to a path. */
  const localizedPath = useCallback(
    (path: string): string => {
      if (!langPrefix) return path;
      const normalized = path.startsWith('/') ? path : `/${path}`;
      return `/${langPrefix}${normalized === '/' ? '' : normalized}`;
    },
    [langPrefix]
  );

  /** Navigate to the equivalent page in a different language. */
  const switchLanguageTo = useCallback(
    (lang: string) => {
      const basePath = langPrefix
        ? '/' + segments.slice(1).join('/')
        : location.pathname;
      const normalizedBase = basePath || '/';

      if (lang === 'fr') {
        navigate(normalizedBase);
      } else {
        navigate(
          `/${lang}${normalizedBase === '/' ? '' : normalizedBase}`
        );
      }
    },
    [langPrefix, segments, location.pathname, navigate]
  );

  return { localizedPath, switchLanguageTo, currentLang, langPrefix };
}
