import { useNavigate, useParams } from 'react-router-dom';
import { Cronologia } from '../components/detail/Cronologia';
import { MeiosTable } from '../components/detail/MeiosTable';
import { PressList } from '../components/detail/PressList';
import { StatusChain } from '../components/detail/StatusChain';
import { KpiGrid } from '../components/kpi/KpiGrid';
import { PtMap } from '../components/map/PtMap';
import { MobileDetalhe } from '../components/mobile/MobileDetalhe';
import { NivTag } from '../components/common/NivTag';
import { useIsMobileViewport } from '../hooks/useMediaQuery';
import { useOcorrencia } from '../hooks/useOcorrencias';
import './DetalhePage.css';

export function DetalhePage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobileViewport();
  const { data: o, isLoading } = useOcorrencia(id);

  if (isLoading) return <div className="rdr-page">A carregar…</div>;
  if (!o) return <div className="rdr-page">Ocorrência não encontrada.</div>;

  if (isMobile) return <MobileDetalhe ocorrencia={o} />;

  return (
    <div className="rdr-detalhe">
      <div className="rdr-detalhe-actionbar">
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
          ← Voltar ao mapa
        </button>
        <span className="rdr-detalhe-breadcrumb">
          Radar 112 · Ocorrências · {o.id}
        </span>
        <button type="button" className="btn btn-primary">
          Seguir esta ocorrência
        </button>
      </div>

      <div className="rdr-detalhe-header">
        <div>
          <span className="rdr-detalhe-kicker">{o.tipo}</span>
          <h1 className="rdr-detalhe-title">{o.subtipo}</h1>
          <div className="rdr-detalhe-tags">
            <NivTag niv={o.niv} />
            <span className="tag tag-neutral">{o.estado}</span>
            {o.viaCortada && <span className="tag tag-outline">Via cortada</span>}
            <span className="tag tag-neutral">{o.distrito}</span>
          </div>
        </div>
        <div className="rdr-detalhe-meta">
          {[
            ['Distrito', o.distrito],
            ['Concelho', o.concelho],
            ['Local', o.freguesia || o.concelho],
            ['Alerta', o.hora],
            ['Desde o alerta', o.dur],
            ['Viaturas envolvidas', String(o.viaturasEnvolvidas)],
          ].map(([label, value]) => (
            <div key={label} className="rdr-detalhe-meta-row">
              <span className="rdr-detalhe-meta-label">{label}</span>
              <span className="rdr-detalhe-meta-value tabular-nums">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <StatusChain estado={o.estado} cronologia={o.cronologia} />

      <div className="rdr-detalhe-corpo">
        <div className="rdr-detalhe-main">
          <div>
            <h6>Localização</h6>
            <div className="rdr-mapa-localizacao">
              <PtMap markers={[{ id: o.id, lat: o.lat, lon: o.lon, crit: o.niv, live: o.estado !== 'Encerrada' }]} selected={o.id} district={o.distrito} />
              <div className="rdr-coordenadas-cartucho tabular-nums">
                {o.lat.toFixed(4)}, {o.lon.toFixed(4)}
              </div>
            </div>
            <p className="rdr-mapa-caption">
              Posição aproximada ao nível do quilómetro. A localização exata não é divulgada publicamente.
            </p>
          </div>

          <Cronologia entradas={o.cronologia} />
          <MeiosTable meios={o.meiosNoLocal} />
        </div>

        <div className="rdr-detalhe-side">
          <div className="rdr-side-section">
            <h6>Ponto de situação</h6>
            <p style={{ fontSize: 13, opacity: 0.85 }}>{o.pontoDeSituacao}</p>
            <div className="rdr-aviso-publico">Se vai circular na zona: evite {o.freguesia || o.concelho} e siga a sinalização no local.</div>
          </div>

          <div className="rdr-side-section">
            <h6>Condições no local</h6>
            <KpiGrid items={o.condicoesNoLocal.map((c) => ({ label: c.label, value: c.valor }))} />
          </div>

          <PressList links={o.imprensa} />
        </div>
      </div>
    </div>
  );
}
