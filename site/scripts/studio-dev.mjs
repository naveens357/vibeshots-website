// Runs the whole site with the studio dashboard locally: builds Astro, then
// starts the Worker with a local D1 database (kept in site/.wrangler, on this
// drive). Wrangler's own settings and logs also stay in this folder, not in the
// user profile on C:.
//
// First time: create site/.dev.vars with one line
//   STUDIO_DEV_EMAIL=you@example.com
// That email is treated as signed in on localhost only; add it to OWNER_EMAILS
// there too (OWNER_EMAILS=you@example.com) to be an owner.
// Then: npm run studio  ->  http://localhost:8787/studio/
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const home = path.join(root, '.wrangler-home');
fs.mkdirSync(home, { recursive: true });
const env = {
  ...process.env,
  XDG_CONFIG_HOME: home,
  WRANGLER_LOG_PATH: path.join(home, 'logs'),
  WRANGLER_SEND_METRICS: 'false',
  ASTRO_TELEMETRY_DISABLED: '1',
};
const run = (cmd, args) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [cmd, ...args], { cwd: root, stdio: 'inherit', env });
  child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${path.basename(cmd)} exited with ${code}`))));
});

if (!fs.existsSync(path.join(root, '.dev.vars'))) {
  console.warn('No site/.dev.vars yet: the studio will say "login is not set up". See the top of scripts/studio-dev.mjs.');
}
await run(path.join(root, 'node_modules/astro/bin/astro.mjs'), ['build']);
await run(path.join(root, 'node_modules/wrangler/bin/wrangler.js'), ['dev', '--local', '--persist-to', '.wrangler/state', '--port', '8787', ...process.argv.slice(2)]);
