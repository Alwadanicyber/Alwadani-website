import {env} from 'cloudflare:workers';
import {teacherAccess} from '@/lib/teacher';
import {assistantSettings,assistantUsage,saveAssistantSettings} from '@/lib/assistant-store';
import {validateAssistantSettings,ASSISTANT_MODEL} from '@/lib/assistant-core';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
export async function GET(){if(!await teacherAccess())return reply({error:'هذه الصفحة مخصصة لمالك الموقع.'},403);try{return reply({settings:await assistantSettings(),used:await assistantUsage(),available:!!env.AI,model:ASSISTANT_MODEL});}catch{return reply({error:'تعذّر تحميل إعدادات المساعد.'},503);}}
export async function PUT(req:Request){if(!await teacherAccess()||req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'طلب غير مصرح به.'},403);let settings;try{const text=await req.text();if(text.length>2000)throw new Error();settings=validateAssistantSettings(JSON.parse(text));}catch(e){return reply({error:e instanceof Error&&e.message?e.message:'راجع حدود المساعد.'},400);}try{return reply({settings:await saveAssistantSettings(settings),used:await assistantUsage(),available:!!env.AI,model:ASSISTANT_MODEL});}catch{return reply({error:'تعذّر حفظ إعدادات المساعد.'},503);}}
