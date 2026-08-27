import { useNavigate } from 'react-router-dom';
import type { OcorrenciaResumo, View } from '../../api/types';
import { SelectionCard } from './SelectionCard';
import { TimelineRow } from './TimelineRow';
import './Timeline.css';

const VIEWS: View[] = ['Ativas', 'Todas', 'Histórico'];

export function TimelineList({
  items,
  selectedId,
  onSelect,
  view,
  onViewChange,
  newIds,
}: {
  items: OcorrenciaResumo[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  view: View;
  onViewChange: (v: View) => void;
  newIds: Set<string>;
}) {
  const navigate = useNavigate();

  return (
    <div className="rdr-timeline-col">
      {selectedId && <SelectionCard id={selectedId} />}

      <div className="rdr-timeline-header">
        <h6>Timeline</h6>
      </div>
      <div className="rdr-timeline-seg">
        <div className="seg" role="group" aria-label="Filtrar por estado">
          {VIEWS.map((v) => (
            <button key={v} type="button" className="seg-opt" aria-pressed={view === v} onClick={() => onViewChange(v)}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="rdr-timeline-list">
        {items.length === 0 && <p className="rdr-timeline-empty">Sem ocorrências para os filtros selecionados.</p>}
        {items.map((o) => (
          <TimelineRow key={o.id} ocorrencia={o} selected={selectedId === o.id} isNew={newIds.has(o.id)} onSelect={onSelect} />
        ))}
      </div>

      <div className="rdr-timeline-footer">
        <span className="tabular-nums">{items.length} ocorrências</span>
        <button type="button" className="btn btn-ghost" onClick={() => navigate('/historico')}>
          Ver histórico →
        </button>
      </div>
    </div>
  );
}
