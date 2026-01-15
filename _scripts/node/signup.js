#!/usr/bin/env node

// _scripts/node/signup.js
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This path.join() + __dirname + __filename setup lets us access signup.json relative to signup.js
// Otherwise, when we run our scripts, all filepaths are relative to your "current working directory" (cwd)
// E.g., if we started at our chatify directory to run "_scripts/node/signup.js", to access signup.json, we'd do "_fixtures/signup.json"
// E.g., if we started at our backend directory to run "../_scripts/node/signup.js", to access signup.json, we'd do "../_fixtures/signup.json"
const data = readFileSync(path.join(__dirname, '../../_fixtures/signup.json'), 'utf8');
const cookiePath = path.join(__dirname, '../../_fixtures/cookies/cookies.txt');

fetch('http://localhost:3000/api/auth/signup', {
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
  .catch((err) => console.error('Error', err.message));
