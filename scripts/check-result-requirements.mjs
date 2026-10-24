import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {parseResultRequirements,qualifiesResult,qualificationPercent} from '../lib/result-requirements.ts';

const enabled={enabled:true,minimumPercent:80},result=(score,total=5,completed='2026-10-24T12:00:00Z')=>({score,total,completed});
assert(qualifiesResult(result(4),enabled),'Exact 80% must qualify');
assert(!qualifiesResult(result(159,200),enabled),'79.5% must not qualify by rounding');
assert(!qualifiesResult(result(4,5,null),enabled),'An incomplete attempt must not qualify');
assert(!qualifiesResult(result(0,0),enabled),'An empty denominator must not qualify');
assert(qualifiesResult(result(5),{enabled:true,minimumPercent:100}));
assert(qualifiesResult(result(0,5,null),{enabled:false,minimumPercent:80}),'Disabled requirements must preserve earlier behavior');
assert.equal(qualificationPercent(79.999),79.99);
for(const minimumPercent of [0,101,79.5,'80',null,NaN,Infinity])assert.throws(()=>parseResultRequirements({enabled:true,minimumPercent}));
assert.throws(()=>parseResultRequirements({enabled:'true',minimumPercent:80}));

const require=createRequire(import.meta.url),{Miniflare}=createRequire(require.resolve('wrangler/package.json'))('miniflare'),root=resolve('dist/server');
const modules=['index.js',...readdirSync(root,{recursive:true}).filter(p=>(p.endsWith('.js')||p.endsWith('.mjs'))&&p!=='index.js')].map(p=>({type:'ESModule',path:root+'/'+p}));
const setupKey=crypto.randomUUID()+crypto.randomUUID(),password=crypto.randomUUID()+'Aa1!',origin='https://requirements.test';
const mf=new Miniflare({modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings:{TEACHER_SETUP_KEY:setupKey},d1Databases:{DB:'requirements-test'},cf:false});
let teacherCookie='';
const definition={lessons:[{title:'تدريب محلي',en:'Local test',tag:'01',intro:'',formula:'',rules:[],note:'',example:'',translation:''}],questions:[1,2,3,4,5].map(id=>({id,lesson:0,prompt:'Choose A',options:['A','B'],answer:0,reason:'A is correct.'}))};
const client=(course='requirements-test')=>({course,cookie:'',attempt:1,id:''});
async function request(path,{body,method=body?'POST':'GET',cookie='',expected=200,requestOrigin=origin,headers={}}={}){
 const response=await mf.dispatchFetch(origin+path,{method,headers:{'Content-Type':'application/json',origin:requestOrigin,cookie,...headers},...(body?{body:JSON.stringify(body)}:{})});
 const data=await response.json();assert.equal(response.status,expected,JSON.stringify({path,status:response.status,expected,data}));return {data,cookie:response.headers.get('set-cookie')?.split(';')[0]};
}
async function lesson(c,body){const {data,cookie}=await request('/api/classroom'+(body?'':'?course='+c.course),{body:body?{...body,course:c.course,attempt:c.attempt}:undefined,cookie:c.cookie});if(cookie)c.cookie=cookie;if(data.student){c.attempt=data.student.attempt;c.id=data.student.id;}return data;}
async function start(c,name){return lesson(c,{action:'start',name});}
async function finish(c,correct,count=5,complete=true){let state=await lesson(c,{action:'read',lesson:0});for(const q of state.course.questions.slice(0,count))state=await lesson(c,{action:'answer',question:q.id,choice:q.options.indexOf(q.id<=correct?'A':'B'),elapsedMs:1000});return complete?lesson(c,{action:'complete'}):state;}
async function settings(course,requirements,expected=200){return (await request('/api/teacher/competition',{method:'PUT',cookie:teacherCookie,body:{course,action:'requirements',...requirements},expected})).data;}
try{
 const db=await mf.getD1Database('DB');
 for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')&&!f.startsWith('0005_')&&!f.startsWith('0022_')).sort())for(const statement of readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(statement.trim())await db.prepare(statement.trim()).run();
 for(const id of ['requirements-test','requirements-other','requirements-speed','chores-grade-4'])await db.prepare('INSERT INTO courses(id,title,description,definition,published,grade,updated) VALUES(?,?,?,?,1,?,?)').bind(id,'اختبار محلي للشروط','',JSON.stringify(definition),'grade-4',new Date().toISOString()).run();
 await db.prepare("INSERT INTO course_competitions(course,enabled,show_countdown,ends_at,prize,updated) VALUES('chores-grade-4',0,1,NULL,'',?)").bind(new Date().toISOString()).run();
 assert(!(await db.prepare("SELECT name FROM sqlite_master WHERE name='course_result_requirements'").first()),'Fixture must simulate production before the new table');
 const low=client(),boundary=client(),high=client(),pending=client(),other=client('requirements-other');
 await start(low,'طالب أقل من الحد');let state=await finish(low,3);assert(state.certificate&&state.certificate.score===3,'Legacy completion must remain valid while disabled');
 assert.deepEqual(state.resultRequirements,{enabled:false,minimumPercent:80,bestCompletedPercent:60});
 await start(boundary,'طالب عند الحد');await finish(boundary,4);await start(high,'طالب أعلى من الحد');await finish(high,5);await start(pending,'طالب لم يكمل');await finish(pending,4,4,false);
 await start(other,'طالب في درس آخر');await finish(other,2);
 assert.equal((await lesson(low)).leaderboard.length,4);
 const owner=await request('/api/teacher/auth',{body:{action:'setup',username:'requirements-owner',password,setupKey}});teacherCookie=owner.cookie;assert(teacherCookie);
 await request('/api/teacher/competition?course=requirements-test',{expected:403});
 await request('/api/teacher/competition',{method:'PUT',body:{course:low.course,action:'requirements',...enabled},cookie:low.cookie,expected:403});
 await request('/api/teacher/competition',{method:'PUT',body:{course:low.course,action:'requirements',...enabled},cookie:teacherCookie,requestOrigin:'https://other.test',expected:403});
 for(const minimumPercent of [0,101,79.5,'80',null])await settings(low.course,{enabled:true,minimumPercent},400);
 await settings('missing-lesson',enabled,404);
 const saved=await settings(low.course,enabled);assert.deepEqual(saved.resultRequirements,enabled);
 assert.deepEqual((await request('/api/teacher/competition?course='+low.course,{cookie:teacherCookie})).data.resultRequirements,enabled,'Settings must persist on readback');
 state=await lesson(low);assert.equal(state.certificate,null);assert.equal(state.resultRequirements.bestCompletedPercent,60);assert.equal(state.bestResult.score,3);
 assert.equal((await lesson(low,{action:'complete',resultRequirements:{enabled:false,minimumPercent:1}})).certificate,null,'Client payload bypassed the teacher threshold');
 assert.deepEqual(state.leaderboard.map(r=>r.id),[high.id,boundary.id]);assert.deepEqual(state.leaderboard.map(r=>r.position),[1,2]);
 assert((await lesson(boundary)).certificate,'Exact 80% lost its certificate');
 assert(!(await lesson(pending)).leaderboard.some(r=>r.id===pending.id),'Unfinished 80% appeared');
 assert((await lesson(other)).certificate,'Threshold leaked to another lesson');
 const teacherRows=(await request('/api/teacher/students?course='+low.course,{cookie:teacherCookie})).data.participants;
 assert.equal(teacherRows.length,4,'Low results were deleted or hidden from the teacher');assert(teacherRows.some(r=>r.id===low.id&&r.score===3&&!r.competing));
 assert.equal((await request('/api/courses',{cookie:low.cookie})).data.courses.find(c=>c.id===low.course).progress.certificateEligible,false,'Catalog promised a blocked certificate');
 await settings(low.course,{enabled:true,minimumPercent:100});assert.equal((await lesson(boundary)).certificate,null);assert.equal((await lesson(high)).leaderboard.length,1);
 await settings(low.course,{enabled:false,minimumPercent:100});state=await lesson(low);assert(state.certificate);assert.equal(state.leaderboard.length,4);
 await settings(low.course,enabled);await lesson(low,{action:'retry'});assert.equal((await lesson(low)).certificate,null);state=await finish(low,5);assert.equal(state.certificate.score,5);assert(state.leaderboard.some(r=>r.id===low.id));
 await lesson(low,{action:'retry'});state=await finish(low,1);assert.equal(state.certificate.score,5,'A worse retry removed an earned certificate');assert(state.leaderboard.some(r=>r.id===low.id&&r.score===5));
 assert.equal((await request('/api/courses',{cookie:low.cookie})).data.courses.find(c=>c.id===low.course).progress.certificateEligible,true,'Catalog ignored an earlier qualifying attempt');
 assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM student_attempts WHERE student=?').bind(low.id).first()).n,2);
 // Choose the fastest qualifying attempt, not the fastest disqualified attempt.
 await request('/api/teacher/competition',{method:'PUT',cookie:teacherCookie,body:{course:'requirements-speed',action:'ranking',rankingMode:'speed'}});
 const speed=client('requirements-speed');await start(speed,'طالب السرعة');await finish(speed,5);
 await db.prepare('UPDATE student_speed_clocks SET elapsed_ms=10000,running_since=NULL,valid=1 WHERE student=? AND attempt=1').bind(speed.id).run();
 await lesson(speed,{action:'retry'});await finish(speed,3);
 await db.prepare('UPDATE student_speed_clocks SET elapsed_ms=1000,running_since=NULL,valid=1 WHERE student=? AND attempt=2').bind(speed.id).run();
 await settings(speed.course,enabled);state=await lesson(speed);const speedRow=state.leaderboard.find(r=>r.id===speed.id);assert.equal(speedRow.score,5);assert.equal(speedRow.attempt,1);assert.equal(speedRow.solveMs,10000);assert.equal(state.bestResult.score,5);assert.equal(state.certificate.score,5);
 await settings(speed.course,{enabled:false,minimumPercent:80});assert.equal((await lesson(speed)).leaderboard.find(r=>r.id===speed.id).score,3,'Disabled requirements changed speed-mode selection');
 // The eligibility cutoff must keep the competition's existing deadline.
 const deadline=new Date(Date.now()-60000).toISOString();
 await db.prepare('UPDATE students SET created=? WHERE id=?').bind(new Date(Date.parse(deadline)-10000).toISOString(),low.id).run();
 await db.prepare('UPDATE student_attempts SET completed=? WHERE student=? AND attempt=2').bind(new Date(Date.parse(deadline)-1000).toISOString(),low.id).run();
 await db.prepare("INSERT INTO course_competitions(course,enabled,show_countdown,ends_at,prize,updated) VALUES(?,1,1,?,'',?)").bind(low.course,deadline,new Date().toISOString()).run();
 assert.deepEqual((await lesson(low)).leaderboard.map(r=>r.id),[low.id],'Post-deadline results bypassed the saved competition end');
 assert.equal((await lesson(low)).certificate.score,5,'The competition deadline removed an earned certificate');
 // The balloon lesson uses the combined quiz + dictation + game denominator.
 const chores=client('chores-grade-4');await start(chores,'طالب نقاط الرحلة');
 const completed=new Date().toISOString();await db.prepare('UPDATE students SET completed=? WHERE id=?').bind(completed,chores.id).run();
 await db.batch([db.prepare('INSERT INTO reads(student,lesson) VALUES(?,0)').bind(chores.id),...definition.questions.map(q=>db.prepare('INSERT INTO answers(student,question,choice,correct) VALUES(?,?,0,1)').bind(chores.id,q.id)),...Array.from({length:6},(_,i)=>db.prepare('INSERT INTO student_dictation_answers(student,attempt,question,text,correct,created) VALUES(?,1,?,?,0,?)').bind(chores.id,i,'local',completed)),db.prepare("INSERT INTO student_game_runs(id,student,attempt,difficulty,rounds,state,revision,score,answered,solved,status,created,completed) VALUES(?,?,1,'easy','[]','{}',0,12,12,12,'won',?,?)").bind(crypto.randomUUID(),chores.id,completed,completed)]);
 await settings(chores.course,enabled);const anonymousChores=(await request('/api/classroom?course='+chores.course)).data;assert(!anonymousChores.leaderboard.some(r=>r.id===chores.id),'Quiz/game-only 100% bypassed missing dictation points');
 await settings(chores.course,{enabled:false,minimumPercent:80});const allChores=(await request('/api/classroom?course='+chores.course)).data.leaderboard.find(r=>r.id===chores.id);assert.equal(allChores.score,17);assert.equal(allChores.total,23);
 // The migration is safe after lazy initialization, and records were not rewritten.
 await db.prepare(readFileSync('drizzle/0022_course_result_requirements.sql','utf8')).run();
 assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM answers WHERE student=?').bind(low.id).first()).n,5);
 const teacherPage=await mf.dispatchFetch(origin+'/teacher/students?course='+low.course,{headers:{cookie:teacherCookie}}),teacherHtml=await teacherPage.text();assert.equal(teacherPage.status,200);assert(teacherHtml.includes('شروط الظهور والشهادة'));
 console.log('PASS: authenticated per-lesson settings, lazy D1 setup, exact cutoff without rounding, completed-only eligibility, preserved private results, contiguous positions, retries, catalog certificate status, fastest eligible attempt, combined game totals, disabling restoration, and teacher form rendering.');
}finally{await mf.dispose();}
