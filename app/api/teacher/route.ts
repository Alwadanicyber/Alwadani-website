import {teacherAccess} from '@/lib/teacher';
import {listCourses,validateCourse,builtInCourse} from '@/lib/courses';
import {COURSE_TRASHED} from '@/lib/course-types';
import {database} from '@/lib/database';
export const dynamic='force-dynamic';
const reply=(d:unknown,s=200)=>Response.json(d,{status:s,headers:{'Cache-Control':'no-store'}});
const validId=(id:unknown):id is string=>typeof id==='string'&&(!!builtInCourse(id)||/^[a-f0-9-]{36}$/.test(id));
async function courseLists(){
  const all=await listCourses(true,true);
  return {courses:all.filter(c=>c.published!==COURSE_TRASHED),deletedCourses:all.filter(c=>c.published===COURSE_TRASHED)};
}
async function mutationAccess(req:Request){
  if(!await teacherAccess())return reply({error:'غير مصرح بإدارة الدروس.'},403);
  if(req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'طلب غير صالح.'},403);
  return null;
}
export async function GET(){
  if(!await teacherAccess())return reply({error:'هذه الصفحة مخصصة لمالك الموقع.'},403);
  try{return reply(await courseLists());}catch(e){console.error(e);return reply({error:'تعذّر تحميل دروسك.'},503);}
}
export async function POST(req:Request){
  const denied=await mutationAccess(req);if(denied)return denied;
  try{
    const text=await req.text();if(text.length>300000)return reply({error:'محتوى الدرس كبير جدًا.'},400);
    const body=JSON.parse(text),c=validateCourse(body),id=body.id===undefined?crypto.randomUUID():body.id;
    if(!validId(id))return reply({error:'معرف درس غير صالح.'},400);
    const saved=await database().prepare('INSERT INTO courses(id,title,description,definition,published,updated,grade) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,description=excluded.description,definition=excluded.definition,published=excluded.published,updated=excluded.updated,grade=excluded.grade WHERE courses.published<>? RETURNING id').bind(id,c.title,c.description,JSON.stringify(c.definition),c.published,new Date().toISOString(),c.grade||'general',COURSE_TRASHED).first();
    if(!saved)return reply({error:'الدرس في المحذوفات. استعده قبل تعديله أو نشره.'},409);
    return reply({id,...await courseLists()});
  }catch(e){console.error(e);return reply({error:e instanceof Error?e.message:'تعذّر حفظ الدرس.'},400);}
}
async function readCourseRequest(req:Request){
  const text=await req.text();
  if(text.length>4096)throw new Error('طلب كبير جدًا.');
  const body=JSON.parse(text);
  if(!validId(body?.id))throw new Error('معرف درس غير صالح.');
  return body as {id:string;action?:string};
}
export async function DELETE(req:Request){
  const denied=await mutationAccess(req);if(denied)return denied;
  let body;try{body=await readCourseRequest(req);}catch{return reply({error:'راجع معرف الدرس وطلب الحذف.'},400);}
  try{
    const db=database(),updated=new Date().toISOString();
    // Store a tombstone for the built-in lesson too, so its fallback never reappears.
    // Existing content and all student records are retained; repeated deletion is safe.
    const source=builtInCourse(body.id);
    if(source){
      await db.prepare('INSERT INTO courses(id,title,description,definition,published,updated,grade) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET published=excluded.published,updated=excluded.updated').bind(body.id,source.title,source.description,JSON.stringify(source.definition),COURSE_TRASHED,updated,source.grade||'general').run();
    }else{
      const changed=await db.prepare('UPDATE courses SET published=?,updated=? WHERE id=? RETURNING id').bind(COURSE_TRASHED,updated,body.id).first();
      if(!changed)return reply({error:'الدرس غير موجود.'},404);
    }
    return reply(await courseLists());
  }catch(e){console.error(e);return reply({error:'تعذّر حذف الدرس. حاول مجددًا.'},503);}
}
export async function PATCH(req:Request){
  const denied=await mutationAccess(req);if(denied)return denied;
  let body;try{body=await readCourseRequest(req);}catch{return reply({error:'راجع معرف الدرس وطلب الاستعادة.'},400);}
  if(body.action!=='restore')return reply({error:'طلب غير صالح.'},400);
  try{
    const changed=await database().prepare('UPDATE courses SET published=0,updated=? WHERE id=? AND published=? RETURNING id').bind(new Date().toISOString(),body.id,COURSE_TRASHED).first();
    if(!changed)return reply({error:'الدرس غير موجود في المحذوفات.'},404);
    return reply(await courseLists());
  }catch(e){console.error(e);return reply({error:'تعذّرت استعادة الدرس. حاول مجددًا.'},503);}
}
