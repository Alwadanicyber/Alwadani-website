import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import ts from 'typescript';
const dir=mkdtempSync(join(tmpdir(),'alwadani-record-check-'));
try{
  for(const name of ['grades','records','record-export','education-brand','certificates','local-records']){const source=readFileSync(new URL('../lib/'+name+'.ts',import.meta.url),'utf8');const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/from '\.\/(grades|records|education-brand)'/g,"from './$1.mjs'");writeFileSync(join(dir,name+'.mjs'),js);}
  const {validateRecord,markLabel,markClass,completionCount}=await import(pathToFileURL(join(dir,'records.mjs')));
  const {recordHtml,recordCsv}=await import(pathToFileURL(join(dir,'record-export.mjs')));
  const student=randomUUID(),tasks=Array.from({length:7},(_,i)=>({id:randomUUID(),title:i===0?'<script>alert(1)</script>':'عمل '+(i+1),type:i===0?'exam':i===1?'homework':'performance',maxScore:20}));
  const record={title:'كشف <img src=x onerror=alert(1)>',grade:'grade-9',className:'3 / ب',teacherName:'معلم & مدير',principalName:'المدير',students:[{id:student,name:'=HYPERLINK("https://example.test")'}],tasks,marks:{[student]:{[tasks[0].id]:0,[tasks[1].id]:'missing',[tasks[2].id]:'done'}}};
  assert.equal(validateRecord(record).marks[student][tasks[0].id],0);assert.equal(completionCount(record),3);
  assert.equal(markLabel(tasks[0],0),'0 / 20');assert.equal(markLabel(tasks[0],'absent'),'غائب');assert.equal(markClass('absent'),'mark-missing');assert.equal(markLabel(tasks[1],'done'),'حل الواجب');assert.equal(markLabel(tasks[2],'missing'),'لم ينجز');assert.equal(markLabel(tasks[1],null),'لم يُرصد');
  const html=recordHtml(record);assert(!html.includes('<script>'));assert(!html.includes('<img src=x'));assert(html.includes('رؤية السعودية 2030'));assert(html.includes('&lt;script&gt;'));assert(html.includes('معلم &amp; مدير'));assert(html.includes('0 / 20'));assert.equal((html.match(/<section class="record-print-page record-design-white">/g)||[]).length,2);assert.equal((html.match(/اسم الطالب/g)||[]).length,2);
  const csv=recordCsv(record);assert(csv.startsWith('\ufeff'));assert(csv.includes("'="));assert(csv.includes('""https://example.test""'));assert(csv.includes('لم يحل'));
  for(const invalid of [{...record,students:Array.from({length:151},()=>({id:randomUUID(),name:''}))},{...record,tasks:Array.from({length:41},()=>({...tasks[0],id:randomUUID()}))},{...record,tasks:[tasks[0],tasks[0]]},{...record,marks:{[student]:{[tasks[0].id]:NaN}}},{...record,marks:{[student]:{[tasks[0].id]:20.1}}},{...record,marks:{[student]:{[tasks[1].id]:'absent'}}}])assert.throws(()=>validateRecord(invalid));
  const scored={...record,tasks:[{...tasks[0],type:'performance-score',maxScore:5}],marks:{[student]:{[tasks[0].id]:3}},classLabel:'الصف الرابع عام أ',design:'gold'};
  assert.equal(validateRecord(scored).marks[student][tasks[0].id],3);
  for(const bad of [0,6,2.5,'done','absent'])assert.throws(()=>validateRecord({...scored,marks:{[student]:{[tasks[0].id]:bad}}}));
  assert.equal(validateRecord(record).design,'white');assert.throws(()=>validateRecord({...record,design:'__proto__'}));
  assert(recordHtml(scored).includes('الصف الرابع عام أ'));assert(!recordHtml(scored).includes('الشعبة'));assert(recordHtml(scored).includes('record-design-gold'));
  const {emptyPack,certificateBody,certificateStyle,certificatesHtml,validateCertificatePack}=await import(pathToFileURL(join(dir,'certificates.mjs')));
  const pack={...emptyPack,teacher:'المعلم',principal:'المدير',grade:'الصف الرابع عام',letter:'أ',students:[{id:student,name:'أحمد <script>',design:'gold',text:'creative',customText:''},{id:randomUUID(),name:'خالد',design:'blue',text:'effort',customText:''}]};
  assert.equal(validateCertificatePack(pack).students.length,2);assert(certificateBody(pack,pack.students[0]).includes('&lt;script&gt;'));assert(!certificateBody(pack,pack.students[0]).includes('cert-motifs'));
  const themed=certificateBody({...pack,decorate:true},pack.students[0]);assert(themed.includes('cert-motifs'));assert(themed.includes('ABC'));assert(themed.includes('بالصف الرابع عام أ'));assert(!themed.includes('بالصف الصف'));assert(!themed.includes('الشعبة'));
  assert(certificateBody({...pack,subject:'math',decorate:true},pack.students[0]).includes('x²'));assert.equal((certificatesHtml(pack).match(/<section class="cert-print-break">/g)||[]).length,2);
  assert.throws(()=>validateCertificatePack({...pack,image:'javascript:alert(1)'}));assert.throws(()=>validateCertificatePack({...pack,nameY:Infinity}));assert.throws(()=>validateCertificatePack({...pack,students:[{...pack.students[0],design:'__proto__'}]}));
  assert(!certificateStyle(pack).includes('background-image:url'));
  const {localSave,localFind,localList}=await import(pathToFileURL(join(dir,'local-records.mjs')));const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
  const local=localSave(scored);assert.equal(localList().length,1);assert.equal(localFind(local.id).tasks[0].type,'performance-score');const changed=localSave({...local,title:'نسخة معدلة'},local);assert.equal(changed.version,2);assert.throws(()=>localSave(local,local));assert.equal(localFind(local.id).title,'نسخة معدلة');
  for(const mode of ['status','check','number']){const custom={...scored,tasks:[{...scored.tasks[0],type:'custom',mode,maxScore:20,positiveLabel:'أحضر الكتاب',negativeLabel:'لم يحضر'}],marks:{[student]:{[tasks[0].id]:mode==='number'?12:'done'}}};assert.equal(validateRecord(custom).tasks[0].mode,mode);assert.equal(markLabel(custom.tasks[0],mode==='number'?12:'done'),mode==='number'?'12 / 20':'أحضر الكتاب');assert.throws(()=>validateRecord({...custom,marks:{[student]:{[tasks[0].id]:mode==='number'?'done':12}}}));}
  assert.throws(()=>validateRecord({...scored,tasks:[{...scored.tasks[0],type:'custom',mode:'script'}]}));
  console.log('PASS: custom tasks: numbers, checkboxes, editable status labels, incompatible marks rejected.');
  console.log('PASS: scored performance, subject decorations, per-student designs, certificate escaping, local persistence and conflict guard.');
  console.log('PASS: record validation boundaries, zero and fractional grades, status labels, six-column print pagination, HTML escaping, CSV formula protection and Arabic encoding.');
}finally{rmSync(dir,{recursive:true,force:true});}
