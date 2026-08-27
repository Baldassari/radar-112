import type { Kpis } from '../../api/types';
import './KpiStrip.css';

export function KpiStrip({ kpis }: { kpis: Kpis | undefined }) {
  const cells: { label: string; value: number; color?: string }[] = [
    { label: 'Ocorrências ativas', value: kpis?.ocorrenciasAtivas ?? 0, color: 'var(--color-accent)' },
    { label: 'Nível vermelho', value: kpis?.nivelVermelho ?? 0, color: 'var(--niv-vermelho)' },
    { label: 'Meios no terreno', value: kpis?.meiosNoTerreno ?? 0 },
    { label: 'Operacionais', value: kpis?.operacionais ?? 0 },
    { label: 'Distritos com ocorrências', value: kpis?.distritosComOcorrencias ?? 0 },
  ];

  return (
    <div className="rdr-kpi-strip">
      {cells.map((c) => (
        <div key={c.label} className="rdr-kpi-cell">
          <span className="rdr-kpi-value tabular-nums" style={{ color: c.color }}>
            {c.value}
          </span>
          <span className="rdr-kpi-label">{c.label}</span>
        </div>
      ))}
      {kpis?.avisoVermelhoAtivo && (
        <div className="rdr-kpi-aviso">
          <span className="rdr-kpi-aviso-titulo">{kpis.avisoVermelhoAtivo.titulo}</span>
          <span className="rdr-kpi-aviso-desc">{kpis.avisoVermelhoAtivo.descricao}</span>
        </div>
      )}
    </div>
  );
}
