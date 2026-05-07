function PageRequestLogs() {
  const M = window.MERIDIAN;
  const [model, setModel] = React.useState('all');
  const [team, setTeam] = React.useState('all');
  const [status, setStatus] = React.useState('all');
  const [query, setQuery] = React.useState('');
  const [expanded, setExpanded] = React.useState(null);
  const [sortKey, setSortKey] = React.useState('time');
  const [sortDir, setSortDir] = React.useState('desc');

  const rows = React.useMemo(() => {
    let r = M.REQUEST_LOGS.slice();
    if (model !== 'all') r = r.filter(x => x.model === model);
    if (team !== 'all') r = r.filter(x => x.team === team);
    if (status !== 'all') r = r.filter(x => x.status === status);
    if (query) r = r.filter(x => x.id.includes(query.toLowerCase()));
    r.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return r;
  }, [model, team, status, query, sortKey, sortDir]);

  const toggleSort = (k) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('desc'); }
  };

  return (
    <div className="content" data-screen-label="Request Logs">
      <div className="card" style={{ padding: 16, marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="input" placeholder="Search request ID..." style={{ flex: '0 0 240px' }} value={query} onChange={e => setQuery(e.target.value)} />
          <select className="select" value={model} onChange={e => setModel(e.target.value)}>
            <option value="all">All models</option>
            {M.MODELS.map(m => <option key={m.id} value={m.short}>{m.name}</option>)}
          </select>
          <select className="select" value={team} onChange={e => setTeam(e.target.value)}>
            <option value="all">All teams</option>
            {M.TEAMS.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
          </select>
          <select className="select" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option>Success</option>
            <option>Error</option>
            <option>Rate Limited</option>
          </select>
          <div className="date-range" style={{ marginLeft: 'auto' }}>{Icon.cal()} May 1 – May 3{Icon.chevron()}</div>
          <button className="btn">{Icon.download()} Export CSV</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="between" style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="card-title">{rows.length} requests</div>
            <div className="card-sub">Page 1 of 57 · 50 rows per page</div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <SortTh k="id" label="Request ID" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                <SortTh k="time" label="Timestamp" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                <SortTh k="model" label="Model" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                <th>Routed From</th>
                <SortTh k="team" label="Team" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                <SortTh k="inTok" label="In Tok" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} align="right" />
                <SortTh k="outTok" label="Out Tok" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} align="right" />
                <SortTh k="cost" label="Cost" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} align="right" />
                <SortTh k="latency" label="Latency" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} align="right" />
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <React.Fragment key={r.id + i}>
                  <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                    <td className="mono">{r.id}</td>
                    <td className="mono dim" style={{ fontSize: 11 }}>{r.time}</td>
                    <td><span className={`model-badge model-${r.modelFamily}`}>{r.model}</span></td>
                    <td className="dim">{r.routedFrom || '—'}</td>
                    <td>{r.team}</td>
                    <td style={{ textAlign: 'right' }}>{r.inTok.toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>{r.outTok.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 400 }}>${r.cost.toFixed(4)}</td>
                    <td style={{ textAlign: 'right' }} className="dim">{r.latency}ms</td>
                    <td>
                      <span className={`dot-status status-${r.status === 'Success' ? 'green' : r.status === 'Error' ? 'red' : 'amber'}`}></span>
                      <span style={{ fontSize: 11.5 }}>{r.status}</span>
                    </td>
                  </tr>
                  {expanded === r.id && (
                    <tr>
                      <td colSpan="10" style={{ background: '#0C0E14', padding: 18 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
                          <DetailItem label="Routing decision" value={r.routedFrom ? `${r.routedFrom} → ${r.model}` : 'No reroute'} />
                          <DetailItem label="Cost saved" value={r.saving > 0 ? '$' + r.saving.toFixed(4) : '—'} highlight={r.saving > 0} />
                          <DetailItem label="Loop contribution" value="None" />
                          <DetailItem label="Flags" value={r.status === 'Error' ? 'API error' : r.status === 'Rate Limited' ? 'Rate limited' : 'Clean'} />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-dim)' }}>
          <span>Showing 1–{rows.length} of 2,847,391</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-ghost">‹ Prev</button>
            <button className="btn">1</button>
            <button className="btn btn-ghost">2</button>
            <button className="btn btn-ghost">3</button>
            <button className="btn btn-ghost">…</button>
            <button className="btn btn-ghost">57</button>
            <button className="btn btn-ghost">Next ›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SortTh({ k, label, sortKey, sortDir, onClick, align }) {
  return (
    <th onClick={() => onClick(k)} style={{ cursor: 'pointer', userSelect: 'none', textAlign: align || 'left' }}>
      {label}{sortKey === k && <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>}
    </th>
  );
}

function DetailItem({ label, value, highlight }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: 'var(--text-mute)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 13, marginTop: 6, color: highlight ? 'var(--green-2)' : 'var(--text)', fontWeight: highlight ? 500 : 300 }}>{value}</div>
    </div>
  );
}

window.PageRequestLogs = PageRequestLogs;
