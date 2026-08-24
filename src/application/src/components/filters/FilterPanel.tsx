import type { Nivel } from '../../api/types';
import { NIVEL_LABEL } from '../../lib/niveis';
import './FilterPanel.css';

export type FilterPanelProps = {
  q: string;
  onQChange: (q: string) => void;
  niveis: Nivel[];
  onToggleNivel: (n: Nivel) => void;
  nivelCounts: Record<Nivel, number>;
  distrito: string | null;
  onToggleDistrito: (d: string) => void;
  distritoCounts: { nome: string; count: number }[];
  tipos: string[];
  onToggleTipo: (t: string) => void;
  tiposDisponiveis: string[];
  onClear: () => void;
};

export function FilterPanel({
  q,
  onQChange,
  niveis,
  onToggleNivel,
  nivelCounts,
  distrito,
  onToggleDistrito,
  distritoCounts,
  tipos,
  onToggleTipo,
  tiposDisponiveis,
  onClear,
}: FilterPanelProps) {
  return (
    <aside className="rdr-filters">
      <div className="rdr-filters-header">
        <h6>Filtros</h6>
        <button type="button" className="btn btn-ghost" onClick={onClear} style={{ fontSize: 11, padding: 0 }}>
          Limpar
        </button>
      </div>

      <div className="rdr-filters-field">
        <div className="field">
          <label htmlFor="rdr-loc">Localidade</label>
          <input
            id="rdr-loc"
            className="input"
            type="search"
            placeholder="Concelho ou freguesia"
            value={q}
            onChange={(e) => onQChange(e.target.value)}
          />
        </div>
      </div>

      <div className="rdr-filters-block">
        <h6>Criticidade</h6>
        <p className="rdr-filters-hint">Escala de aviso da Proteção Civil.</p>
        <div className="rdr-crit-list">
          {(Object.keys(NIVEL_LABEL) as Nivel[]).map((n) => {
            const active = niveis.includes(n);
            return (
              <button key={n} type="button" className={`rdr-crit-row${active ? ' active' : ''}`} onClick={() => onToggleNivel(n)}>
                <span className="rdr-crit-swatch" style={{ background: `var(--niv-${n})` }} aria-hidden="true" />
                <span className="rdr-crit-name">{NIVEL_LABEL[n]}</span>
                <span className="rdr-crit-count tabular-nums">{nivelCounts[n] ?? 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rdr-filters-block">
        <h6>Distrito</h6>
        <div className="rdr-distrito-list">
          {distritoCounts.map(({ nome, count }) => {
            const active = distrito === nome;
            return (
              <button key={nome} type="button" className={`rdr-distrito-row${active ? ' active' : ''}`} onClick={() => onToggleDistrito(nome)}>
                <span>{nome}</span>
                <span className="rdr-crit-count tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rdr-filters-block">
        <h6>Natureza</h6>
        <div className="rdr-tipos">
          {tiposDisponiveis.map((t) => {
            const active = tipos.includes(t);
            return (
              <button
                key={t}
                type="button"
                className={`tag tag-outline rdr-tipo-chip${active ? ' active' : ''}`}
                onClick={() => onToggleTipo(t)}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
