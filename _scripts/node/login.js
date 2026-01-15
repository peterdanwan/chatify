// _scripts/node/login.js

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = readFileSync(path.join(__dirname, '../../_fixtures/login.json'), 'utf8');
const cookiePath = path.join(__dirname, '../../_fixtures/cookies/cookies.txt');

fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: data,
})
  .then((res) => {
    // Capture the Set-Cookie header from the response
    const setCookie = res.headers.get('set-cookie');

    if (setCookie) {
      writeFileSync(cookiePath, setCookie);
    }
    return res.json();
  })
  .then((json) => console.log(JSON.stringify(json)))
  .catch((error) => console.error('Error', error.message));
