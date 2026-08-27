import { useEffect, useState } from 'react';

/** Segundos desde `syncedAt`, a subir a cada segundo — o contador "há N s"
 * do nav. Mantém-se a subir mesmo que o stream falhe: é o sinal de
 * honestidade do "near-real-time" (README, Interactions & Behavior). */
export function useAgoCounter(syncedAt: Date | null): number {
  const [ago, setAgo] = useState(() => (syncedAt ? Math.round((Date.now() - syncedAt.getTime()) / 1000) : 0));

  useEffect(() => {
    if (!syncedAt) return undefined;
    setAgo(Math.round((Date.now() - syncedAt.getTime()) / 1000));
    const id = setInterval(() => {
      setAgo(Math.round((Date.now() - syncedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [syncedAt]);

  return ago;
}

export function formatAgo(seconds: number): string {
  if (seconds < 60) return `há ${seconds}s`;
  const min = Math.floor(seconds / 60);
  return `há ${min}min`;
}
