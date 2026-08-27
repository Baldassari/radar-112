const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** Formata uma data ISO ('YYYY-MM-DD') sem passar por Date/fuso-horário. */
export function formatDiaLabel(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${Number(d)} ${MESES[Number(m) - 1]}`;
}
