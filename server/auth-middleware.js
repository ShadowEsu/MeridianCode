'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const COOKIE = 'meridian_session';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function jwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) {
    throw new Error('JWT_SECRET must be set. See .env.example');
  }
  if (s.length >= 32) {
    return s;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET must be at least 32 characters in production. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  console.warn(
    '[meridian] JWT_SECRET is shorter than 32 characters (e.g. copied placeholder from .env.example). Using a SHA-256–derived dev signing key. Replace JWT_SECRET in .env with a 64-char hex value from the command in .env.example.'
  );
  return crypto.createHash('sha256').update(`meridian:jwt:${s}`, 'utf8').digest();
}

function signSession(res, payload) {
  const token = jwt.sign(payload, jwtSecret(), { expiresIn: '7d' });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE_MS,
    path: '/',
  });
}

function clearSession(res) {
  res.clearCookie(COOKIE, { path: '/' });
}

function readUser(req) {
  const raw = req.cookies && req.cookies[COOKIE];
  if (!raw) return null;
  try {
    const decoded = jwt.verify(raw, jwtSecret());
    return { id: decoded.sub, email: decoded.email };
  } catch {
    return null;
  }
}

function requireUser(req, res, next) {
  const user = req.user || readUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = user;
  next();
}

module.exports = {
  COOKIE,
  signSession,
  clearSession,
  readUser,
  requireUser,
};
