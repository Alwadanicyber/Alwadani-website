import {readFileSync,writeFileSync,mkdtempSync,mkdirSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import ts from 'typescript';
// Compile into the repository so the generator uses the same docx package as the app.
const directory=mkdtempSync(new URL('../.export-check-',import.meta.url));
try{
  for(const name of ['word-export','record-layout','export-page','records','grades','manual-record','education-brand']){const source=readFileSync(new URL('../lib/'+name+'.ts',import.meta.url),'utf8');writeFileSync(join(directory,name+'.mjs'),ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/from '\.\/([\w-]+)'/g,"from './$1.mjs'"));}
  const {centeredPageImage}=await import(pathToFileURL(join(directory,'export-page.mjs')));const box=centeredPageImage(800,400,297,210,10);assert.equal(box.x,10);assert(Math.abs(box.y-(210-box.height)/2)<0.00001);const full=centeredPageImage(210,297,210,297);assert.deepEqual(full,{x:0,y:0,width:210,height:297});
  const {recordWord,certificatesWord}=await import(pathToFileURL(join(directory,'word-export.mjs'))),{defaultManualTasks}=await import(pathToFileURL(join(directory,'manual-record.mjs'))),{ministryReferenceLogo,visionLogo}=await import(pathToFileURL(join(directory,'education-brand.mjs')));
  const require=createRequire(import.meta.url),docxRequire=createRequire(require.resolve('docx')),JSZip=docxRequire('jszip');
  const png=Buffer.from(ministryReferenceLogo.split(',')[1],'base64'),logos={ministry:png,vision:png};
  const output=process.env.ALWADANI_EXPORT_FIXTURES;
  if(output){mkdirSync(output,{recursive:true});const runtimeRequire=createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'package.json'));logos.vision=await runtimeRequire('sharp')(Buffer.from(visionLogo.split(',')[1],'base64')).png().toBuffer();}
  const base={title:'كشف متابعة الطلاب',grade:'grade-4',className:'أ',classLabel:'الصف الرابع عام أ',schoolName:'مدرسة الودعاني',subjectName:'اللغة الإنجليزية',educationArea:'الإدارة العامة للتعليم',educationOffice:'مكتب التعليم',schoolYear:'1448 هـ',academicTerm:'الأول',teacherName:'معلم المادة',principalName:'مدير المدرسة',marks:{},students:Array.from({length:30},(_,i)=>({id:'student-'+i,name:i<3?['أحمد محمد','خالد عبدالله','محمد علي'][i]:''}))};
  async function xml(blob){assert.equal(blob.type,'application/vnd.openxmlformats-officedocument.wordprocessingml.document');const bytes=Buffer.from(await blob.arrayBuffer());assert.equal(bytes.subarray(0,2).toString(),'PK');const zip=await JSZip.loadAsync(bytes);return {zip,bytes,xml:await zip.file('word/document.xml').async('string')};}
  const school={...base,format:'blank',blankLayout:'school',tasks:defaultManualTasks().map((task,i)=>({...task,id:'task-'+i}))};
  const manualBlob=await recordWord(school,logos),manual=await xml(manualBlob);
  assert.equal((manual.xml.match(/<w:sectPr>/g)||[]).length,2);assert(manual.xml.includes('w:bidiVisual'));assert(manual.xml.includes('w:gridSpan w:val="10"'));assert(manual.xml.includes('w:vMerge w:val="restart"'));assert(manual.xml.includes('أحمد محمد'));assert(manual.xml.includes('المهام الأدائية'));assert(manual.xml.includes('من 20'));assert(!manual.xml.includes('لم يُرصد'));assert(!manual.xml.includes('غائب'));
  const electronic={...base,format:'electronic',students:[{id:'s1',name:'طالب <script>'},{id:'s2',name:'أحمد محمد'}],tasks:[{id:'exam',type:'exam',title:'اختبار من 20',maxScore:20},{id:'homework',type:'homework',title:'الواجب',maxScore:10}],marks:{s1:{exam:'absent',homework:'missing'},s2:{exam:0,homework:'done'}}};
  const electronicBlob=await recordWord(electronic,logos),results=await xml(electronicBlob);
  assert(results.xml.includes('<w:pgSz w:w="11906" w:h="16838" w:orient="portrait"/>'));assert(results.xml.includes('غائب'));assert(results.xml.includes('952D28'));assert(results.xml.includes('طالب &lt;script&gt;'));assert(results.xml.includes('>0</w:t>'));assert(!results.xml.includes('0 / 20'));assert(results.xml.includes('حل الواجب'));assert.equal((results.xml.match(/<w:sectPr>/g)||[]).length,1);
  const many={...electronic,students:Array.from({length:37},(_,i)=>({id:'many-'+i,name:'طالب '+(i+1)})),tasks:Array.from({length:7},(_,i)=>({...electronic.tasks[0],id:'many-task-'+i})),marks:{}};
  const paged=await xml(await recordWord(many,logos));assert.equal((paged.xml.match(/<w:sectPr>/g)||[]).length,6);assert.equal((paged.xml.match(/>طالب 37</g)||[]).length,2);assert.equal((paged.xml.match(/<w:drawing>/g)||[]).length,2);assert.equal((paged.xml.match(/>وزارة التعليم</g)||[]).length,1);
  const certificates=await xml(await certificatesWord([{data:png,width:1050,height:650},{data:png,width:1050,height:650}]));assert.equal((certificates.xml.match(/<w:sectPr>/g)||[]).length,2);assert.equal((certificates.xml.match(/<w:drawing>/g)||[]).length,2);assert(certificates.zip.file('[Content_Types].xml'));
  const longRoster={...electronic,students:Array.from({length:38},(_,i)=>({id:'roster-'+i,name:'طالب تجريبي '+(i+1)+' عبدالله محمد أحمد'})),marks:{'roster-0':{exam:'absent',homework:'missing'},'roster-1':{exam:18,homework:'done'}}};const roster=await xml(await recordWord(longRoster,logos));assert.equal((roster.xml.match(/<w:drawing>/g)||[]).length,2);
  if(output){writeFileSync(join(output,'roster-record.docx'),roster.bytes);writeFileSync(join(output,'manual-record.docx'),manual.bytes);writeFileSync(join(output,'electronic-record.docx'),results.bytes);}
  console.log('PASS: real DOCX ZIP, editable RTL tables, grouped writing boxes, grade caps, blank cells, absence colors, escaped names, row/column pagination and one certificate per page.');
}finally{rmSync(directory,{recursive:true,force:true});}
