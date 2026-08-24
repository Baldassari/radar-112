import { useNavigate } from 'react-router-dom';
import { useOcorrencia } from '../../hooks/useOcorrencias';
import { NivTag } from '../common/NivTag';

export function SelectionCard({ id }: { id: string }) {
  const { data } = useOcorrencia(id);
  const navigate = useNavigate();
  if (!data) return null;

  return (
    <div className="rdr-selection-card">
      <div className="rdr-selection-top">
        <span className="rdr-selection-code">{data.id}</span>
        <NivTag niv={data.niv} />
      </div>
      <h3 className="rdr-selection-title">{data.tipo}</h3>
      <p className="rdr-selection-sub">
        {data.subtipo} · {data.freguesia || data.concelho}
      </p>
      <hr className="hr" />
      <div className="rdr-selection-kpis">
        <div className="rdr-selection-kpi">
          <span className="rdr-selection-kpi-value tabular-nums">{data.meios}</span>
          <span className="rdr-selection-kpi-label">Meios</span>
        </div>
        <div className="rdr-selection-kpi">
          <span className="rdr-selection-kpi-value tabular-nums">{data.operacionais}</span>
          <span className="rdr-selection-kpi-label">Operacionais</span>
        </div>
        <div className="rdr-selection-kpi">
          <span className="rdr-selection-kpi-value tabular-nums">{data.dur}</span>
          <span className="rdr-selection-kpi-label">Desde o alerta</span>
        </div>
      </div>
      <button type="button" className="btn btn-primary btn-block" onClick={() => navigate(`/ocorrencias/${data.id}`)}>
        Abrir detalhe da ocorrência →
      </button>
    </div>
  );
}
