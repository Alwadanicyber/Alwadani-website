import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const dir=mkdtempSync(join(tmpdir(),'teachcraft-exam-'));
try{
 for(const name of ['exam-prep-content','exam-prep-courses','ranking-mode']){const source=readFileSync(new URL('../lib/'+name+'.ts',import.meta.url),'utf8');const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replaceAll("from './exam-prep-content'","from './exam-prep-content.mjs'");writeFileSync(join(dir,name+'.mjs'),js);}
 const {examPrepCourses}=await import(pathToFileURL(join(dir,'exam-prep-courses.mjs'))),{examUnits,examPassages,examWritingGuides,examVocabularyExpressions}=await import(pathToFileURL(join(dir,'exam-prep-content.mjs'))),{defaultRankingMode}=await import(pathToFileURL(join(dir,'ranking-mode.mjs')));
 // Independently reviewed against the original models and the added Unit 2 matching table.
 const expected=[
 ['vegetarian','a big city','more than half','computer','addict','drinks','ride','Does','never','How often','a','b','p','t','f','True','False','True','True','False'],
 ['infant','twins','athlete','donate','award','donated','appointment','outstanding','encouraged','infant/newborn','did','lived','were','was','used','new student','Abha','shy','best player'],
 ['passport','surf','suitcase','special','wealthy','waiting','am','going','stay','buy','True','False','True','False','True']
 ];
 assert.deepEqual(examUnits.map(u=>u.unit),[1,2,3]);assert.equal(examPrepCourses.length,3);
 for(let n=0;n<3;n++){
  const c=examPrepCourses[n],u=examUnits[n],def=c.definition;
  assert.equal(c.id,u.id);assert.equal(c.grade,'grade-9');assert.equal(c.published,1);assert.equal(defaultRankingMode(c.id),'participation');assert.equal(def.questions.length,u.objectiveTotal);
  assert.deepEqual(def.questions.map(q=>q.options[q.answer]),expected[n]);assert.deepEqual(def.questions.map(q=>q.id),def.questions.map((_,i)=>i+1));
  for(const [i,lesson]of def.lessons.entries()){assert(lesson.intro&&lesson.rules.length&&lesson.formula&&lesson.example&&lesson.translation);assert(def.questions.some(q=>q.lesson===i));assert(lesson.tag===String(i+1).padStart(2,'0'));}
  for(const q of def.questions){assert.equal(q.options.length,new Set(q.options).size);assert(q.options.length>=2&&q.options.length<=6);assert(q.answer>=0&&q.answer<q.options.length);assert(q.reason.length>=70);assert(q.prompt.length<=1200&&q.reason.length<=2000);assert(def.lessons[q.lesson]);}
  assert.deepEqual([...def.questions.map(q=>q.lesson)].sort((a,b)=>a-b),def.questions.map(q=>q.lesson));
  assert(examPassages[u.unit].paragraphs.length&&examPassages[u.unit].translation.length);
  assert(!('pdf' in u),'Original paper URL exposed in public lesson metadata');
  assert(!existsSync(new URL('../public/exam-models/unit-'+u.unit+'.pdf',import.meta.url)),'Original paper is still a public asset');
  if(u.writingPoints){assert(examWritingGuides[u.unit].steps.length===4);assert(examWritingGuides[u.unit].model&&examWritingGuides[u.unit].checklist.length>=5);}
 }
 assert.equal(examPrepCourses.reduce((sum,c)=>sum+c.definition.questions.length,0),54);
 const unit2=examPrepCourses[1].definition;
 assert.equal(unit2.questions.filter(q=>q.lesson===0).length,10);
 const matching=unit2.questions.slice(5,10);
 assert.deepEqual(matching.map(q=>q.prompt),['“Gave to charity” means ___.','“An arrangement to meet” means ___.','“Excellent” means ___.','“Supported someone to succeed” means ___.','“A baby” means ___.']);
 assert.deepEqual(matching.map(q=>q.options[q.answer]),['donated','appointment','outstanding','encouraged','infant/newborn']);
 assert.deepEqual(examVocabularyExpressions[2].map(item=>[item.word,item.expression]),[['donated','gave to charity'],['appointment','an arrangement to meet'],['outstanding','excellent'],['encouraged','supported someone to succeed'],['infant / newborn','a baby']]);
 for(const item of examVocabularyExpressions[2])for(const field of ['meaning','expressionMeaning','exampleMeaning','note'])assert(/[\u0600-\u06ff]/.test(item[field]),'Missing Arabic support: '+item.word+' / '+field);
 assert(matching.every(q=>q.lesson===0&&q.reason.includes('مثال:')));
 assert(matching[4].reason.includes('ليستا متطابقتين'));
 assert.equal(examUnits[1].writingPoints,6);
 const birthplace=unit2.questions.find(q=>q.prompt==='Yousef grew up in ___.');
 assert(birthplace.reason.includes('لا يحدد مكان الميلاد'));
 assert(examPrepCourses[2].definition.questions[6].reason.includes('ترتيب للمستقبل'));
 assert(examPrepCourses[0].definition.questions[5].reason.includes('he / she / it'));
 console.log('PASS: all 54 keys matched to the supplied materials, five new Unit 2 vocabulary pairs with Arabic words, expressions and examples, ordered questions, original papers excluded, 3 translated reading passages, and separate writing workshops.');
}finally{rmSync(dir,{recursive:true,force:true});}
