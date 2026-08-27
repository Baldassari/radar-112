import type { OcorrenciaResumo } from '../api/types';

const COLUNAS: (keyof OcorrenciaResumo)[] = [
  'id', 'hora', 'tipo', 'subtipo', 'concelho', 'freguesia', 'distrito', 'niv', 'estado', 'meios', 'operacionais', 'dur',
];

function escapeCsv(value: unknown): string {
  const s = String(value ?? '');
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function ocorrenciasToCsv(items: OcorrenciaResumo[]): string {
  const linhas = [COLUNAS.join(';'), ...items.map((o) => COLUNAS.map((c) => escapeCsv(o[c])).join(';'))];
  return linhas.join('\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
