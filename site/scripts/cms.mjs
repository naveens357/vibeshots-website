// Runs the local Decap CMS server with the git repo root (one level above site/)
// as its base, matching the "site/..." paths in public/admin/config.yml.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const server = fileURLToPath(new URL('../node_modules/decap-server/dist/index.js', import.meta.url));
const child = spawn(process.execPath, [server], {
  stdio: 'inherit',
  env: { ...process.env, GIT_REPO_DIRECTORY: repoRoot },
});
child.on('exit', (code) => process.exit(code ?? 0));
