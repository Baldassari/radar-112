import type { OcorrenciaResumo } from '../../api/types';
import { MobileListRow } from './MobileListRow';

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
          <MobileListRow key={o.id} id={o.id} niv={o.niv} title={o.tipo} meta={`${o.freguesia || o.concelho} · ${o.dur}`} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
