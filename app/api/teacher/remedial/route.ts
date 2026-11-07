import {teacherAccess,tokenHash} from '@/lib/teacher';
import {initiativeBody} from '@/lib/initiatives-core';
import {remedialId,validateRemedialPlan,newAccessCode,normalizeAccessCode} from '@/lib/remedial-model';
import {remedialReady,encryptCode,decryptCode,type PlanRow,type AssignmentRow} from '@/lib/remedial-store';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export async function GET(req:Request){try{
 if(!await teacherAccess())return reply({error:'هذه المساحة خاصة بالمعلم.'},403);
 const db=await remedialReady(),plans=(await db.prepare("SELECT id,title,description,chapter_count,published,version,created,updated,json_extract(definition,'$.grade') AS grade,json_extract(definition,'$.className') AS className FROM remedial_plans ORDER BY updated DESC").all()).results;
 const requested=new URL(req.url).searchParams.get('plan'),id=requested||String(plans[0]?.id||'');
 const selected=id?await db.prepare('SELECT * FROM remedial_plans WHERE id=?').bind(id).first<PlanRow>():null;
 const assignments=selected?(await db.prepare('SELECT a.id,a.student_name,a.code_hint,a.active,a.next_index,a.unlocked_at,a.plan_version,a.chapter_count,a.run,a.last_score,a.last_total,a.updated,(SELECT COUNT(*) FROM remedial_attempts t WHERE t.assignment_id=a.id) AS attempts FROM remedial_assignments a WHERE plan_id=? ORDER BY a.created DESC').bind(selected.id).all()).results:[];
 return reply({plans,selected:selected?{...selected,definition:JSON.parse(selected.definition)}:null,assignments});
 }catch{return reply({error:'تعذّر تحميل الخطط العلاجية.'},503);}}
export async function POST(req:Request){try{
 if(!await teacherAccess()||req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'غير مصرح بإدارة الخطط.'},403);
 const body=await initiativeBody(req),db=await remedialReady(),now=Date.now();
 if(body.action==='save-plan'){
  if(typeof body.published!=='boolean')return reply({error:'حدّد حالة الخطة.'},400);const value=validateRemedialPlan(body.definition,body.published),id=body.id||crypto.randomUUID();if(!remedialId(id))return reply({error:'خطة غير صالحة.'},400);
  if(body.id){const result=await db.prepare('UPDATE remedial_plans SET title=?,description=?,definition=?,chapter_count=?,published=?,version=version+1,updated=? WHERE id=? AND version=?').bind(value.title,value.description,JSON.stringify(value),value.chapters.length,body.published?1:0,now,id,body.version).run();if(!result.meta.changes)return reply({error:'الخطة تغيّرت في نافذة أخرى. حدّثها قبل الحفظ.'},409);}
  else await db.prepare('INSERT INTO remedial_plans(id,title,description,definition,chapter_count,published,created,updated) VALUES(?,?,?,?,?,?,?,?)').bind(id,value.title,value.description,JSON.stringify(value),value.chapters.length,body.published?1:0,now,now).run();
  return reply({ok:true,id},body.id?200:201);
 }
 if(body.action==='assign'){
  if(!remedialId(body.planId)||typeof body.studentName!=='string'||!body.studentName.trim()||body.studentName.trim().length>100)return reply({error:'اختر الخطة واكتب اسم الطالب (حتى ١٠٠ حرف).'},400);
  if(!await db.prepare('SELECT id FROM remedial_plans WHERE id=?').bind(body.planId).first())return reply({error:'الخطة غير موجودة.'},404);
  const code=typeof body.code==='string'&&body.code.trim()?body.code.trim():newAccessCode(),normalized=normalizeAccessCode(code),id=crypto.randomUUID();
  await db.prepare('INSERT INTO remedial_assignments(id,plan_id,student_name,code_hash,code_cipher,code_hint,created,updated) VALUES(?,?,?,?,?,?,?,?)').bind(id,body.planId,body.studentName.trim(),await tokenHash(normalized),await encryptCode(code),normalized.slice(-4),now,now).run();return reply({ok:true,id},201);
 }
 if(!remedialId(body.assignmentId))return reply({error:'اختر الطالب.'},400);
 const row=await db.prepare('SELECT * FROM remedial_assignments WHERE id=?').bind(body.assignmentId).first<AssignmentRow>();if(!row)return reply({error:'الطالب غير موجود.'},404);
 if(body.action==='access-details'){try{return reply({code:await decryptCode(row.code_cipher)});}catch{return reply({error:'تعذّر استعادة الرمز. أصدر رمزًا جديدًا.'},409);}}
 if(body.action==='history'){const attempts=(await db.prepare('SELECT id,run,chapter_title,score,total,passed,detail,submitted FROM remedial_attempts WHERE assignment_id=? ORDER BY submitted DESC LIMIT 50').bind(row.id).all()).results;return reply({attempts:attempts.map(a=>({...a,detail:JSON.parse(String(a.detail))}))});}
 if(body.action==='set-active'){if(typeof body.active!=='boolean')return reply({error:'حالة غير صالحة.'},400);await db.prepare('UPDATE remedial_assignments SET active=?,version=version+1,updated=? WHERE id=?').bind(body.active?1:0,now,row.id).run();return reply({ok:true});}
 if(body.action==='unlock'){await db.prepare('UPDATE remedial_assignments SET override_index=next_index,unlocked_at=0,version=version+1,updated=? WHERE id=?').bind(now,row.id).run();return reply({ok:true});}
 if(body.action==='refresh-plan'){
  const current=await db.prepare('SELECT * FROM remedial_plans WHERE id=?').bind(row.plan_id).first<PlanRow>();if(!current?.published)return reply({error:'انشر الخطة المحدّثة أولًا.'},400);if(!row.snapshot)return reply({ok:true});
  const latest=validateRemedialPlan(JSON.parse(current.definition),true),previous=validateRemedialPlan(JSON.parse(row.snapshot),true);
  if(latest.chapters.length<row.next_index||previous.chapters.slice(0,row.next_index).some((chapter,index)=>latest.chapters[index]?.id!==chapter.id))return reply({error:'أبقِ الفصول المنجزة في ترتيبها لتحديث الأجزاء الباقية دون فقد التقدم.'},400);
  const definition={...latest,chapters:[...previous.chapters.slice(0,row.next_index),...latest.chapters.slice(row.next_index)]};
  const changed=await db.prepare('UPDATE remedial_assignments SET snapshot=?,plan_version=?,chapter_count=?,ready_for_exam=0,version=version+1,updated=? WHERE id=? AND version=?').bind(JSON.stringify(definition),current.version,definition.chapters.length,now,row.id,row.version).run();return changed.meta.changes?reply({ok:true}):reply({error:'تغيّر تقدم الطالب. حدّث الصفحة.'},409);
 }
 if(body.action==='reset'){await db.prepare('UPDATE remedial_assignments SET snapshot=NULL,plan_version=0,chapter_count=0,next_index=0,unlocked_at=0,ready_for_exam=0,override_index=-1,last_score=NULL,last_total=NULL,run=run+1,version=version+1,updated=? WHERE id=?').bind(now,row.id).run();return reply({ok:true});}
 if(body.action==='change-code'){
  const code=typeof body.code==='string'&&body.code.trim()?body.code.trim():newAccessCode(),normalized=normalizeAccessCode(code);
  await db.batch([db.prepare('UPDATE remedial_assignments SET code_hash=?,code_cipher=?,code_hint=?,version=version+1,updated=? WHERE id=?').bind(await tokenHash(normalized),await encryptCode(code),normalized.slice(-4),now,row.id),db.prepare('DELETE FROM remedial_sessions WHERE assignment_id=?').bind(row.id)]);return reply({ok:true});
 }
 return reply({error:'إجراء غير صالح.'},400);
 }catch(error){const message=error instanceof Error?error.message:'';return reply({error:message.includes('UNIQUE')?'هذا الرمز مستخدم لطالب آخر. اختر رمزًا مختلفًا.':message.includes('D1_')?'تعذّر حفظ البيانات. حاول مجددًا.':message||'تعذّر إتمام الطلب.'},400);}}
