import type { Nivel, OcorrenciaResumo } from '../api/types';

export type Facets = {
  q: string;
  niveis: Nivel[];
  distrito: string | null;
  tipos: string[];
};

/** Filtragem client-side sobre o pool "Ativas" já carregado — o portal é
 * pequeno o suficiente (dezenas de ocorrências ativas) para não valer a pena
 * um pedido ao servidor por cada combinação de filtros de faceta. */
export function applyFacets(items: OcorrenciaResumo[], facets: Facets): OcorrenciaResumo[] {
  return items.filter((o) => {
    if (facets.distrito && o.distrito !== facets.distrito) return false;
    if (facets.niveis.length && !facets.niveis.includes(o.niv)) return false;
    if (facets.tipos.length && !facets.tipos.includes(o.tipo)) return false;
    if (facets.q) {
      const q = facets.q.toLowerCase();
      if (!o.concelho.toLowerCase().includes(q) && !o.freguesia.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export function countByNivel(items: OcorrenciaResumo[]): Record<Nivel, number> {
  return {
    vermelho: items.filter((o) => o.niv === 'vermelho').length,
    laranja: items.filter((o) => o.niv === 'laranja').length,
    amarelo: items.filter((o) => o.niv === 'amarelo').length,
  };
}

export function countByDistrito(items: OcorrenciaResumo[], distritos: string[]): { nome: string; count: number }[] {
  return distritos
    .map((nome) => ({ nome, count: items.filter((o) => o.distrito === nome).length }))
    .sort((a, b) => b.count - a.count);
}
