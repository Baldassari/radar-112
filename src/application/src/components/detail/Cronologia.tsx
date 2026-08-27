import type { CronologiaEntry } from '../../api/types';

export function Cronologia({ entradas }: { entradas: CronologiaEntry[] }) {
  return (
    <div>
      <h6>Cronologia</h6>
      {entradas.map((c, i) => (
        <div key={`${c.hora}-${i}`} className="rdr-cronologia-row">
          <span className={`rdr-cronologia-hora tabular-nums${i === entradas.length - 1 ? ' ultima' : ''}`}>{c.hora}</span>
          <div>
            <p className="rdr-cronologia-titulo">{c.titulo}</p>
            <p className="rdr-cronologia-texto">{c.texto}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
