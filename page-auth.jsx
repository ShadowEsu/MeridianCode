// Login / signup (not loaded in Meridian.html right now — wire back with npm run start:api + app gate).
function PageAuth({ onAuthed }) {
  const [mode, setMode] = React.useState('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const path = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const sameOriginHint =
      'Use the URL from npm start (same host and port as this page). Opening Meridian.html from disk or Live Server while the API runs on another port breaks /api/auth.';

    try {
      const r = await fetch(path, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const text = await r.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }
      if (!r.ok) {
        const code = `HTTP ${r.status}`;
        const fromApi = data.error || data.message;
        const bodySnippet =
          text && text.length > 0 && text.length < 400 && !/^\s*</.test(text)
            ? text.trim()
            : '';
        setError(
          fromApi ||
            (bodySnippet ? `${bodySnippet} (${code})` : null) ||
            (r.status === 404
              ? `No API at ${path} (${code}). ${sameOriginHint}`
              : `${code}. ${fromApi ? '' : sameOriginHint}`.trim()
        );
        return;
      }
      if (!data.user) {
        setError('Unexpected response (missing user). Try again or check the server log.');
        return;
      }
      onAuthed(data.user, { isNew: !!data.isNew });
    } catch {
      setError(
        'Network error — could not reach the server. From the project folder run: npm install && npm start, then open the URL shown (e.g. http://localhost:5500). ' +
          sameOriginHint
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="auth-visual-inner">
          <div className="auth-orbit" aria-hidden="true">
            <div className="auth-orbit-ring" />
            <div className="auth-orbit-ring r2" />
            <div className="auth-orbit-dot" />
          </div>
          <div className="auth-visual-brand">
            <div className="auth-visual-logo">{Icon.logo()}</div>
            <h1 className="auth-visual-title">Meridian</h1>
            <p className="auth-visual-tag">AI cost intelligence · routing · fleet</p>
          </div>
          <ul className="auth-feature-list">
            <li><span className="auth-check">✓</span> Encrypted provider keys on your server</li>
            <li><span className="auth-check">✓</span> Session cookies (JWT) — no tokens in localStorage</li>
            <li><span className="auth-check">✓</span> Sample dashboard while you wire real data</li>
          </ul>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-panel-card">
          <div className="auth-panel-head">
            <p className="auth-eyebrow">{mode === 'login' ? 'Welcome back' : 'Create workspace'}</p>
            <h2 className="auth-heading">{mode === 'login' ? 'Sign in' : 'Sign up'}</h2>
            <p className="auth-sub">
              {mode === 'login'
                ? 'Use the email and password you registered with.'
                : 'Accounts are stored in data/meridian-store.json on this machine.'}
            </p>
          </div>

          <div className="auth-seg">
            <button
              type="button"
              className={'auth-seg-btn' + (mode === 'login' ? ' on' : '')}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Log in
            </button>
            <button
              type="button"
              className={'auth-seg-btn' + (mode === 'signup' ? ' on' : '')}
              onClick={() => { setMode('signup'); setError(''); }}
            >
              Sign up
            </button>
          </div>

          <form className="auth-form" onSubmit={submit}>
            {error ? <div className="auth-error" role="alert">{error}</div> : null}

            <label className="auth-label">
              <span>Email</span>
              <input
                className="auth-input"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="auth-label">
              <span>Password</span>
              <input
                className="auth-input"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={mode === 'signup' ? 8 : 1}
              />
            </label>

            {mode === 'signup' ? (
              <p className="auth-micro">Password must be 8+ characters. This is a demo backend — use a unique password you do not reuse elsewhere.</p>
            ) : null}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : null}
              <span>{loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</span>
            </button>
          </form>
        </div>
        <p className="auth-foot">Meridian · sample UI data until you connect live metrics</p>
      </div>
    </div>
  );
}

window.PageAuth = PageAuth;
