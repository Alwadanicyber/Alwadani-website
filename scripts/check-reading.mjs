import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readingChapters} from '../lib/reading-course.ts';
assert.equal(readingChapters.length,10);
assert.deepEqual(readingChapters.map(c=>c.page),[2,5,8,11,15,18,21,32,35,37]);
assert.equal(readingChapters.reduce((n,c)=>n+c.quiz.length,0),32);
assert.deepEqual(readingChapters[6].passages.map(p=>p.page),[22,25,28,31]);
for(const [i,c] of readingChapters.entries()){
 assert.equal(c.id,i+1);
 assert(c.title&&c.en&&c.goal&&c.note);
 assert(c.patterns.length>0&&c.patterns.every(p=>p.pattern&&p.words&&p.tip));
 assert(c.passages.length>0&&c.passages.every(p=>p.title&&p.text&&p.page>=c.page));
 assert(/sh/i.test(c.sh),'Every chapter needs supported SH reading practice');
 assert(c.quiz.length>=3);
 for(const q of c.quiz){assert(q.prompt&&q.reason);assert(q.options.length>=2);assert.equal(new Set(q.options).size,q.options.length);assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length);}
}
assert(readingChapters[2].sh.startsWith('She sells seashells by the seashore.'));
assert(readFileSync(new URL('../public/reading/reading-guide.pdf',import.meta.url)).subarray(0,5).equals(Buffer.from('%PDF-')));
const catalog=readFileSync(new URL('../app/catalog.tsx',import.meta.url),'utf8');
assert(catalog.includes("grade==='general'&&<a"));
assert(catalog.includes('href="/reading"'));
console.log('PASS: 10 sequential PDF chapters, 13 source passages, 32 valid quiz questions, SH practice, public source PDF and general-lessons entry.');
