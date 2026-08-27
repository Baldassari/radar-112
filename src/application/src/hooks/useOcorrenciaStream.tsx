import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { ocorrenciasSource } from '../api';
import { queryKeys } from '../api/queryKeys';

type StreamState = {
  syncedAt: Date | null;
  connected: boolean;
  lastEventId: string | null;
};

const StreamContext = createContext<StreamState>({ syncedAt: null, connected: false, lastEventId: null });

/** Monta a subscrição SSE (ou o simulador mock) uma única vez para toda a
 * app, e mantém o cache do TanStack Query em sincronia com os eventos
 * `ocorrencia.created` / `ocorrencia.updated` / `heartbeat`. */
export function StreamProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<StreamState>({ syncedAt: null, connected: false, lastEventId: null });
  const mountedOnce = useRef(false);

  useEffect(() => {
    if (mountedOnce.current) return undefined;
    mountedOnce.current = true;

    const unsubscribe = ocorrenciasSource.subscribe((event) => {
      if (event.type === 'heartbeat') {
        setState((s) => ({ ...s, connected: true, syncedAt: new Date(event.payload.syncedAt) }));
        return;
      }
      queryClient.setQueryData(queryKeys.ocorrencia(event.payload.id), event.payload);
      queryClient.invalidateQueries({ queryKey: ['ocorrencias'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.kpis() });
      queryClient.invalidateQueries({ queryKey: queryKeys.distritos() });
      setState((s) => ({ ...s, connected: true, syncedAt: new Date(), lastEventId: event.payload.id }));
    });

    return () => {
      unsubscribe();
      mountedOnce.current = false;
    };
  }, [queryClient]);

  return <StreamContext.Provider value={state}>{children}</StreamContext.Provider>;
}

export function useStreamState(): StreamState {
  return useContext(StreamContext);
}
