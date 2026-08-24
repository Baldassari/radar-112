import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** README: "Mobile é um layout próprio, não o desktop reflowed" — breakpoint
 * único que decide a árvore de componentes a montar, não só o CSS. */
export function useIsMobileViewport(): boolean {
  return useMediaQuery('(max-width: 700px)');
}
