// Local migrations only; never touches a hosted database.
import { run } from './deploy.mjs';
run('node_modules/wrangler/bin/wrangler.js', ['d1', 'migrations', 'apply', 'DB', '--local', '--config', 'wrangler.json', '--persist-to', '.wrangler/state']);
