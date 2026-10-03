// Prepare a fresh local development database. Never touches the hosted database.
import {mkdirSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const runtime=path.join(root,'.sites-runtime');
mkdirSync(runtime,{recursive:true});
const config=path.join(runtime,'local-database.json');
writeFileSync(config,JSON.stringify({name:'alwadani-local',compatibility_date:'2026-05-15',d1_databases:[{binding:'DB',database_name:'site-creator-d1',database_id:'00000000-0000-4000-8000-000000000000',migrations_dir:path.join(root,'drizzle')}]}));
const result=spawnSync(process.execPath,[path.join(root,'node_modules/wrangler/bin/wrangler.js'),'d1','migrations','apply','DB','--local','--config',config,'--persist-to',path.join(root,'.wrangler/state')],{cwd:root,stdio:'inherit',env:{...process.env,WRANGLER_SEND_METRICS:'false',CLOUDFLARE_CF_FETCH_ENABLED:'false',WRANGLER_LOG_PATH:path.join(runtime,'wrangler-logs')}});
if(result.error)throw result.error;
process.exitCode=result.status??1;
