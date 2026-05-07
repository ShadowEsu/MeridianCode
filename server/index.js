'use strict';

/**
 * Static file server for the Meridian UI demo (sample numbers in data.jsx).
 * Auth, JSON store, and provider APIs are disabled for now — see server/index.with-api.js
 * and run: npm run start:api
 */
const path = require('path');
const express = require('express');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.join(__dirname, '..');

const app = express();
app.use(express.static(ROOT, { extensions: ['html'] }));

app.get('/', (_req, res) => {
  res.sendFile(path.join(ROOT, 'Meridian.html'));
});

app.listen(PORT, () => {
  console.log(`Meridian UI (static demo)  http://localhost:${PORT}`);
  console.log(`Tip: VS Code Live Server also works for this frontend-only mode.`);
});
