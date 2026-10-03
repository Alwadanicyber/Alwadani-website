import {teacherAccess} from '@/lib/teacher';
import {listCourses,validateCourse} from '@/lib/courses';
import {database} from '@/lib/database';
export const dynamic='force-dynamic';
const reply=(d:unknown,s=200)=>Response.json(d,{status:s,headers:{'Cache-Control':'no-store'}});
export async function GET(){if(!await teacherAccess())return reply({error:'هذه الصفحة مخصصة لمالك الموقع.'},403);try{return reply({courses:await listCourses(true)});}catch(e){console.error(e);return reply({error:'تعذّر تحميل دروسك.'},503);}}
export async function POST(req:Request){if(!await teacherAccess())return reply({error:'غير مصرح بإدارة الدروس.'},403);if(req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'طلب غير صالح.'},403);try{const text=await req.text();if(text.length>300000)return reply({error:'محتوى الدرس كبير جدًا.'},400);const body=JSON.parse(text);const c=validateCourse(body);const id=body.id===undefined?crypto.randomUUID():body.id;if(typeof id!=='string'||!(id==='life-stories'||/^[a-f0-9-]{36}$/.test(id)))return reply({error:'معرف درس غير صالح.'},400);
await database().prepare('INSERT INTO courses(id,title,description,definition,published,updated,grade) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,description=excluded.description,definition=excluded.definition,published=excluded.published,updated=excluded.updated,grade=excluded.grade').bind(id,c.title,c.description,JSON.stringify(c.definition),c.published,new Date().toISOString(),c.grade||'general').run();return reply({id,courses:await listCourses(true)});
}catch(e){console.error(e);return reply({error:e instanceof Error?e.message:'تعذّر حفظ الدرس.'},400);}}
