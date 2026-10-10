import {teacherAccess} from '@/lib/teacher';
import {getCourse} from '@/lib/courses';
import {database} from '@/lib/database';
import {ensureClassroomResults,classroomResults} from '@/lib/classroom-results';

export const dynamic='force-dynamic';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const validId=(value:unknown):value is string=>typeof value==='string'&&/^[a-zA-Z0-9_-]{1,128}$/.test(value);

async function access(req:Request,mutation=false){
  if(!await teacherAccess())return reply({error:'هذه الصفحة مخصصة لمالك الموقع.'},403);
  if(mutation&&req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'طلب غير صالح.'},403);
  return null;
}
async function participants(courseId:string){
  const course=await getCourse(courseId,true);
  if(!course)return reply({error:'الدرس غير موجود أو في المحذوفات.'},404);
  await ensureClassroomResults();
  const results=await classroomResults(course,undefined,true);
  return reply({course:course.id,participants:results.participants});
}
export async function GET(req:Request){
  const denied=await access(req);if(denied)return denied;
  const course=new URL(req.url).searchParams.get('course');
  if(!validId(course))return reply({error:'اختر درسًا صحيحًا.'},400);
  try{return await participants(course);}catch(e){console.error(e);return reply({error:'تعذّر تحميل المشاركين. حاول مجددًا.'},503);}
}
async function mutate(req:Request,restore:boolean){
  const denied=await access(req,true);if(denied)return denied;
  let body:{course:string;id:string;action?:string};
  try{
    const text=await req.text();if(text.length>4096)throw new Error();
    body=JSON.parse(text);
    if(!validId(body?.course)||!validId(body?.id)||restore&&body.action!=='restore')throw new Error();
  }catch{return reply({error:'راجع الدرس والمشاركة المطلوبة.'},400);}
  try{
    if(!await getCourse(body.course,true))return reply({error:'الدرس غير موجود أو في المحذوفات.'},404);
    await ensureClassroomResults();
    const db=database(),student=await db.prepare('SELECT id FROM students WHERE id=? AND course=?').bind(body.id,body.course).first();
    if(!student)return reply({error:'المشاركة غير موجودة في هذا الدرس.'},404);
    if(restore){
      await db.prepare('DELETE FROM student_moderation WHERE student=?').bind(body.id).run();
    }else{
      // Keep the attempts and certificate recoverable; only the public participation is removed.
      await db.prepare('INSERT OR IGNORE INTO student_moderation(student,removed) VALUES(?,?)').bind(body.id,new Date().toISOString()).run();
    }
    return await participants(body.course);
  }catch(e){console.error(e);return reply({error:restore?'تعذّرت استعادة المشاركة. حاول مجددًا.':'تعذّر حذف المشاركة. حاول مجددًا.'},503);}
}
export const DELETE=(req:Request)=>mutate(req,false);
export const PATCH=(req:Request)=>mutate(req,true);
