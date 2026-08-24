import { useNavigate } from 'react-router-dom';
import type { OcorrenciaDetalhe } from '../../api/types';
import { PtMap } from '../map/PtMap';
import './Mobile.css';

export function MobileDetalhe({ ocorrencia }: { ocorrencia: OcorrenciaDetalhe }) {
  const navigate = useNavigate();
  const o = ocorrencia;

  return (
    <div className="rdr-mobile-shell">
      <div className="rdr-mobile-back">
        <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
          ← {o.id}
        </button>
      </div>

      <div className="rdr-mobile-faixa">
        Nível {o.niv} · {o.estado}
      </div>

      <h1 className="rdr-mobile-detalhe-title">{o.tipo}</h1>
      <p className="rdr-mobile-detalhe-sub">
        {o.subtipo} · {o.freguesia || o.concelho}, {o.distrito}
      </p>

      <div className="rdr-mobile-kpis">
        <div className="rdr-mobile-kpi">
          <span className="rdr-mobile-kpi-value tabular-nums">{o.meios}</span>
          <span className="rdr-mobile-kpi-label">Meios</span>
        </div>
        <div className="rdr-mobile-kpi">
          <span className="rdr-mobile-kpi-value tabular-nums">{o.operacionais}</span>
          <span className="rdr-mobile-kpi-label">Operacionais</span>
        </div>
        <div className="rdr-mobile-kpi">
          <span className="rdr-mobile-kpi-value tabular-nums">{o.dur}</span>
          <span className="rdr-mobile-kpi-label">Desde o alerta</span>
        </div>
      </div>

      <div className="rdr-mobile-minimapa">
        <PtMap markers={[{ id: o.id, lat: o.lat, lon: o.lon, crit: o.niv, live: o.estado !== 'Encerrada' }]} selected={o.id} labels={false} />
      </div>

      <div className="rdr-mobile-cronologia">
        {o.cronologia.map((c, i) => (
          <div key={`${c.hora}-${i}`} className="rdr-mobile-cronologia-row">
            <span className="rdr-mobile-cronologia-hora tabular-nums">{c.hora}</span>
            <span>{c.titulo}</span>
          </div>
        ))}
      </div>

      <div className="rdr-mobile-footer">
        <button type="button" className="btn btn-primary btn-block">
          Seguir esta ocorrência
        </button>
      </div>
    </div>
  );
}
