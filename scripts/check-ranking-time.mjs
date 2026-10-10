import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {readFileSync,readdirSync} from 'node:fs';
import {ActiveSolveTimer,parseSolveMs,formatSolveTime} from '../lib/solve-time.ts';
import {compareResults,betterResult} from '../lib/result-ranking.ts';

let now=0;
const timer=new ActiveSolveTimer(0,()=>now);
now=90_000;assert.equal(timer.value(),0,'Explanation time counted');
timer.resume();now+=1200;timer.pause();now+=50_000;
assert.equal(timer.value(),1200,'Loading/correction time counted');
timer.resume();now+=800;assert.equal(timer.capture(),2000);
now+=9000;assert.equal(timer.value(),2000,'Save round trip counted');
const restored=new ActiveSolveTimer(timer.value(),()=>now);restored.resume();now+=500;
assert.equal(restored.capture(),2500,'Reload lost active time');
assert.equal(parseSolveMs(undefined),null);
for(const v of [0,-1,NaN,Infinity,'1',1.5,86_400_001])assert.throws(()=>parseSolveMs(v));
assert.equal(formatSolveTime(232_310),'3:52.31');
const result=(score,solveMs,completed='2026-10-10')=>({score,total:30,answered:30,solveMs,completed,attempt:1,created:'2026-10-10'});
assert(compareResults(result(30,40_000),result(29,1000))<0,'Speed outranks grade');
assert(compareResults(result(30,40_000),result(30,50_000))<0,'Equal grades ignore speed');
assert(compareResults(result(30,null),result(30,40_000))>0,'Unknown time treated as zero');
assert(!betterResult(result(30,1,null),result(29,40_000)),'Incomplete attempt replaces final result');

const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wranglerRequire('miniflare'),project=fileURLToPath(new URL('../',import.meta.url)),root=project+'dist/server';
const modules=['index.js',...readdirSync(root,{recursive:true}).filter(p=>(p.endsWith('.js')||p.endsWith('.mjs'))&&p!=='index.js')].map(p=>({type:'ESModule',path:root+'/'+p}));
const mf=new Miniflare({modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'ranking-test'},cf:false});
const lesson={title:'اختبار الوقت',en:'Time test',tag:'01',intro:'اختبار محلي',formula:'',rules:[],note:'',example:'',translation:''};
const definition={lessons:[lesson],questions:[1,2].map(id=>({id,lesson:0,prompt:'Choose A',options:['A','B'],answer:0,reason:'A'}))};
const client=(course='timing-test')=>({course,cookie:'',attempt:1});
async function req(c,body,expected=200){
  const response=await mf.dispatchFetch('https://course.test/api/classroom'+(body?'':'?course='+c.course),{
    method:body?'POST':'GET',headers:{'Content-Type':'application/json',origin:'https://course.test',cookie:c.cookie},
    ...(body?{body:JSON.stringify({...body,course:c.course,attempt:c.attempt})}:{}),
  });
  if(response.headers.get('set-cookie'))c.cookie=response.headers.get('set-cookie').split(';')[0];
  const data=await response.json();assert.equal(response.status,expected,JSON.stringify({body,data}));
  if(data.student)c.attempt=data.student.attempt;return data;
}
async function start(c,name){return req(c,{action:'start',name});}
async function finishQuiz(c,durations=[1000,1000],wrong=false){
  let state=await req(c,{action:'read',lesson:0});
  for(const q of state.course.questions){state=await req(c,{action:'answer',question:q.id,choice:q.options.indexOf(wrong&&q.id===1?'B':'A'),...(durations?{elapsedMs:durations[q.id-1]}:{})});}
  return state;
}
async function finish(c,durations,wrong=false){await finishQuiz(c,durations,wrong);return req(c,{action:'complete'});}
async function game(c,state,ms,wrong=false){
  state=await req(c,{action:'game-start',difficulty:'easy',restart:!!state.game});
  let wrongDone=false;
  while(state.game.status==='playing'){
    const g=state.game;
    if(g.feedback==='wrong'){state=await req(c,{action:'game-resume',run:g.id,revision:g.revision,gameUpdate:true});continue;}
    const mistaken=wrong&&!wrongDone;wrongDone=wrongDone||mistaken;
    const selection=mistaken?g.options.find(o=>o.en!==g.word.en).en:g.word.en;
    state=await req(c,{action:'game-pop',run:g.id,revision:g.revision,selection,advance:true,gameUpdate:true,elapsedMs:ms});
  }
  return state;
}
try{
  const db=await mf.getD1Database('DB');
  for(const file of readdirSync(project+'drizzle').filter(x=>x.endsWith('.sql')&&!x.startsWith('0005_')).sort())for(const s of readFileSync(project+'drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(s.trim())await db.prepare(s.trim()).run();
  for(const id of ['timing-test','chores-grade-4'])await db.prepare('INSERT INTO courses(id,title,description,definition,published,grade,updated) VALUES(?,?,?,?,1,?,?)').bind(id,'اختبار محلي','',JSON.stringify(definition),'grade-4','2026-10-10').run();
  const alice=client(),bob=client(),cara=client(),legacy=client(),partial=client();
  const a=await start(alice,'طالب أ');await finish(alice,[12_000,18_000]);
  const b=await start(bob,'طالب ب');let state=await finish(bob,[4000,6000]);
  await req(bob,{action:'answer',question:1,choice:0,elapsedMs:1});
  const row=()=>state.leaderboard.find(r=>r.id===b.student.id);
  assert.equal(row().position,1,'Earlier completion beats a faster answer time');assert.equal(row().solveMs,10_000);
  assert.equal((await db.prepare("SELECT elapsed_ms FROM student_answer_times WHERE student=? AND attempt=1 AND stage='quiz' AND question=1").bind(b.student.id).first()).elapsed_ms,4000,'Duplicate answer overwrote time');
  await start(cara,'طالب ج');await finish(cara,[1000,1000],true);
  const old=await start(legacy,'نتيجة سابقة');await finish(legacy,null);
  const pending=await start(partial,'محاولة غير مكتملة');await req(partial,{action:'read',lesson:0});
  await req(partial,{action:'answer',question:1,choice:pending.course.questions[0].options.indexOf('A'),elapsedMs:0},400);
  await req(partial,{action:'answer',question:1,choice:pending.course.questions[0].options.indexOf('A'),elapsedMs:1000});
  state=await req(bob);assert.equal(state.leaderboard[0].id,b.student.id);assert.equal(state.leaderboard[1].id,a.student.id);
  assert.equal(state.leaderboard.find(r=>r.id===old.student.id).solveMs,null,'Legacy time invented');
  assert.equal(state.leaderboard.at(-1).id,pending.student.id,'Unfinished entry won a medal');
  state=await req(bob,{action:'retry'});assert.equal(state.bestResult.solveMs,10_000,'Retry discarded previous completion');
  state=await finish(bob,[10_000,10_000]);assert.equal(state.bestResult.solveMs,10_000,'Slower retry replaced best time');
  await req(bob,{action:'retry'});state=await finish(bob,[4000,4000]);assert.equal(state.bestResult.solveMs,8000);assert.equal(state.bestResult.attempt,3);
  await req(bob,{action:'retry'});state=await finish(bob,[1000,1000],true);assert.equal(state.bestResult.solveMs,8000,'Mixed latest speed with older grade');
  assert.equal(state.certificate.solveMs,8000,'Certificate and leaderboard chose different attempts');
  await req(legacy,{action:'answer',question:1,choice:0,elapsedMs:1});
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM student_answer_times WHERE student=?').bind(old.student.id).first()).n,0,'Added fictitious times to existing answers');
  console.log('PASS: score-first completed ranking, speed ties, unknown times, duplicates, invalid durations, retries and best-attempt certificate consistency.');
  const chores=client('chores-grade-4');await start(chores,'وقت الرحلة');state=await finishQuiz(chores,[2000,2000]);
  for(const item of state.dictation.items)state=await req(chores,{action:'dictation-answer',question:item.id,text:item.audio,elapsedMs:1000});
  state=await game(chores,state,500);assert.equal(state.certificate.solveMs,16_000,'Quiz, dictation and game time were not combined');
  state=await game(chores,state,400);assert.equal(state.gameBest.solveMs,4800,'Faster tied game was not chosen');assert.equal(state.certificate.solveMs,14_800);
  state=await game(chores,state,200,true);assert.equal(state.gameBest.score,12,'Speed displaced a higher game grade');assert.equal(state.certificate.solveMs,14_800);
  const gameRow=await db.prepare('SELECT state FROM student_game_runs WHERE id=?').bind(state.game.id).first();
  assert.equal(JSON.parse(gameRow.state).timing.elapsedMs,2600,'Wrong selections lost their solving time');
  await req(chores,{action:'retry'});state=await finishQuiz(chores,[3000,3000]);
  for(const item of state.dictation.items)state=await req(chores,{action:'dictation-answer',question:item.id,text:item.audio,elapsedMs:1000});
  state=await game(chores,state,400);assert.equal(state.certificate.solveMs,14_800,'Archived attempt time changed after a replay');
  console.log('PASS: full journey timing, faster tied balloon replay, wrong-choice time, same-run game selection and archived journey duration.');
}finally{await mf.dispose();}
