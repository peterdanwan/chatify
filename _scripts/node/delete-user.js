#!/usr/bin/env node

// _scripts/node/delete-user.js
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This path.join() + __dirname + __filename setup lets us access delete-user.json relative to delete-user.js
// Otherwise, when we run our scripts, all filepaths are relative to your "current working directory" (cwd)
// E.g., if we started at our chatify directory to run "_scripts/node/delete-user.js", to access deleteUser.json, we'd do "_fixtures/deleteUser.json"
// E.g., if we started at our backend directory to run "../_scripts/node/delete-user.js", to access delete-user.json, we'd do "../_fixtures/deleteUser.json"
const data = readFileSync(path.join(__dirname, '../../_fixtures/delete-user.json'), 'utf8');
const cookiePath = path.join(__dirname, '../../_fixtures/cookies/cookies.txt');

let cookie = null;
if (existsSync(cookiePath)) {
  cookie = readFileSync(cookiePath, 'utf8');
}

const headers = {
  'Content-Type': 'application/json',
};

if (cookie) {
  headers['Cookie'] = cookie;
}

fetch('http://localhost:3000/api/auth/delete-user', {
  method: 'DELETE',
  headers,
  body: data,
})
  .then((res) => res.json())
  .then((json) => console.log(JSON.stringify(json)))
  .catch((error) => console.error('Error', error.message));
