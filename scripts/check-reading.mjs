import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {readingChapters} from '../lib/reading-course.ts';
import {readingAlphabet} from '../lib/reading-alphabet.ts';
import {phonemeSlices} from '../app/reading/reading-phonemes.ts';
assert.equal(readingChapters.length,10);
assert.deepEqual(readingChapters.map(c=>c.page),[2,8,21,5,11,15,18,32,35,37],'Requested order: letters, consonant digraphs, vowel digraphs, then the rest');
assert.equal(readingChapters.reduce((n,c)=>n+c.quiz.length,0),32);
assert.deepEqual(readingChapters[2].passages.map(p=>p.page),[22,25,28,31]);
const voiceDirectory = new URL('../public/reading/voice-v3/',import.meta.url);
function audioBank(name){
 return JSON.parse(readFileSync(new URL(`${name}.json`,voiceDirectory),'utf8'));
}
function audioBytes(bank,key){
 const bytes = Buffer.from(bank[key] ?? '', 'base64');
 assert(bytes.length > 1000 && bytes.subarray(0,3).toString()==='ID3',`Missing MP3: ${key}`);
 return bytes;
}
const phonemes=readFileSync(new URL('sounds-american.mp3',voiceDirectory));
assert(phonemes.length>100000,'The original phoneme recording must be present');
assert.deepEqual(phonemeSlices.ay,[4,.7]);
for (const [offset,duration] of Object.values(phonemeSlices)){
 assert(offset>=0 && duration>0 && offset+duration<51);
}
const alphabet = audioBank('alphabet');
assert.deepEqual(readingAlphabet.map(a=>a.letter),[...'abcdefghijklmnopqrstuvwxyz']);
for(const letter of readingAlphabet){
 assert.equal(letter.examples.length,2,'Each letter must have exactly two example words');
 assert.equal(new Set(letter.examples).size,2);
 assert(letter.phones&&letter.ipa&&letter.tip);
 if (!phonemeSlices[letter.letter]) audioBytes(alphabet,`sound-${letter.letter}`);
 for(const word of letter.examples)audioBytes(alphabet,`word-${word.toLowerCase()}`);
}
assert.equal(readingAlphabet.find(a=>a.letter==='q').phones,'k w');
assert.equal(readingAlphabet.find(a=>a.letter==='x').phones,'k s');
for(const [i,c] of readingChapters.entries()){
 assert.equal(c.id,i+1);
 assert(c.title&&c.en&&c.goal&&c.note);
 assert(c.patterns.length>0&&c.patterns.every(p=>p.pattern&&p.words&&p.tip));
 assert(c.passages.length>0&&c.passages.every(p=>p.title&&p.text&&p.page>=c.page));
 assert(/sh/i.test(c.sh));assert(c.quiz.length>=3);
 const bank = audioBank(`chapter-${c.id}`);
 for(const pattern of c.patterns){
  for(const word of pattern.words.split(' ')) audioBytes(bank,`word-${word.toLowerCase()}`);
 }
 for(const passage of c.passages){
  audioBytes(bank,`passage-${passage.page}`);
  audioBytes(bank,`slow-passage-${passage.page}`);
 }
 audioBytes(bank,'practice-sh');
 for(const q of c.quiz){
  assert(q.word&&q.prompt&&q.reason);assert.equal(q.options.length,3);
  assert.equal(new Set(q.options).size,3);
  assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<3);
  assert.equal(q.options[q.answer],q.word,'Correct sound must pronounce the displayed word');
  const hashes=q.options.map(w=>createHash('sha256').update(audioBytes(bank,`word-${w.toLowerCase()}`)).digest('hex'));
  assert.equal(new Set(hashes).size,3,'Sound options must not be identical recordings');
 }
}
const she=readingChapters[1].quiz.find(q=>q.word==='she');
assert.deepEqual(she.options,['see','she','tea']);assert.equal(she.answer,1);
assert(readingChapters[1].sh.startsWith('She sells seashells by the seashore.'));
assert(readFileSync(new URL('../public/reading/reading-guide.pdf',import.meta.url)).subarray(0,5).equals(Buffer.from('%PDF-')));
const catalog=readFileSync(new URL('../app/catalog.tsx',import.meta.url),'utf8');assert(catalog.includes('href="/reading"'));
console.log('PASS: requested chapter order, 26 sound clips, 52 examples, 32 audio questions with distinct playable files, and complete practice and passage audio.');
