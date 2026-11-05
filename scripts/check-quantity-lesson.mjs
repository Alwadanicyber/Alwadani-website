import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import ts from 'typescript';
const project=fileURLToPath(new URL('../',import.meta.url)),dir=mkdtempSync(join(tmpdir(),'quantity-lesson-'));
try{
 for(const name of ['quantity-course','quantity-learning','ranking-mode'])writeFileSync(join(dir,name+'.mjs'),ts.transpileModule(readFileSync(project+'lib/'+name+'.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);
 const {quantityCourse:c}=await import(pathToFileURL(join(dir,'quantity-course.mjs'))),{foodItems,cakeDialogue,pizzaSteps,pronounTasks}=await import(pathToFileURL(join(dir,'quantity-learning.mjs'))),{defaultRankingMode}=await import(pathToFileURL(join(dir,'ranking-mode.mjs')));
 const expected=['eggs','butter','How many','How much','How many','a few','a little','much','a lot of','enough','something','nothing','anything','nothing','I don’t have anything.','any','many','much','package','dozen','Before','First','After','Then','Finally'];
 assert.equal(c.grade,'grade-9');assert.equal(c.published,1);assert.equal(c.definition.lessons.length,5);assert.equal(c.definition.questions.length,25);assert.equal(defaultRankingMode(c.id),'accuracy');assert.deepEqual(c.definition.questions.map(q=>q.options[q.answer]),expected);
 // Selected exercise keys were independently transcribed from Teacher Guide pp.40–41.
 assert.deepEqual(c.definition.questions.slice(10,14).map(q=>q.options[q.answer]),['something','nothing','anything','nothing']);
 assert.deepEqual(c.definition.questions.slice(15,20).map(q=>q.options[q.answer]),['any','many','much','package','dozen']);
 assert.deepEqual(c.definition.questions.slice(20,25).map(q=>q.options[q.answer]),['Before','First','After','Then','Finally']);
 for(const [i,q]of c.definition.questions.entries()){assert.equal(q.id,i+1);assert(q.prompt.length<=1200&&q.reason.length>=70&&q.reason.length<=2000);assert.equal(q.options.length,new Set(q.options).size);assert(q.options.length>=2&&q.options.length<=6);assert(c.definition.lessons[q.lesson]);assert(q.picture);}
 c.definition.lessons.forEach((l,i)=>{assert.equal(l.tag,String(i+1).padStart(2,'0'));assert.equal(c.definition.questions.filter(q=>q.lesson===i).length,5);assert(l.formula.length<=240);assert(l.rules.every(r=>r.length===3));});
 for(const food of foodItems){assert(food.ar&&food.example&&food.hint);assert(food.question.startsWith(food.countable?'How many':'How much'));assert(food.reply.startsWith(food.countable?'There are':'There is'));}
 assert.equal(pronounTasks.length,6);assert.equal((cakeDialogue.map(l=>l.en).join(' ').match(/\(\d\) ___/g)||[]).length,8);assert.deepEqual(pizzaSteps.map(s=>s.word),['Before','First','Then','After','Before','Then','Finally']);assert(pizzaSteps.every(s=>s.text&&s.blank.includes('___')&&s.ar&&s.scene));assert(pizzaSteps[1].text.includes('three teaspoons of baking powder'));assert(pizzaSteps[2].text.includes('one egg'));assert(!JSON.stringify(c).includes('Screenshot'));
 const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wranglerRequire('miniflare');
 const root=project+'dist/server',paths=readdirSync(root,{recursive:true}).filter(p=>p.endsWith('.js')||p.endsWith('.mjs'));
 const mf=new Miniflare({name:'app',modules:['index.js',...paths.filter(p=>p!=='index.js')].map(p=>({type:'ESModule',path:root+'/'+p})),modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'quantity-isolated-test'},cf:false});
 try{
  const db=await mf.getD1Database('DB');for(const f of readdirSync(project+'drizzle').filter(f=>f.endsWith('.sql')&&!f.startsWith('0005_')).sort())for(const sql of readFileSync(project+'drizzle/'+f,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql.trim()).run();
  let cookie='',state;
  async function call(path,body,status=200,auth=cookie){const r=await mf.dispatchFetch('https://school.test'+path,{method:body?'POST':'GET',headers:{origin:'https://school.test',cookie:auth,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const d=await r.json();assert.equal(r.status,status,JSON.stringify(d));return {r,d};}
  const catalog=(await call('/api/courses')).d.courses;assert(catalog.some(x=>x.id===c.id&&x.grade==='grade-9'));const initial=(await call('/api/classroom?course='+c.id)).d;assert.equal(initial.student,null);assert(initial.course.questions.every(q=>!('answer' in q)&&!('reason' in q)));
  const html=await mf.dispatchFetch('https://school.test/?course='+c.id);assert.equal(html.status,200);const markup=await html.text();assert(markup.includes('What Do I Need to Buy?'));assert(markup.includes('سوق المعدود وغير المعدود'));assert(!markup.includes('Screenshot 2026'));
  const started=await call('/api/classroom',{course:c.id,action:'start',name:'Isolated quantity learner'});cookie=started.r.headers.get('set-cookie').split(';')[0];state=started.d;const learner=state.student.id;
  async function post(body,status=200){const result=await call('/api/classroom',{course:c.id,attempt:state.student.attempt,...body},status);if(status===200)state=result.d;return result;}
  await post({action:'read',lesson:1},400);await post({action:'answer',question:1,choice:0},400);await post({action:'complete'},400);
  const order=JSON.stringify(state.course.questions.map(q=>q.options));assert.equal(order,JSON.stringify((await call('/api/classroom?course='+c.id)).d.course.questions.map(q=>q.options)));
  async function solve(wrong=new Set()){
   for(let station=0;station<5;station++){
    await post({action:'read',lesson:station});
    for(const q of state.course.questions.filter(q=>q.lesson===station)){
     const original=c.definition.questions.find(x=>x.id===q.id),right=original.options[original.answer],choice=q.options.findIndex(o=>wrong.has(q.id)?o!==right:o===right);
     await post({action:'answer',question:q.id,choice});const answer=state.answers.find(a=>a.question===q.id);assert.equal(answer.correct,wrong.has(q.id)?0:1);assert.equal(answer.answerText,right);assert.equal(answer.reason,original.reason);
     if(wrong.has(q.id)){await post({action:'answer',question:q.id,choice:q.options.indexOf(right)});assert.equal(state.answers.find(a=>a.question===q.id).correct,0,'First answer must remain immutable');}
    }
   }
   await post({action:'complete'});
  }
  await solve(new Set([11,17]));assert.equal(state.certificate.score,23);assert.equal(state.certificate.total,25);assert.equal(state.reads.length,5);assert.equal(state.course.rankingMode,'accuracy');assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM student_answer_times WHERE student=?').bind(learner).first()).n,0);
  await post({action:'retry'});assert.equal(state.student.attempt,2);assert.equal(state.answers.length,0);assert.equal(state.bestResult.score,23);assert.notEqual(order,JSON.stringify(state.course.questions.map(q=>q.options)));
  await solve();assert.equal(state.certificate.score,25);assert.equal(state.bestResult.score,25);const rank=state.leaderboard.find(r=>r.id===learner);assert(rank&&rank.score===25);assert.equal(state.leaderboard.filter(r=>r.id===learner).length,1);
  const restored=(await call('/api/classroom?course='+c.id)).d;assert.equal(restored.answers.length,25);assert.equal(restored.reads.length,5);assert.equal(restored.certificate.score,25);
  const other=await call('/api/classroom',{course:c.id,action:'start',name:'Another isolated learner'},200,'');const otherCookie=other.r.headers.get('set-cookie').split(';')[0];const separate=(await call('/api/classroom?course='+c.id,null,200,otherCookie)).d;assert.equal(separate.answers.length,0);assert.notEqual(separate.student.id,learner);assert.equal((await call('/api/classroom?course='+c.id)).d.certificate.score,25);
  console.log('PASS: 25 independently checked keys, selected Teacher Guide A/C/D fidelity, focused How many/much practice, five sequential stations, visual context metadata, server correction reasons, first-answer integrity, certificate 23/25 then best-result improvement to 25/25, option shuffling and persistence, untimed accuracy ranking and student isolation.');
 }finally{await mf.dispose();}
}finally{rmSync(dir,{recursive:true,force:true});}
