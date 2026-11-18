import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import ts from 'typescript';
const project=fileURLToPath(new URL('../',import.meta.url)),dir=mkdtempSync(join(tmpdir(),'teacher-portfolio-'));
try{
 writeFileSync(join(dir,'portfolio.mjs'),ts.transpileModule(readFileSync(project+'lib/teacher-portfolio.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);
 const {portfolioRequirements,portfolioProfileFields,PORTFOLIO_FILE_LIMIT,PORTFOLIO_CHUNK_SIZE}=await import(pathToFileURL(join(dir,'portfolio.mjs')));
 assert.deepEqual(portfolioRequirements.map(r=>r.title),['أداء الواجبات الوظيفية','التفاعل مع المجتمع المهني','التفاعل مع أولياء الأمور','التنويع في استراتيجيات التدريس','تحسين نتائج المتعلمين','إعداد وتنفيذ خطة التعلم','توظيف تقنيات ووسائل التعلم المناسبة','تهيئة بيئة تعليمية','الإدارة الصفية','تحليل نتائج المتعلمين وتشخيص مستوياتهم','تنوع أساليب التقويم']);
 assert.deepEqual(portfolioProfileFields.map(f=>f.label),['الاسم','المؤهلات','الخبرات المهنية','نصاب الحصص','التخصص','مواد التدريس','بيانات التواصل']);assert.equal(PORTFOLIO_FILE_LIMIT,250*1024*1024);assert.equal(PORTFOLIO_CHUNK_SIZE,512*1024);
 const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wranglerRequire('miniflare'),root=project+'dist/server',paths=readdirSync(root,{recursive:true}).filter(p=>p.endsWith('.js')||p.endsWith('.mjs'));
 const mf=new Miniflare({name:'app',modules:['index.js',...paths.filter(p=>p!=='index.js')].map(p=>({type:'ESModule',path:root+'/'+p})),modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings:{TEACHER_SETUP_KEY:'isolated-portfolio-test-setup-key-1234567890'},d1Databases:{DB:'portfolio-isolated-test'},cf:false});
 try{
  const db=await mf.getD1Database('DB');for(const file of readdirSync(project+'drizzle').filter(f=>f.endsWith('.sql')&&!f.startsWith('0005_')&&!f.startsWith('0029_')).sort())for(const sql of readFileSync(project+'drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql.trim()).run();
  let cookie='';async function request(path,body,status=200,options={}){const method=options.method||(body?'POST':'GET'),headers={origin:'https://school.test',cookie,'content-type':'application/json',...(options.headers||{})};const r=await mf.dispatchFetch('https://school.test'+path,{method,headers,...(body!==undefined&&body!==null?{body:typeof body==='string'||body instanceof Uint8Array?body:JSON.stringify(body)}:{})});if(options.raw){assert.equal(r.status,status);return r;}const text=await r.text();let d;try{d=JSON.parse(text);}catch{throw Error('Unexpected response '+r.status+': '+text.slice(0,300));}assert.equal(r.status,status,JSON.stringify(d));return {r,d};}
  for(const path of ['/api/teacher/portfolio','/api/teacher/portfolio/file?id=00000000-0000-0000-0000-000000000000']){const r=await request(path,null,403,{raw:true});assert.match(r.headers.get('cache-control'),/no-store/);await r.text();}
  await request('/api/teacher/portfolio',{action:'save-profile',revision:0,profile:{}},403);
  await request('/api/teacher/portfolio/upload',{action:'begin'},403);
  const guest=await mf.dispatchFetch('https://school.test/teacher/portfolio');const guestMarkup=await guest.text();assert([200,307].includes(guest.status));if(guest.status===307)assert.equal(guest.headers.get('location'),'/teacher');else assert.match(guestMarkup,/redirect[^<]*|url=\/?teacher|NEXT_REDIRECT/i);assert(!guestMarkup.includes('PORTFOLIO_PRIVATE_SENTINEL'));
  const owner=await request('/api/teacher/auth',{action:'setup',username:'portfolio-owner',password:'Isolated-Portfolio-Password-123!',setupKey:'isolated-portfolio-test-setup-key-1234567890'});cookie=owner.r.headers.get('set-cookie').split(';')[0];
  let state=(await request('/api/teacher/portfolio')).d;assert.equal(state.profileRevision,0);assert.equal(state.files.length,0);assert.equal(state.sections.length,0);assert.equal(Object.keys(state.profile).length,7);
  const privateText='PORTFOLIO_PRIVATE_SENTINEL',profile={name:'معلم تجريبي',qualifications:'بكالوريوس',experience:privateText,specialization:'لغة إنجليزية',teachingLoad:'١٨ حصة',subjects:'الرابع والثالث المتوسط',contact:'owner@example.test'};
  await request('/api/teacher/portfolio',{action:'save-profile',revision:0,profile},403,{headers:{origin:'https://other.test'}});
  await request('/api/teacher/portfolio',{action:'save-profile',revision:0,profile:{...profile,name:'x'.repeat(161)}},400);
  await request('/api/teacher/portfolio',{action:'save-profile',revision:0,profile:[]},400);
  await request('/api/teacher/portfolio','not json',400);
  await request('/api/teacher/portfolio',{action:'save-profile',revision:0,profile});
  await request('/api/teacher/portfolio',{action:'save-profile',revision:0,profile:{...profile,name:'stale'}},409);
  for(const r of portfolioRequirements)await request('/api/teacher/portfolio',{action:'save-section',id:r.id,content:privateText+' '+r.title,revision:0});
  await request('/api/teacher/portfolio',{action:'save-section',id:'unknown',content:'x',revision:0},400);await request('/api/teacher/portfolio',{action:'save-section',id:'duties',content:'x'.repeat(15001),revision:1},400);
  state=(await request('/api/teacher/portfolio')).d;assert.deepEqual(state.profile,profile);assert.equal(state.sections.length,11);const created=state.sections.find(s=>s.id==='duties').created;
  await request('/api/teacher/portfolio',{action:'save-section',id:'duties',content:'updated private evidence',revision:1});await request('/api/teacher/portfolio',{action:'save-section',id:'duties',content:'stale overwrite',revision:1},409);
  state=(await request('/api/teacher/portfolio')).d;assert.equal(state.sections.find(s=>s.id==='duties').created,created);assert.equal(state.sections.find(s=>s.id==='duties').content,'updated private evidence');
  const begin=(size,name='شاهد-الإنجاز.pdf',sectionId='duties',description=privateText)=>request('/api/teacher/portfolio/upload',{action:'begin',sectionId,fileName:name,size,description},201);
  for(const size of [0,PORTFOLIO_FILE_LIMIT+1])await request('/api/teacher/portfolio/upload',{action:'begin',sectionId:'duties',fileName:'test.pdf',size},400);
  await request('/api/teacher/portfolio/upload',{action:'begin',sectionId:'invented',fileName:'test.pdf',size:2},400);
  const bytes=new Uint8Array(3*1024*1024+123);for(let i=0;i<bytes.length;i++)bytes[i]=i%251;
  const upload=(await begin(bytes.length)).d,id=upload.uploadId;assert.equal(upload.chunkSize,PORTFOLIO_CHUNK_SIZE);
  await request('/api/teacher/portfolio/upload',{action:'finish',uploadId:id},409);assert.equal((await request('/api/teacher/portfolio')).d.files.length,0);
  let hidden=await request('/api/teacher/portfolio/file?id='+id,null,404,{raw:true});await hidden.text();
  const put=(part,data,status=200,headers={})=>request('/api/teacher/portfolio/upload?id='+id+'&part='+part,data,status,{method:'PUT',headers:{'content-type':'application/octet-stream',...headers}});
  await put(1,bytes.slice(PORTFOLIO_CHUNK_SIZE,PORTFOLIO_CHUNK_SIZE*2),409);
  await put(0,bytes.slice(0,PORTFOLIO_CHUNK_SIZE),403,{cookie:''});await put(0,bytes.slice(0,PORTFOLIO_CHUNK_SIZE),403,{origin:'https://other.test'});
  await put(0,bytes.slice(0,10),400);await put(0,new Uint8Array(PORTFOLIO_CHUNK_SIZE+1),413);
  await put(0,bytes.slice(0,PORTFOLIO_CHUNK_SIZE));await put(0,bytes.slice(0,PORTFOLIO_CHUNK_SIZE));await put(0,new Uint8Array(PORTFOLIO_CHUNK_SIZE),409);
  for(let offset=PORTFOLIO_CHUNK_SIZE,part=1;offset<bytes.length;offset+=PORTFOLIO_CHUNK_SIZE,part++)await put(part,bytes.slice(offset,offset+PORTFOLIO_CHUNK_SIZE));
  const finished=(await request('/api/teacher/portfolio/upload',{action:'finish',uploadId:id})).d;assert(finished.uploadedAt);assert.equal((await request('/api/teacher/portfolio/upload',{action:'finish',uploadId:id})).d.uploadedAt,finished.uploadedAt);
  state=(await request('/api/teacher/portfolio')).d;assert.equal(state.files.length,1);assert.equal(state.files[0].description,privateText);assert.equal(state.files[0].file_size,bytes.length);assert.equal(state.files[0].completed,finished.uploadedAt);assert(!JSON.stringify(state).includes('bytes'));assert(!('received_size' in state.files[0]));
  const download=await request('/api/teacher/portfolio/file?id='+id,null,200,{raw:true});assert.equal(download.headers.get('content-type'),'application/octet-stream');assert.match(download.headers.get('content-disposition'),/attachment/);assert.match(download.headers.get('content-disposition'),/UTF-8/);assert.equal(download.headers.get('x-content-type-options'),'nosniff');assert.match(download.headers.get('content-security-policy'),/sandbox/);assert.equal(createHash('sha256').update(new Uint8Array(await download.arrayBuffer())).digest('hex'),createHash('sha256').update(bytes).digest('hex'));
  const downloadDenied=await request('/api/teacher/portfolio/file?id='+id,null,403,{raw:true,headers:{cookie:''}});await downloadDenied.text();
  const aborted=(await begin(3,'unfinished.docx','parents')).d.uploadId;await request('/api/teacher/portfolio/upload',{action:'cancel',uploadId:aborted});assert.equal((await request('/api/teacher/portfolio')).d.files.length,1);
  // Attach a second complete file to the same requirement; neither replaces the first.
  const second=(await begin(4,'شاهد-آخر.docx')).d.uploadId;await request('/api/teacher/portfolio/upload?id='+second+'&part=0',new Uint8Array([1,2,3,4]),200,{method:'PUT'});await request('/api/teacher/portfolio/upload',{action:'finish',uploadId:second});assert.equal((await request('/api/teacher/portfolio')).d.files.length,2);
  const forbiddenDelete=await request('/api/teacher/portfolio/file?id='+id,null,403,{method:'DELETE',raw:true,headers:{origin:'https://other.test'}});await forbiddenDelete.text();
  const otherDevice=await request('/api/teacher/auth',{action:'login',username:'portfolio-owner',password:'Isolated-Portfolio-Password-123!'});const otherCookie=otherDevice.r.headers.get('set-cookie').split(';')[0];assert.equal((await request('/api/teacher/portfolio',null,200,{headers:{cookie:otherCookie}})).d.files.length,2);
  const otherDownload=await request('/api/teacher/portfolio/file?id='+id,null,200,{raw:true,headers:{cookie:otherCookie}});assert.equal((await otherDownload.arrayBuffer()).byteLength,bytes.length);
  const publicCourses=(await request('/api/courses')).d;assert(!JSON.stringify(publicCourses).includes(privateText));const homepage=await mf.dispatchFetch('https://school.test/');assert(!((await homepage.text()).includes(privateText)));
  await request('/api/teacher/portfolio/file?id='+id,null,200,{method:'DELETE'});assert.equal((await request('/api/teacher/portfolio')).d.files.length,1);assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM teacher_portfolio_chunks WHERE file_id=?').bind(id).first()).n,0);const deleted=await request('/api/teacher/portfolio/file?id='+id,null,404,{raw:true});await deleted.text();
  for(const sql of readFileSync(project+'drizzle/0029_teacher_portfolio.sql','utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql.trim()).run();assert.equal((await request('/api/teacher/portfolio')).d.sections.length,11);
  await request('/api/teacher/auth',{action:'logout'});await request('/api/teacher/portfolio',null,403);const loggedOutFile=await request('/api/teacher/portfolio/file?id='+second,null,403,{raw:true});await loggedOutFile.text();
  console.log('PASS: exact 7 profile fields and 11 requirements; owner-only page, metadata, uploads, download and deletion; origin and validation guards; stale-edit protection; durable profile/section data; 3 MiB chunked binary round-trip with matching SHA-256; incomplete-file hiding, chunk order, bounds and retry integrity; multiple evidence files per requirement; server upload dates; second-device owner access; no public content leakage; lazy and SQL migrations compatible; logout revokes access.');
 }finally{await mf.dispose();}
}finally{rmSync(dir,{recursive:true,force:true});}
