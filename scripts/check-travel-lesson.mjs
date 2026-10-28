import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import ts from 'typescript';
const project=fileURLToPath(new URL('../',import.meta.url)),dir=mkdtempSync(join(tmpdir(),'travel-lesson-'));
try{
 for(const name of ['travel-course','travel-learning','ranking-mode'])writeFileSync(join(dir,name+'.mjs'),ts.transpileModule(readFileSync(project+'lib/'+name+'.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);
 const {travelCourse:c}=await import(pathToFileURL(join(dir,'travel-course.mjs'))),{travelEmail,travelParagraph,travelVocabulary,travelLinks,travelMovement,travelWritingSteps,travelWritingHints}=await import(pathToFileURL(join(dir,'travel-learning.mjs'))),{defaultRankingMode}=await import(pathToFileURL(join(dir,'ranking-mode.mjs')));
 const expected=[
 'His parents','Everything was different.','Spend time with friends','Four hours','Visit Niagara Falls','Yes, despite some difficulties.',
 'The weather is very cold.','helpful','quite a large campus','a very large campus','The adverb fast','fairly / to some extent','My speaking is not very good yet.',
 'arrive','arrives','until','while','Before you leave, check your ticket.','were','after I finish','When we arrive, we’re going straight to the hotel.',
 'before you leave for the airport.','after he does his homework.','when I go to the shopping mall.','when they’re in London.','while you’re away at college.','before you board the airplane.','until they call for boarding.','as soon as he arrives.','two hours before departure.','until he finishes his homework.',
 'to','away from','through','into','around','along','across','out of','to',
 'Dear Ali,','I like my classes because the teachers are helpful.','Next week, I’m going to visit a museum.','get','Check paragraphs, grammar, punctuation, and your name.'
 ];
 assert.equal(c.grade,'grade-9');assert.equal(c.published,1);assert.equal(c.definition.lessons.length,6);assert.equal(defaultRankingMode(c.id),'participation');assert.deepEqual(c.definition.questions.map(q=>q.options[q.answer]),expected);
 assert.deepEqual(c.definition.lessons.map((_,i)=>c.definition.questions.filter(q=>q.lesson===i).length),[6,7,8,10,9,5]);
 c.definition.questions.forEach((q,i)=>{assert.equal(q.id,i+1);assert(q.reason.length>=80&&q.reason.length<=2000);assert(q.prompt.length<=1200);assert.equal(new Set(q.options).size,q.options.length);assert(c.definition.lessons[q.lesson]);});
 assert.equal(travelEmail.length,5);assert(travelEmail.every(p=>p.en&&p.ar&&p.hint));assert(travelEmail.map(p=>p.en).join(' ').includes('four hours of English every day'));assert.equal((travelParagraph.match(/\(\d\) ___/g)||[]).length,9);assert(travelVocabulary.length>=19);assert.equal(travelLinks.length,6);assert.equal(travelMovement.length,8);assert.equal(travelWritingSteps.length,5);
 assert(travelWritingHints('').every(h=>!h.found));assert(travelWritingHints(travelWritingSteps.map(s=>s.example).join('\n')).every(h=>h.found));
 const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wranglerRequire('miniflare');
 const root=project+'dist/server',paths=readdirSync(root,{recursive:true}).filter(p=>p.endsWith('.js')||p.endsWith('.mjs'));
 const mf=new Miniflare({name:'app',modules:['index.js',...paths.filter(p=>p!=='index.js')].map(p=>({type:'ESModule',path:root+'/'+p})),modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings:{TEACHER_SETUP_KEY:'isolated-travel-test-key-123456789'},d1Databases:{DB:'travel-test'},cf:false});
 try{
  const db=await mf.getD1Database('DB');for(const file of readdirSync(project+'drizzle').filter(f=>f.endsWith('.sql')&&!f.startsWith('0005_')).sort())for(const sql of readFileSync(project+'drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql.trim()).run();
  async function call(path,{method='GET',body,cookie='',status=200,origin='https://school.test'}={}){const r=await mf.dispatchFetch('https://school.test'+path,{method,headers:{origin,cookie,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const d=await r.json();assert.equal(r.status,status,JSON.stringify(d));return {d,r};}
  const catalog=(await call('/api/courses')).d.courses;assert(catalog.some(x=>x.id===c.id&&x.grade==='grade-9'));
  const initial=(await call('/api/classroom?course='+c.id)).d;assert.equal(initial.student,null);assert(initial.course.questions.every(q=>!('answer' in q)&&!('reason' in q)));
  const html=await mf.dispatchFetch('https://school.test/?course='+c.id);assert.equal(html.status,200);const markup=await html.text();assert(markup.includes('When Are You Traveling?'));assert(!markup.includes('Screenshot 2026'));
  const started=await call('/api/classroom',{method:'POST',body:{course:c.id,action:'start',name:'Isolated travel learner'}});let cookie=started.r.headers.get('set-cookie').split(';')[0],state=started.d;
  const post=async(body,status=200)=>{const res=await call('/api/classroom',{method:'POST',cookie,status,body:{course:c.id,attempt:state.student.attempt,...body}});if(status===200)state=res.d;return res;};
  await post({action:'read',lesson:1},400);await post({action:'answer',question:1,choice:0},400);await post({action:'complete'},400);
  let order=JSON.stringify(state.course.questions.map(q=>q.options));assert.equal(order,JSON.stringify((await call('/api/classroom?course='+c.id,{cookie})).d.course.questions.map(q=>q.options)));
  const writing='/api/exam-writing?course='+c.id;
  await call(writing,{status:401});const originalText='Dear Ali,\nThe weather is quite cold. My teachers are extremely helpful. I’m going to visit a museum. I’ll call when I arrive.\nBest wishes,\nFahad';
  await call('/api/exam-writing',{method:'PUT',cookie,status:403,origin:'https://other.test',body:{course:c.id,attempt:1,text:originalText}});
  await call('/api/exam-writing',{method:'PUT',status:401,body:{course:c.id,attempt:1,text:originalText}});
  await call('/api/exam-writing',{method:'PUT',cookie,body:{course:c.id,attempt:1,text:originalText}});assert.equal((await call(writing,{cookie})).d.writing.response,originalText);
  const target=writing+'&student='+state.student.id;await call(target,{cookie,status:403});
  const owner=await call('/api/teacher/auth',{method:'POST',body:{action:'setup',username:'travel-owner',password:'Isolated-Travel-Test-123!',setupKey:'isolated-travel-test-key-123456789'}});const teacherCookie=owner.r.headers.get('set-cookie').split(';')[0];assert.equal((await call(target,{cookie:teacherCookie})).d.submissions[0].response,originalText);
  for(let station=0;station<6;station++){
   await post({action:'read',lesson:station});
   for(const q of state.course.questions.filter(q=>q.lesson===station)){
    const canonical=c.definition.questions.find(x=>x.id===q.id),right=canonical.options[canonical.answer];
    const index=q.options.findIndex(o=>q.id===14?o!==right:o===right);
    await post({action:'answer',question:q.id,choice:index,elapsedMs:1000});const a=state.answers.find(x=>x.question===q.id);assert.equal(a.correct,q.id===14?0:1);assert.equal(a.reason,canonical.reason);assert.equal(a.answerText,right);
    // A later click cannot replace the stored first answer.
    if(q.id===14){await post({action:'answer',question:q.id,choice:q.options.indexOf(right)});assert.equal(state.answers.find(a=>a.question===14).correct,0);}
   }
  }
  await post({action:'complete'});assert.equal(state.certificate.total,45);assert.equal(state.certificate.score,44);assert.equal(state.reads.length,6);assert(!JSON.stringify(state.leaderboard).includes(originalText));assert.equal(state.course.rankingMode,'participation');
  const previousId=state.student.id;await post({action:'retry'});assert.equal(state.student.attempt,2);assert.equal(state.answers.length,0);assert.equal((await call(writing,{cookie})).d.writing,null);assert.notEqual(order,JSON.stringify(state.course.questions.map(q=>q.options)));
  await call('/api/exam-writing',{method:'PUT',cookie,status:409,body:{course:c.id,attempt:1,text:'Old attempt update'}});
  const edited=originalText+'\nI miss you!';await call('/api/exam-writing',{method:'PUT',cookie,body:{course:c.id,attempt:2,text:edited}});const submissions=(await call(target,{cookie:teacherCookie})).d.submissions;assert.equal(submissions.length,2);assert.equal(submissions[1].response,originalText);assert.equal(submissions[0].response,edited);
  // A different student on the same browser cannot read the first student's email.
  const other=await call('/api/classroom',{method:'POST',body:{course:c.id,action:'start',name:'Another isolated learner'}});const otherCookie=other.r.headers.get('set-cookie').split(';')[0];assert.notEqual(other.d.student.id,previousId);assert.equal((await call(writing,{cookie:otherCookie})).d.writing,null);await call(target,{cookie:otherCookie,status:403});
  // Existing exam writing still works on its supported course.
  const oldCourse='exam-prep-unit-3-grade-9',old=await call('/api/classroom',{method:'POST',body:{course:oldCourse,action:'start',name:'Existing exam learner'}});const oldCookie=old.r.headers.get('set-cookie').split(';')[0];await call('/api/exam-writing',{method:'PUT',cookie:oldCookie,body:{course:oldCourse,attempt:1,text:'Dear friend, I am visiting London.'}});assert.equal((await call('/api/exam-writing?course='+oldCourse,{cookie:oldCookie})).d.writing.response,'Dear friend, I am visiting London.');
  console.log('PASS: 45 independently checked answers, full page A/B coverage, six gated stations, real wrong-answer explanations and immutable first answer, certificate 44/45, shuffled stable options and fresh retry, private server-saved email, owner review, origin/session guards, attempt history/isolation, existing exam writing regression, and server-rendered lesson.');
 }finally{await mf.dispose();}
}finally{rmSync(dir,{recursive:true,force:true});}
