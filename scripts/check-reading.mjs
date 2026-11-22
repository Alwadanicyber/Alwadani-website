import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {readingChapters,readingExampleWord} from '../lib/reading-course.ts';
import {readingAlphabet} from '../lib/reading-alphabet.ts';
import {clearWordBank,modelFocusBank,mouthModelIds,readingPhonemeBank,readingPhonemeId,readingWordBank} from '../app/reading/reading-phonemes.ts';
import {shPracticeTiming} from '../app/reading/sh-practice-timing.ts';
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
 const isMp3=bytes.subarray(0,3).toString()==='ID3'||(bytes[0]===0xff&&(bytes[1]&0xe0)===0xe0);
 assert(bytes.length>1000&&isMp3,`Missing MP3: ${key}`);
 return bytes;
}
assert.equal(readingPhonemeBank('ay'),'aep-vowels');
assert.equal(readingPhonemeBank('l'),modelFocusBank);
const lastLetterGroup=readingChapters[0].patterns.find(p=>p.pattern==='U–Z').groups.at(-1);
assert.deepEqual(lastLetterGroup,{ipa:'ks',atEnd:true,spellings:[{letters:'X',examples:['bo[x]']}]});
assert.equal(readingPhonemeBank(readingPhonemeId('ks')),'alphabet');
const digraphs=readingChapters[1].patterns;
assert.deepEqual(digraphs.find(p=>p.pattern==='th').groups.map(g=>g.ipa),['θ','ð']);
assert(digraphs.every(p=>p.groups.every(g=>g.audio||readingPhonemeId(g.ipa))));
const vowelTeams=readingChapters[2].patterns;
const longA=vowelTeams.find(p=>p.pattern==='Long A').groups;
assert.deepEqual(longA.map(g=>g.ipa),['eɪ']);
assert.deepEqual(longA[0].spellings.find(s=>s.letters==='ay').examples,['d[ay]','pl[ay]']);
assert.deepEqual(vowelTeams.find(p=>p.pattern==='oo · ea').groups.map(g=>g.ipa),['uː','ʊ','ɛ']);
const alphabet=audioBank('alphabet');
const corrected=audioBank(clearWordBank);
const focus=audioBank(modelFocusBank);
for(const word of ['hoe','cup','knee','give','ship','fish','shell']){
 assert.equal(readingWordBank(word),clearWordBank);
 audioBytes(corrected,`word-${word}`);
}
for(const word of ['saw','sun','up','me','new','loud','shoot']){
 assert.equal(readingWordBank(word),modelFocusBank);
 audioBytes(focus,`word-${word}`);
}
const aepDirectory=new URL('../public/reading/aep-2.4.0/',import.meta.url);
const aepSources=readFileSync(new URL('SOURCES.txt',aepDirectory),'utf8');
assert.match(aepSources,/GPL|GNU General Public License/);
for(const sound of mouthModelIds){
 assert.equal(readingPhonemeBank(sound),modelFocusBank);
 audioBytes(focus,`sound-${sound}`);
 assert(aepSources.split('\n').some(line=>line.startsWith(`${sound} | `)&&line.endsWith('.mp4')));
 const video=readFileSync(new URL(`${sound}.mp4`,aepDirectory));
 assert(video.length>10_000&&video.subarray(4,8).toString()==='ftyp',`Missing video for ${sound}`);
}
assert.equal(new Set(['l','m','n'].map(letter=>focus[`sound-${letter}`])).size,3);
const recordedWords = new Set(readFileSync(new URL('recordings-credits.txt',voiceDirectory),'utf8')
 .split('Original recordings:\n')[1].trim().split('\n').map(line=>line.split(':')[0]));
for(const word of ['box','dog','duck','fox','leg','lip','up']) assert(recordedWords.has(word),`Missing recording credit for ${word}`);
assert.deepEqual(readingAlphabet.map(a=>a.letter),[...'abcdefghijklmnopqrstuvwxyz']);
for(const letter of readingAlphabet){
 assert.equal(letter.examples.length,2,'Each letter must have exactly two example words');
 assert.equal(new Set(letter.examples).size,2);
 assert(letter.phones&&letter.ipa&&letter.tip);
 const soundBank=readingPhonemeBank(letter.letter);
 assert(soundBank,`Missing alphabet bank for ${letter.letter}`);
 audioBytes(audioBank(soundBank),`sound-${letter.letter}`);
 for(const word of letter.examples)audioBytes(alphabet,`word-${word.toLowerCase()}`);
}
assert.equal(readingAlphabet.find(a=>a.letter==='q').phones,'k w');
assert.equal(readingAlphabet.find(a=>a.letter==='x').phones,'k s');
for(const [i,c] of readingChapters.entries()){
 assert.equal(c.id,i+1);
 assert(c.title&&c.en&&c.goal&&c.note);
 assert(c.patterns.length>0&&c.patterns.every(p=>p.pattern&&p.groups.length));
 assert(c.passages.length>0&&c.passages.every(p=>p.title&&p.text&&p.page>=c.page));
 assert(/sh/i.test(c.sh));assert(c.quiz.length>=3);
 const bank = audioBank(`chapter-${c.id}`);
 for(const word of ['box','dog','duck','fox','leg','lip','up']){
  if(bank[`word-${word}`]) assert.equal(bank[`word-${word}`],alphabet[`word-${word}`]);
 }
 for(const pattern of c.patterns){
  for(const group of pattern.groups){
   assert(group.spellings.length);
   for(const symbol of group.ipa.split(' ~ ')){
    const sound=group.audio??readingPhonemeId(symbol);
    if(sound){
     const overrideBank=readingPhonemeBank(sound);
     audioBytes(overrideBank?audioBank(overrideBank):bank,`sound-${sound}`);
    }
   }
   for(const spelling of group.spellings){
    assert(spelling.letters&&spelling.examples.length);
    for(const example of spelling.examples){
     assert.match(example,/^(?:[a-z]|\[[a-z]+\])+$/i,'Spellings need balanced letter highlights');
     if(group.ipa) assert(example.includes('['),'Sound examples should highlight the relevant letters');
     audioBytes(bank,`word-${readingExampleWord(example).toLowerCase()}`);
    }
   }
  }
 }
 for(const passage of c.passages){
  audioBytes(bank,`passage-${passage.page}`);
  audioBytes(bank,`slow-passage-${passage.page}`);
 }
 const practiceBank=audioBank(`practice-v4-${c.id}`);
 audioBytes(practiceBank,'practice-sh');
 const ranges=shPracticeTiming[c.id];
 assert.equal(ranges.length,c.sh.split(/(?<=[.!?])\s+/).length);
 for(const [index,[start,duration]] of ranges.entries()){
  assert(start>=0&&duration>0);
  if(index>0) assert(start>=ranges[index-1][0]+ranges[index-1][1]);
 }
 for(const [index,q] of c.quiz.entries()){
  assert(q.word&&q.prompt&&q.reason);assert.equal(q.options.length,3);
  assert.equal(new Set(q.options).size,3);
  assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<3);
  assert.equal(q.options[q.answer],q.word,'Correct sound must pronounce the displayed word');
  const hashes=q.options.map(w=>{
   const word=w.toLowerCase();
   return createHash('sha256').update(audioBytes(practiceBank,`quiz-${index}-word-${word}`)).digest('hex');
  });
  assert.equal(new Set(hashes).size,3,'Sound options must not be identical recordings');
 }
}
const she=readingChapters[1].quiz.find(q=>q.word==='she');
assert.deepEqual(she.options,['see','she','tea']);assert.equal(she.answer,1);
assert(readingChapters[1].sh.startsWith('She sells seashells by the seashore.'));
assert(readFileSync(new URL('../public/reading/reading-guide.pdf',import.meta.url)).subarray(0,5).equals(Buffer.from('%PDF-')));
const catalog=readFileSync(new URL('../app/catalog.tsx',import.meta.url),'utf8');assert(catalog.includes('href="/reading"'));
console.log('PASS: requested chapter order, 26 sound clips, 52 examples, 32 audio questions with distinct playable files, and complete practice and passage audio.');
