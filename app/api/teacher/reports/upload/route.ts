import {teacherAccess} from '@/lib/teacher';
import {reportUnlocked} from '@/lib/report-lock';
import {reportFileChunksReady,REPORT_CHUNK_SIZE,type ReportFileUpload} from '@/lib/report-file-chunks';
import {validReportId,REPORT_FILE_LIMIT} from '@/lib/student-reports';
export const dynamic='force-dynamic';
const reply=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'private, no-store'}});
async function denied(req:Request){if(!await teacherAccess()||req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'غير مصرح برفع الملفات.'},403);if(!await reportUnlocked(req))return reply({error:'افتح قفل التقارير أولًا.',locked:true},423);return null;}
export async function POST(req:Request){try{const no=await denied(req);if(no)return no;const raw=await req.text();if(raw.length>2000)return reply({error:'طلب كبير.'},400);const body=JSON.parse(raw);const db=await reportFileChunksReady();
 if(body.action==='begin'){
 if(!validReportId(body.reportId)||typeof body.fileName!=='string'||!body.fileName.trim()||body.fileName.length>255||!Number.isSafeInteger(body.size)||body.size<1||body.size>REPORT_FILE_LIMIT)return reply({error:'اختر ملفًا غير فارغ بحجم لا يتجاوز ٢٥٠ ميجابايت.'},400);
 if(!await db.prepare('SELECT id FROM teacher_student_reports WHERE id=? AND archived=0').bind(body.reportId).first())return reply({error:'التقرير غير موجود.'},404);
 const id=crypto.randomUUID(),name=body.fileName.replace(/[\r\n\x00-\x1f]/g,'').slice(0,200);await db.prepare("INSERT INTO teacher_report_file_uploads(id,report_id,file_name,file_type,file_size,created) VALUES(?,?,?,'application/octet-stream',?,?)").bind(id,body.reportId,name,body.size,new Date().toISOString()).run();return reply({uploadId:id,chunkSize:REPORT_CHUNK_SIZE},201);
 }
 if(!validReportId(body.uploadId))return reply({error:'معرّف رفع غير صالح.'},400);
 const upload=await db.prepare('SELECT * FROM teacher_report_file_uploads WHERE id=?').bind(body.uploadId).first<ReportFileUpload>();if(!upload)return reply({error:'عملية الرفع غير موجودة.'},404);
 if(body.action==='cancel'){if(upload.completed)return reply({error:'الملف محفوظ بالفعل.'},409);await db.batch([db.prepare('DELETE FROM teacher_report_file_chunks WHERE upload_id=?').bind(upload.id),db.prepare('DELETE FROM teacher_report_file_uploads WHERE id=? AND completed IS NULL').bind(upload.id)]);return reply({ok:true});}
 if(body.action!=='finish')return reply({error:'إجراء غير صالح.'},400);
 if(upload.completed)return reply({ok:true,uploadedAt:upload.completed});
 if(upload.received_size!==upload.file_size)return reply({error:'الملف لم يكتمل رفعه بعد.'},409);
 if(!await db.prepare('SELECT id FROM teacher_student_reports WHERE id=? AND archived=0').bind(upload.report_id).first())return reply({error:'التقرير غير موجود أو في الأرشيف.'},409);
 const uploaded=new Date().toISOString();await db.batch([
 db.prepare("UPDATE teacher_student_reports SET fileName=?,fileType=?,fileSize=?,fileData='',updated=? WHERE id=? AND archived=0").bind(upload.file_name,upload.file_type,upload.file_size,uploaded,upload.report_id),
 db.prepare('INSERT INTO teacher_report_current_files(report_id,upload_id) VALUES(?,?) ON CONFLICT(report_id) DO UPDATE SET upload_id=excluded.upload_id').bind(upload.report_id,upload.id),
 db.prepare('UPDATE teacher_report_file_uploads SET completed=? WHERE id=?').bind(uploaded,upload.id),
 db.prepare('INSERT INTO teacher_report_upload_events(id,report_id,file_name,file_size,uploaded) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),upload.report_id,upload.file_name,upload.file_size,uploaded),
 ]);return reply({ok:true,uploadedAt:uploaded});
 }catch{return reply({error:'تعذّر حفظ الملف. المرفق السابق يبقى محفوظًا؛ أعد المحاولة.'},503);}}
export async function PUT(req:Request){try{const no=await denied(req);if(no)return no;const url=new URL(req.url),id=url.searchParams.get('id'),part=Number(url.searchParams.get('part'));if(!validReportId(id)||!Number.isSafeInteger(part)||part<0)return reply({error:'جزء غير صالح.'},400);
 const db=await reportFileChunksReady(),upload=await db.prepare('SELECT * FROM teacher_report_file_uploads WHERE id=?').bind(id).first<ReportFileUpload>();if(!upload||upload.completed)return reply({error:'عملية رفع غير متاحة.'},409);
 const expected=part*REPORT_CHUNK_SIZE,wanted=Math.min(REPORT_CHUNK_SIZE,upload.file_size-expected);if(wanted<=0)return reply({error:'جزء خارج حجم الملف.'},400);
 const reader=req.body?.getReader();if(!reader)return reply({error:'جزء فارغ.'},400);const chunks:Uint8Array[]=[];let length=0;while(true){const r=await reader.read();if(r.done)break;length+=r.value.length;if(length>wanted){await reader.cancel();return reply({error:'حجم الجزء غير صحيح.'},413);}chunks.push(r.value);}if(length!==wanted)return reply({error:'جزء غير مكتمل.'},400);
 const bytes=new Uint8Array(length);let at=0;for(const c of chunks){bytes.set(c,at);at+=c.length;}const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');
 const previous=await db.prepare('SELECT hash FROM teacher_report_file_chunks WHERE upload_id=? AND part=?').bind(id,part).first<{hash:string}>();if(previous)return previous.hash===hash?reply({ok:true}):reply({error:'الجزء المرسل مختلف عن الجزء المحفوظ.'},409);
 if(upload.received_size!==expected)return reply({error:'أرسل أجزاء الملف بالترتيب.'},409);
 await db.batch([db.prepare('INSERT OR IGNORE INTO teacher_report_file_chunks(upload_id,part,bytes,hash) SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM teacher_report_file_uploads WHERE id=? AND received_size=? AND completed IS NULL)').bind(id,part,bytes.buffer,hash,id,expected),db.prepare('UPDATE teacher_report_file_uploads SET received_size=? WHERE id=? AND received_size=? AND EXISTS(SELECT 1 FROM teacher_report_file_chunks WHERE upload_id=? AND part=? AND hash=?)').bind(expected+length,id,expected,id,part,hash)]);return reply({ok:true});
 }catch{return reply({error:'تعذّر رفع جزء من الملف. أعد المحاولة.'},503);}}
