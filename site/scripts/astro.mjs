// Runs the Astro CLI with telemetry off, so Astro never writes its
// telemetry/preferences file to the user profile (C: drive on Windows).
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url));
const child = spawn(process.execPath, [cli, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
});
child.on('exit', (code) => process.exit(code ?? 0));
