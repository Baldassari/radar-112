export function MobileKpiRow({ items }: { items: { label: string; value: string | number; color?: string }[] }) {
  return (
    <div className="rdr-mobile-kpis">
      {items.map((item) => (
        <div key={item.label} className="rdr-mobile-kpi">
          <span className="rdr-mobile-kpi-value tabular-nums" style={item.color ? { color: item.color } : undefined}>
            {item.value}
          </span>
          <span className="rdr-mobile-kpi-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
