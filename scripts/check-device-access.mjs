import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {readFileSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wranglerRequire('miniflare'),project=fileURLToPath(new URL('../',import.meta.url)),root=project+'dist/server';
const paths=readdirSync(root,{recursive:true}).filter(p=>p.endsWith('.js')||p.endsWith('.mjs'));
const modules=['index.js',...paths.filter(p=>p!=='index.js')].map(p=>({type:'ESModule',path:root+'/'+p}));
const key=crypto.randomUUID()+crypto.randomUUID(),password=crypto.randomUUID()+'Aa1!';
const mf=new Miniflare({modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings:{TEACHER_SETUP_KEY:key},d1Databases:{DB:'device-test'},cf:false});
let auth={},cookies={};
const path='/api/teacher/device-access',course='life-stories-time-place-grade-9';
async function call(url,body,status=200,headers={},method=body?'POST':'GET'){
 const response=await mf.dispatchFetch('https://course.test'+url,{method,headers:{'Content-Type':'application/json',origin:'https://course.test',cookie:Object.entries(cookies).map(([k,v])=>k+'='+v).join('; '),...headers},...(body?{body:JSON.stringify(body)}:{})});
 if(response.headers.get('set-cookie')){const [part]=response.headers.get('set-cookie').split(';'),i=part.indexOf('=');cookies[part.slice(0,i)]=part.slice(i+1);}
 const data=await response.json();assert.equal(response.status,status,JSON.stringify({url,status:response.status,expected:status,data}));return data;
}
const policy=(course,studentAccess,status=200,headers=auth)=>call(path,{course,studentAccess},status,headers,'PUT');
try{
 const db=await mf.getD1Database('DB');
 for(const file of readdirSync(project+'drizzle').filter(x=>x.endsWith('.sql')).sort())for(const sql of readFileSync(project+'drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql.trim()).run();
 await call(path,{course:'all',studentAccess:'single'},403,{},'PUT');
 const setup=await mf.dispatchFetch('https://course.test/api/teacher/auth',{method:'POST',headers:{'Content-Type':'application/json',origin:'https://course.test'},body:JSON.stringify({action:'setup',username:'device-test',password,setupKey:key})});
 assert.equal(setup.status,200);auth={cookie:setup.headers.get('set-cookie').split(';')[0]};
 await policy('all','single',403,{'oai-authenticated-user-id':'forged'});
 await policy('all','single',403,{...auth,origin:'https://evil.test'});
 await policy('all','single',403,{...auth,origin:''});
 for(const invalid of [{course:'all'},{course:'all',studentAccess:'bad'},{studentAccess:'single'},{course:[],studentAccess:'single'}])await call(path,invalid,400,auth,'PUT');
 await policy('missing','single',404);
 const page=await mf.dispatchFetch('https://course.test/teacher/device-access',{headers:auth}),html=await page.text();
 assert.equal(page.status,200);assert(html.includes('كيف يعمل الإعداد؟')&&html.includes('التصفح الخاص')&&html.includes('/teacher/device-access'));
 const anonymous=await mf.dispatchFetch('https://course.test/teacher/device-access');
 const anonymousHtml=await anonymous.text();
 assert(!anonymousHtml.includes('كيف يعمل الإعداد؟')&&(anonymous.status>=300&&anonymous.status<400||anonymousHtml.includes('/teacher')), 'Device settings must require the teacher login');
 const initial=(await call('/api/teacher',null,200,auth)).courses;
 const source=initial.find(c=>c.id===course),draftId=crypto.randomUUID();
 const custom={...source.definition,customMetadata:{retained:true},questions:source.definition.questions.map(q=>({...q,extra:'preserve me'}))};
 await db.prepare('INSERT INTO courses(id,title,description,definition,published,updated,grade) VALUES(?,?,?,?,?,?,?)').bind(draftId,'Device policy draft','Draft stays private',JSON.stringify(custom),0,'2026-10-19','grade-9').run();
 await call('/api/teacher',{id:'life-stories',action:'delete'},200,auth,'DELETE');
 const trashedBefore=await db.prepare('SELECT * FROM courses WHERE id=?').bind('life-stories').first();
 await policy('life-stories','shared',404);
 const before=(await call('/api/teacher',null,200,auth)).courses;
 const content=c=>JSON.stringify({title:c.title,description:c.description,grade:c.grade,published:c.published,definition:{...c.definition,studentAccess:undefined}});
 const locked=await policy('all','single');
 assert.equal(locked.changed,before.length);assert(locked.courses.every(c=>c.studentAccess==='single'));
 for(const previous of before)assert.equal(content(locked.courses.find(c=>c.id===previous.id)),content(previous),'Policy save must preserve complete lesson content');
 assert.deepEqual(await db.prepare('SELECT * FROM courses WHERE id=?').bind('life-stories').first(),trashedBefore,'Bulk update must not restore a trashed lesson');
 assert.equal(locked.courses.find(c=>c.id===draftId).published,0,'Bulk update must not publish drafts');
 let state=await call('/api/classroom',{action:'start',course,name:'First student'});
 const student=state.student.id,session=JSON.stringify(cookies);
 await call('/api/classroom',{action:'read',course,lesson:0});
 const beforeState=await call('/api/classroom?course='+course);
 await call('/api/classroom',{action:'start',course,name:'Second student',studentAccess:'shared'},409);
 assert.equal(JSON.stringify(cookies),session,'Blocked start must not replace student identity');
 const reopened=await policy(course,'shared');
 assert.equal(reopened.changed,1);assert(reopened.courses.filter(c=>c.id!==course).every(c=>c.studentAccess==='single'));
 state=await call('/api/classroom?course='+course);assert.equal(state.student.id,student);assert.deepEqual(state.reads,beforeState.reads);assert.deepEqual(state.answers,beforeState.answers);assert.equal(state.course.studentAccess,'shared');
 state=await call('/api/classroom',{action:'start',course,name:'Second student'});assert.notEqual(state.student.id,student);
 await policy(course,'single');
 await call('/api/classroom',{action:'start',course,name:'Third student'},409);
 const resumed=await call('/api/classroom',{action:'start',course,name:'Second student'});assert.equal(resumed.student.id,state.student.id);
 // A new/cleared browser can start; physical-device identity is deliberately not claimed.
 cookies={};const cleared=await call('/api/classroom',{action:'start',course,name:'New browser student'});assert.notEqual(cleared.student.id,state.student.id);
 const recordsBefore=JSON.stringify((await db.prepare('SELECT * FROM students ORDER BY id').all()).results),readsBefore=JSON.stringify((await db.prepare('SELECT * FROM reads ORDER BY student,lesson').all()).results);
 const shared=await policy('all','shared');assert(shared.courses.every(c=>c.studentAccess==='shared'));
 assert.equal(JSON.stringify((await db.prepare('SELECT * FROM students ORDER BY id').all()).results),recordsBefore);assert.equal(JSON.stringify((await db.prepare('SELECT * FROM reads ORDER BY student,lesson').all()).results),readsBefore);
 assert.deepEqual((await call('/api/teacher',null,200,auth)).courses.map(c=>[c.id,c.studentAccess]),shared.courses.map(c=>[c.id,c.studentAccess]),'Saved settings must survive reload');
 console.log('PASS: owner-only page/API; CSRF and invalid input rejection; per-lesson and bulk policies; full content, custom metadata, drafts, trashed lessons and student progress preserved; second names blocked or allowed by the current policy; saved settings reload; name-only enrollment and cleared-browser behavior retained.');
}finally{await mf.dispose();}
