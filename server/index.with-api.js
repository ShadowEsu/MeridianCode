'use strict';

const path = require('path');
const crypto = require('crypto');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.JWT_SECRET || !process.env.ENCRYPTION_KEY) {
  if (process.env.NODE_ENV === 'production') {
    console.error('Set JWT_SECRET and ENCRYPTION_KEY in .env (see .env.example)');
    process.exit(1);
  }
  process.env.JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
  process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  console.warn('[meridian] Dev mode: ephemeral JWT_SECRET + ENCRYPTION_KEY (add .env to persist encrypted keys across restarts)');
}

const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { createJsonStore } = require('./json-store');
const { encryptSecret, decryptSecret } = require('./crypto-secret');
const { signSession, clearSession, readUser, requireUser } = require('./auth-middleware');

const PORT = Number(process.env.PORT) || 5500;
const ROOT = path.join(__dirname, '..');
const STORE_PATH = process.env.MERIDIAN_STORE_PATH || path.join(ROOT, 'data', 'meridian-store.json');

const store = createJsonStore(STORE_PATH);

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', process.env.NODE_ENV === 'production');

app.use(helmet({
  // We serve local scripts from /node_modules; this demo doesn't ship a CSP yet.
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(express.json({ limit: '256kb', strict: true, type: ['application/json', 'application/*+json'] }));
app.use(cookieParser());

// Make user info available early (for user-based rate limiting).
app.use((req, _res, next) => {
  req.user = readUser(req);
  next();
});

function jsonError(res, status, error, extra) {
  res.status(status).json({ error, ...(extra || {}) });
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function safeText(s, max = 200) {
  // Basic sanitization for display fields: trim, collapse whitespace, remove control chars.
  const v = String(s || '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return v.slice(0, max);
}

function maskKey(secret) {
  const s = String(secret || '');
  // Prevent accidental logging / line breaks in responses.
  const compact = s.replace(/\s+/g, '');
  if (compact.length <= 8) return '••••';
  return compact.slice(0, 4) + '···' + compact.slice(-4);
}

function makeLimiter({ windowMs, max, scope, byUser }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const uid = byUser && req.user && req.user.id ? String(req.user.id) : '';
      return uid ? `${scope}:u:${uid}` : `${scope}:ip:${ip}`;
    },
    handler: (req, res) => {
      const ra = Number(res.getHeader('Retry-After') || 0);
      jsonError(res, 429, 'Too many requests', {
        code: 'RATE_LIMITED',
        scope,
        retryAfterSeconds: ra || undefined,
      });
    },
  });
}

// Global protection for all public endpoints under /api (IP-based).
app.use('/api', makeLimiter({ windowMs: 60 * 1000, max: 120, scope: 'api', byUser: false }));

// Tighter limits for auth endpoints (IP-based).
const authLimiter = makeLimiter({ windowMs: 15 * 60 * 1000, max: 20, scope: 'auth', byUser: false });

// User-based protection for authenticated write/proxy routes.
const userWriteLimiter = makeLimiter({ windowMs: 60 * 1000, max: 60, scope: 'write', byUser: true });
const proxyLimiter = makeLimiter({ windowMs: 60 * 1000, max: 30, scope: 'proxy', byUser: true });

function validate(schema) {
  return (req, res, next) => {
    const out = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!out.success) {
      return jsonError(res, 400, 'Invalid request', {
        code: 'VALIDATION_ERROR',
        issues: out.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
      });
    }
    req.validated = out.data;
    next();
  };
}

/* -------- Auth (persisted in JSON) -------- */
app.post(
  '/api/auth/signup',
  authLimiter,
  validate(z.object({
    body: z.object({
      email: z.string().min(3).max(254).transform(normalizeEmail),
      password: z.string().min(8).max(256),
    }).strict(),
  })),
  (req, res) => {
  try {
    const email = req.validated.body.email;
    const password = req.validated.body.password;
    if (!email.includes('@') || email.length > 254) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    const hash = bcrypt.hashSync(password, 12);
    try {
      const user = store.addUser(email, hash);
      signSession(res, { sub: String(user.id), email: user.email });
      return res.status(201).json({ user: { id: user.id, email: user.email }, isNew: true });
    } catch (e) {
      if (e.code === 'DUPLICATE_EMAIL') {
        return res.status(409).json({ error: 'Email already registered' });
      }
      throw e;
    }
  } catch (e) {
    console.error('[meridian] signup', e);
    return res.status(500).json({
      error: e.message || 'Could not create account',
    });
  }
});

app.post(
  '/api/auth/login',
  authLimiter,
  validate(z.object({
    body: z.object({
      email: z.string().min(3).max(254).transform(normalizeEmail),
      password: z.string().min(1).max(256),
    }).strict(),
  })),
  (req, res) => {
  try {
    const email = req.validated.body.email;
    const password = req.validated.body.password;
    const row = store.findUserByEmail(email);
    if (!row || !bcrypt.compareSync(password, row.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    signSession(res, { sub: String(row.id), email: row.email });
    return res.json({ user: { id: row.id, email: row.email }, isNew: false });
  } catch (e) {
    console.error('[meridian] login', e);
    return res.status(500).json({
      error: e.message || 'Could not sign in',
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const user = readUser(req);
  if (!user) return res.status(401).json({ user: null });
  const row = store.findUserById(user.id);
  if (!row) {
    clearSession(res);
    return res.status(401).json({ user: null });
  }
  res.json({ user: { id: row.id, email: row.email } });
});

/* -------- Provider keys (encrypted in JSON store) -------- */
app.get('/api/provider-keys', requireUser, (req, res) => {
  const rows = store.listProviderKeys(req.user.id);
  res.json({
    keys: rows.map(r => ({
      id: r.id,
      provider: r.provider,
      label: r.label || '',
      createdAt: r.createdAt,
      mask: r.mask || 'stored···',
    })),
  });
});

app.post(
  '/api/provider-keys',
  requireUser,
  userWriteLimiter,
  validate(z.object({
    body: z.object({
      provider: z.enum(['anthropic', 'openai', 'google', 'mistral']),
      apiKey: z.string().min(8).max(2000).transform(s => String(s).trim()),
      label: z.string().optional().transform(v => safeText(v, 200)),
    }).strict(),
  })),
  (req, res) => {
  const provider = req.validated.body.provider;
  const apiKey = req.validated.body.apiKey;
  const label = req.validated.body.label || '';
  if (/[\r\n\t]/.test(apiKey)) {
    return jsonError(res, 400, 'Invalid apiKey', { code: 'VALIDATION_ERROR' });
  }
  const { iv, ciphertext, authTag } = encryptSecret(apiKey);
  const mask = maskKey(apiKey);
  const row = store.addProviderKey(req.user.id, {
    provider,
    label: label || null,
    mask,
    iv,
    ciphertext,
    authTag,
  });
  res.status(201).json({
    key: {
      id: row.id,
      provider,
      label,
      mask,
    },
  });
});

app.delete(
  '/api/provider-keys/:id',
  requireUser,
  userWriteLimiter,
  validate(z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/),
    }).strict(),
  })),
  (req, res) => {
  const ok = store.deleteProviderKey(req.user.id, req.validated.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

function getDecryptedKey(userId, provider) {
  const row = store.getLatestProviderKey(userId, provider);
  if (!row) return null;
  return decryptSecret({
    iv: row.iv,
    ciphertext: row.ciphertext,
    authTag: row.authTag,
  });
}

/* -------- Proxy (optional — forwards to provider with stored key) -------- */
app.post(
  '/api/proxy/anthropic/v1/messages',
  requireUser,
  proxyLimiter,
  validate(z.object({
    body: z.object({
      model: z.string().min(1).max(120),
      messages: z.array(z.object({
        role: z.string().min(1).max(32),
        content: z.any(),
      })).min(1).max(200),
      max_tokens: z.number().int().positive().max(8192).optional(),
    }).passthrough(),
  })),
  async (req, res) => {
  const apiKey = getDecryptedKey(req.user.id, 'anthropic');
  if (!apiKey) {
    return res.status(400).json({ error: 'No Anthropic API key on file.' });
  }
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });
    const text = await r.text();
    res.status(r.status);
    try {
      res.json(JSON.parse(text));
    } catch {
      res.type('text').send(text);
    }
  } catch (e) {
    res.status(502).json({ error: 'Upstream request failed', detail: String(e.message) });
  }
});

app.post(
  '/api/proxy/openai/v1/chat/completions',
  requireUser,
  proxyLimiter,
  validate(z.object({
    body: z.object({
      model: z.string().min(1).max(120),
      messages: z.array(z.object({
        role: z.string().min(1).max(32),
        content: z.any(),
      })).min(1).max(200),
      max_tokens: z.number().int().positive().max(8192).optional(),
      temperature: z.number().min(0).max(2).optional(),
    }).passthrough(),
  })),
  async (req, res) => {
  const apiKey = getDecryptedKey(req.user.id, 'openai');
  if (!apiKey) {
    return res.status(400).json({ error: 'No OpenAI API key on file.' });
  }
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    });
    const text = await r.text();
    res.status(r.status);
    try {
      res.json(JSON.parse(text));
    } catch {
      res.type('text').send(text);
    }
  } catch (e) {
    res.status(502).json({ error: 'Upstream request failed', detail: String(e.message) });
  }
});

app.use(express.static(ROOT, { extensions: ['html'] }));

app.get('/', (_req, res) => {
  res.sendFile(path.join(ROOT, 'Meridian.html'));
});

app.listen(PORT, () => {
  console.log(`Meridian server http://localhost:${PORT}`);
  console.log(`JSON store: ${STORE_PATH}`);
});
