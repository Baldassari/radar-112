import type { OcorrenciaResumo } from '../../api/types';

export function PertoDeMimSheet({
  items,
  onSelect,
}: {
  items: OcorrenciaResumo[];
  onSelect: (id: string) => void;
}) {
  const proximas = items.slice(0, 4);
  return (
    <div className="rdr-mobile-sheet">
      <div className="rdr-mobile-sheet-handle" aria-hidden="true" />
      <h6 className="rdr-mobile-sheet-title">Perto de mim</h6>
      <div className="rdr-mobile-sheet-list">
        {proximas.length === 0 && <p style={{ padding: '0 16px', fontSize: 13, opacity: 0.6 }}>Sem ocorrências próximas.</p>}
        {proximas.map((o) => (
          <button key={o.id} type="button" className="rdr-mobile-row" onClick={() => onSelect(o.id)}>
            <span className="rdr-mobile-row-bar" style={{ background: `var(--niv-${o.niv})` }} aria-hidden="true" />
            <span>
              <div className="rdr-mobile-row-title">{o.tipo}</div>
              <div className="rdr-mobile-row-meta">
                {o.freguesia || o.concelho} · {o.dur}
              </div>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
