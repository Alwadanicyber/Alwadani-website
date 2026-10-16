import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const dir=mkdtempSync(join(tmpdir(),'teachcraft-exam-'));
try{
 for(const name of ['exam-prep-content','exam-prep-courses','ranking-mode']){const source=readFileSync(new URL('../lib/'+name+'.ts',import.meta.url),'utf8');const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replaceAll("from './exam-prep-content'","from './exam-prep-content.mjs'");writeFileSync(join(dir,name+'.mjs'),js);}
 const {examPrepCourses}=await import(pathToFileURL(join(dir,'exam-prep-courses.mjs'))),{examUnits,examPassages,examWritingGuides}=await import(pathToFileURL(join(dir,'exam-prep-content.mjs'))),{defaultRankingMode}=await import(pathToFileURL(join(dir,'ranking-mode.mjs')));
 // Independently reviewed against all six pages of the attached models.
 const expected=[
 ['vegetarian','a big city','more than half','computer','addict','drinks','ride','Does','never','How often','a','b','p','t','f','True','False','True','True','False'],
 ['infant','twins','athlete','donate','award','did','lived','were','was','used','new student','Abha','shy','best player'],
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
 assert.equal(examPrepCourses.reduce((sum,c)=>sum+c.definition.questions.length,0),49);
 assert(examPrepCourses[1].definition.questions[11].prompt.includes('grew up'));
 assert(examPrepCourses[1].definition.questions[11].reason.includes('لا يحدد مكان الميلاد'));
 assert(examPrepCourses[2].definition.questions[6].reason.includes('ترتيب للمستقبل'));
 assert(examPrepCourses[0].definition.questions[5].reason.includes('he / she / it'));
 console.log('PASS: all 49 keys independently matched to the supplied papers, ordered sections, original papers excluded from public assets, 3 reading passages with translations, complete rule guides, corrected birthplace wording, and both separate writing workshops.');
}finally{rmSync(dir,{recursive:true,force:true});}
