const TABS = ['Mapa', 'Lista', 'Alertas', 'Eu'];

export function MobileTabBar({ active = 'Mapa' }: { active?: string }) {
  return (
    <div className="rdr-mobile-tabbar">
      {TABS.map((t) => (
        <button key={t} type="button" className={`rdr-mobile-tab${t === active ? ' active' : ''}`}>
          {t}
        </button>
      ))}
    </div>
  );
}
