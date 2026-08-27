import type { Nivel } from '../../api/types';
import { NIVEL_LABEL } from '../../lib/niveis';

export function NivTag({ niv, filled = true }: { niv: Nivel; filled?: boolean }) {
  return (
    <span
      className="tag"
      style={
        filled
          ? { background: `var(--niv-${niv}-bg)`, color: `var(--niv-${niv}-fg)` }
          : { border: `1px solid var(--niv-${niv})`, color: `var(--niv-${niv})` }
      }
    >
      {NIVEL_LABEL[niv]}
    </span>
  );
}

export function NivSwatch({ niv }: { niv: Nivel }) {
  return <span style={{ width: 10, height: 10, display: 'inline-block', background: `var(--niv-${niv})` }} aria-hidden="true" />;
}
