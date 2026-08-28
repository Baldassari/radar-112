import type { Nivel } from '../../api/types';

export function MobileListRow({
  id,
  niv,
  title,
  meta,
  onSelect,
}: {
  id: string;
  niv: Nivel;
  title: string;
  meta: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <button type="button" className="rdr-mobile-row" onClick={onSelect ? () => onSelect(id) : undefined}>
      <span className="rdr-mobile-row-bar" style={{ background: `var(--niv-${niv})` }} aria-hidden="true" />
      <span>
        <div className="rdr-mobile-row-title">{title}</div>
        <div className="rdr-mobile-row-meta">{meta}</div>
      </span>
    </button>
  );
}
