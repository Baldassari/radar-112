import type { Estado } from '../../api/types';

const CADEIA: Estado[] = ['Despacho', 'Em Curso', 'Chegada ao TO', 'Em Resolução', 'Em Conclusão', 'Encerrada'];

/** A cronologia é gerada (store.ts, novaCronologia) na mesma ordem da cadeia
 * de estados ANEPC, um passo por índice — por isso basta indexar por posição
 * em vez de tentar casar texto livre. */
export function StatusChain({ estado, cronologia }: { estado: Estado; cronologia: { titulo: string; hora: string }[] }) {
  const atualIdx = CADEIA.indexOf(estado === 'Vigilância' ? 'Em Conclusão' : estado);
  const passos = cronologia.filter((c) => c.titulo !== 'Em vigilância');

  return (
    <div className="rdr-status-chain">
      {CADEIA.map((nome, i) => {
        const status = i < atualIdx ? 'passado' : i === atualIdx ? 'atual' : 'futuro';
        return (
          <div key={nome} className={`rdr-status-cell ${status}`}>
            <span className="rdr-status-nome">{nome}</span>
            <span className="rdr-status-hora tabular-nums">{status === 'futuro' ? '—' : passos[i]?.hora ?? '—'}</span>
          </div>
        );
      })}
    </div>
  );
}
