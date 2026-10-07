import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import ts from 'typescript';
const dir=mkdtempSync(join(tmpdir(),'alwadani-record-check-'));
try{
  for(const name of ['grades','records','record-export','record-layout','manual-record','education-brand','certificate-school','certificates','local-records']){const source=readFileSync(new URL('../lib/'+name+'.ts',import.meta.url),'utf8');const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/from '\.\/(grades|records|education-brand|certificate-school|manual-record|record-layout)'/g,"from './$1.mjs'");writeFileSync(join(dir,name+'.mjs'),js);}
  const {validateRecord,markLabel,markClass,completionCount,applyRecordTaskSettings,addRecordStudent,nextStudentSlot,MAX_STUDENTS}=await import(pathToFileURL(join(dir,'records.mjs')));
  const {recordHtml,recordCsv}=await import(pathToFileURL(join(dir,'record-export.mjs')));
  const student=randomUUID(),tasks=Array.from({length:7},(_,i)=>({id:randomUUID(),title:i===0?'<script>alert(1)</script>':'عمل '+(i+1),type:i===0?'exam':i===1?'homework':'performance',maxScore:20}));
  const record={title:'كشف <img src=x onerror=alert(1)>',grade:'grade-9',className:'3 / ب',teacherName:'معلم & مدير',principalName:'المدير',students:[{id:student,name:'=HYPERLINK("https://example.test")'}],tasks,marks:{[student]:{[tasks[0].id]:0,[tasks[1].id]:'missing',[tasks[2].id]:'done'}}};
  assert.equal(validateRecord(record).marks[student][tasks[0].id],0);assert.equal(completionCount(record),3);
  assert.equal(markLabel(tasks[0],0),'0 / 20');assert.equal(markLabel(tasks[0],'absent'),'غائب');assert.equal(markClass('absent'),'mark-missing');assert.equal(markLabel(tasks[1],'done'),'حل الواجب');assert.equal(markLabel(tasks[2],'missing'),'لم ينجز');assert.equal(markLabel(tasks[1],null),'لم يُرصد');
  const html=recordHtml(record);assert(!html.includes('<script>'));assert(!html.includes('<img src=x'));assert(html.includes('رؤية السعودية 2030'));assert(html.includes('&lt;script&gt;'));assert(html.includes('معلم &amp; مدير'));assert(html.includes('dir="ltr">0</b>'));assert.equal((html.match(/<section class="record-print-page record-design-white"/g)||[]).length,2);assert.equal((html.match(/اسم الطالب/g)||[]).length,2);
  const csv=recordCsv(record);assert(csv.startsWith('\ufeff'));assert(csv.includes("'="));assert(csv.includes('""https://example.test""'));assert(csv.includes('لم يحل'));
  for(const invalid of [{...record,students:Array.from({length:151},()=>({id:randomUUID(),name:''}))},{...record,tasks:Array.from({length:41},()=>({...tasks[0],id:randomUUID()}))},{...record,tasks:[tasks[0],tasks[0]]},{...record,marks:{[student]:{[tasks[0].id]:NaN}}},{...record,marks:{[student]:{[tasks[0].id]:20.1}}},{...record,marks:{[student]:{[tasks[1].id]:'absent'}}}])assert.throws(()=>validateRecord(invalid));
  const scored={...record,schoolName:'مدرسة <script>',subjectName:'اللغة الإنجليزية',tasks:[{...tasks[0],type:'performance-score',maxScore:5}],marks:{[student]:{[tasks[0].id]:3}},classLabel:'الصف الرابع عام أ',design:'gold'};
  assert.equal(validateRecord(scored).marks[student][tasks[0].id],3);
  for(const bad of [0,6,2.5,'done','absent'])assert.throws(()=>validateRecord({...scored,marks:{[student]:{[tasks[0].id]:bad}}}));
  assert.equal(validateRecord(record).design,'white');assert.throws(()=>validateRecord({...record,design:'__proto__'}));
  assert(recordHtml(scored).includes('الصف الرابع عام أ'));assert(!recordHtml(scored).includes('الشعبة'));assert(recordHtml(scored).includes('record-design-gold'));assert(recordHtml(scored).includes('مدرسة &lt;script&gt;'));assert(recordHtml(scored).includes('العام الدراسي 1448'));assert(recordHtml(scored).includes('record-cliche'));assert(recordHtml(scored).includes('اللغة الإنجليزية'));
  const {emptyPack,certificateBody,certificateStyle,certificatesHtml,validateCertificatePack}=await import(pathToFileURL(join(dir,'certificates.mjs')));
  const pack={...emptyPack,teacher:'المعلم',principal:'المدير',grade:'الصف الرابع عام',letter:'أ',students:[{id:student,name:'أحمد <script>',design:'gold',text:'creative',customText:''},{id:randomUUID(),name:'خالد',design:'blue',text:'effort',customText:''}]};
  assert.equal(validateCertificatePack(pack).students.length,2);assert(certificateBody(pack,pack.students[0]).includes('&lt;script&gt;'));assert(!certificateBody(pack,pack.students[0]).includes('cert-motifs'));
  const themed=certificateBody({...pack,decorate:true},pack.students[0]);assert(themed.includes('cert-motifs'));assert(themed.includes('ABC'));assert(themed.includes('بالصف الرابع عام أ'));assert(!themed.includes('بالصف الصف'));assert(!themed.includes('الشعبة'));
  assert(certificateBody({...pack,subject:'math',decorate:true},pack.students[0]).includes('x²'));assert.equal((certificatesHtml(pack).match(/<section class="cert-print-break">/g)||[]).length,2);
  assert.throws(()=>validateCertificatePack({...pack,image:'javascript:alert(1)'}));assert.throws(()=>validateCertificatePack({...pack,nameY:Infinity}));assert.throws(()=>validateCertificatePack({...pack,students:[{...pack.students[0],design:'__proto__'}]}));
  for(const design of ['schoolBlue','schoolGreen','schoolViolet']){const studentModel={...pack.students[0],design,text:'family'};assert.equal(validateCertificatePack({...pack,students:[studentModel]}).students[0].design,design);const body=certificateBody(pack,studentModel);assert(body.includes('cert-school-seal'));assert(body.includes('وزارة التعليم'));assert(body.includes('&lt;script&gt;'));assert(body.includes('أسرتك'));assert(!body.includes('cert-school-pattern'));assert(certificateBody({...pack,decorate:true},studentModel).includes('cert-school-pattern'));assert(!body.includes('بالصف الصف'));}
  assert(!certificateStyle(pack).includes('background-image:url'));
  const {localSave,localFind,localList,localDelete}=await import(pathToFileURL(join(dir,'local-records.mjs')));const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
  const local=localSave(scored);assert.equal(localList().length,1);assert.equal(localFind(local.id).tasks[0].type,'performance-score');const changed=localSave({...local,title:'نسخة معدلة'},local);assert.equal(changed.version,2);assert.throws(()=>localSave(local,local));assert.equal(localFind(local.id).title,'نسخة معدلة');assert.throws(()=>localDelete(local.id,1));assert.equal(localList().length,1);localDelete(local.id,changed.version);assert.equal(localList().length,0);
  for(const mode of ['status','check','number']){const custom={...scored,tasks:[{...scored.tasks[0],type:'custom',mode,maxScore:20,positiveLabel:'أحضر الكتاب',negativeLabel:'لم يحضر'}],marks:{[student]:{[tasks[0].id]:mode==='number'?12:'done'}}};assert.equal(validateRecord(custom).tasks[0].mode,mode);assert.equal(markLabel(custom.tasks[0],mode==='number'?12:'done'),mode==='number'?'12 / 20':'أحضر الكتاب');assert.throws(()=>validateRecord({...custom,marks:{[student]:{[tasks[0].id]:mode==='number'?'done':12}}}));}
  assert.throws(()=>validateRecord({...scored,tasks:[{...scored.tasks[0],type:'custom',mode:'script'}]}));
  const choices=[{id:randomUUID(),label:'حاضر',tone:'positive'},{id:randomUUID(),label:'غائب',tone:'negative'},{id:randomUUID(),label:'متأخر <img src=x>',tone:'neutral'}];
  const commentTask={...tasks[0],title:'الحضور',type:'custom',mode:'comments',choices},commentRecord={...record,tasks:[commentTask],marks:{[student]:{[commentTask.id]:'choice:'+choices[2].id}}};
  const validatedComments=validateRecord(commentRecord);assert.equal(validatedComments.tasks[0].choices.length,3);assert.equal(markLabel(commentTask,'choice:'+choices[2].id),'متأخر <img src=x>');assert.equal(completionCount(commentRecord),1);
  assert.equal(markClass('choice:'+choices[0].id,commentTask),'mark-done');assert.equal(markClass('choice:'+choices[1].id,commentTask),'mark-missing');assert.equal(markClass('choice:'+choices[2].id,commentTask),'mark-note');
  const commentHtml=recordHtml(commentRecord);assert(commentHtml.includes('متأخر &lt;img src=x&gt;'));assert(!commentHtml.includes('<img src=x>'));assert(commentHtml.includes('class="mark-note"'));assert(recordCsv(commentRecord).includes('متأخر <img src=x>'));
  for(const badChoices of [[],[{...choices[0],label:''}],choices.concat(choices[0]),[{...choices[0],tone:'script'}],[choices[0],{...choices[1],label:'حاضر'}]])assert.throws(()=>validateRecord({...commentRecord,tasks:[{...commentTask,choices:badChoices}]}));
  for(const badMark of ['choice:'+randomUUID(),'done','missing','absent',4])assert.throws(()=>validateRecord({...commentRecord,marks:{[student]:{[commentTask.id]:badMark}}}));
  const renamed=applyRecordTaskSettings(commentRecord,commentTask.id,{choices:choices.map((c,i)=>i===2?{...c,label:'تأخر بعذر',tone:'positive'}:c)});assert.equal(renamed.marks[student][commentTask.id],commentRecord.marks[student][commentTask.id]);assert.equal(markLabel(renamed.tasks[0],renamed.marks[student][commentTask.id]),'تأخر بعذر');assert.equal(markClass(renamed.marks[student][commentTask.id],renamed.tasks[0]),'mark-done');assert.throws(()=>applyRecordTaskSettings(commentRecord,commentTask.id,{choices:choices.slice(0,2)}));
  const legacy={...commentRecord,tasks:[{...commentTask,mode:'status',positiveLabel:'مكتمل',negativeLabel:'لم يكتمل'}],students:[...record.students,{id:randomUUID(),name:''}],marks:{[student]:{[commentTask.id]:'done'}}};legacy.marks[legacy.students[1].id]={[commentTask.id]:'missing'};
  const converted=applyRecordTaskSettings(legacy,commentTask.id,{mode:'comments',choices:choices.slice(0,2)});assert.equal(converted.marks[student][commentTask.id],'choice:'+choices[0].id);assert.equal(converted.marks[legacy.students[1].id][commentTask.id],'choice:'+choices[1].id);assert.equal(legacy.marks[student][commentTask.id],'done');assert.equal(converted.students[1].name,'');
  const localComments=localSave(commentRecord);assert.equal(localFind(localComments.id).tasks[0].choices[2].label,choices[2].label);assert.equal(localFind(localComments.id).marks[student][commentTask.id],'choice:'+choices[2].id);assert.equal(validateRecord(JSON.parse(JSON.stringify(localComments))).tasks[0].choices.length,3);
  // A printable blank record retains headings and names, never results or UI controls.
  const blank=validateRecord({...record,format:'blank',marks:{}});
  assert.equal(validateRecord(record).format,'electronic');
  assert.throws(()=>validateRecord({...record,format:'paper'}));
  assert.throws(()=>validateRecord({...record,format:'blank'}));
  const blankHtml=recordHtml(blank),blankCsv=recordCsv(blank);
  assert(!blankHtml.includes('لم يُرصد')&&!blankHtml.includes('0 / 20')&&!blankHtml.includes('record-legend">'));
  assert(!blankHtml.includes('<select')&&!blankHtml.includes('<input')&&!blankHtml.includes('<br>من '));
  assert(blankHtml.includes('&lt;script&gt;')&&blankHtml.includes('معلم &amp; مدير'));
  assert.equal((blankHtml.match(/<td class="record-blank-cell"><\/td>/g)||[]).length,7);
  assert.equal((blankHtml.match(/<section class="record-print-page/g)||[]).length,2);
  assert(!blankCsv.includes('لم يُرصد')&&blankCsv.includes('"","","","","","",""'));
  const savedBlank=localSave(blank);assert.equal(localFind(savedBlank.id).format,'blank');assert.equal(localList().find(r=>r.id===savedBlank.id).format,'blank');
  assert.equal(validateRecord(JSON.parse(JSON.stringify(savedBlank))).format,'blank');

  // The school paper template retains editable grades, grouped headings and writing boxes.
  const {defaultManualTasks,manualTotal}=await import(pathToFileURL(join(dir,'manual-record.mjs')));
  const school=validateRecord({...blank,blankLayout:'school',educationArea:'منطقة <script>',educationOffice:'مكتب & تعليم',schoolYear:'1448 هـ',academicTerm:'الأول',tasks:defaultManualTasks().map(t=>({...t,id:randomUUID()})),students:Array.from({length:30},(_,i)=>({id:randomUUID(),name:i===0?'طالب <script>':''}))});
  assert.equal(manualTotal(school.tasks),60);assert.deepEqual(school.tasks.map(t=>t.maxScore),[10,20,5,5,20]);
  const schoolHtml=recordHtml(school);assert.equal((schoolHtml.match(/<header class="manual-header">/g)||[]).length,1);assert(schoolHtml.includes('تتمة الكشف'));
  assert(schoolHtml.includes('المشاركة والتفاعل')&&schoolHtml.includes('colspan="10"')&&schoolHtml.includes('60 درجة')&&schoolHtml.includes('size:A4 portrait'));
  assert(!schoolHtml.includes('<script>')&&!schoolHtml.includes('<input')&&!schoolHtml.includes('لم يُرصد')&&!schoolHtml.includes('0 /'));
  assert(schoolHtml.includes('منطقة &lt;script&gt;')&&schoolHtml.includes('مكتب &amp; تعليم')&&schoolHtml.includes('1448 هـ')&&schoolHtml.includes('الأول'));
  assert.equal((schoolHtml.match(/<section class="manual-sheet/g)||[]).length,2);
  assert.equal((schoolHtml.match(/class="manual-empty/g)||[]).length,30*23);
  assert(schoolHtml.includes('<td class="manual-index">26</td>'));
  const customPaper=applyRecordTaskSettings(school,school.tasks[0].id,{title:'إحضار الكتاب',maxScore:15,manualCells:3,manualGroup:'متابعة مخصصة'});
  assert.equal(manualTotal(customPaper.tasks),65);assert(recordHtml(customPaper).includes('متابعة مخصصة'));assert(recordHtml(customPaper).includes('65 درجة'));assert(recordCsv(customPaper).includes('إحضار الكتاب (من 15)'));
  const localPaper=localSave(customPaper),restoredPaper=validateRecord(JSON.parse(JSON.stringify(localFind(localPaper.id))));
  assert.equal(restoredPaper.blankLayout,'school');assert.equal(restoredPaper.tasks[0].manualCells,3);assert.equal(restoredPaper.tasks[0].maxScore,15);assert.equal(restoredPaper.educationArea,'منطقة <script>');
  for(const bad of [0,21,1.5,'3'])assert.throws(()=>applyRecordTaskSettings(school,school.tasks[0].id,{manualCells:bad}));
  assert.throws(()=>validateRecord({...school,format:'electronic'}));assert.throws(()=>validateRecord({...school,blankLayout:'unknown'}));
  const widePaper={...school,students:school.students.slice(0,1),tasks:Array.from({length:3},(_,i)=>({...school.tasks[0],id:randomUUID(),manualCells:20,title:'مهمة '+i}))};
  const wideHtml=recordHtml(widePaper);assert.equal((wideHtml.match(/<section class="manual-sheet/g)||[]).length,3);assert(wideHtml.includes('مجموع هذه الصفحة')&&wideHtml.includes('مجموع جميع المهام 30 درجة'));
  const paginated={...record,students:Array.from({length:40},(_,i)=>({id:randomUUID(),name:'طالب '+(i+1)}))};const paginatedHtml=recordHtml(paginated);assert.equal((paginatedHtml.match(/<header class="record-cliche">/g)||[]).length,1);assert(!paginatedHtml.includes('<button')&&!paginatedHtml.includes('تغيير'));assert(paginatedHtml.includes('record-output'));assert(paginatedHtml.includes('<td>40</td>'));
  console.log('PASS: school manual template defaults, editable grades/groups/boxes, row and column pagination, blank totals, escaping, local and JSON roundtrips.');

  // Named additions reuse reserved trailing rows; earlier holes and all marks stay in place.
  const roster={...record,marks:structuredClone(record.marks),students:Array.from({length:30},(_,i)=>({id:i===0?student:randomUUID(),name:i===0?'طالب أول':i===1?'طالب ثان':''}))};
  const row3=roster.students[2].id;roster.marks[row3]={[tasks[0].id]:5};
  const filled=addRecordStudent(roster,'  طالب ثالث  ');
  assert.equal(filled.students.length,30);assert.equal(filled.students[2].id,row3);assert.equal(filled.students[2].name,'طالب ثالث');assert.equal(filled.marks[row3][tasks[0].id],5);assert.equal(roster.students[2].name,'');
  const hole={...roster,students:roster.students.map((r,i)=>({...r,name:i===1?'':i===3?'آخر اسم':r.name}))};
  assert.equal(nextStudentSlot(hole),4);assert.equal(addRecordStudent(hole,'بعد آخر اسم').students[4].name,'بعد آخر اسم');assert.equal(addRecordStudent(hole,'بعد آخر اسم').students[1].name,'');
  const unnamed=addRecordStudent(roster,'  ');assert.equal(unnamed.students.length,31);assert.equal(unnamed.students[30].name,'');
  const noNames={...blank,students:Array.from({length:3},()=>({id:randomUUID(),name:''}))};assert.equal(addRecordStudent(noNames,'أول طالب').students[0].name,'أول طالب');
  const fullNames={...record,students:[{id:student,name:'طالب'}]};const appended=addRecordStudent(fullNames,'طالب إضافي');assert.equal(appended.students.length,2);assert.equal(appended.students[1].name,'طالب إضافي');assert.deepEqual(appended.marks,record.marks);
  const maxRows={...blank,students:Array.from({length:MAX_STUDENTS},(_,i)=>({id:randomUUID(),name:i===0?'طالب أول':''}))};assert.equal(addRecordStudent(maxRows,'طالب ثان').students.length,MAX_STUDENTS);assert.equal(addRecordStudent(maxRows,'طالب ثان').students[1].name,'طالب ثان');assert.throws(()=>addRecordStudent(maxRows,''));assert.throws(()=>addRecordStudent({...maxRows,students:maxRows.students.map(r=>({...r,name:'طالب'}))},'طالب إضافي'));
  console.log('PASS: blank HTML/CSV cells, pagination, local backup format, trailing student slots, stable IDs/marks and maximum-row behavior.');
  console.log('PASS: approved comment choices, colors, HTML/CSV output, local roundtrip, legacy status conversion and referenced-choice deletion guard.');
  console.log('PASS: custom tasks: numbers, checkboxes, editable status labels, incompatible marks rejected.');
  console.log('PASS: scored performance, subject decorations, per-student designs, certificate escaping, local persistence and conflict guard.');
  console.log('PASS: record validation boundaries, zero and fractional grades, status labels, six-column print pagination, HTML escaping, CSV formula protection and Arabic encoding.');
}finally{rmSync(dir,{recursive:true,force:true});}
