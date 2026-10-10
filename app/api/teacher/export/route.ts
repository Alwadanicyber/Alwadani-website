import {teacherAccess} from '@/lib/teacher';
import {listCourses} from '@/lib/courses';
export const dynamic='force-dynamic';
export async function GET(){
  if(!await teacherAccess())return Response.json({error:'غير مصرح بتنزيل الدروس.'},{status:403,headers:{'Cache-Control':'no-store'}});
  try{
    const courses=(await listCourses(true)).map(({id,title,description,grade,studentGender,published,definition,updated})=>({id,title,description,grade:grade||'general',studentGender:studentGender||definition.studentGender||'male',published,definition,updated}));
    return new Response(JSON.stringify({format:'alwadani-lessons',version:1,exportedAt:new Date().toISOString(),courses},null,2),{headers:{'Content-Type':'application/json; charset=utf-8','Content-Disposition':'attachment; filename="alwadani-lessons.json"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }catch(e){console.error(e);return Response.json({error:'تعذر تنزيل الدروس. حاول مجددًا.'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
