import type { ImprensaLink } from '../../api/types';

export function PressList({ links }: { links: ImprensaLink[] }) {
  if (links.length === 0) return null;
  return (
    <div className="rdr-side-section">
      <h6>Na imprensa</h6>
      {links.map((l, i) => (
        <a key={i} className="rdr-imprensa-link" href={l.url} target="_blank" rel="noreferrer">
          <div className="rdr-imprensa-meta">
            {l.fonte} · {l.hora}
          </div>
          <div className="rdr-imprensa-titulo">{l.titulo}</div>
        </a>
      ))}
    </div>
  );
}
