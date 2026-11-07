import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {nextChapterTime,validateRemedialPlan} from '../lib/remedial-model.ts';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wranglerRequire('miniflare');
const project=fileURLToPath(new URL('../',import.meta.url)),root=project+'dist/server',paths=readdirSync(root,{recursive:true}).filter(p=>p.endsWith('.js')||p.endsWith('.mjs'));
const ownerKey=crypto.randomUUID()+crypto.randomUUID(),password=crypto.randomUUID()+'Aa1!';
const mf=new Miniflare({modules:['index.js',...paths.filter(p=>p!=='index.js')].map(p=>({type:'ESModule',path:root+'/'+p})),modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings:{TEACHER_SETUP_KEY:ownerKey},d1Databases:{DB:'remedial-test'},cf:false});
let teacher='',studentA='',studentB='';
const apiTeacher='/api/teacher/remedial',apiStudent='/api/remedial';
async function request(path,body,cookie='',expected=200,headers={}){const r=await mf.dispatchFetch('https://remedial.test'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',origin:'https://remedial.test',cookie,...headers},...(body?{body:JSON.stringify(body)}:{})});const d=await r.json();assert.equal(r.status,expected,JSON.stringify({path,status:r.status,expected,error:d.error}));return {data:d,cookie:r.headers.get('set-cookie')?.split(';')[0]||cookie};}
const admin=async(action,fields={},expected=200)=>(await request(apiTeacher,{action,...fields},teacher,expected)).data;
const view=async(cookie)=>(await request(apiStudent,null,cookie)).data;
const action=async(cookie,state,name,extra={},expected=200)=>(await request(apiStudent,{action:name,version:state.version,chapterId:state.chapter?.id,...extra},cookie,expected)).data;
const question=()=>({id:crypto.randomUUID(),prompt:'Choose the correct answer',choices:['Right','Wrong'],correct:0,explanation:'Review the explanation.'});
const chapter=(title,body)=>({id:crypto.randomUUID(),title,body,questions:[question(),question(),question()]});
try{
 const db=await mf.getD1Database('DB');for(const file of readdirSync(project+'drizzle').filter(f=>f.endsWith('.sql')).sort()){for(const sql of readFileSync(project+'drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql.trim()).run();}
 await request(apiStudent,null,'',401);await request(apiTeacher,null,'',403);await request(apiTeacher,{action:'save-plan'},'',403,{'oai-authenticated-user-id':'fake'});
 const owner=await request('/api/teacher/auth',{action:'setup',username:'remedial-teacher',password,setupKey:ownerKey});teacher=owner.cookie;assert(teacher.includes('__Host-alwadani_teacher='));
 const draft={title:'Draft plan',description:'Content will be added later.',grade:'grade-4',className:'أ',passPercent:70,delayHours:6,dailyLimit:false,chapters:[]};
 const draftRow=await admin('save-plan',{definition:draft,published:false},201);await admin('save-plan',{id:draftRow.id,version:1,definition:draft,published:true},400);
 const draftStudent=await admin('assign',{planId:draftRow.id,studentName:'Draft student',code:'DRAFT-CODE-1234'},201);
 const draftLogin=await request(apiStudent,{action:'login',code:'DRAFT-CODE-1234'});assert(draftLogin.data.paused);assert.equal((await db.prepare('SELECT snapshot FROM remedial_assignments WHERE id=?').bind(draftStudent.id).first()).snapshot,null);
 const definition={...draft,title:'Private remedial plan',chapters:[chapter('Chapter one','CURRENT_PRIVATE_BODY'),chapter('Chapter two','FUTURE_SECRET_BODY')]};
 assert.throws(()=>validateRemedialPlan({...definition,chapters:[definition.chapters[0],definition.chapters[0]]},true));
 const plan=await admin('save-plan',{definition,published:true},201);await request(apiTeacher,{action:'assign',planId:plan.id,studentName:'Cross site'},teacher,403,{origin:'https://evil.test'});
 const a=await admin('assign',{planId:plan.id,studentName:'Student A',code:'STUDENT-A-1234'},201),b=await admin('assign',{planId:plan.id,studentName:'Student B',code:'STUDENT-B-1234'},201);
 await admin('assign',{planId:draftRow.id,studentName:'Duplicate',code:'STUDENT-A-1234'},400);
 const stored=await db.prepare('SELECT * FROM remedial_assignments WHERE id=?').bind(a.id).first();assert(!stored.code_cipher.includes('STUDENT-A-1234'));assert.notEqual(stored.code_hash,'STUDENT-A-1234');assert.equal((await admin('access-details',{assignmentId:a.id})).code,'STUDENT-A-1234');
 await request(apiTeacher,null,'',403);await request(apiStudent,{action:'login',code:'WRONGCODE'},'',400);
 let login=await request(apiStudent,{action:'login',code:'student a 1234'});studentA=login.cookie;let state=login.data;assert.equal(state.studentName,'Student A');assert.equal(state.chapter.body,'CURRENT_PRIVATE_BODY');assert(!JSON.stringify(state).includes('FUTURE_SECRET_BODY'));assert.equal(state.chapter.questions.length,0);assert(!JSON.stringify(state).includes('code_hash'));
 login=await request(apiStudent,{action:'login',code:'STUDENT-B-1234'});studentB=login.cookie;assert.equal(login.data.currentIndex,0);
 assert.equal((await request(apiStudent+'?assignmentId='+b.id,null,studentA)).data.studentName,'Student A');
 await request(apiStudent,{action:'reset',assignmentId:b.id},studentA,400);await request(apiStudent,{action:'exam'},studentA,403,{origin:'https://evil.test'});
 state=await action(studentA,state,'exam');assert.equal(state.chapter.questions.length,3);for(const q of state.chapter.questions){assert(!('correct' in q));assert(!('explanation' in q));}
 await action(studentA,state,'submit',{answers:[{id:state.chapter.questions[0].id,choice:0}]},400);
 state=await action(studentA,state,'submit',{score:100,passed:true,answers:state.chapter.questions.map(q=>({id:q.id,choice:1}))});assert.equal(state.result.score,0);assert(!state.result.passed);assert.equal(state.currentIndex,0);
 const staleVersion=state.version;
 state=await action(studentA,state,'submit',{answers:state.chapter.questions.map(q=>({id:q.id,choice:0}))});assert(state.result.passed);assert.equal(state.currentIndex,1);assert(state.locked);assert.equal(state.chapter,null);assert(state.unlockAt-state.serverNow>6*3600000-3000&&state.unlockAt-state.serverNow<=6*3600000);
 await request(apiStudent,{action:'exam',chapterId:definition.chapters[1].id,version:state.version,now:Date.now()+100*86400000},studentA,400);assert.equal((await view(studentB)).currentIndex,0);
 const otherDevice=await request(apiStudent,{action:'login',code:'STUDENT-A-1234'});assert.equal(otherDevice.data.currentIndex,1);assert(otherDevice.data.locked);
 await admin('set-active',{assignmentId:a.id,active:false});assert((await view(studentA)).paused);await admin('set-active',{assignmentId:a.id,active:true});
 const updated={...definition,chapters:[definition.chapters[0],{...definition.chapters[1],body:'UPDATED_FUTURE_BODY'}]};
 await admin('save-plan',{id:plan.id,version:1,definition:updated,published:true});await admin('save-plan',{id:plan.id,version:1,definition:updated,published:true},409);
 const priorUnlock=(await view(studentA)).unlockAt;await admin('refresh-plan',{assignmentId:a.id});state=await view(studentA);assert.equal(state.currentIndex,1);assert.equal(state.unlockAt,priorUnlock);assert(state.locked);
 await admin('unlock',{assignmentId:a.id});state=await view(studentA);assert(!state.locked);assert.equal(state.chapter.body,'UPDATED_FUTURE_BODY');assert.equal(state.chapters[0].status,'passed');
 await request(apiStudent,{action:'exam',version:staleVersion,chapterId:state.chapter.id},studentA,400);
 state=await action(studentA,state,'exam');state=await action(studentA,state,'submit',{answers:state.chapter.questions.map(q=>({id:q.id,choice:0}))});assert(state.completed);assert.equal(state.currentIndex,2);
 const history=await admin('history',{assignmentId:a.id});assert.equal(history.attempts.length,3);assert.equal((await db.prepare('SELECT next_index FROM remedial_assignments WHERE id=?').bind(b.id).first()).next_index,0);
 await admin('change-code',{assignmentId:a.id,code:'NEW-STUDENT-A-9999'});await request(apiStudent,null,studentA,401);await request(apiStudent,null,otherDevice.cookie,401);await request(apiStudent,{action:'login',code:'STUDENT-A-1234'},'',400);
 login=await request(apiStudent,{action:'login',code:'NEW-STUDENT-A-9999'});studentA=login.cookie;assert(login.data.completed);await admin('reset',{assignmentId:a.id});state=await view(studentA);assert.equal(state.currentIndex,0);assert.equal((await admin('history',{assignmentId:a.id})).attempts.length,3);
 // The real server clock is enforced. The test advances only its isolated DB fixture.
 let bState=await view(studentB);bState=await action(studentB,bState,'exam');const submit={action:'submit',version:bState.version,chapterId:bState.chapter.id,answers:bState.chapter.questions.map(q=>({id:q.id,choice:0}))};
 const concurrent=await Promise.all([mf.dispatchFetch('https://remedial.test'+apiStudent,{method:'POST',headers:{origin:'https://remedial.test','Content-Type':'application/json',cookie:studentB},body:JSON.stringify(submit)}),mf.dispatchFetch('https://remedial.test'+apiStudent,{method:'POST',headers:{origin:'https://remedial.test','Content-Type':'application/json',cookie:studentB},body:JSON.stringify(submit)})]);assert.deepEqual(concurrent.map(r=>r.status).sort(),[200,400]);assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM remedial_attempts WHERE assignment_id=? AND passed=1').bind(b.id).first()).n,1);
 await db.prepare('UPDATE remedial_assignments SET unlocked_at=? WHERE id=?').bind(Date.now()-1,b.id).run();assert.equal((await view(studentB)).chapter.id,definition.chapters[1].id);
 await admin('save-plan',{id:plan.id,version:2,definition:updated,published:false});assert((await view(studentB)).paused);await admin('save-plan',{id:plan.id,version:3,definition:updated,published:true});
 await request(apiStudent,{action:'logout'},studentA);await request(apiStudent,null,studentA,401);await request(apiStudent,null,'__Host-teachcraft_remedial='+crypto.randomUUID().replaceAll('-','').repeat(2),401);
 for(let i=0;i<20;i++)await request(apiStudent,{action:'login',code:'BADCODE123'},'',400,{'cf-connecting-ip':'198.51.100.77'});await request(apiStudent,{action:'login',code:'STUDENT-B-1234'},'',429,{'cf-connecting-ip':'198.51.100.77'});
 const evening=Date.parse('2026-11-07T17:00:00Z');assert.equal(nextChapterTime(evening,{delayHours:6,dailyLimit:false}),evening+6*3600000);const early=Date.parse('2026-11-07T01:00:00Z');assert.equal(nextChapterTime(early,{delayHours:6,dailyLimit:true}),Date.parse('2026-11-07T21:00:00Z'));
 const url=new URL('/remedial','https://remedial.test');url.hash='code=STUDENT-B-1234';assert.equal(url.search,'');assert(!url.href.split('#')[0].includes('STUDENT-B'));
 const {default:QRCode}=await import('qrcode');assert((await QRCode.toDataURL(url.href)).startsWith('data:image/png;base64,'));
 console.log('PASS: draft plans before lessons; grade/class settings; teacher-only plan/student management; encrypted unique codes and QR; isolated persistent sessions; private current content and server-only answer keys; server grading; failure/retry; six-hour unlocks; optional daily cap; client-clock and stale-request rejection; atomic concurrent passes; teacher pause/unlock/reset/rotation; progress-preserving plan updates; retained attempt history; logout/revocation; rate limiting and CSRF.');
}finally{await mf.dispose();}
