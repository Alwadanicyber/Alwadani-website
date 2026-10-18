import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import ts from 'typescript';
const directory=mkdtempSync(new URL('../.certificate-check-',import.meta.url));
try{
 for(const name of ['audience','grades','education-brand','ministry-logo','certificate-marble-art','certificate-fields','certificate-canvas','export-page','certificate-print','certificate-school','certificate-marble','certificates','certificate-editor','certificate-image'])writeFileSync(join(directory,name+'.mjs'),ts.transpileModule(readFileSync(new URL('../lib/'+name+'.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/from '\.\/([\w-]+)'/g,"from './$1.mjs'"));
 const {emptyPack,certificateBody,certificatesHtml,validateCertificatePack}=await import(pathToFileURL(join(directory,'certificates.mjs'))),{certificatePreviewStudent,changeCertificateStudent,changeCertificateField,createCertificateStudents,changeCertificatePlacement}=await import(pathToFileURL(join(directory,'certificate-editor.mjs'))),{removeCertificateImage}=await import(pathToFileURL(join(directory,'certificate-image.mjs'))),{interactiveCertificateHtml}=await import(pathToFileURL(join(directory,'certificate-fields.mjs')));
 let number=0;const id=()=>String(++number),reload=p=>validateCertificatePack(JSON.parse(JSON.stringify(p)));
 let pack=changeCertificateStudent({...emptyPack},0,true,{design:'marbleEnglish'});
 pack=changeCertificateField(pack,0,true,'title',{text:'A special award',size:125});
 pack=changeCertificatePlacement(pack,{nameY:48,textY:62,signY:84});
 pack=reload(pack);assert.equal(certificatePreviewStudent(pack).design,'marbleEnglish');assert.equal(certificatePreviewStudent(pack).text,'englishAppreciation');
 pack=createCertificateStudents(pack,['أحمد محمد','خالد عبدالله'],id);assert(pack.students.every(s=>s.design==='marbleEnglish'&&s.edits.title.size===125));
 pack=changeCertificateStudent(pack,1,false,{design:'schoolBlue'});
 pack=changeCertificateField(pack,0,false,'name',{text:'سارة أحمد'});
 pack=changeCertificateField(pack,0,false,'name',{size:140});
 pack=changeCertificateField(pack,0,false,'reason',{text:'Great work <script>alert(1)</script>'});
 pack=changeCertificatePlacement(pack,{nameY:50});
 pack=reload(pack);pack=createCertificateStudents(pack,['سارة أحمد','خالد عبدالله','طالب جديد'],id);
 const renamed=createCertificateStudents(pack,['اسم جديد في السطر الأول','خالد عبدالله','طالب جديد'],id);assert.equal(renamed.students[0].design,'marbleEnglish');assert.equal(renamed.students[0].edits.name.size,140);assert.equal(renamed.students[0].id,'1');
 assert.equal(pack.students[0].design,'marbleEnglish');assert.equal(pack.students[1].design,'schoolBlue');assert.equal(pack.students[0].edits.name.size,140);assert.equal(pack.students[1].edits.name,undefined);assert.equal(pack.students[0].id,'1');
 const html=certificateBody(pack,pack.students[0]);assert(html.includes('cert-marble'));assert(html.includes('A special award'));assert(html.includes('font-size:140%'));assert(html.includes('&lt;script&gt;'));assert(!html.includes('<script>'));assert(html.includes('transform:translateY('));
 assert(interactiveCertificateHtml(html).includes('aria-label="تعديل اسم الطالب / الطالبة"'));assert(!certificatesHtml(pack).includes('role="button"'));assert(!certificatesHtml(pack).includes('data-selected'));
 pack=changeCertificateField(pack,0,true,'teacher',{text:'معلمة تجريبية'});assert(pack.students.every(s=>s.edits.teacher.text==='معلمة تجريبية'));assert.equal(pack.students[1].design,'schoolBlue');
 pack=changeCertificateField(pack,0,false,'title',null);assert.equal(pack.students[0].edits.title,undefined);assert.equal(pack.students[1].edits.title.text,'A special award');
 const image={...pack,image:'data:image/webp;base64,YQ==',imageRatio:1.6,draftCertificate:{...pack.draftCertificate,design:'custom',previousDesign:'marbleEnglish'},students:[{...pack.students[0],design:'custom',previousDesign:'marbleEnglish'}]};
 const removed=reload(removeCertificateImage(reload(image)));assert.equal(removed.image,'');assert.equal(removed.students[0].design,'marbleEnglish');assert.equal(removed.draftCertificate.design,'marbleEnglish');assert.equal(removed.students[0].edits.name.size,140);
 for(const design of ['gold','blue','green','joy','schoolBlue','schoolGreen','schoolViolet','marbleEnglish','custom']){const body=certificateBody(pack,{...pack.students[0],design});assert(body.includes('data-cert-field="name"'));assert(body.includes('data-cert-field="teacher"'));}
 for(const edits of [{title:{size:NaN}},{title:{size:201}},{title:{text:'a'.repeat(121)}},{unknown:{text:'x'}},{name:{text:'wrong'}}])assert.throws(()=>validateCertificatePack({...pack,students:[{...pack.students[0],edits}]}));
 assert.equal(reload({...emptyPack,students:[{id:'legacy',name:'طالب',design:'gold',text:'creative',customText:''}]}).students[0].design,'gold');
 console.log('Certificate background persistence, direct text edits, sizes, list regeneration, restore, safe exports and legacy compatibility passed.');
}finally{rmSync(directory,{recursive:true,force:true});}
