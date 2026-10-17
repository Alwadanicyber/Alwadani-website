import {env} from 'cloudflare:workers';
import {getCourse} from '@/lib/courses';
import {ASSISTANT_MODEL,ASSISTANT_MAX_TOKENS,validateAssistantInput,buildAssistantMessages,assistantReply,assistantFailure} from '@/lib/assistant-core';
import {assistantSettings,reserveAssistant,AssistantLimit} from '@/lib/assistant-store';
import {assistantSession,assistantToken,assistantBuckets} from '@/lib/assistant-session';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200,headers:Record<string,string>={})=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store',...headers}});
export async function GET(req:Request){try{const course=new URL(req.url).searchParams.get('course');if(!course||!await getCourse(course))return reply({error:'الدرس غير متاح.'},404);const settings=await assistantSettings(),session=assistantSession(req);return reply({enabled:settings.enabled,available:!!env.AI,visitorLimit:settings.visitorLimit},200,session.cookie?{'Set-Cookie':session.cookie}:{});}catch{return reply({error:'تعذّر تحميل المساعد. حاول مجددًا.'},503);}}
async function boundedJson(req:Request){const reader=req.body?.getReader();if(!reader)throw new Error('EMPTY');const decoder=new TextDecoder();let text='',length=0;try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>32000){await reader.cancel();throw new Error('TOO_LARGE');}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();return JSON.parse(text);}finally{reader.releaseLock();}}
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'طلب غير صالح.'},403);
 let input;try{input=validateAssistantInput(await boundedJson(req));}catch(e){return reply({error:e instanceof Error&&!(e instanceof SyntaxError)&&/[\u0600-\u06ff]/.test(e.message)?e.message:'راجع الرسالة أو اختصرها ثم أعد الإرسال.'},400);}
 try{
  const course=await getCourse(input.course);if(!course)return reply({error:'الدرس غير متاح.'},404);
  const settings=await assistantSettings();if(!settings.enabled)return reply({error:'أوقف المعلم المساعد مؤقتًا. يمكنك متابعة الشرح والتدريبات.'},503);
  if(!env.AI)return reply({error:'المساعد قيد التفعيل من المعلم. الشرح والتصحيح داخل الدرس متاحان.'},503);
  const token=assistantToken(req);if(!token)return reply({error:'افتح المساعد مجددًا لبدء جلسة المحادثة.'},401);
  let messages;try{messages=buildAssistantMessages(course,input);}catch(e){return reply({error:(e as Error).message},400);}
  const buckets=await assistantBuckets(token,req.headers.get('cf-connecting-ip')||'local',env.TEACHER_SETUP_KEY||'local-only');
  await reserveAssistant({...buckets,requestId:input.requestId,settings});
  const options={messages,max_completion_tokens:ASSISTANT_MAX_TOKENS,temperature:0.3,store:false,stream:false,chat_template_kwargs:{enable_thinking:false}};
  let timeout:ReturnType<typeof setTimeout>|undefined;
  try{const raw=await Promise.race([env.AI.run(ASSISTANT_MODEL,options),new Promise<never>((_,reject)=>{timeout=setTimeout(()=>reject(new Error('TIMEOUT')),45000);})]);return reply({message:assistantReply(raw)});}finally{if(timeout)clearTimeout(timeout);}
 }catch(e){if(e instanceof AssistantLimit)return reply({error:e.message},e.status,{'Retry-After':String(e.retryAfter)});const fault=assistantFailure(e);return reply({error:fault.message,code:fault.code},503);}
}
