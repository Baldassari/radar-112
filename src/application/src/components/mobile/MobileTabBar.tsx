import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Mapa', end: true },
  { to: '/ocorrencias', label: 'Ocorrências', end: false },
  { to: '/historico', label: 'Histórico', end: false },
  { to: '/distritos', label: 'Distritos', end: false },
];

export function MobileTabBar() {
  return (
    <div className="rdr-mobile-tabbar">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `rdr-mobile-tab${isActive ? ' active' : ''}`}>
          {t.label}
        </NavLink>
      ))}
    </div>
  );
}
