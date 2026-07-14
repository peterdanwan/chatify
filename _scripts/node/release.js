// _scripts/node/release.js
// Bumps root/backend/frontend package.json to the same version, commits, and tags.
// Usage: npm run release -- <patch|minor|major>
// Then:  git push --follow-tags   (the pushed tag is what triggers CD)

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');

const bump = process.argv[2];
if (!['patch', 'minor', 'major'].includes(bump)) {
  console.error('Usage: npm run release -- <patch|minor|major>');
  process.exit(1);
}

function run(cmd, cwd) {
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function readVersion(pkgDir) {
  return JSON.parse(readFileSync(path.join(pkgDir, 'package.json'), 'utf8')).version;
}

// Bump root first to decide the target version, then force backend/frontend to match it
// exactly — independent bumps could drift apart if their versions ever get out of sync.
run(`npm version ${bump} --no-git-tag-version`, root);
const version = readVersion(root);

run(`npm version ${version} --no-git-tag-version --allow-same-version`, path.join(root, 'backend'));
run(`npm version ${version} --no-git-tag-version --allow-same-version`, path.join(root, 'frontend'));

run(
  'git add package.json backend/package.json frontend/package.json',
  root
);
run(`git commit -m "chore: release v${version}"`, root);
run(`git tag v${version}`, root);

console.log(`\nTagged v${version}. Push it to trigger a deploy:\n  git push --follow-tags`);
