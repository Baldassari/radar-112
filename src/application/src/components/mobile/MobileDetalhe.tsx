import { useNavigate } from 'react-router-dom';
import type { OcorrenciaDetalhe } from '../../api/types';
import { Cronologia } from '../detail/Cronologia';
import { MeiosTable } from '../detail/MeiosTable';
import { PressList } from '../detail/PressList';
import { StatusChain } from '../detail/StatusChain';
import { KpiGrid } from '../kpi/KpiGrid';
import { PtMap } from '../map/PtMap';
import './Mobile.css';
import { MobileKpiRow } from './MobileKpiRow';

export function MobileDetalhe({ ocorrencia }: { ocorrencia: OcorrenciaDetalhe }) {
  const navigate = useNavigate();
  const o = ocorrencia;

  return (
    <div className="rdr-mobile-shell">
      <div className="rdr-mobile-back">
        <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
          ← {o.id}
        </button>
        <span className="rdr-mobile-breadcrumb">Radar 112 · Ocorrências</span>
      </div>

      <div className="rdr-mobile-faixa">
        Nível {o.niv} · {o.estado}
      </div>

      <h1 className="rdr-mobile-detalhe-title">{o.tipo}</h1>
      <p className="rdr-mobile-detalhe-sub">
        {o.subtipo} · {o.freguesia || o.concelho}, {o.distrito}
      </p>
      {(o.viaCortada || o.viaturasEnvolvidas != null) && (
        <div className="rdr-mobile-detalhe-tags">
          {o.viaCortada && <span className="tag tag-outline">Via cortada</span>}
          {o.viaturasEnvolvidas != null && <span className="tag tag-neutral">{o.viaturasEnvolvidas} viaturas envolvidas</span>}
        </div>
      )}

      <MobileKpiRow
        items={[
          { label: 'Meios', value: o.meios },
          { label: 'Operacionais', value: o.operacionais },
          { label: 'Desde o alerta', value: o.dur },
        ]}
      />

      <div className="rdr-mobile-minimapa">
        <PtMap markers={[{ id: o.id, lat: o.lat, lon: o.lon, crit: o.niv, live: o.estado !== 'Encerrada' }]} selected={o.id} district={o.distrito} labels={false} />
      </div>
      <div className="rdr-mobile-coords">
        <span className="tabular-nums">
          {o.lat.toFixed(4)}, {o.lon.toFixed(4)}
        </span>
        <p>Posição aproximada ao nível do quilómetro. A localização exata não é divulgada publicamente.</p>
      </div>

      <div className="rdr-mobile-detalhe-body">
        <StatusChain estado={o.estado} cronologia={o.cronologia} />

        <Cronologia entradas={o.cronologia} />

        <div className="rdr-mobile-table-scroll">
          <MeiosTable meios={o.meiosNoLocal} />
        </div>

        <div className="rdr-side-section">
          <h6>Ponto de situação</h6>
          <p style={{ fontSize: 13, opacity: 0.85 }}>{o.pontoDeSituacao}</p>
          <div className="rdr-aviso-publico">Se vai circular na zona: evite {o.freguesia || o.concelho} e siga a sinalização no local.</div>
        </div>

        <div>
          <h6>Condições no local</h6>
          <KpiGrid items={o.condicoesNoLocal.map((c) => ({ label: c.label, value: c.valor }))} />
        </div>

        <PressList links={o.imprensa} />
      </div>

      <div className="rdr-mobile-footer">
        <button type="button" className="btn btn-primary btn-block">
          Seguir esta ocorrência
        </button>
      </div>
    </div>
  );
}
