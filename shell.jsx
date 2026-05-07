// Sidebar
function Sidebar({ page, setPage, user, onLogout }) {
  const items = [
    { id: 'overview', label: 'Overview', icon: 'overview' },
    { id: 'feed', label: 'Live Feed', icon: 'feed', dot: 'green' },
    { id: 'logs', label: 'Request Logs', icon: 'logs' },
    { id: 'agents', label: 'Agent Monitor', icon: 'agent', dot: 'amber' },
    { id: 'keys', label: 'Virtual Keys', icon: 'key' },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-name">Meridian</div>
        <div className="brand-tag">AI Operations</div>
      </div>

      <div className="nav">
        {items.map(it => (
          <div
            key={it.id}
            className={`nav-item ${page === it.id ? 'active' : ''}`}
            onClick={() => setPage(it.id)}
          >
            {Icon[it.icon]({ width: 16, height: 16 })}
            <div className="label">{it.label}</div>
            {it.dot && <div className={`nav-dot ${it.dot === 'amber' ? 'amber' : ''}`}></div>}
          </div>
        ))}
        <div
          className={`nav-item ${page === 'alerts' ? 'active' : ''}`}
          onClick={() => setPage('alerts')}
          style={{ marginTop: 8 }}
        >
          {Icon.bell({ width: 16, height: 16 })}
          <div className="label">Alerts</div>
          <div className="nav-badge">2</div>
        </div>
      </div>

      <div className="user-card">
        <div className="sidebar-link" style={{ marginTop: 2 }} onClick={() => {}}>
          {Icon.settings({ width: 16, height: 16 })}
          <div className="label">Settings</div>
        </div>

        <div className="user-card-row">
          <div className="user-avatar">
            {user && user.email ? user.email.slice(0, 2).toUpperCase() : 'ME'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user && user.email ? user.email.split('@')[0] : 'Account'}
            </div>
            <div className="user-role" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user && user.email ? user.email : '—'}
            </div>
          </div>
          {typeof onLogout === 'function' ? (
            <button type="button" className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 11 }} onClick={onLogout}>
              Log out
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

// Global search popover
function GlobalSearch({ setPage, setFleetSelected, setKeysFilter }) {
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [focused, setFocused] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const results = React.useMemo(() => {
    const query = q.toLowerCase().trim();
    const models = window.MERIDIAN.MODELS.filter(m =>
      !query || m.name.toLowerCase().includes(query) || m.family.includes(query)
    );
    const keys = window.MERIDIAN.VIRTUAL_KEYS.filter(k =>
      !query || k.name.toLowerCase().includes(query) || k.team.toLowerCase().includes(query) || k.mask.toLowerCase().includes(query)
    );
    const teams = window.MERIDIAN.TEAMS.filter(t =>
      !query || t.name.toLowerCase().includes(query)
    );
    return { models: models.slice(0, 6), keys: keys.slice(0, 6), teams: teams.slice(0, 4) };
  }, [q]);

  const total = results.models.length + results.keys.length + results.teams.length;

  return (
    <div className="search">
      <span className="search-icon">{Icon.search()}</span>
      <input
        ref={inputRef}
        className="search-input"
        placeholder="Search models, API keys, teams..."
        value={q}
        onChange={e => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 180)}
      />
      <span className="search-kbd">⌘K</span>

      {open && (
        <div className="search-popover">
          {total === 0 && <div className="search-empty">No matches for "{q}"</div>}

          {results.models.length > 0 && (
            <>
              <div className="search-section-title">Models</div>
              {results.models.map(m => (
                <div
                  key={m.id}
                  className="search-result"
                  onMouseDown={() => { setPage('overview'); setOpen(false); setQ(''); }}
                >
                  <div className="search-result-icon" style={{ background: m.color + '22', borderColor: m.color + '55' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }}></div>
                  </div>
                  <div className="search-result-meta">
                    <div className="search-result-title">{m.name}</div>
                    <div className="search-result-sub">{window.MERIDIAN.fmtNum(m.callsMonth)} calls · {window.MERIDIAN.fmtMoney(m.spend)} spend</div>
                  </div>
                  <div className="search-result-tag">Model</div>
                </div>
              ))}
            </>
          )}

          {results.keys.length > 0 && (
            <>
              <div className="search-section-title">API Keys</div>
              {results.keys.map(k => (
                <div
                  key={k.name}
                  className="search-result"
                  onMouseDown={() => { setPage('keys'); setKeysFilter(k.name); setOpen(false); setQ(''); }}
                >
                  <div className="search-result-icon">
                    {Icon.key({ width: 14, height: 14, stroke: 'var(--indigo-2)' })}
                  </div>
                  <div className="search-result-meta">
                    <div className="search-result-title">{k.name}</div>
                    <div className="search-result-sub mono">{k.mask} · {k.team}</div>
                  </div>
                  <div className="search-result-tag">Key</div>
                </div>
              ))}
            </>
          )}

          {results.teams.length > 0 && (
            <>
              <div className="search-section-title">Teams</div>
              {results.teams.map(t => (
                <div
                  key={t.name}
                  className="search-result"
                  onMouseDown={() => { setPage('keys'); setOpen(false); setQ(''); }}
                >
                  <div className="search-result-icon">
                    <div style={{ width: 14, height: 14, borderRadius: 4, background: window.MERIDIAN.TEAM_COLORS[t.name] || '#6366F1' }}></div>
                  </div>
                  <div className="search-result-meta">
                    <div className="search-result-title">{t.name}</div>
                    <div className="search-result-sub">{t.members} members · {window.MERIDIAN.fmtMoney(t.spend)} / {window.MERIDIAN.fmtMoney(t.budget)}</div>
                  </div>
                  <div className="search-result-tag">Team</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Header({ title, sub, search, demo }) {
  return (
    <div className="header">
      <div className="header-projects">
        <div style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontWeight: 500, fontSize: 14 }}>
          Project Alpha
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', color: 'rgba(255,255,255,.55)', fontWeight: 500, fontSize: 14 }}>
          Team Sigma
        </div>
      </div>

      <div className="header-search-wrap">
        {search}
      </div>

      <div className="header-actions">
        <button type="button" className="btn btn-primary" style={{ padding: '7px 12px' }}>
          Deploy
        </button>
        <div
          title={demo ? `Sample data · ${title}` : title}
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,.20)',
            background: 'rgba(255,255,255,.04)',
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          M
        </div>
      </div>
    </div>
  );
}

window.Sidebar = Sidebar;
window.GlobalSearch = GlobalSearch;
window.Header = Header;
