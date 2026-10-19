import {teacherAccess} from '@/lib/teacher';
import {builtInCourse,listCourses} from '@/lib/courses';
import {courseStudentAccess,validateStudentAccess} from '@/lib/student-access';
import {COURSE_TRASHED} from '@/lib/course-types';
import {database} from '@/lib/database';

export const dynamic='force-dynamic';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function PUT(req:Request){
 if(!await teacherAccess())return reply({error:'هذه الصفحة مخصصة لمالك الموقع.'},403);
 if(req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'طلب غير صالح.'},403);
 let course:string,mode:'single'|'shared';
 try{
  const raw=await req.text();if(raw.length>4096)throw new Error('طلب كبير جدًا.');
  const body=JSON.parse(raw);
  if(!body||typeof body.course!=='string'||!body.course||body.course.length>128)throw new Error('اختر درسًا أو جميع الدروس.');
  if(body.studentAccess===undefined)throw new Error('اختر طريقة استخدام المتصفح.');
  course=body.course;mode=validateStudentAccess(body.studentAccess,'shared');
 }catch(e){return reply({error:e instanceof Error?e.message:'راجع الإعدادات.'},400);}
 try{
  const courses=await listCourses(true),selected=course==='all'?courses:courses.filter(c=>c.id===course);
  if(!selected.length)return reply({error:'الدرس غير موجود أو في المحذوفات.'},404);
  const db=database(),updated=new Date().toISOString();
  // Change only the policy in the stored JSON. Never round-trip lesson content
  // through the editor validator or overwrite a concurrent content edit.
  const changes=selected.map(c=>{
   const source=builtInCourse(c.id);
   if(source)return db.prepare('INSERT INTO courses(id,title,description,definition,published,updated,grade) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET definition=json_set(courses.definition,\'$.studentAccess\',?),updated=excluded.updated WHERE courses.published<>? RETURNING id')
    .bind(c.id,source.title,source.description,JSON.stringify({...source.definition,studentAccess:mode}),source.published,updated,source.grade||'general',mode,COURSE_TRASHED);
   return db.prepare('UPDATE courses SET definition=json_set(definition,\'$.studentAccess\',?),updated=? WHERE id=? AND published<>? RETURNING id').bind(mode,updated,c.id,COURSE_TRASHED);
  });
  const results=await db.batch(changes),changed=results.reduce((n,r)=>n+r.results.length,0);
  if(!changed)return reply({error:'تغيّرت قائمة الدروس. حدّث الصفحة وحاول مجددًا.'},409);
  const latest=await listCourses(true);
  return reply({changed,courses:latest.map(c=>({...c,studentAccess:courseStudentAccess(c)}))});
 }catch(e){console.error(e);return reply({error:'تعذّر حفظ إعدادات استخدام الأجهزة. حاول مجددًا.'},503);}
}
