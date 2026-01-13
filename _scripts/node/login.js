// _scripts/node/login.js

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = readFileSync(path.join(__dirname, '../../_fixtures/login.json'), 'utf8');

fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: data,
})
  .then((res) => res.json())
  .then((json) => console.log(JSON.stringify(json)))
  .catch((err) => console.error('Error', err.message));
