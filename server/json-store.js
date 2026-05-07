'use strict';

const fs = require('fs');
const path = require('path');

function empty() {
  return { nextUserId: 1, nextKeyId: 1, users: [], providerKeys: [] };
}

function normalizeLoaded(d) {
  if (!d || typeof d !== 'object') return empty();
  const out = empty();
  out.users = Array.isArray(d.users) ? d.users : [];
  out.providerKeys = Array.isArray(d.providerKeys) ? d.providerKeys : [];
  const maxUid = out.users.reduce((m, u) => Math.max(m, Number(u.id) || 0), 0);
  const maxKid = out.providerKeys.reduce((m, k) => Math.max(m, Number(k.id) || 0), 0);
  out.nextUserId = Math.max(Number(d.nextUserId) || 0, maxUid) + 1 || 1;
  out.nextKeyId = Math.max(Number(d.nextKeyId) || 0, maxKid) + 1 || 1;
  return out;
}

function load(filePath) {
  try {
    if (!fs.existsSync(filePath)) return empty();
    const raw = fs.readFileSync(filePath, 'utf8');
    return normalizeLoaded(JSON.parse(raw));
  } catch {
    return empty();
  }
}

function save(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function createJsonStore(filePath) {
  let data = load(filePath);
  const persist = () => save(filePath, data);

  return {
    path: filePath,
    addUser(email, passwordHash) {
      const em = String(email).toLowerCase();
      if (data.users.some(u => u.email.toLowerCase() === em)) {
        const err = new Error('duplicate');
        err.code = 'DUPLICATE_EMAIL';
        throw err;
      }
      const id = data.nextUserId++;
      data.users.push({
        id,
        email: String(email),
        passwordHash,
        createdAt: new Date().toISOString(),
      });
      persist();
      return { id, email: String(email) };
    },
    findUserByEmail(email) {
      const em = String(email).toLowerCase();
      return data.users.find(u => u.email.toLowerCase() === em);
    },
    findUserById(id) {
      return data.users.find(u => String(u.id) === String(id));
    },
    addProviderKey(userId, { provider, label, mask, iv, ciphertext, authTag }) {
      const id = data.nextKeyId++;
      const row = {
        id,
        userId: Number(userId),
        provider,
        label: label || null,
        mask: mask || null,
        iv,
        ciphertext,
        authTag,
        createdAt: new Date().toISOString(),
      };
      data.providerKeys.push(row);
      persist();
      return row;
    },
    listProviderKeys(userId) {
      return data.providerKeys
        .filter(k => String(k.userId) === String(userId))
        .sort((a, b) => b.id - a.id);
    },
    deleteProviderKey(userId, keyId) {
      const i = data.providerKeys.findIndex(
        k => k.id === Number(keyId) && String(k.userId) === String(userId)
      );
      if (i === -1) return false;
      data.providerKeys.splice(i, 1);
      persist();
      return true;
    },
    getLatestProviderKey(userId, provider) {
      const list = data.providerKeys.filter(
        k => String(k.userId) === String(userId) && k.provider === provider
      );
      return list.sort((a, b) => b.id - a.id)[0] || null;
    },
  };
}

module.exports = { createJsonStore };
