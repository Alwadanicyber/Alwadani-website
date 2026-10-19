import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,mkdirSync,rmSync,existsSync} from 'node:fs';
import {dirname,join,relative,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';
const project=fileURLToPath(new URL('../',import.meta.url)),dir=mkdtempSync(join(project,'.home-render-')),compiled=new Map();
function compile(path){
 path=resolve(path);if(compiled.has(path))return compiled.get(path);
 const output=join(dir,relative(project,path).replace(/\.(tsx|ts)$/,'.mjs'));compiled.set(path,output);mkdirSync(dirname(output),{recursive:true});
 let js=ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 js=js.replace(/from (['"])([^'"]+)\1/g,(whole,quote,spec)=>{if(!spec.startsWith('.')&&!spec.startsWith('@/'))return whole;const base=spec.startsWith('@/')?join(project,spec.slice(2)):resolve(dirname(path),spec);const source=['.tsx','.ts','.js',''].map(ext=>base+ext).find(existsSync);assert(source,'Unresolved test dependency '+spec);const target=compile(source);let name=relative(dirname(output),target).replaceAll('\\','/');if(!name.startsWith('.'))name='./'+name;return 'from '+quote+name+quote;});
 writeFileSync(output,js);return output;
}
try{
 const {default:Study,HomeCanPicture}=await import(pathToFileURL(compile(join(project,'app/home-can-study.tsx')))),{default:Dictation}=await import(pathToFileURL(compile(join(project,'app/home-can-dictation-question.tsx')))),{homeCanCourse}=await import(pathToFileURL(compile(join(project,'lib/home-can-course.ts')))),{homeChores}=await import(pathToFileURL(compile(join(project,'lib/home-can-learning.ts'))));
 const pictures=renderToStaticMarkup(createElement('div',null,homeChores.map(w=>createElement(HomeCanPicture,{key:w.scene,scene:w.scene}))));
 const clipIds=[...pictures.matchAll(/<clipPath id="([^"]+)"/g)].map(m=>m[1]);assert.equal(clipIds.length,9);assert.equal(new Set(clipIds).size,9);
 assert.equal((pictures.match(/viewBox="0 0 318 342"/g)||[]).length,9);assert.equal((pictures.match(/<rect width="318" height="342"/g)||[]).length,9);assert.equal((pictures.match(/<g clip-path="url\(#/g)||[]).length,9);
 const guide=renderToStaticMarkup(createElement(Study,{station:1,unit:homeCanCourse.definition.lessons[1],busy:false,onPractice:()=>{}}));
 assert(guide.includes('Can I help you?')&&guide.includes('Can you help me?')&&guide.includes('لأنه الفاعل')&&guide.includes('ليست قاعدة عامة'));
 for(const q of homeCanCourse.definition.questions.filter(q=>q.kind==='audio-write')){
  const {answer,reason,...question}=q;question.options=[];
  const props={question,busy:false,last:q.id===24,onSubmit:async()=>{},onContinue:()=>{}};
  const untouched=renderToStaticMarkup(createElement(Dictation,props));
  assert(!untouched.includes('<image')&&!untouched.includes(q.options[q.answer])&&!untouched.includes('home-dictation-reveal'),'Picture or expected phrase visible before submission');
  for(const correct of [0,1]){const checked=renderToStaticMarkup(createElement(Dictation,{...props,answer:{correct,response:'student spelling',answerText:q.options[q.answer],reason:q.reason}}));assert(checked.includes('<image')&&checked.includes('home-dictation-meaning')&&checked.includes(q.options[q.answer])&&checked.includes('student spelling'));assert(checked.includes(q.id===24?'انتقل إلى لعبة البالونات':'فهمت، العبارة التالية'));}
 }
 console.log('PASS: nine isolated, uniquely clipped illustrations; concise offer/request guide and I/you subject explanation; all eight dictations hide the picture and phrase until submission, then reveal picture, meaning and spelling with manual review.');
}finally{rmSync(dir,{recursive:true,force:true});}
