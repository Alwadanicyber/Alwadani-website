import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import ts from 'typescript';

const project=fileURLToPath(new URL('../',import.meta.url)),temp=mkdtempSync(join(tmpdir(),'database-errors-'));
try{
 const out=join(temp,'errors.mjs');writeFileSync(out,ts.transpileModule(readFileSync(project+'lib/database-error.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);
 const {databaseFailure,logDatabaseFailure}=await import(pathToFileURL(out));
 for(const [message,code] of [["Your account has exceeded D1's free tier daily row read limit.",'DATABASE_READ_LIMIT'],["Your account has exceeded D1's free tier daily row write limit.",'DATABASE_WRITE_LIMIT'],['Exceeded maximum DB size.','DATABASE_STORAGE_LIMIT'],['D1_ERROR: no such table: teacher_account','DATABASE_SCHEMA'],['Database unavailable','DATABASE_BINDING'],['Network connection lost.','DATABASE_UNAVAILABLE']]){
  const error=new Error('D1 query failed',{cause:new Error(message)}),failure=databaseFailure(error);
  assert.equal(failure.code,code);assert(!JSON.stringify(failure).includes(message),'Internal error details leaked to the public response');
 }
 const circular={message:'D1 query failed'};circular.cause=circular;assert.equal(databaseFailure(circular).code,'DATABASE_UNAVAILABLE');
 let entry;const original=console.error;try{console.error=value=>{entry=value;};logDatabaseFailure('courses.list',Object.assign(new Error('D1 query failed',{cause:new Error('actual D1 detail')}),{password:'secret-not-to-log',cookie:'secret-cookie'}));}finally{console.error=original;}
 assert.equal(entry.message,'D1 query failed');assert.deepEqual(entry.causes,['actual D1 detail']);assert(!JSON.stringify(entry).includes('secret-'));assert(!JSON.stringify(entry).includes('at '));
}finally{rmSync(temp,{recursive:true,force:true});}

const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wranglerRequire('miniflare');
const root=project+'dist/server',paths=readdirSync(root,{recursive:true}).filter(p=>p.endsWith('.js')||p.endsWith('.mjs'));
const modules=['index.js',...paths.filter(p=>p!=='index.js')].map(p=>({type:'ESModule',path:root+'/'+p}));
const setupKey=crypto.randomUUID()+crypto.randomUUID(),password=crypto.randomUUID()+'Aa1!';
const normal=new Miniflare({modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings:{TEACHER_SETUP_KEY:setupKey},d1Databases:{DB:'normal'},cf:false});
const missing=new Miniflare({modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings:{TEACHER_SETUP_KEY:setupKey},d1Databases:{DB:'missing'},cf:false});
try{
 const db=await normal.getD1Database('DB');for(const file of readdirSync(project+'drizzle').filter(x=>x.endsWith('.sql')).sort())for(const sql of readFileSync(project+'drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql.trim()).run();
 const catalog=await normal.dispatchFetch('https://course.test/api/courses');assert.equal(catalog.status,200);assert((await catalog.json()).courses.length>=8);
 const setup=await normal.dispatchFetch('https://course.test/api/teacher/auth',{method:'POST',headers:{'Content-Type':'application/json',origin:'https://course.test'},body:JSON.stringify({action:'setup',username:'database-test',password,setupKey})});assert.equal(setup.status,200);
 const login=await normal.dispatchFetch('https://course.test/api/teacher/auth',{method:'POST',headers:{'Content-Type':'application/json',origin:'https://course.test'},body:JSON.stringify({action:'login',username:'database-test',password})});assert.equal(login.status,200);assert(login.headers.get('set-cookie')?.includes('HttpOnly'));
 const regular=await normal.dispatchFetch('https://course.test/teacher'),regularHtml=await regular.text();assert(regularHtml.includes('مرحبًا بعودتك')&&regularHtml.includes('name="password"'));
 const failed=await missing.dispatchFetch('https://course.test/api/courses'),failure=await failed.json();assert.equal(failed.status,503);assert.equal(failure.code,'DATABASE_SCHEMA');assert(failed.headers.get('cache-control').includes('no-store'));assert(!JSON.stringify(failure).includes('no such table'));
 const page=await missing.dispatchFetch('https://course.test/teacher'),html=await page.text();assert(html.includes('خدمة البيانات غير متاحة حاليًا')&&html.includes('حاول مجددًا'));assert(!html.includes('name="password"')&&!html.includes('أنشئ حسابك الخاص')&&!html.includes('لم يكتمل إعداد الاستضافة'));
 const auth=await missing.dispatchFetch('https://course.test/api/teacher/auth',{method:'POST',headers:{'Content-Type':'application/json',origin:'https://course.test'},body:JSON.stringify({action:'login',username:'database-test',password})});assert.equal(auth.status,503);assert.equal((await auth.json()).code,'DATABASE_SCHEMA');
 console.log('PASS: D1 messages and nested causes stay in structured owner logs; public error codes hide SQL/details; normal catalog and teacher setup/login work; missing database tables yield explicit 503 errors and a retry page without account-reset/setup prompts.');
}finally{await Promise.all([normal.dispose(),missing.dispose()]);}
