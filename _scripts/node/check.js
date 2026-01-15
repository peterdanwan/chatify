#!/usr/bin/env node
// _scripts/node/check.js

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cookiePath = path.join(__dirname, '../../_fixtures/cookies/cookies.txt');

// Try to read the cookie if it exists
let cookie = null;

if (existsSync(cookiePath)) {
  cookie = readFileSync(cookiePath, 'utf8');
}

const headers = {};
if (cookie) {
  headers['Cookie'] = cookie;
}

fetch('http://localhost:3000/api/auth/check', {
  method: 'GET',
  headers,
})
  .then((res) => res.json())
  .then((json) => console.log(JSON.stringify(json)))
  .catch((error) => console.error('Error:', error.message));
