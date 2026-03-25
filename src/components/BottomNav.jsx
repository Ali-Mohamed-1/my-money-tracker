import './BottomNav.css';

export default function BottomNav({ tabs, active, onChange }) {
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        const Icon = tab.Icon;
        return (
          <button
            key={tab.id}
            className={`nav-btn ${isActive ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}
            aria-label={tab.labelAr}
          >
            <div className="nav-icon-wrapper">
              <Icon size={isActive ? 28 : 24} />
            </div>
            <span className="nav-label">{tab.labelAr}</span>
          </button>
        );
      })}
    </nav>
  );
}
