import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import ts from 'typescript';
const project=fileURLToPath(new URL('../',import.meta.url)),dir=mkdtempSync(join(tmpdir(),'record-search-'));
const content={title:'كشف متابعة النشاط',grade:'grade-4',className:'ب',classLabel:'الصف الرابع عام ب',teacherName:'إبراهيم أحمد',principalName:'المدير',subjectName:'اللغة الإنجليزية · English',schoolName:'مدرسة الأمل',students:[{id:randomUUID(),name:'طالب تجريبي'}],tasks:[{id:randomUUID(),title:'المشاركة',type:'performance',maxScore:5}],marks:{}};
content.marks[content.students[0].id]={[content.tasks[0].id]:'done'};
try{
 for(const name of ['audience','grades','records','local-records','record-search']){
  const js=ts.transpileModule(readFileSync(project+'lib/'+name+'.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/from '\.\/(audience|grades|records)'/g,"from './$1.mjs'");writeFileSync(join(dir,name+'.mjs'),js);
 }
 const {recordMatchesSearch,normalizeRecordSearch}=await import(pathToFileURL(join(dir,'record-search.mjs'))),{localSave,localList,localFind,localDelete}=await import(pathToFileURL(join(dir,'local-records.mjs')));
 const storage=new Map();globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};
 const scored=content;
  {
    const searchable=localSave({...scored,title:'كشف متابعة النشاط',grade:'grade-4',className:'ب',classLabel:'الصف الرابع عام ب',teacherName:'إِبْـراهيم أحمد',subjectName:'اللغة الإنجليزية · English',schoolName:'مدرسة الأمل'});
    const item=localList().find(r=>r.id===searchable.id),before=JSON.stringify(localFind(searchable.id));
    assert.equal(item.className,'ب');assert.equal(item.classLabel,'الصف الرابع عام ب');assert.equal(item.subjectName,searchable.subjectName);assert.equal(item.schoolName,searchable.schoolName);
    for(const query of ['رابع','الصف الرابع','٤ ابتدائي','4ب','۴ / ب','رابع ب انجليزي','ابراهيم احمد','مُتابَعَة','ENGLISH','مدرسة الامل','مدرسه الامل','الانجليزيه','الكتروني','   '])assert(recordMatchesSearch(item,query),query);
    for(const query of ['خامس','ثالث متوسط','رابع أ','رابع ت','محمد','٤ متوسط','١٤ ابتدائي'])assert(!recordMatchesSearch(item,query),query);
    assert.equal(normalizeRecordSearch('  ٤/ب · إِنْـجليزي  '),'4 ب انجليزي');
    const middle={...item,id:randomUUID(),title:'كشف الثالث',grade:'grade-9',className:'أ',classLabel:'',subjectName:'رياضيات',schoolName:''};
    assert(recordMatchesSearch(middle,'٣ متوسط'));assert(recordMatchesSearch(middle,'الثالث المتوسط أ'));assert(!recordMatchesSearch(middle,'٣ ابتدائي'));
    const older={...middle,classLabel:undefined,subjectName:undefined,schoolName:undefined};assert(recordMatchesSearch(older,'ثالث متوسط'));assert(!recordMatchesSearch(older,'انجليزي'));
    const list=[item,middle],filter=(query,grade='all')=>list.filter(r=>(grade==='all'||r.grade===grade)&&recordMatchesSearch(r,query));
    assert.equal(filter('متابعة').length,1);assert.equal(filter('ثالث متوسط').length,1);assert.equal(filter('','grade-4').length,1);assert.equal(filter('ثالث','grade-4').length,0);assert.equal(filter('').length,2);
    assert.equal(JSON.stringify(localFind(searchable.id)),before,'Searching must not change records, IDs or marks');
    const edited=localSave({...searchable,subjectName:'الرياضيات'},searchable),updated=localList().find(r=>r.id===edited.id);assert(recordMatchesSearch(updated,'رياضيات'));assert(!recordMatchesSearch(updated,'ENGLISH'));assert.deepEqual(localFind(edited.id).marks,searchable.marks);
    localDelete(edited.id,edited.version);
    console.log('PASS: comprehensive record search includes titles, grades, classes, subjects, schools and teachers; Arabic/Western/Persian digits, diacritics, mixed-field queries, precise class letters, legacy metadata and filters; searches preserve saved marks.');
  }
}finally{rmSync(dir,{recursive:true,force:true});}

// Verify the authenticated API projects the same metadata from real D1 JSON,
// including older rows, without loading or changing student marks in the list.
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wranglerRequire('miniflare');
const root=project+'dist/server',paths=readdirSync(root,{recursive:true}).filter(p=>p.endsWith('.js')||p.endsWith('.mjs'));
const modules=['index.js',...paths.filter(p=>p!=='index.js')].map(p=>({type:'ESModule',path:root+'/'+p}));
const setupKey=randomUUID()+randomUUID(),password=randomUUID()+'Aa1!',mf=new Miniflare({modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings:{TEACHER_SETUP_KEY:setupKey},d1Databases:{DB:'record-search'},cf:false});
try{
 const db=await mf.getD1Database('DB');for(const file of readdirSync(project+'drizzle').filter(p=>p.endsWith('.sql')).sort())for(const sql of readFileSync(project+'drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql.trim()).run();
 const setup=await mf.dispatchFetch('https://course.test/api/teacher/auth',{method:'POST',headers:{'Content-Type':'application/json',origin:'https://course.test'},body:JSON.stringify({action:'setup',username:'record-search',password,setupKey})});assert.equal(setup.status,200);
 const headers={'Content-Type':'application/json',origin:'https://course.test',cookie:setup.headers.get('set-cookie').split(';')[0]};
 const created=await mf.dispatchFetch('https://course.test/api/teacher/records',{method:'POST',headers,body:JSON.stringify(content)});assert.equal(created.status,201);const {record}=await created.json();
 let response=await mf.dispatchFetch('https://course.test/api/teacher/records',{headers});assert.equal(response.status,200);let item=(await response.json()).records.find(r=>r.id===record.id);
 for(const key of ['className','classLabel','subjectName','schoolName','teacherName'])assert.equal(item[key],content[key],key);assert(!('marks' in item)&&!('students' in item));
 const before=await db.prepare('SELECT content FROM teacher_records WHERE id=?').bind(record.id).first();
 const legacy={...content};delete legacy.classLabel;delete legacy.subjectName;delete legacy.schoolName;
 await db.prepare('UPDATE teacher_records SET content=? WHERE id=?').bind(JSON.stringify(legacy),record.id).run();
 response=await mf.dispatchFetch('https://course.test/api/teacher/records',{headers});item=(await response.json()).records.find(r=>r.id===record.id);assert.equal(item.classLabel,'');assert.equal(item.subjectName,'');assert.equal(item.schoolName,'');assert.equal(item.className,content.className);
 const legacySaved=await db.prepare('SELECT content FROM teacher_records WHERE id=?').bind(record.id).first();assert.deepEqual(JSON.parse(legacySaved.content).marks,JSON.parse(before.content).marks);
 const forbidden=await mf.dispatchFetch('https://course.test/api/teacher/records');assert.equal(forbidden.status,403);
 console.log('PASS: authenticated D1 record summaries include searchable class, subject, school and teacher metadata; legacy rows work, marks remain unchanged and private records remain protected.');
}finally{await mf.dispose();}
