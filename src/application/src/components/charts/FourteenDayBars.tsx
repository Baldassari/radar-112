import type { HistoricoDia } from '../../api/types';
import './FourteenDayBars.css';

export function FourteenDayBars({ dias }: { dias: HistoricoDia[] }) {
  const max = Math.max(1, ...dias.map((d) => d.count));
  const peakIndex = dias.reduce((best, d, i) => (d.count > dias[best].count ? i : best), 0);

  return (
    <div className="rdr-bars">
      {dias.map((d, i) => (
        <div key={d.dia} className="rdr-bars-col">
          <div className={`rdr-bars-bar${i === peakIndex ? ' peak' : ''}`} style={{ height: `${(d.count / max) * 100}%` }} />
          <span className="rdr-bars-day tabular-nums">{d.dia.slice(-2)}</span>
        </div>
      ))}
    </div>
  );
}
