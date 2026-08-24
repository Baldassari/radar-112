import './KpiGrid.css';

export function KpiGrid({ items }: { items: { label: string; value: string | number }[] }) {
  return (
    <div className="rdr-kpi-grid">
      {items.map((item) => (
        <div key={item.label} className="rdr-kpi-grid-cell">
          <span className="rdr-kpi-grid-value tabular-nums">{item.value}</span>
          <span className="rdr-kpi-grid-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
