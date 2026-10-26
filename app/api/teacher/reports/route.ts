import {reportUnlocked} from '@/lib/report-lock';
import type {CustomReportCategory} from '@/lib/student-reports';
import {teacherAccess} from '@/lib/teacher';
import {studentReportsReady,reportColumns} from '@/lib/student-report-store';
import {validateStudentReport,validReportId,REPORT_FILE_LIMIT,type StudentReport} from '@/lib/student-reports';
import {initiativeBody} from '@/lib/initiatives-core';
export const dynamic='force-dynamic';
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export async function GET(req:Request){try{if(!await teacherAccess())return reply({error:'هذه التقارير خاصة بمالك الموقع.'},403);if(!await reportUnlocked(req))return reply({error:'افتح قفل التقارير أولًا.',locked:true},423);const db=await studentReportsReady();const archived=new URL(req.url).searchParams.get('archived')==='1'?1:0;const categories=(await db.prepare('SELECT id,label,mode FROM teacher_report_categories ORDER BY rowid').all<CustomReportCategory>()).results;return reply({categories,reports:(await db.prepare(`SELECT ${reportColumns} FROM teacher_student_reports WHERE archived=? ORDER BY updated DESC,id DESC`).bind(archived).all<StudentReport>()).results});}catch{return reply({error:'تعذّر تحميل التقارير.'},503);}}
export async function POST(req:Request){try{if(!await teacherAccess()||req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'غير مصرح بإدارة التقارير.'},403);}catch{return reply({error:'تعذّر التحقق من الدخول.'},503);}
 try{
 if(!await reportUnlocked(req))return reply({error:'افتح قفل التقارير أولًا.',locked:true},423);
 const body=await initiativeBody(req);const db=await studentReportsReady();
 if(body.action==='add-category'){if(typeof body.label!=='string'||!body.label.trim()||body.label.trim().length>100||!['grade','student','violation'].includes(String(body.mode)))return reply({error:'اكتب اسم الخانة وحدد بياناتها.'},400);await db.prepare('INSERT INTO teacher_report_categories(id,label,mode) VALUES(?,?,?)').bind('report-'+crypto.randomUUID(),body.label.trim(),body.mode).run();return reply({ok:true},201);}
 if(body.action==='archive'||body.action==='restore'){
 if(!validReportId(body.id))return reply({error:'تقرير غير صالح.'},400);
 const r=await db.prepare('UPDATE teacher_student_reports SET archived=?,updated=? WHERE id=?').bind(body.action==='archive'?1:0,new Date().toISOString(),body.id).run();return r.meta.changes?reply({ok:true}):reply({error:'التقرير غير موجود.'},404);
 }
 if(body.action!=='save')return reply({error:'إجراء غير صالح.'},400);
 const categories=(await db.prepare('SELECT id,label,mode FROM teacher_report_categories').all<CustomReportCategory>()).results;const value=validateStudentReport(body,categories);if(body.id!==undefined&&!validReportId(body.id))return reply({error:'تقرير غير صالح.'},400);
 const id=body.id||crypto.randomUUID(),now=new Date().toISOString();
 if(body.id){const r=await db.prepare('UPDATE teacher_student_reports SET category=?,title=?,grade=?,studentName=?,violation=?,notes=?,updated=? WHERE id=? AND archived=0').bind(value.category,value.title,value.grade,value.studentName,value.violation,value.notes,now,id).run();if(!r.meta.changes)return reply({error:'التقرير غير موجود أو في الأرشيف.'},404);}
 else await db.prepare('INSERT INTO teacher_student_reports(id,category,title,grade,studentName,violation,notes,created,updated) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,value.category,value.title,value.grade,value.studentName,value.violation,value.notes,now,now).run();
 return reply({ok:true,id},body.id?200:201);
 }catch(e){return reply({error:e instanceof Error?e.message:'تعذّر حفظ التقرير.'},400);}
}
export async function PUT(req:Request){
 try{if(!await teacherAccess()||req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'غير مصرح بإدارة الملفات.'},403);}catch{return reply({error:'تعذّر التحقق من الدخول.'},503);}
 try{
 if(!await reportUnlocked(req))return reply({error:'افتح قفل التقارير أولًا.',locked:true},423);
 const id=new URL(req.url).searchParams.get('id');if(!validReportId(id))return reply({error:'تقرير غير صالح.'},400);
 // Read a bounded stream before parsing multipart data.
 const reader=req.body?.getReader();if(!reader)return reply({error:'اختر ملفًا.'},400);const chunks:Uint8Array[]=[];let size=0;
 while(true){const r=await reader.read();if(r.done)break;size+=r.value.length;if(size>REPORT_FILE_LIMIT+16384){await reader.cancel();return reply({error:'الحد الأقصى للملف ١ ميجابايت.'},413);}chunks.push(r.value);}
 const bytes=new Uint8Array(size);let pos=0;for(const chunk of chunks){bytes.set(chunk,pos);pos+=chunk.length;}
 const form=await new Response(bytes,{headers:{'Content-Type':req.headers.get('content-type')||''}}).formData();const file=form.get('file');if(!(file instanceof File)||!file.size||file.size>REPORT_FILE_LIMIT)return reply({error:'اختر ملفًا بحجم لا يتجاوز ١ ميجابايت.'},400);
 const buffer=new Uint8Array(await file.arrayBuffer());const ext=file.name.split('.').pop()?.toLowerCase();const types:Record<string,string>={pdf:'application/pdf',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg'};
 if(!ext||!types[ext])return reply({error:'الصيغ المتاحة: PDF، Word DOCX، Excel XLSX، PNG، JPG.'},400);
 const signature=Array.from(buffer.slice(0,8)).map(b=>b.toString(16).padStart(2,'0')).join('');const valid=ext==='pdf'?new TextDecoder().decode(buffer.slice(0,5))==='%PDF-':ext==='png'?signature==='89504e470d0a1a0a':['jpg','jpeg'].includes(ext)?signature.startsWith('ffd8ff'):signature.startsWith('504b0304');if(!valid)return reply({error:'محتوى الملف لا يوافق صيغته.'},400);
 let binary='';for(let i=0;i<buffer.length;i+=8192)binary+=String.fromCharCode(...buffer.subarray(i,i+8192));
 const db=await studentReportsReady();const r=await db.prepare('UPDATE teacher_student_reports SET fileName=?,fileType=?,fileSize=?,fileData=?,updated=? WHERE id=? AND archived=0').bind(file.name.replace(/[\r\n\x00-\x1f]/g,'').slice(0,200),types[ext],file.size,btoa(binary),new Date().toISOString(),id).run();return r.meta.changes?reply({ok:true}):reply({error:'التقرير غير موجود.'},404);
 }catch(error){console.error('Private report upload error',error);return reply({error:'تعذّر رفع الملف. التقرير محفوظ ويمكن إعادة رفع مرفقه.'},400);}
}
