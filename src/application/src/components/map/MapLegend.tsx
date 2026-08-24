import './MapLegend.css';

export function MapLegend({ ambito, count }: { ambito: string; count: number }) {
  const items: { label: string; color: string }[] = [
    { label: 'Vermelho', color: 'var(--niv-vermelho)' },
    { label: 'Laranja', color: 'var(--niv-laranja)' },
    { label: 'Amarelo', color: 'var(--niv-amarelo)' },
  ];
  return (
    <div className="rdr-map-topbar">
      <span className="rdr-map-ambito">{ambito}</span>
      <span className="rdr-map-count tabular-nums">{count} ocorrências</span>
      <div className="rdr-map-legend">
        {items.map((i) => (
          <span key={i.label} className="rdr-map-legend-item">
            <span className="rdr-map-legend-dot" style={{ background: i.color }} aria-hidden="true" />
            {i.label}
          </span>
        ))}
      </div>
    </div>
  );
}
