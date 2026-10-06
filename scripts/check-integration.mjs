import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {requireProductionDatabase} from './hosting-config.mjs';
const require=createRequire(import.meta.url);
const wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wranglerRequire('miniflare');
const project=fileURLToPath(new URL('../',import.meta.url));
import {readFileSync,readdirSync} from 'node:fs';
const root=project+'dist/server';
const paths=readdirSync(root,{recursive:true}).filter(p=>p.endsWith('.js')||p.endsWith('.mjs'));
const modules=['index.js',...paths.filter(p=>p!=='index.js')].map(p=>({type:'ESModule',path:root+'/'+p}));
const mf=new Miniflare({modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings:{TEACHER_SETUP_KEY:'test-owner-key-never-use-in-production-123456789'},d1Databases:{DB:'test'},cf:false});
let auth={};
const ownerKey='test-owner-key-never-use-in-production-123456789';
const password='Teacher-Test-Only-123!';
const forged={'oai-authenticated-user-id':'test-owner','oai-authenticated-user-email':'teacher@test.example'};
let cookies={};
async function req(path,body,expected=200,headers={},method=body?'POST':'GET'){const r=await mf.dispatchFetch('https://course.test'+path,{method,headers:{'Content-Type':'application/json',origin:'https://course.test',cookie:Object.entries(cookies).map(([k,v])=>k+'='+v).join('; '),...headers},...(body?{body:JSON.stringify(body)}:{})});if(r.headers.get('set-cookie')){const c=r.headers.get('set-cookie').split(';')[0];const i=c.indexOf('=');cookies[c.slice(0,i)]=c.slice(i+1);}const d=await r.json();if(r.status!==expected)throw new Error(JSON.stringify({path,status:r.status,expected,d,body}));return d;}
function assert(v,m){if(!v)throw new Error(m);}
try{const db=await mf.getD1Database('DB');for(const file of readdirSync(project+'drizzle').filter(x=>x.endsWith('.sql')&&!x.startsWith('0005_')).sort()){for(const s of readFileSync(project+'drizzle/'+file,'utf8').split('--> statement-breakpoint'))await db.prepare(s.trim()).run();}
// Public search metadata, sitemap and crawler guidance work without a login.
const siteOrigin='https://alwadani-website.jubranii45.workers.dev';
const canonicalOf=html=>html.match(/<link\b(?=[^>]*\brel="canonical")(?=[^>]*\bhref="([^"]+)")[^>]*>/)?.[1];
const homeResponse=await mf.dispatchFetch('https://course.test/'),homeHtml=await homeResponse.text();
const initialHead=homeHtml.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1]||'';
assert(initialHead.includes('name="google-site-verification"')&&initialHead.includes('content="t8elB2NwK-beAeD6IJvhWhMjwuoiHr4BnSeZtWctFmg"'),'Google verification must be in the initial HTML head before JavaScript');
assert(/<meta\b(?=[^>]*property="og:site_name")(?=[^>]*content="الودعاني")[^>]*>/.test(initialHead),'Preferred site name must be in the initial HTML head');
assert(/<link\b(?=[^>]*rel="icon")(?=[^>]*href="\/favicon.svg")(?=[^>]*type="image\/svg\+xml")[^>]*>/.test(initialHead),'Brand icon must be discoverable in the initial HTML head');
assert(initialHead.includes('id="site-name-schema"')&&(homeHtml.match(/id="site-name-schema"/g)||[]).length===1,'Exactly one site-name schema must be in the initial HTML head');
assert(homeResponse.status===200&&homeHtml.includes('<title>الودعاني | Alwadani Teaching Tools</title>')&&new URL(canonicalOf(homeHtml)||'https://invalid.test').href===siteOrigin+'/','Homepage search title or canonical missing '+JSON.stringify({status:homeResponse.status,title:homeHtml.match(/<title>(.*?)<\/title>/)?.[1],canonical:canonicalOf(homeHtml),hasName:homeHtml.includes('Alwadani Teaching Tools')}));
const schemaTag=homeHtml.match(/<script\b[^>]*id="site-name-schema"[^>]*>([\s\S]*?)<\/script>/);assert(schemaTag,'Site name structured data absent');const schema=JSON.parse(schemaTag[1]);assert(schema.name==='الودعاني'&&schema.alternateName.includes('Alwadani Teaching Tools')&&schema.url===siteOrigin+'/','Arabic/English site-name data incorrect');
const robotResponse=await mf.dispatchFetch('https://course.test/robots.txt'),robotText=await robotResponse.text();assert(robotResponse.status===200&&robotResponse.headers.get('content-type').includes('text/plain')&&robotText.includes('Allow: /')&&robotText.includes('Sitemap: '+siteOrigin+'/sitemap.xml'),'Crawler guidance is unavailable or blocks the site');
const mapResponse=await mf.dispatchFetch('https://course.test/sitemap.xml'),mapText=await mapResponse.text();assert(mapResponse.status===200&&mapResponse.headers.get('content-type').includes('application/xml')&&mapText.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')&&mapText.includes('<loc>'+siteOrigin+'/tools/records</loc>')&&mapText.includes('<loc>'+siteOrigin+'/tools/certificates</loc>')&&!mapText.includes('/teacher')&&!mapText.includes('/api/'),'Sitemap is missing public tools or exposes private paths');
for(const path of ['/tools','/tools/records','/tools/certificates']){const html=await(await mf.dispatchFetch('https://course.test'+path)).text();assert(canonicalOf(html)===siteOrigin+path&&html.includes('الودعاني'),'Public tool canonical or brand metadata missing '+path);}
// Neither browser-supplied Sites identity nor an anonymous request grants access.
await req('/api/teacher',null,403,forged);
const setupPage=await mf.dispatchFetch('https://course.test/teacher'),setupHtml=await setupPage.text();assert(setupHtml.includes('أنشئ حسابك الخاص'),'Setup page missing');assert(/<meta\b(?=[^>]*name="robots")(?=[^>]*content="[^"]*noindex)[^>]*>/.test(setupHtml),'Teacher pages should not be indexed');
await req('/api/teacher/auth',{action:'setup',username:'alwadani',password,setupKey:ownerKey},403,{origin:'https://other.test'});
await req('/api/teacher/auth',{action:'setup',username:'alwadani',password,setupKey:'wrong'},403);
await req('/api/teacher/auth',{action:'setup',username:'alwadani',password:'short',setupKey:ownerKey},400);
const setup=await mf.dispatchFetch('https://course.test/api/teacher/auth',{method:'POST',headers:{'Content-Type':'application/json',origin:'https://course.test'},body:JSON.stringify({action:'setup',username:'alwadani',password,setupKey:ownerKey})});
assert(setup.status===200,'Owner setup failed');
const cookie=setup.headers.get('set-cookie');assert(cookie.startsWith('__Host-alwadani_teacher=')&&cookie.includes('HttpOnly')&&cookie.includes('Secure')&&cookie.includes('SameSite=Strict'),'Session cookie unsafe');
auth={cookie:cookie.split(';')[0]};
const account=await db.prepare('SELECT * FROM teacher_account').first();assert(account.username==='alwadani'&&!account.password_hash.includes(password)&&account.password_hash.startsWith('pbkdf2-sha256-hmac-v1:'),'Password storage incorrect');
assert(!JSON.stringify((await db.prepare('SELECT * FROM teacher_sessions').all()).results).includes(auth.cookie.split('=')[1]),'Raw session stored');
await req('/api/teacher/auth',{action:'setup',username:'intruder',password,setupKey:ownerKey},409,{'cf-connecting-ip':'198.51.100.2'});
await req('/api/teacher/auth',{action:'login',username:'alwadani',password:'Wrong-Password-123!'},401,{'cf-connecting-ip':'198.51.100.3'});
await req('/api/teacher/auth',{action:'login',username:'wrong',password},401,{'cf-connecting-ip':'198.51.100.3'});
for(let i=0;i<5;i++)await req('/api/teacher/auth',{action:'login',username:'alwadani',password:'Wrong-Password-123!'},401,{'cf-connecting-ip':'198.51.100.5'});
await req('/api/teacher/auth',{action:'login',username:'alwadani',password},429,{'cf-connecting-ip':'198.51.100.5'});
assert((await db.prepare('SELECT COUNT(*) AS n FROM teacher_account').first()).n===1,'Extra owner created');
await req('/api/teacher',null,403);await req('/api/teacher',{},403);await req('/api/teacher',null,403,{'oai-authenticated-user-id':'other','oai-authenticated-user-email':'other@test.example'});
const initial=await req('/api/courses');assert(initial.courses.length===1,'Original course missing');assert(initial.courses[0].grade==='grade-9','Original grade incorrect');assert((await req('/api/courses?grade=grade-9')).courses.length===1,'Third middle class missing');assert((await req('/api/courses?grade=general')).courses.length===0,'Original remains in general');
await req('/api/teacher',{},403,{...auth,origin:'https://evil.test'});
await req('/api/teacher',{},403,{...auth,origin:''});
const admin=await req('/api/teacher',null,200,auth);assert(admin.courses.length===1,'Owner cannot load courses');
const lesson={title:'المضارع البسيط',en:'Simple Present',tag:'01',intro:'شرح الدرس',formula:'Subject + verb',rules:[['المفرد','نضيف s مع he','He works.']],note:'',example:'He works.',translation:'هو يعمل.'};
const payload={title:'درس جديد',description:'وصف',grade:'grade-4',published:0,definition:{lessons:[lesson],questions:[{id:1,lesson:0,prompt:'He ___ every day.',options:['work','works','worked'],answer:1,reason:'مع he في المضارع البسيط نضيف s.'}]}};
const draft=await req('/api/teacher',payload,200,auth);assert((await req('/api/courses')).courses.length===1,'Draft is visible');assert(!(await(await mf.dispatchFetch('https://course.test/sitemap.xml')).text()).includes('course='+draft.id),'Draft leaked into sitemap');const pub=await req('/api/teacher',{...payload,id:draft.id,published:1},200,auth);assert((await req('/api/courses')).courses.length===2,'Published course missing');assert((await(await mf.dispatchFetch('https://course.test/sitemap.xml')).text()).includes('course='+draft.id),'Published lesson not discoverable in sitemap');
const fourth=await req('/api/courses?grade=grade-4');assert(fourth.courses.length===1&&fourth.courses[0].grade==='grade-4','Grade grouping failed');await req('/api/courses?grade=invalid',null,400);
await req('/api/classroom',{action:'start',course:draft.id,name:'طالب بدون حساب'});await req('/api/classroom',{action:'complete',course:draft.id},400);await req('/api/classroom',{action:'read',course:draft.id,lesson:0});
const before=await req('/api/classroom?course='+draft.id);assert(!('answer' in before.course.questions[0])&&!('reason' in before.course.questions[0]),'Answer leaked before solving');
const a=await req('/api/classroom',{action:'answer',course:draft.id,question:1,choice:before.course.questions[0].options.indexOf('work')});assert(a.answers[0].correct===0&&a.answers[0].reason&&a.answers[0].answerText==='works','Correction failed');
const updated=structuredClone(payload);updated.definition.questions[0].answer=0;updated.definition.questions[0].reason='شرح جديد';await req('/api/teacher',{...updated,id:draft.id,published:1},200,auth);
const saved=await req('/api/classroom?course='+draft.id);assert(saved.answers[0].answerText==='works'&&saved.course.questions[0].options[saved.answers[0].answer]==='works','Existing student content changed');assert(JSON.stringify(before.course.questions[0].options)===JSON.stringify(saved.course.questions[0].options),'Option order unstable');
const completion=await req('/api/classroom',{action:'complete',course:draft.id});assert(completion.student.completed,'Certificate gating failed');
const progress=await req('/api/courses?grade=grade-4');assert(progress.courses[0].progress.answered===1&&progress.courses[0].progress.percent===100&&progress.courses[0].progress.completed,'Grade progress not restored');assert(completion.course.grade==='grade-4','Grade metadata missing');const anonymous=await mf.dispatchFetch('https://course.test/api/courses?grade=grade-4');const anon=await anonymous.json();assert(anon.courses[0].progress===null,'Progress leaked to another browser');
const originalStart=await req('/api/classroom',{action:'start',name:'طالب القصة'});const originalDefinition=admin.courses.find(c=>c.id==='life-stories').definition;const keys=[0,1,2,1,2,1,1,2,1,0,1,2,1,0,2,1,0,2,0,1,1,2,0,1,2,0,1,2];
for(let i=1;i<=28;i++){const l=i<=3?0:i<=6?1:i<=9?2:i<=12?3:4;if([1,4,7,10,13].includes(i))await req('/api/classroom',{action:'read',lesson:l});await req('/api/classroom',{action:'answer',question:i,choice:originalStart.course.questions[i-1].options.indexOf(originalDefinition.questions[i-1].options[keys[i-1]])});}
const end=await req('/api/classroom',{action:'complete'});assert(end.answers.length===28&&end.leaderboard[0].score===28,'Original course regression');
const custom=await req('/api/classroom?course='+draft.id);assert(custom.student.name==='طالب بدون حساب','Course sessions mixed');
for(const path of ['/', '/?grade=grade-4','/?course=life-stories','/teacher']){const r=await mf.dispatchFetch('https://course.test'+path,{headers:path==='/teacher'?auth:{}});assert(r.status===200,'Render failed '+path);}
const supportPage=await mf.dispatchFetch('https://course.test/?course=life-stories');const supportHtml=await supportPage.text();assert(supportHtml.includes('شرح إضافي للفهم')&&supportHtml.includes('https://www.youtube.com/watch?v=lHzZVybA5Ao'),'Extra explanations missing');

const exported=await mf.dispatchFetch('https://course.test/api/teacher/export',{headers:auth});const backup=await exported.json();assert(exported.status===200&&exported.headers.get('content-disposition').includes('attachment'),'Owner cannot download backup');assert(backup.format==='alwadani-lessons'&&backup.courses.length===2&&backup.courses.find(c=>c.id===draft.id).definition.questions[0].reason==='شرح جديد','Backup content incomplete');assert(!JSON.stringify(backup).includes('طالب بدون حساب'),'Backup leaked students');assert(!('students' in backup.courses[0]),'Student stats exported');for(const headers of [{},{'oai-authenticated-user-id':'other','oai-authenticated-user-email':'other@test.example'}])assert((await mf.dispatchFetch('https://course.test/api/teacher/export',{headers})).status===403,'Backup authorization failed');
const stored=await db.prepare('SELECT choice,correct FROM answers WHERE student=? AND question=1').bind(end.student.id).first();assert(stored.choice===keys[0]&&stored.correct===1,'Stored choice is not canonical');
// Recheck a pre-update canonical saved answer with the new display mapping.
await db.prepare('INSERT INTO students(id,name,created,course,snapshot) VALUES(?,?,?,?,?)').bind('legacy-id','قديم','2026-01-01','life-stories',JSON.stringify({id:'life-stories',title:admin.courses[0].title,description:admin.courses[0].description,published:1,definition:originalDefinition,updated:''})).run();await db.prepare('INSERT INTO answers(student,question,choice,correct) VALUES(?,?,?,?)').bind('legacy-id',1,keys[0],1).run();
assert((await req('/api/classroom')).leaderboard.some(x=>x.name==='قديم'&&x.score===1),'Legacy leaderboard excluded');
const orders=new Set();for(let n=0;n<6;n++){const session=await req('/api/classroom',{action:'start',name:'اختبار الترتيب '+n});orders.add(JSON.stringify(session.course.questions.map(q=>q.options)));const restored=await req('/api/classroom');assert(JSON.stringify(restored.course.questions)===JSON.stringify(session.course.questions),'Reload changed choices');assert(session.course.questions.every((q,i)=>[...q.options].sort().join('|')===[...originalDefinition.questions[i].options].sort().join('|')),'Choices missing or duplicated');assert(!('answer' in session.course.questions[0]),'Unsolved answer leaked');}
assert(orders.size>1,'Different students have identical full option order');
// Deletion is private, reversible, and preserves every student record.
const mutateCourse=(method,body,expected=200,headers=auth)=>req('/api/teacher',body,expected,headers,method);
const missingCourse='00000000-0000-4000-8000-000000000123';
for(const method of ['DELETE','PATCH']){
  const body={id:draft.id,...(method==='PATCH'?{action:'restore'}:{})};
  await mutateCourse(method,body,403,{});
  await mutateCourse(method,body,403,forged);
  await mutateCourse(method,body,403,{...auth,origin:'https://other.test'});
  await mutateCourse(method,body,403,{...auth,origin:''});
  await mutateCourse(method,{...body,id:'invalid'},400);
  await mutateCourse(method,{...body,id:missingCourse},404);
  const malformed=await mf.dispatchFetch('https://course.test/api/teacher',{method,headers:{...auth,origin:'https://course.test','Content-Type':'application/json'},body:'{'});
  assert(malformed.status===400,'Malformed course mutation accepted');
}
await mutateCourse('PATCH',{id:draft.id,action:'delete'},400);
async function studentRecords(){
  const students=(await db.prepare('SELECT * FROM students ORDER BY id').all()).results;
  const answers=(await db.prepare('SELECT * FROM answers ORDER BY student,question').all()).results;
  const reads=(await db.prepare('SELECT * FROM reads ORDER BY student,lesson').all()).results;
  return JSON.stringify({students,answers,reads});
}
const studentRecordsBefore=await studentRecords();
const savedDefinition=(await db.prepare('SELECT definition FROM courses WHERE id=?').bind(draft.id).first()).definition;
const deleted=await mutateCourse('DELETE',{id:draft.id});
assert(!deleted.courses.some(c=>c.id===draft.id)&&deleted.deletedCourses.some(c=>c.id===draft.id&&c.published===-1),'Deleted course missing from trash');
assert(!(await req('/api/courses')).courses.some(c=>c.id===draft.id),'Deleted course is public');
assert((await req('/api/courses?grade=grade-4')).courses.length===0,'Deleted course still appears in its grade');
await req('/api/classroom?course='+draft.id,null,503);
await req('/api/classroom',{action:'start',course:draft.id,name:'لا يبدأ الدرس المحذوف'},503);
const hiddenPage=await mf.dispatchFetch('https://course.test/?course='+draft.id);
assert((await hiddenPage.text()).includes('الدرس غير متاح حاليًا'),'Deleted direct link remains accessible');
const trashBackup=await (await mf.dispatchFetch('https://course.test/api/teacher/export',{headers:auth})).json();
assert(!trashBackup.courses.some(c=>c.id===draft.id),'Trash included in active lesson backup');
await req('/api/teacher',{...updated,id:draft.id,published:1},409,auth);
assert((await db.prepare('SELECT published,definition FROM courses WHERE id=?').bind(draft.id).first()).definition===savedDefinition,'Stale editor changed deleted content');
await mutateCourse('DELETE',{id:draft.id});
assert(await studentRecords()===studentRecordsBefore,'Deletion removed or changed student data');
const restored=await mutateCourse('PATCH',{id:draft.id,action:'restore'});
assert(restored.courses.some(c=>c.id===draft.id&&c.published===0)&&!restored.deletedCourses.some(c=>c.id===draft.id),'Restoration must create a private draft');
assert(!(await req('/api/courses')).courses.some(c=>c.id===draft.id),'Restoration unexpectedly published the course');
await req('/api/teacher',{...restored.courses.find(c=>c.id===draft.id),published:1},200,auth);
const restoredProgress=(await req('/api/courses?grade=grade-4')).courses[0].progress;
assert(restoredProgress.answered===1&&restoredProgress.completed===progress.courses[0].progress.completed,'Restored lesson lost student progress');
assert((await req('/api/classroom?course='+draft.id)).answers[0].answerText==='works','Restored student snapshot or correction changed');

// A discarded private draft can also be recovered.
const disposableDraft=await req('/api/teacher',payload,200,auth);
await mutateCourse('DELETE',{id:disposableDraft.id});
const recoveredDraft=await mutateCourse('PATCH',{id:disposableDraft.id,action:'restore'});
assert(recoveredDraft.courses.some(c=>c.id===disposableDraft.id&&c.published===0),'Private draft was not restored');
await mutateCourse('DELETE',{id:disposableDraft.id});

// Deleting the original source lesson stores a marker rather than reintroducing the fallback.
const originalDeleted=await mutateCourse('DELETE',{id:'life-stories'});
assert(!originalDeleted.courses.some(c=>c.id==='life-stories')&&originalDeleted.deletedCourses.some(c=>c.id==='life-stories'),'Original course fallback returned after deletion');
assert(!(await req('/api/courses')).courses.some(c=>c.id==='life-stories'),'Original deleted lesson is public');
await req('/api/classroom',null,503);
const hiddenOriginal=await mf.dispatchFetch('https://course.test/?course=life-stories');
assert((await hiddenOriginal.text()).includes('الدرس غير متاح حاليًا'),'Original deleted direct link is accessible');
const restoredOriginal=await mutateCourse('PATCH',{id:'life-stories',action:'restore'});
const restoredOriginalCourse=restoredOriginal.courses.find(c=>c.id==='life-stories');
assert(restoredOriginalCourse.published===0&&restoredOriginalCourse.definition.questions.length===28,'Original content was not retained');
await req('/api/teacher',{...restoredOriginalCourse,published:1},200,auth);
assert((await req('/api/courses?grade=grade-9')).courses.length===1,'Original course did not return to its grade');
assert(await studentRecords()===studentRecordsBefore,'Delete/restore changed existing answers, reads, completions or snapshots');
const trashedAdmin=await req('/api/teacher',null,200,auth);
assert(trashedAdmin.deletedCourses.length===1&&trashedAdmin.deletedCourses[0].id===disposableDraft.id,'Trash visibility is incorrect');

// Private interactive teacher records: additive setup, validation and concurrent edits.
const recordsPath='/api/teacher/records';
assert(!(await db.prepare("SELECT name FROM sqlite_master WHERE name='teacher_records'").first()),'Record table should not exist before the first authorized record request');
for(const method of ['GET','POST','PUT','DELETE']){
  await req(recordsPath,method==='GET'?null:{},403,{},method);
  await req(recordsPath,method==='GET'?null:{},403,forged,method);
}
assert(!(await db.prepare("SELECT name FROM sqlite_master WHERE name='teacher_records'").first()),'Anonymous requests created the record table');
const recordList=await req(recordsPath,null,200,auth);assert(recordList.records.length===0,'Record list not empty');
const student1=crypto.randomUUID(),student2=crypto.randomUUID(),student3=crypto.randomUUID();
const performance=crypto.randomUUID(),homework=crypto.randomUUID(),exam=crypto.randomUUID();
const recordPayload={title:'كشف تجريبي',grade:'grade-9',className:'3 / ب',teacherName:'معلم تجريبي',principalName:'مدير تجريبي',students:[{id:student1,name:'طالب أول'},{id:student2,name:'طالب ثان'},{id:student3,name:''}],tasks:[{id:performance,title:'حفظ الحروف',type:'performance',maxScore:10},{id:homework,title:'واجب الوحدة',type:'homework',maxScore:10},{id:exam,title:'الاختبار الأول',type:'exam',maxScore:20}],marks:{[student1]:{[performance]:'done',[homework]:'missing',[exam]:0},[student2]:{[performance]:'missing',[homework]:'done',[exam]:'absent'}}};
for(const method of ['POST','PUT','DELETE'])for(const origin of ['', 'https://other.test'])await req(recordsPath,recordPayload,403,{...auth,origin},method);
const badRecords=[{...recordPayload,students:[]},{...recordPayload,students:[recordPayload.students[0],recordPayload.students[0]]},{...recordPayload,tasks:[]},{...recordPayload,grade:'invalid'},{...recordPayload,tasks:[{...recordPayload.tasks[0],type:'unknown'}]},{...recordPayload,marks:{[student1]:{[exam]:21}}},{...recordPayload,marks:{[student1]:{[exam]:-1}}},{...recordPayload,marks:{[student1]:{[homework]:5}}},{...recordPayload,marks:{[student1]:{[performance]:'absent'}}},{...recordPayload,marks:{[crypto.randomUUID()]:{[exam]:2}}}];
for(const invalid of badRecords)await req(recordsPath,invalid,400,auth);
const createdRecord=(await req(recordsPath,recordPayload,201,auth)).record;
assert(createdRecord.version===1&&createdRecord.students.length===3&&createdRecord.marks[student1][exam]===0,'Initial record or zero score not retained');
const listedRecords=(await req(recordsPath,null,200,auth)).records;
assert(listedRecords.length===1&&listedRecords[0].studentCount===3&&listedRecords[0].taskCount===3&&!('marks' in listedRecords[0])&&!('students' in listedRecords[0]),'Record summary is incorrect');
const fetchedRecord=(await req(recordsPath+'?id='+createdRecord.id,null,200,auth)).record;
assert(fetchedRecord.principalName===recordPayload.principalName&&fetchedRecord.marks[student2][exam]==='absent','Record metadata or absence missing');
await req(recordsPath+'?id='+createdRecord.id,null,403);
await req(recordsPath+'?id=invalid',null,400,auth);
await req(recordsPath+'?id='+crypto.randomUUID(),null,404,auth);
const editRecord=structuredClone(createdRecord);editRecord.students[2].name='طالب ثالث';editRecord.marks[student1][exam]=7.5;editRecord.marks[student2][homework]=null;editRecord.teacherName='معلم معدّل';editRecord.tasks.push({id:crypto.randomUUID(),title:'مهمة إضافية',type:'performance',maxScore:10});
const savedRecord=(await req(recordsPath,editRecord,200,auth,'PUT')).record;
assert(savedRecord.version===2&&savedRecord.marks[student1][exam]===7.5&&savedRecord.marks[student2][homework]===null&&savedRecord.students[2].name==='طالب ثالث'&&savedRecord.tasks.length===4,'Record update did not persist');
await req(recordsPath,{...savedRecord,tasks:savedRecord.tasks.map(t=>t.id===exam?{...t,maxScore:5}:t)},400,auth,'PUT');
await req(recordsPath,{...createdRecord,title:'تعديل قديم'},409,auth,'PUT');
assert((await req(recordsPath+'?id='+createdRecord.id,null,200,auth)).record.title===recordPayload.title,'Stale edit overwrote the record');
const copyRecord=(await req(recordsPath,{...savedRecord,title:'نسخة مستقلة'},201,auth)).record;
assert(copyRecord.id!==createdRecord.id&&copyRecord.version===1,'Record copy overwrote its source');
const malformedRecord=await mf.dispatchFetch('https://course.test'+recordsPath,{method:'POST',headers:{...auth,origin:'https://course.test','Content-Type':'application/json'},body:'{'});assert(malformedRecord.status===400,'Malformed record accepted');
const oversizedRecord=await mf.dispatchFetch('https://course.test'+recordsPath,{method:'POST',headers:{...auth,origin:'https://course.test','Content-Type':'application/json'},body:'x'.repeat(350001)});assert(oversizedRecord.status===400,'Oversized record accepted');
// Migration remains safe after automatic setup and keeps existing saved records.
for(const file of readdirSync(project+'drizzle').filter(x=>x.startsWith('0005_')&&x.endsWith('.sql'))){for(const statement of readFileSync(project+'drizzle/'+file,'utf8').split('--> statement-breakpoint'))await db.prepare(statement.trim()).run();}
assert((await req(recordsPath,null,200,auth)).records.length===2,'Migration removed saved records');
assert(await studentRecords()===studentRecordsBefore,'Record feature changed lesson student data');
for(const [path,text] of [['/teacher/records','كشوفك، في مكان واحد'],['/teacher/settings','إعدادات المظهر'],['/teacher/classes','صفوفك الدراسية'],['/teacher?grade=grade-9','الصف الثالث المتوسط']]){const response=await mf.dispatchFetch('https://course.test'+path,{headers:auth});const html=await response.text();assert(response.status===200&&html.includes(text)&&html.includes('قائمة المعلم'),'New teacher page failed '+path);}
for(const path of ['/teacher/records','/teacher/settings','/teacher/classes']){const response=await mf.dispatchFetch('https://course.test'+path);const html=await response.text();assert((response.status>=300&&response.status<400&&response.headers.get('location')?.endsWith('/teacher'))||(response.status===200&&html.includes('مرحبًا بعودتك')&&!html.includes('كشوفك، في مكان واحد')),'Private teacher page exposed '+path+' '+JSON.stringify({status:response.status,location:response.headers.get('location'),html:html.slice(0,500)}));}


for(const [path,text] of [['/tools','أدوات تسهّل يومك'],['/tools/records','كشوفك، في مكان واحد'],['/tools/certificates','لكل مبدع، شهادة']]){const response=await mf.dispatchFetch('https://course.test'+path);const html=await response.text();assert(response.status===200&&html.includes(text)&&html.includes('أدوات متاحة للجميع'),'Anonymous tools page unavailable '+path);assert(!html.includes(recordPayload.title),'Public tools exposed owner records');}
const ratedId=crypto.randomUUID(),customId=crypto.randomUUID();
const toolsRecord={...recordPayload,schoolName:'مدرسة تجريبية',subjectName:'اللغة الإنجليزية',classLabel:'الصف الرابع عام أ',design:'blue',tasks:[{id:ratedId,title:'أداء شفهي',type:'performance-score',maxScore:5},{id:customId,title:'إحضار الكتاب',type:'custom',mode:'check',maxScore:10,positiveLabel:'أحضر',negativeLabel:'لم يحضر'}],marks:{[student1]:{[ratedId]:4,[customId]:'done'}}};
const toolsSaved=(await req(recordsPath,toolsRecord,201,auth)).record;assert(toolsSaved.schoolName==='مدرسة تجريبية'&&toolsSaved.subjectName==='اللغة الإنجليزية'&&toolsSaved.classLabel==='الصف الرابع عام أ'&&toolsSaved.design==='blue'&&toolsSaved.marks[student1][ratedId]===4&&toolsSaved.tasks[1].mode==='check','New record options did not persist in D1');
await req(recordsPath,{...toolsRecord,marks:{[student1]:{[ratedId]:6}}},400,auth);
await req(recordsPath,{...toolsSaved,tasks:toolsSaved.tasks.map(t=>t.id===customId?{...t,mode:'number'}:t)},400,auth,'PUT');
await req(recordsPath,null,403);await req('/api/teacher',null,403);
await req(recordsPath,{id:toolsSaved.id,version:toolsSaved.version+1},409,auth,'DELETE');assert((await req(recordsPath+'?id='+toolsSaved.id,null,200,auth)).record.id===toolsSaved.id,'Stale delete removed a newer record');await req(recordsPath,{id:toolsSaved.id,version:toolsSaved.version},200,auth,'DELETE');await req(recordsPath+'?id='+toolsSaved.id,null,404,auth);assert(await studentRecords()===studentRecordsBefore,'Record deletion changed lesson student data');

// Custom comments and optional blank student rows persist as part of the record JSON.
const commentId=crypto.randomUUID(),commentChoices=[{id:crypto.randomUUID(),label:'حاضر',tone:'positive'},{id:crypto.randomUUID(),label:'غائب',tone:'negative'},{id:crypto.randomUUID(),label:'متأخر',tone:'neutral'}];
const commentPayload={...recordPayload,tasks:[{id:commentId,title:'الحضور',type:'custom',mode:'comments',maxScore:10,choices:commentChoices}],marks:{[student1]:{[commentId]:'choice:'+commentChoices[0].id},[student2]:{[commentId]:'choice:'+commentChoices[2].id}}};
const savedComments=(await req(recordsPath,commentPayload,201,auth)).record;
const fetchedComments=(await req(recordsPath+'?id='+savedComments.id,null,200,auth)).record;
assert(fetchedComments.tasks[0].choices.length===3&&fetchedComments.marks[student2][commentId]==='choice:'+commentChoices[2].id,'Custom comment choices or selection lost in D1');
const revisedComments={...fetchedComments,tasks:[{...fetchedComments.tasks[0],choices:commentChoices.map((c,i)=>i===2?{...c,label:'متأخر بعذر',tone:'positive'}:c)}],students:[...fetchedComments.students,{id:crypto.randomUUID(),name:''},{id:crypto.randomUUID(),name:'طالب إضافي'}]};
const updatedComments=(await req(recordsPath,revisedComments,200,auth,'PUT')).record;
assert(updatedComments.students.at(-2).name===''&&updatedComments.students.at(-1).name==='طالب إضافي'&&updatedComments.tasks[0].choices[2].label==='متأخر بعذر'&&updatedComments.marks[student2][commentId]==='choice:'+commentChoices[2].id,'Comment editing or optional student name did not persist');
await req(recordsPath,{...updatedComments,tasks:[{...updatedComments.tasks[0],choices:commentChoices.slice(0,2)}]},400,auth,'PUT');
await req(recordsPath,{...updatedComments,marks:{[student1]:{[commentId]:'choice:'+crypto.randomUUID()}}},400,auth,'PUT');
await req(recordsPath,{...updatedComments,tasks:[{...updatedComments.tasks[0],choices:[]}]},400,auth,'PUT');
assert((await req(recordsPath+'?id='+savedComments.id,null,200,auth)).record.version===updatedComments.version,'Invalid comment update changed the saved record');

// Blank paper records persist without scores, with the format visible in summaries.
const paperPayload={...recordPayload,title:'كشف فارغ تجريبي',format:'blank',marks:{},students:Array.from({length:30},(_,i)=>({id:i===0?student1:i===1?student2:crypto.randomUUID(),name:i===0?'طالب أول':i===1?'طالب ثان':''}))};
const paperSaved=(await req(recordsPath,paperPayload,201,auth)).record;
assert(paperSaved.format==='blank'&&paperSaved.students.length===30&&Object.keys(paperSaved.marks).length===0,'Blank record content not retained');
const paperSummary=(await req(recordsPath,null,200,auth)).records.find(r=>r.id===paperSaved.id);
assert(paperSummary.format==='blank'&&!('marks' in paperSummary)&&!('students' in paperSummary),'Blank record summary is incorrect');
const paperUpdated={...paperSaved,students:paperSaved.students.map((r,i)=>i===2?{...r,name:'طالب ثالث'}:r)};
const paperResult=(await req(recordsPath,paperUpdated,200,auth,'PUT')).record;
const paperFetched=(await req(recordsPath+'?id='+paperSaved.id,null,200,auth)).record;
assert(paperResult.format==='blank'&&paperFetched.students[2].id===paperSaved.students[2].id&&paperFetched.students[2].name==='طالب ثالث'&&paperFetched.students.length===30,'Reserved blank row or paper format lost after update');
await req(recordsPath,{...paperFetched,marks:{[student1]:{[exam]:10}}},400,auth,'PUT');
await req(recordsPath,{...paperPayload,format:'invalid'},400,auth);
assert((await req(recordsPath+'?id='+paperSaved.id,null,200,auth)).record.version===paperResult.version,'Invalid paper edit modified record');
assert(await studentRecords()===studentRecordsBefore,'Paper records changed lesson progress');
console.log('PASS: blank record format, summary, reserved rows and validation in D1.');

// Recovery revokes existing sessions, expiration denies access, logout revokes.
const oldAuth={...auth};
await req('/api/teacher/auth',{action:'recover',username:'alwadani',password:'New-Teacher-Password-456!',setupKey:'wrong'},403,{'cf-connecting-ip':'198.51.100.10'});
await req('/api/teacher',null,200,auth);
const recovered=await mf.dispatchFetch('https://course.test/api/teacher/auth',{method:'POST',headers:{'Content-Type':'application/json',origin:'https://course.test','cf-connecting-ip':'198.51.100.10'},body:JSON.stringify({action:'recover',username:'alwadani',password:'New-Teacher-Password-456!',setupKey:ownerKey})});
assert(recovered.status===200,'Recovery failed');auth={cookie:recovered.headers.get('set-cookie').split(';')[0]};
await req('/api/teacher',null,403,oldAuth);await req('/api/teacher',null,200,auth);
await req('/api/teacher/auth',{action:'login',username:'alwadani',password},401,{'cf-connecting-ip':'198.51.100.20'});
const loggedIn=await mf.dispatchFetch('https://course.test/api/teacher/auth',{method:'POST',headers:{'Content-Type':'application/json',origin:'https://course.test','cf-connecting-ip':'198.51.100.20'},body:JSON.stringify({action:'login',username:'alwadani',password:'New-Teacher-Password-456!'})});
assert(loggedIn.status===200,'Password login failed');
const loginCookie=loggedIn.headers.get('set-cookie').split(';')[0];
await req('/api/teacher/auth',{action:'logout'},200,auth);await req('/api/teacher',null,403,auth);
await req('/api/teacher',null,200,{cookie:loginCookie});
await db.prepare('UPDATE teacher_sessions SET expires=0').run();await req('/api/teacher',null,403,{cookie:loginCookie});await req(recordsPath,null,403,{cookie:loginCookie});
const unauth=await mf.dispatchFetch('https://course.test/teacher');assert((await unauth.text()).includes('مرحبًا بعودتك'),'Login page missing');
// Unconfigured installations fail closed even with forged identity headers.
await mf.setOptions({modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings:{},d1Databases:{DB:'test'},cf:false});
await req('/api/teacher',null,403,forged);await req('/api/teacher/auth',{action:'setup',username:'someone',password,setupKey:ownerKey},503);
assert((await req('/api/courses')).courses.length===2,'Unconfigured teacher blocks students');
let blocked=false;try{requireProductionDatabase({d1_databases:[{binding:'DB',database_id:'00000000-0000-4000-8000-000000000000'}]});}catch{blocked=true;}assert(blocked,'Placeholder deployment accepted');
console.log('PASS: private teacher records, lazy additive D1 schema, progress/grades/absence persistence, concurrent edit conflicts, isolated copies, record validation, teacher navigation and settings; reversible course deletion and draft restoration; owner-only deletion and restore; CSRF and malformed mutation rejection; original fallback suppression; student records and snapshots preserved; stale editors cannot republish deleted lessons; independent owner setup/login/logout/recovery; secure hashed passwords and sessions; CSRF checks; forged headers denied; rate limit and expiration; deployment placeholder blocked;  export permissions and saved content; third middle placement; stable per-student choice shuffling; canonical scoring; legacy leaderboard;  grade assignment, filtering, saved progress, anonymous isolation, supplemental explanation, owner-only editing; anonymous student start; draft visibility; publishing; corrections; certificate; snapshot preservation; per-course sessions; all 28 original questions; page rendering.');
}finally{await mf.dispose();}
