import assert from 'node:assert/strict';
import {learningTextParts} from '../lib/learning-text.ts';
import {prepositionAim,balloonBurstPieces} from '../lib/preposition-motion.ts';
import {courseStudentAccess,validateStudentAccess} from '../lib/student-access.ts';
import {readFileSync} from 'node:fs';
import {TIME_PLACE_COURSE_ID,compareTimePlaceResults,prepositionExamples,pastExpressions,completeTimePlacePrompt} from '../lib/time-place-learning.ts';
import {lifeStoryParts,timePlaceWorkbook,normalizeBookAnswer} from '../lib/time-place-workbook.ts';
assert.equal(TIME_PLACE_COURSE_ID,'life-stories-time-place-grade-9');
assert.equal(completeTimePlacePrompt('He was born ___ Riyadh ___ June 27, 1956.','in / on'),'He was born in Riyadh on June 27, 1956.');
assert.equal(completeTimePlacePrompt('The flight lasted ___ June 17 ___ June 24.','from / to'),'The flight lasted from June 17 to June 24.');
assert.equal(completeTimePlacePrompt('___ Monday','on'),'on Monday');
assert.deepEqual(prepositionExamples.time.map(e=>e.word),['in','on','at']);
assert.deepEqual(prepositionExamples.place.map(e=>e.word),['in','on','at']);
assert(pastExpressions.some(e=>e.word==='ago')&&pastExpressions.some(e=>e.word==='when'));
const result=(score,completed=null,extra={})=>({score,total:24,answered:score,completed,attempt:1,created:'2026-10-13',...extra});
assert(compareTimePlaceResults(result(24,'yes'),result(23,'yes'))<0);
assert(compareTimePlaceResults(result(20),result(12,'yes'))<0);
assert.equal(compareTimePlaceResults(result(24,'yes',{solveMs:1000}),result(24,'yes',{solveMs:90000})),0);
assert(compareTimePlaceResults(result(24,'yes'),result(24))<0);
assert.equal(timePlaceWorkbook.reduce((n,g)=>n+g.items.length,0),38);
assert.equal(lifeStoryParts.length,21);
assert.equal(timePlaceWorkbook[0].items.length,20);
for(const group of timePlaceWorkbook)for(const item of group.items){
 assert(item.answers.length&&item.reason&&item.arabic);
 if(item.words){
  const words=text=>normalizeBookAnswer(text).split(' ').sort();
  assert.deepEqual(words(item.words.join(' ')),words(item.answers[0]));
 }
}
assert.equal(timePlaceWorkbook[2].items[1].answers[0],'We took a math test the day before yesterday.');
assert.equal(timePlaceWorkbook[2].items[6].answers[0],'My parents bought me a cell phone last week.');
assert.equal(normalizeBookAnswer(' He didn’t GO. '),normalizeBookAnswer('he did not go'));
for(const name of ['student-20.png','student-21.png']){
 const png=readFileSync(new URL('../public/lesson-pages/grade9-life-stories-02/'+name,import.meta.url));
 assert.equal(png.subarray(1,4).toString(),'PNG');assert(png.readUInt32BE(16)>=840&&png.readUInt32BE(20)>=1070);
}
console.log('PASS: score-first descending order without speed, 38 book items, 20 story slots, exact source word sets including repeated words, accepted normalization and both original PNGs.');

// The screenshot's ambiguous "on. in" must be two separate LTR islands.
const mixed='نستخدم on. in تعني داخل، وat تحدد نقطة.';
const parts=learningTextParts(mixed);
assert.equal(parts.map(p=>p.text).join(''),mixed);
assert.deepEqual(parts.filter(p=>p.english).map(p=>p.text),['on','in','at']);
for(const text of ['on June 27, 1956','at 8:00 a.m.','in / on','When I was a child, I used to play.'])assert.equal(learningTextParts(text).map(p=>p.text).join(''),text);
for(const [x,y,sign] of [[80,100,-1],[240,70,0],[400,100,1]]){
 const aim=prepositionAim(480,410,x,y);
 assert.equal(Math.sign(aim.bowAngle),sign);
 assert.equal(240+aim.dx,x);assert.equal(367+aim.dy,y);
 assert(Number.isFinite(aim.angle)&&Number.isFinite(aim.bowAngle));
}
assert.equal(balloonBurstPieces.length,14);assert(balloonBurstPieces.every(p=>Math.hypot(p.dx,p.dy)>=48-1e-9));
assert.equal(courseStudentAccess({id:TIME_PLACE_COURSE_ID}),'single');
assert.equal(courseStudentAccess({id:'chores-grade-4'}),'shared');
assert.equal(courseStudentAccess({id:TIME_PLACE_COURSE_ID,definition:{studentAccess:'shared'}}),'shared');
assert.throws(()=>validateStudentAccess('anything','shared'));
console.log('PASS: mixed-language sentence boundaries, exact arrow destinations and bow directions, radial burst and browser-access defaults.');
