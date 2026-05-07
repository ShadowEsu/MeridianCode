// Frontend-only demo: sample data in data.jsx (no sign-in, no backend).
const DEMO_USER = { id: 'demo', email: 'demo@meridian.local' };

function AuthenticatedApp({ user }) {
  const [page, setPage] = React.useState('overview');
  const [keysFilter, setKeysFilter] = React.useState('');
  const [showSetup, setShowSetup] = React.useState(false);

  React.useEffect(() => {
    const k = 'meridian_setup_v1_' + user.id;
    try {
      setShowSetup(!localStorage.getItem(k));
    } catch {
      setShowSetup(true);
    }
  }, [user.id]);

  const titles = {
    overview: { title: 'Overview', sub: 'AI spend across all providers · May 2026' },
    feed: { title: 'Live Feed', sub: 'Real-time API call stream · all teams' },
    logs: { title: 'Request Logs', sub: 'Searchable history of every routed call' },
    agents: { title: 'Agent Monitor', sub: 'Long-running sessions and loop protection' },
    keys: { title: 'Virtual Keys', sub: 'Per-key budgets and team allocation' },
    alerts: { title: 'Alerts', sub: 'Cost and reliability thresholds' },
  };
  const meta = titles[page] || titles.overview;

  const M = window.MERIDIAN;

  return (
    <div className="app">
      {showSetup ? <SetupWizard user={user} onDone={() => setShowSetup(false)} /> : null}
      <Sidebar
        page={page}
        setPage={(p) => { setPage(p); if (p !== 'keys') setKeysFilter(''); }}
        user={user}
        onLogout={undefined}
      />
      <div className="main">
        {M.uiDemoSampleData ? (
          <div className="demo-data-ribbon">
            <span className="demo-data-pill">Sample data</span>
            <span className="demo-data-text">Dollar amounts and volumes are illustrative examples. Backend and sign-in are off for now.</span>
          </div>
        ) : null}
        <Header
          title={meta.title}
          sub={meta.sub}
          demo={M.uiDemoSampleData}
          search={<GlobalSearch setPage={setPage} setKeysFilter={setKeysFilter} setFleetSelected={() => {}} />}
        />
        {page === 'overview' && <PageOverview />}
        {page === 'feed' && <PageLiveFeed />}
        {page === 'logs' && <PageRequestLogs />}
        {page === 'agents' && <PageAgents />}
        {page === 'keys' && <PageKeys keysFilter={keysFilter} />}
        {page === 'alerts' && <PageAlerts />}
      </div>
    </div>
  );
}

function App() {
  return <AuthenticatedApp user={DEMO_USER} />;
}

(function boot() {
  const el = document.getElementById('root');
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
    el.innerHTML =
      '<div style="min-height:100vh;display:grid;place-content:center;padding:24px;background:#0a0b0d;color:#fda4af;font-family:\'Crimson Pro\',Georgia,serif;max-width:480px;margin:0 auto;text-align:center"><p style="margin:0 0 8px;font-weight:600;color:#e6e8ec">React did not load</p><p style="margin:0;font-size:13px;color:#9097a3">From the project folder run <code style="background:#161922;padding:2px 6px;border-radius:4px">npm install</code> then open this page via <code style="background:#161922;padding:2px 6px;border-radius:4px">npm start</code> or Live Server so <code style="background:#161922;padding:2px 6px;border-radius:4px">/node_modules/…</code> scripts load.</p></div>';
    return;
  }
  try {
    ReactDOM.createRoot(el).render(<App />);
  } catch (e) {
    el.innerHTML =
      '<div style="min-height:100vh;display:grid;place-content:center;padding:24px;background:#0a0b0d;color:#fda4af;font-family:\'Crimson Pro\',Georgia,serif"><p style="margin:0 0 8px;font-weight:600">Meridian failed to start</p><p style="margin:0;color:#e6e8ec;font-size:14px">' +
      String(e && e.message ? e.message : e) +
      '</p></div>';
  }
})();
