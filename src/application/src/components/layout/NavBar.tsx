import { NavLink } from 'react-router-dom';
import { formatAgo, useAgoCounter } from '../../hooks/useAgoCounter';
import { useStreamState } from '../../hooks/useOcorrenciaStream';
import './NavBar.css';

const TABS = [
  { to: '/', label: 'Mapa', end: true },
  { to: '/ocorrencias', label: 'Ocorrências' },
  { to: '/historico', label: 'Histórico' },
  { to: '/distritos', label: 'Distritos' },
];

export function NavBar() {
  const { connected, syncedAt } = useStreamState();
  const ago = useAgoCounter(syncedAt);
  const stale = connected && ago > 90;

  return (
    <div className="nav rdr-nav">
      <div className="nav-brand">
        <span className="rdr-nav-brand-mark" aria-hidden="true" />
        <span>RADAR 112</span>
      </div>

      <nav className="rdr-nav-tabs">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `rdr-nav-tab${isActive ? ' active' : ''}`}>
            {t.label}
          </NavLink>
        ))}
      </nav>

      <div className="rdr-nav-live">
        <div className="rdr-live-indicator">
          <span className={`rdr-live-dot${connected ? '' : ' offline'}`} aria-hidden="true" />
          <span className="rdr-live-label">Em direto</span>
          <span className={`rdr-live-meta tabular-nums${stale ? ' warn' : ''}`}>
            {connected ? `· dados da Proteção Civil, ${formatAgo(ago)}` : '· a estabelecer ligação…'}
          </span>
        </div>
        <button type="button" className="btn btn-secondary">
          Subscrever alertas
        </button>
      </div>
    </div>
  );
}
