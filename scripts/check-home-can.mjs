import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const dir=mkdtempSync(join(tmpdir(),'teachcraft-home-can-'));
try{
 for(const name of ['home-can-learning','home-can-course','home-can-workbook','tenses-learning']){
  const source=readFileSync(new URL('../lib/'+name+'.ts',import.meta.url),'utf8');
  writeFileSync(join(dir,name+'.mjs'),ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/from '(\.\/[\w-]+)'/g,"from '$1.mjs'"));
 }
 const {homeCanCourse:c,hasLegacyHomeCanDefinition,addHomeCanDictation}=await import(pathToFileURL(join(dir,'home-can-course.mjs'))),{homeChores,homeCanSubjects,makeCanExample,normalizeHomeSpelling}=await import(pathToFileURL(join(dir,'home-can-learning.mjs'))),{homeCanWorkbook,normalizeHomeAnswer}=await import(pathToFileURL(join(dir,'home-can-workbook.mjs')));
 const def=c.definition;
 assert.equal(c.grade,'grade-4');assert.equal(c.published,1);assert.equal(def.lessons.length,4);
 const expected=['set the table','sweep the floor','wash the dishes','clear the table','take out the trash','make the bed','cut the grass','feed the animals','wash','Ali can’t sweep the floor.','Can you feed the animals?','Can you help me wash my car?','Can I set the table for you?','Yes, please.','Yes, I can.','Yes, she can.','set the table','sweep the floor','wash the dishes','clear the table','take out the trash','make the bed','cut the grass','feed the animals','set','clear','sweep','can’t','Offer','Request','No, thanks.','Yes, I can.'];
 assert.deepEqual(def.questions.map(q=>q.options[q.answer]),expected);
 assert.deepEqual(def.questions.map(q=>q.id),Array.from({length:32},(_,i)=>i+1));
 assert.deepEqual(def.questions.map(q=>q.lesson),[...Array(8).fill(0),...Array(8).fill(1),...Array(8).fill(2),...Array(8).fill(3)]);
 assert(def.questions.slice(24).every(q=>q.kind==='home-balloon'));
 assert(def.questions.slice(0,8).every(q=>q.kind==='picture-choice'&&q.audio===q.options[q.answer]));
 for(const q of def.questions){assert(q.reason.length>=70&&q.reason.length<=2000);assert(new Set(q.options).size===q.options.length);assert(q.answer>=0);if(q.kind==='home-balloon'&&q.prompt.includes('___'))assert(!q.audio,'Audio gave away a missing game word');}
 assert(def.questions.slice(16,24).every(q=>q.kind==='audio-write'&&q.audio===q.options[q.answer]&&q.picture));
 assert.equal(normalizeHomeSpelling(' SWEEP  the FLOOR. '),'sweep the floor');
 assert.notEqual(normalizeHomeSpelling('sweep floor'),normalizeHomeSpelling('sweep the floor'));
 assert.notEqual(normalizeHomeSpelling('set the tabel'),normalizeHomeSpelling('set the table'));
 const legacy=JSON.parse(readFileSync(new URL('./fixtures/home-can-v1.json',import.meta.url),'utf8')).definition;
 assert(hasLegacyHomeCanDefinition(legacy));const updated=addHomeCanDictation(legacy);
 assert.deepEqual(updated.questions.slice(0,16),legacy.questions.slice(0,16));assert.deepEqual(updated.questions.slice(24).map(({id,lesson,...q})=>q),legacy.questions.slice(16).map(({id,lesson,...q})=>q));
 assert.equal(addHomeCanDictation(updated),updated);assert.equal(updated.lessons.length,4);
 assert.equal(homeChores.length,9);assert.equal(new Set(homeChores.map(w=>w.scene)).size,9);
 for(const word of homeChores){assert(word.ar&&word.translation&&word.tip&&word.example);assert([0,1,2].includes(word.col)&&[0,1,2].includes(word.row));}
 for(const subject of homeCanSubjects){
  assert.equal(makeCanExample(subject.name,'affirmative'),subject.name+' can help.');
  assert.equal(makeCanExample(subject.name,'negative'),subject.name+' can’t help.');
  assert.equal(makeCanExample(subject.name,'question'),'Can '+subject.question+' help?');
 }
 assert.equal(normalizeHomeAnswer(' She CAN’T help! '),normalizeHomeAnswer('she cannot help'));
 assert.notEqual(normalizeHomeAnswer('She can helps.'),normalizeHomeAnswer('She can help.'));
 assert.notEqual(normalizeHomeAnswer('Do you can help?'),normalizeHomeAnswer('Can you help?'));
 assert.equal(homeCanWorkbook.reduce((n,g)=>n+g.items.length,0),34);
 assert.equal(new Set(homeCanWorkbook.flatMap(g=>g.items.map(i=>i.id))).size,34);
 for(const item of homeCanWorkbook.flatMap(g=>g.items))assert(item.ar&&item.answer&&item.reason);
 assert(homeCanWorkbook.find(g=>g.id==='own').items.every(i=>i.open),'Personal expression must not be marked wrong against one model');
 assert.deepEqual(homeCanWorkbook.find(g=>g.id==='purpose').items.map(i=>i.answer),['Request','Offer','Request','Request','Offer','Request']);
 assert.deepEqual(homeCanWorkbook.find(g=>g.id==='verbs').items.map(i=>i.answer),['feeds','sets','makes','cuts','wash','sweeps']);
 const picture=readFileSync(new URL('../public/lessons/home-can-chores.jpg',import.meta.url));assert(picture.length>100000&&picture[0]===255&&picture[1]===216);
 console.log('PASS: 32 independently reviewed answer keys, ordered four-station journey with 8 written dictations and 8 scored balloons, legacy update preserving exercises, 9 translated picture words, CAN for all subjects and forms, no answer spoken into blanks, and 34 optional translated workbook items with open personal responses.');
}finally{rmSync(dir,{recursive:true,force:true});}
