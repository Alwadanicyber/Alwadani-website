import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import ts from 'typescript';
const project=fileURLToPath(new URL('../',import.meta.url)),dir=mkdtempSync(join(tmpdir(),'grade4-reports-'));
try{
for(const name of ['grade4-revision-courses','grade4-revision-content'])writeFileSync(join(dir,name+'.mjs'),ts.transpileModule(readFileSync(project+'lib/'+name+'.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);
const {grade4RevisionCourses}=await import(pathToFileURL(join(dir,'grade4-revision-courses.mjs')));
const expected=[['parents','uncle','cousins','weak','fish','rabbit','kitten','parrot','do','does','mine','his','True','False','True','False','o','t','i','z'],['comic book','floor','dishes','trash','chicken','flower','bucket','bus','reads','playing','Do','Can','True','False','True','False','feeds','trash can','get up','rides']];
for(const [i,c]of grade4RevisionCourses.entries()){assert.equal(c.grade,'grade-4');assert.equal(c.definition.lessons.length,4);assert.deepEqual(c.definition.questions.map(q=>q.options[q.answer]),expected[i]);for(const q of c.definition.questions){assert(q.reason.length>35);assert(q.options.length===new Set(q.options).size);assert(c.definition.lessons[q.lesson]);assert(q.prompt.length<1200);}assert(!JSON.stringify(c).includes('Screenshot'));}
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wranglerRequire('miniflare');
const root=project+'dist/server',paths=readdirSync(root,{recursive:true}).filter(p=>p.endsWith('.js')||p.endsWith('.mjs'));
const mf=new Miniflare({name:'app',modules:['index.js',...paths.filter(p=>p!=='index.js')].map(p=>({type:'ESModule',path:root+'/'+p})),modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings:{TEACHER_SETUP_KEY:'isolated-reports-test-key-123456789'},d1Databases:{DB:'reports-test'},cf:false});let cookie='';
async function call(path,body,status=200,headers={}){const r=await mf.dispatchFetch('https://school.test'+path,{method:body?'POST':'GET',headers:{origin:'https://school.test',cookie,'content-type':'application/json',...headers},...(body?{body:JSON.stringify(body)}:{})});const d=await r.json();assert.equal(r.status,status,JSON.stringify(d));return {d,r};}
try{
const db=await mf.getD1Database('DB');for(const file of readdirSync(project+'drizzle').filter(f=>f.endsWith('.sql')&&!f.startsWith('0005_')&&!f.startsWith('0024_')).sort())for(const sql of readFileSync(project+'drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql.trim()).run();
await call('/api/teacher/reports',null,403);const owner=await call('/api/teacher/auth',{action:'setup',username:'report-owner',password:'Isolated-Reports-Test-123!',setupKey:'isolated-reports-test-key-123456789'});cookie=owner.r.headers.get('set-cookie').split(';')[0];
await call('/api/teacher/reports',null,423);assert.equal((await call('/api/teacher/reports/lock')).d.unlocked,false);
assert((await call('/api/teacher/reports/lock')).d.setupRequired);await call('/api/teacher/reports/lock',{action:'setup',pin:'43210',confirmPin:'43210'});await call('/api/teacher/reports/lock',{action:'setup',pin:'54321',confirmPin:'54321'},409);
await call('/api/teacher/reports/lock',{action:'unlock',pin:'11111'},403);
const unlocked=await call('/api/teacher/reports/lock',{action:'unlock',pin:'43210'});cookie+='; '+unlocked.r.headers.get('set-cookie').split(';')[0];assert(unlocked.r.headers.get('set-cookie').includes('HttpOnly'));await call('/api/teacher/reports');
await call('/api/teacher/reports',{action:'add-category',label:'طلاب خطط المعالجة',mode:'student'},201);const custom=(await call('/api/teacher/reports')).d.categories[0];assert.equal(custom.label,'طلاب خطط المعالجة');await call('/api/teacher/reports',{action:'save',category:custom.id,title:'Remedial plan',studentName:'طالب خطة معالجة',notes:'Private remedial evidence'},201);
const base={action:'save',category:'grades',title:'Private evidence test',grade:'الصف الرابع الابتدائي',notes:'PRIVATE_REPORT_SENTINEL'};
await call('/api/teacher/reports',base,403,{cookie:''});await call('/api/teacher/reports',base,403,{origin:'https://other.test'});await call('/api/teacher/reports',{...base,grade:''},400);
const {id}= (await call('/api/teacher/reports',base,201)).d;
for(const category of ['pledge','referral','behaviour']){await call('/api/teacher/reports',{...base,category},400);const r=await call('/api/teacher/reports',{...base,category,studentName:'اختبار خاص',violation:'تأخر',grade:''},201);assert(r.d.id);}
async function upload(file,auth=cookie,origin='https://school.test',status=200){const form=new FormData();form.set('file',file);const encoded=new Request('https://school.test',{method:'PUT',body:form});const r=await mf.dispatchFetch('https://school.test/api/teacher/reports?id='+id,{method:'PUT',headers:{cookie:auth,origin,'content-type':encoded.headers.get('content-type')},body:await encoded.arrayBuffer()});assert.equal(r.status,status,await r.text());}
const data='%PDF-1.4\n%isolated evidence';const pdf=new File([data],'evidence.pdf',{type:'application/pdf'});
await upload(pdf,'','https://school.test',403);await upload(pdf,cookie,'https://other.test',403);await upload(new File(['html'],'evidence.pdf'),cookie,'https://school.test',400);await upload(pdf);
const list=(await call('/api/teacher/reports')).d.reports;assert.equal(list.find(r=>r.id===id).fileSize,data.length);assert(list.every(r=>!('fileData' in r)));
let file=await mf.dispatchFetch('https://school.test/api/teacher/reports/file?id='+id);assert.equal(file.status,403);await file.text();file=await mf.dispatchFetch('https://school.test/api/teacher/reports/file?id='+id,{headers:{cookie}});assert.equal(file.status,200);assert.equal(await file.text(),data);assert(file.headers.get('cache-control').includes('no-store'));assert(file.headers.get('content-disposition').startsWith('attachment;'));
await call('/api/teacher/reports',{...base,id,title:'Edited'});assert.equal((await call('/api/teacher/reports')).d.reports.find(r=>r.id===id).fileSize,data.length);
await call('/api/teacher/reports',{action:'archive',id});assert(!(await call('/api/teacher/reports')).d.reports.some(r=>r.id===id));assert((await call('/api/teacher/reports?archived=1')).d.reports.some(r=>r.id===id));await call('/api/teacher/reports',{action:'restore',id});assert((await call('/api/teacher/reports')).d.reports.some(r=>r.id===id));

for(const canonical of grade4RevisionCourses){
 let learner='';let state;
 async function lesson(body){const result=await call('/api/classroom',{...body,course:canonical.id,attempt:1},200,{cookie:learner});const nextCookie=result.r.headers.get('set-cookie');if(nextCookie)learner=nextCookie.split(';')[0];state=result.d;return state;}
 await lesson({action:'start',name:'Revision test learner'});assert(!('answer' in state.course.questions[0]));assert(!('reason' in state.course.questions[0]));
 for(let station=0;station<4;station++){await lesson({action:'read',lesson:station});for(const q of state.course.questions.filter(q=>q.lesson===station)){const correct=canonical.definition.questions.find(item=>item.id===q.id);const right=correct.options[correct.answer];const choice=q.options.findIndex(option=>q.id===1?option!==right:option===right);await lesson({action:'answer',question:q.id,choice,elapsedMs:1000});const feedback=state.answers.find(a=>a.question===q.id);assert.equal(feedback.correct,q.id===1?0:1);assert.equal(feedback.reason,correct.reason);}}
 await lesson({action:'complete'});assert.equal(state.certificate.score,19);assert.equal(state.certificate.total,20);
}
const courses=(await call('/api/courses')).d.courses;assert(courses.some(c=>c.id==='unit-1-revision-grade-4'));assert(courses.some(c=>c.id==='unit-2-revision-grade-4'));assert(!JSON.stringify(courses).includes('PRIVATE_REPORT_SENTINEL'));
await db.prepare(readFileSync(project+'drizzle/0024_teacher_student_reports.sql','utf8')).run();
await db.prepare('UPDATE teacher_report_unlocks SET expires=0').run();await call('/api/teacher/reports',null,423);let expired=await mf.dispatchFetch('https://school.test/api/teacher/reports/file?id='+id,{headers:{cookie}});assert.equal(expired.status,423);await expired.text();
const reopened=await call('/api/teacher/reports/lock',{action:'unlock',pin:'43210'});cookie=cookie.split(';')[0]+'; '+reopened.r.headers.get('set-cookie').split(';')[0];await call('/api/teacher/reports');await call('/api/teacher/reports/lock',{action:'lock'});await call('/api/teacher/reports',null,423);for(let i=0;i<5;i++)await call('/api/teacher/reports/lock',{action:'unlock',pin:'11111'},403);await call('/api/teacher/reports/lock',{action:'unlock',pin:'11111'},429);
console.log('PASS: PIN protection on listings and files, session expiry, manual lock, attempt throttling, custom remedial category, 40 independently reviewed revision keys, grade-4 registration, conditional report fields, real file roundtrip, private downloads, owner/origin guards, attachment preservation, archive/restore and lazy migration.');

}finally{await mf.dispose();}
}finally{rmSync(dir,{recursive:true,force:true});}
