'use strict';

const crypto = require('crypto');

const ALG = 'aes-256-gcm';

function encryptionKeyBuffer() {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex) {
    throw new Error('ENCRYPTION_KEY must be set to 64 hex characters (32 bytes). See .env.example');
  }
  if (/^[0-9a-fA-F]{64}$/.test(hex)) {
    return Buffer.from(hex, 'hex');
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes). Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  console.warn(
    '[meridian] ENCRYPTION_KEY is not 64 hex characters (e.g. still a placeholder). Using a SHA-256–derived dev AES key. Set a real 64-char hex ENCRYPTION_KEY in .env before storing provider keys you care about.'
  );
  return crypto.createHash('sha256').update(`meridian:enc:${hex}`, 'utf8').digest();
}

function encryptSecret(plaintext) {
  const key = encryptionKeyBuffer();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALG, key, iv);
  const enc = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('base64'),
    ciphertext: enc.toString('base64'),
    authTag: tag.toString('base64'),
  };
}

function decryptSecret({ iv, ciphertext, authTag }) {
  const key = encryptionKeyBuffer();
  const decipher = crypto.createDecipheriv(ALG, key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}

module.exports = { encryptSecret, decryptSecret };
