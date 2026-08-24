import { useEffect, useRef, useState } from 'react';

/** Mantém o id do último evento SSE visível por um curto período, para a
 * timeline animar só a linha que acabou de chegar (README: animation rdrIn
 * na ocorrência nova). */
export function useNewIds(lastEventId: string | null): Set<string> {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    if (!lastEventId) return;
    setIds((prev) => new Set(prev).add(lastEventId));
    const existing = timers.current.get(lastEventId);
    if (existing) clearTimeout(existing);
    const handle = setTimeout(() => {
      setIds((prev) => {
        const next = new Set(prev);
        next.delete(lastEventId);
        return next;
      });
      timers.current.delete(lastEventId);
    }, 900);
    timers.current.set(lastEventId, handle);
  }, [lastEventId]);

  useEffect(() => {
    const timersMap = timers.current;
    return () => {
      timersMap.forEach((h) => clearTimeout(h));
    };
  }, []);

  return ids;
}
