import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {resolve} from 'node:path';
import { root, requireProductionDatabase } from './hosting-config.mjs';
export function run(relativeTool, args, options = {}) {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL(relativeTool, root)), ...args], { cwd: fileURLToPath(root), env: { ...process.env, WRANGLER_SEND_METRICS: 'false' }, stdio: 'inherit', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`تعذر إتمام الخطوة (${args[0]}). راجع رسالة الخطأ أعلاه وأعد المحاولة.`);
  return result;
}
export function deploy() {
  requireProductionDatabase();
  run('node_modules/wrangler/bin/wrangler.js', ['d1', 'migrations', 'apply', 'DB', '--remote', '--config', 'wrangler.json']);
  run('node_modules/vite/bin/vite.js', ['build']);
  run('node_modules/wrangler/bin/wrangler.js', ['deploy', '--config', 'dist/server/wrangler.json']);
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try { deploy(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
