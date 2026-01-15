#!/usr/bin/env node
// _scripts/node/logout.js

import { readFileSync, unlinkSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cookiePath = path.join(__dirname, '../../_fixtures/cookies/cookies.txt');

// Check if we have a saved cookie (optional - logout should work without it)
let cookie = null;
if (existsSync(cookiePath)) {
  cookie = readFileSync(cookiePath, 'utf-8');
  console.log('Found existing cookie');
}

// Simulate the sending of cookies in the logout request (requests from the browser will have these cookies)
const headers = {};
if (cookie) {
  headers['Cookie'] = cookie;
}

fetch('http://localhost:3000/api/auth/logout', {
  method: 'POST',
  headers,
})
  .then((res) => res.json())
  .then((json) => {
    console.log(JSON.stringify(json));

    // Clean up the saved cookie file after successful logout
    if (existsSync(cookiePath)) {
      unlinkSync(cookiePath);
      console.log('Local cookie file deleted');
    }
  })
  .catch((error) => console.error('Error', error));
