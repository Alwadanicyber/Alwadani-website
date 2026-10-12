import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {arrangeTensesDefinition,hasNewTensesSequence,tenseQuestionKey,tensesSequenceOrder} from '../lib/tenses-sequence.ts';
import {presentSubject,presentReadingPieces} from '../lib/present-subjects.ts';
import {normalizeSentence,tokenPool,tenseVideos,sentenceTimeClue} from '../lib/tenses-learning.ts';
import {tensesWorkbook} from '../lib/tenses-workbook.ts';
assert.equal(normalizeSentence('  He DOESN’T read. '),normalizeSentence('He does not read'));
assert.equal(normalizeSentence('We’re playing football.'),normalizeSentence('We are playing football'));
assert.equal(normalizeSentence('Is she reading a book?'),normalizeSentence('is she reading a book'));
assert.notEqual(normalizeSentence('He doesn’t reads.'),normalizeSentence('He does not read'));
assert.notEqual(normalizeSentence('She reading now.'),normalizeSentence('She is reading now.'));
const options=['I am reading a comic book now.','I read a book every day.','I am reading the book now.'];
const pool=tokenPool(options);
assert.equal(new Set(pool.map(p=>p.id)).size,pool.length);
assert(pool.some(p=>p.word==='am')&&pool.some(p=>p.word==='read')&&pool.some(p=>p.word==='reading'));
assert.equal(tokenPool(['the boy and the book']).filter(p=>p.word==='the').length,2);
assert.equal(tensesWorkbook.length,10);
assert.equal(tensesWorkbook.reduce((n,g)=>n+g.items.length,0),61);
assert.equal(new Set(tensesWorkbook.flatMap(g=>g.items.map(i=>i.id))).size,61);
assert(tensesWorkbook.every(g=>g.items.every(i=>i.answers.length&&i.reason&&i.arabic)));
assert(tensesWorkbook.find(g=>g.id==='personal').items.every(i=>i.open));
assert.equal(tenseVideos[0].id,'6zJCviulfRk');
assert(tenseVideos[0].watch.includes('6zJCviulfRk'));
console.log('PASS: harmless spelling format differences, real grammar errors, repeated word tokens, 61 translated book items, personal answers and the teacher-selected video.');

// Exercise the actual factory used by the lesson: pronouns, names, a pair,
// affirmative, negative, questions, progressive and information questions.
const factory=(name,tense,form,wh=false)=>presentReadingPieces(name,tense,form,wh).map(p=>p.word).join(' ');
for(const name of ['He','She','It','Ali','Fahad']){
 assert.equal(factory(name,'simple','affirmative'),name+' reads comic books every day.');
 assert.equal(factory(name,'simple','negative'),name+' does not read comic books every day.');
 assert.equal(factory(name,'simple','question'),'Does '+presentSubject(name).questionName+' read comic books every day?');
 assert.equal(factory(name,'continuous','affirmative'),name+' is reading a comic book now.');
}
for(const name of ['I','You','We','They','Ali and Fahad']){
 assert.equal(factory(name,'simple','affirmative'),name+' read comic books every day.');
 assert.equal(factory(name,'simple','negative'),name+' do not read comic books every day.');
 assert.equal(factory(name,'simple','question'),'Do '+presentSubject(name).questionName+' read comic books every day?');
}
assert.equal(factory('I','continuous','affirmative'),'I am reading a comic book now.');
assert.equal(factory('Fahad','continuous','negative'),'Fahad is not reading a comic book now.');
assert.equal(factory('Ali and Fahad','continuous','question'),'Are Ali and Fahad reading a comic book now?');
assert.equal(factory('They','continuous','question',true),'What are they reading now?');
assert.equal(presentSubject('Fahad').reply,'he');
assert.equal(presentSubject('She').reply,'she');
assert.equal(presentSubject('Ali and Fahad').reply,'they');
console.log('PASS: real sentence factory for all pronoun groups, single names, compound names, s only in affirmative simple, auxiliary questions and progressive forms.');

for(const [sentence,text,arabic] of [
 ['She reads every day.','every day','كل يوم'],
 ['Fahad catches the bus every morning.','every morning','كل صباح'],
 ['They are playing right now.','right now','الآن تمامًا'],
 ['Ali is reading at the moment.','at the moment','في هذه اللحظة'],
 ['My mother usually drives.','usually','عادةً'],
 ['Ali and Fahad sometimes play.','sometimes','أحيانًا'],
 ['She is reading NOW.','NOW','الآن']
]){const clue=sentenceTimeClue(sentence);assert.equal(clue?.text,text);assert.equal(clue?.arabic,arabic);assert.equal(sentence.slice(clue.index,clue.index+clue.text.length),text);}
assert.equal(sentenceTimeClue('I know him.'),null);
assert.equal(sentenceTimeClue('They snowball ideas.'),null);
console.log('PASS: time clues retain exact English spans and Arabic meanings; full right now phrase precedes now.');

const before=JSON.parse(readFileSync(new URL('./fixtures/tenses-v2.json',import.meta.url),'utf8')).definition;
const regrouped=arrangeTensesDefinition(before,before.questions);
assert(hasNewTensesSequence(regrouped));
assert(regrouped.questions.every((q,i)=>q.id===i+1&&q.lesson===Math.floor(i<12?i/4:3)));
for(let i=0;i<12;i++)assert.equal(tenseQuestionKey(regrouped.questions[i]),tenseQuestionKey(before.questions[tensesSequenceOrder[i]-1]));
assert.deepEqual(regrouped.questions.slice(12),before.questions.slice(12));
const changed=structuredClone(before);changed.questions[0].answer=1;
assert.equal(arrangeTensesDefinition(changed,before.questions),changed);
console.log('PASS: topic sequence and question groupings preserve grading keys and the eight English game questions; custom changed content is preserved.');
