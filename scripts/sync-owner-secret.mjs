// Runs only inside the owner's production Cloudflare build. Never stores the key in a file.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = new URL('../', import.meta.url);

export function syncOwnerSecret({ env = process.env, run = spawnSync, log = console.log } = {}) {
  // Preview builds and local builds must never change production credentials.
  if (env.WORKERS_CI !== '1' || env.WORKERS_CI_BRANCH !== 'main') return 'skipped';
  const key = env.TEACHER_SETUP_KEY;
  if (!key) return 'skipped'; // The owner can also add the runtime secret in the dashboard.
  if (key.length < 32 || key.length > 256 || /[\r\n]/.test(key)) {
    throw new Error('TEACHER_SETUP_KEY must contain 32–256 characters without line breaks.');
  }

  const config = JSON.parse(readFileSync(new URL('../wrangler.json', import.meta.url), 'utf8'));
  if (!config.name || !/^[a-f0-9]{32}$/i.test(config.account_id ?? '')) {
    throw new Error('Configure the production Worker name and Account ID before adding the owner secret.');
  }
  if (env.CLOUDFLARE_ACCOUNT_ID && env.CLOUDFLARE_ACCOUNT_ID !== config.account_id) {
    throw new Error('The build account does not match the configured production account.');
  }

  const cli = fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url));
  const cliEnv = { ...env, CLOUDFLARE_ACCOUNT_ID: config.account_id, WRANGLER_SEND_METRICS: 'false', WRANGLER_WRITE_LOGS: 'false' };
  delete cliEnv.TEACHER_SETUP_KEY;
  const options = {
    cwd: fileURLToPath(root),
    env: cliEnv,
    stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf8', maxBuffer: 1024 * 1024,
  };
  const invoke = (args, settings) => {
    try { return run(process.execPath, [cli, ...args], settings); }
    catch { return { error: true }; }
  };
  const target = ['--name', config.name, '--config', 'wrangler.json'];
  const listing = invoke(['secret', 'list', ...target, '--format', 'json'], options);
  if (listing.error || listing.status !== 0) {
    throw new Error('Could not check runtime secrets. Check the build token Workers Scripts: Edit permission, or add TEACHER_SETUP_KEY in Worker Settings > Variables and Secrets.');
  }
  let secrets;
  try { secrets = JSON.parse(listing.stdout); } catch { throw new Error('Could not read the runtime secret list; no credential was changed.'); }
  if (!Array.isArray(secrets)) throw new Error('Unexpected runtime secret list; no credential was changed.');
  if (secrets.some(secret => secret?.name === 'TEACHER_SETUP_KEY')) {
    log('The runtime owner secret already exists; it was kept unchanged.');
    return 'existing';
  }

  // Only initialize a missing secret. Never rotate a key used by an existing account.
  const created = invoke(['secret', 'put', 'TEACHER_SETUP_KEY', ...target], { ...options, input: key + '\n' });
  // Do not print child-process output or errors: they may contain sensitive data.
  if (created.error || created.status !== 0) {
    throw new Error('Could not initialize the runtime owner secret. Add TEACHER_SETUP_KEY in Worker Settings > Variables and Secrets.');
  }
  log('Initialized the runtime owner secret from the private Cloudflare build setting.');
  return 'created';
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try { syncOwnerSecret(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
