import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import ts from 'typescript';
const dir=mkdtempSync(join(tmpdir(),'alwadani-chores-'));
try{
 for(const name of ['chores-learning','chores-course']){
  const source=readFileSync(new URL('../lib/'+name+'.ts',import.meta.url),'utf8');
  const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/from '\.\/chores-learning'/g,"from './chores-learning.mjs'");
  writeFileSync(join(dir,name+'.mjs'),js);
 }
 const {makeBalloonRounds,popBalloon,initialBalloonRun,balloonWords,choresWords,balloonLevels,wordScenes,sceneDescriptions,extraChoresWords}=await import(pathToFileURL(join(dir,'chores-learning.mjs')));
 const {choresCourse}=await import(pathToFileURL(join(dir,'chores-course.mjs')));
 assert.equal(choresCourse.grade,'grade-4');assert.equal(choresCourse.definition.lessons.length,4);assert.equal(choresCourse.definition.questions.length,16);
 for(const question of choresCourse.definition.questions){assert(choresCourse.definition.lessons[question.lesson]);assert(question.reason.length>30);assert(sceneDescriptions[question.picture]);assert(question.options[question.answer]);assert.equal(new Set(question.options).size,question.options.length);}
 assert.notEqual(choresWords.find(w=>w.en==='wake up').ar,choresWords.find(w=>w.en==='get up').ar);
 assert(choresWords.every(w=>sceneDescriptions[wordScenes[w.en]]));assert(extraChoresWords.length>=50);
 assert(balloonLevels.easy.seconds>balloonLevels.medium.seconds&&balloonLevels.medium.seconds>balloonLevels.hard.seconds);
 for(const difficulty of Object.keys(balloonLevels))for(let n=0;n<25;n++){
  const rounds=makeBalloonRounds(Math.random,difficulty),optionCount=balloonLevels[difficulty].options;assert.equal(rounds.length,12);assert.deepEqual(rounds.map(r=>r.word.en).sort(),balloonWords.map(w=>w.en).sort());
  for(const round of rounds){assert.equal(round.options.length,optionCount);assert.equal(new Set(round.options.map(w=>w.en)).size,optionCount);assert.equal(round.options.filter(w=>w.en===round.word.en).length,1);}
  let state={...initialBalloonRun,popped:[]};const first=rounds[0],wrong=first.options.filter(w=>w.en!==first.word.en);
  state=popBalloon(state,first,wrong[0].en,rounds.length);assert.equal(state.lives,2);assert.equal(state.score,0);assert.equal(state.feedback,'wrong');
  assert.equal(popBalloon(state,first,wrong[0].en,rounds.length),state,'A popped balloon must not cost another life');
  assert.equal(popBalloon(state,first,'unknown',rounds.length),state,'Unknown choices must be ignored');
  state=popBalloon(state,first,first.word.en,rounds.length);assert.equal(state.lives,2);assert.equal(state.score,1);
  assert.equal(popBalloon(state,first,first.word.en,rounds.length),state,'A correct balloon must not award duplicate points');
  for(const round of rounds.slice(1)){state={...state,popped:[],feedback:null};state=popBalloon(state,round,round.word.en,rounds.length);}
  assert.equal(state.status,'won');assert.equal(state.score,12);assert.equal(state.lives,2);
  let failed={...initialBalloonRun,popped:[]};for(const option of wrong.slice(0,3))failed=popBalloon(failed,first,option.en,rounds.length);
  assert.equal(failed.status,'lost');assert.equal(failed.lives,0);assert.equal(failed.score,0);
  assert.equal(popBalloon(failed,first,first.word.en,rounds.length),failed,'A failed game requires a restart');
 }
 assert.equal(initialBalloonRun.lives,3);assert.equal(initialBalloonRun.score,0);assert.deepEqual(initialBalloonRun.popped,[]);
 console.log('PASS: grade-four lesson, 4 stations, 16 illustrated exercises, all translated words, 3 speed levels, 12 distinct balloon rounds, 3 shared lives, no duplicate clicks, failure and victory.');
}finally{rmSync(dir,{recursive:true,force:true});}
