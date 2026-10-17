import {env} from 'cloudflare:workers';
import {teacherAccess} from '@/lib/teacher';
import {listCourses} from '@/lib/courses';
import {assistantSettings,assistantUsage,saveAssistantSettings} from '@/lib/assistant-store';
import {validateAssistantSettings,ASSISTANT_MODEL,type AssistantSettings} from '@/lib/assistant-core';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
async function courseOptions(){return (await listCourses(true)).map(c=>({id:c.id,title:c.title,grade:c.grade||'general',published:c.published===1}));}
export async function GET(){
 if(!await teacherAccess())return reply({error:'هذه الصفحة مخصصة لمالك الموقع.'},403);
 try{const [settings,used,courses]=await Promise.all([assistantSettings(),assistantUsage(),courseOptions()]),ids=new Set(courses.map(c=>c.id));return reply({settings:{...settings,courseIds:settings.courseIds.filter(id=>ids.has(id))},courses,used,available:!!env.AI,model:ASSISTANT_MODEL});}
 catch{return reply({error:'تعذّر تحميل إعدادات المساعد.'},503);}
}
export async function PUT(req:Request){
 if(!await teacherAccess()||req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'طلب غير مصرح به.'},403);
 let body:unknown;try{const text=await req.text();if(text.length>64000)throw new Error();body=JSON.parse(text);if(!body||typeof body!=='object'||Array.isArray(body))throw new Error();}
 catch{return reply({error:'راجع إعدادات المساعد واختيار الدروس.'},400);}
 try{
  const [current,courses]=await Promise.all([assistantSettings(),courseOptions()]);let settings:AssistantSettings;
  try{settings=validateAssistantSettings({...current,...body});const ids=new Set(courses.map(c=>c.id));if(settings.courseIds.some(id=>!ids.has(id)))throw new Error('أحد الدروس لم يعد متاحًا. حدّث القائمة ثم اختر الدروس مجددًا.');}
  catch(e){return reply({error:(e as Error).message},400);}
  return reply({settings:await saveAssistantSettings(settings),courses,used:await assistantUsage(),available:!!env.AI,model:ASSISTANT_MODEL});
 }catch{return reply({error:'تعذّر حفظ إعدادات المساعد.'},503);}
}
