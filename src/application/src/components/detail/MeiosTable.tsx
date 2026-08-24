import type { Meio } from '../../api/types';

export function MeiosTable({ meios }: { meios: Meio[] }) {
  return (
    <div>
      <h6>Meios no local</h6>
      <table className="table">
        <thead>
          <tr>
            <th>Entidade</th>
            <th>Meios</th>
            <th style={{ textAlign: 'right' }}>Operacionais</th>
            <th>Chegada</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {meios.map((m, i) => (
            <tr key={`${m.entidade}-${i}`}>
              <td>{m.entidade}</td>
              <td className="tabular-nums">{m.meios}</td>
              <td className="rdr-num-cell tabular-nums">{m.operacionais}</td>
              <td className="tabular-nums">{m.chegada}</td>
              <td>
                <span
                  className="tag"
                  style={
                    m.estado === 'No local'
                      ? { background: '#eae7e7', color: '#444141' }
                      : { background: '#FFE4CC', color: '#7A3600' }
                  }
                >
                  {m.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
