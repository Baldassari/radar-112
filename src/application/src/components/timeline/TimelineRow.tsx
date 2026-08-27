import type { OcorrenciaResumo } from '../../api/types';
import { NivTag } from '../common/NivTag';

export function TimelineRow({
  ocorrencia,
  selected,
  isNew,
  onSelect,
}: {
  ocorrencia: OcorrenciaResumo;
  selected: boolean;
  isNew: boolean;
  onSelect: (id: string) => void;
}) {
  const o = ocorrencia;
  return (
    <button
      type="button"
      className={`rdr-timeline-row${selected ? ' selected' : ''}${isNew ? ' enter' : ''}`}
      data-selected={selected}
      onClick={() => onSelect(o.id)}
    >
      <span className="rdr-timeline-row-hora tabular-nums">{o.hora}</span>
      <span className="rdr-timeline-row-bar" style={{ background: `var(--niv-${o.niv})` }} aria-hidden="true" />
      <span>
        <div className="rdr-timeline-row-title">{o.tipo}</div>
        <div className="rdr-timeline-row-local">{o.freguesia || o.concelho}</div>
        <div className="rdr-timeline-row-meta tabular-nums">
          {o.meios} meios · {o.operacionais} operacionais · há {o.dur}
        </div>
      </span>
      <span className="rdr-timeline-row-end">
        <NivTag niv={o.niv} />
        <span className="rdr-timeline-row-estado">{o.estado}</span>
      </span>
    </button>
  );
}
