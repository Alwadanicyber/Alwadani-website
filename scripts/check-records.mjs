import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import ts from 'typescript';
const dir=mkdtempSync(join(tmpdir(),'alwadani-record-check-'));
try{
  for(const name of ['grades','records','record-export']){const source=readFileSync(new URL('../lib/'+name+'.ts',import.meta.url),'utf8');const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/from '\.\/(grades|records)'/g,"from './$1.mjs'");writeFileSync(join(dir,name+'.mjs'),js);}
  const {validateRecord,markLabel,markClass,completionCount}=await import(pathToFileURL(join(dir,'records.mjs')));
  const {recordHtml,recordCsv}=await import(pathToFileURL(join(dir,'record-export.mjs')));
  const student=randomUUID(),tasks=Array.from({length:7},(_,i)=>({id:randomUUID(),title:i===0?'<script>alert(1)</script>':'عمل '+(i+1),type:i===0?'exam':i===1?'homework':'performance',maxScore:20}));
  const record={title:'كشف <img src=x onerror=alert(1)>',grade:'grade-9',className:'3 / ب',teacherName:'معلم & مدير',principalName:'المدير',students:[{id:student,name:'=HYPERLINK("https://example.test")'}],tasks,marks:{[student]:{[tasks[0].id]:0,[tasks[1].id]:'missing',[tasks[2].id]:'done'}}};
  assert.equal(validateRecord(record).marks[student][tasks[0].id],0);assert.equal(completionCount(record),3);
  assert.equal(markLabel(tasks[0],0),'0 / 20');assert.equal(markLabel(tasks[0],'absent'),'غائب');assert.equal(markClass('absent'),'mark-missing');assert.equal(markLabel(tasks[1],'done'),'حل الواجب');assert.equal(markLabel(tasks[2],'missing'),'لم ينجز');assert.equal(markLabel(tasks[1],null),'لم يُرصد');
  const html=recordHtml(record);assert(!html.includes('<script>'));assert(!html.includes('<img'));assert(html.includes('&lt;script&gt;'));assert(html.includes('معلم &amp; مدير'));assert(html.includes('0 / 20'));assert.equal((html.match(/<section class="record-print-page">/g)||[]).length,2);assert.equal((html.match(/اسم الطالب/g)||[]).length,2);
  const csv=recordCsv(record);assert(csv.startsWith('\ufeff'));assert(csv.includes("'="));assert(csv.includes('""https://example.test""'));assert(csv.includes('لم يحل'));
  for(const invalid of [{...record,students:Array.from({length:151},()=>({id:randomUUID(),name:''}))},{...record,tasks:Array.from({length:41},()=>({...tasks[0],id:randomUUID()}))},{...record,tasks:[tasks[0],tasks[0]]},{...record,marks:{[student]:{[tasks[0].id]:NaN}}},{...record,marks:{[student]:{[tasks[0].id]:20.1}}},{...record,marks:{[student]:{[tasks[1].id]:'absent'}}}])assert.throws(()=>validateRecord(invalid));
  console.log('PASS: record validation boundaries, zero and fractional grades, status labels, six-column print pagination, HTML escaping, CSV formula protection and Arabic encoding.');
}finally{rmSync(dir,{recursive:true,force:true});}
