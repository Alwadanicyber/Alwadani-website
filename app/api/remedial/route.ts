import {initiativeBody} from '@/lib/initiatives-core';
import {tokenHash} from '@/lib/teacher';
import {remedialReady,remedialIdentity,remedialLogin,remedialCookie,remedialView,studentChapterAction} from '@/lib/remedial-store';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200,cookie?:string)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff',...(cookie?{'Set-Cookie':cookie}:{})}});
export async function GET(req:Request){try{const student=await remedialIdentity(req);return student?reply(await remedialView(student)):reply({loginRequired:true},401);}catch{return reply({error:'تعذّر تحميل خطتك. حاول مجددًا.'},503);}}
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'طلب غير مصرح.'},403);
 try{const body=await initiativeBody(req);
  if(body.action==='login'){const {token,assignment}=await remedialLogin(req,body.code);return reply(await remedialView(assignment),200,remedialCookie(token));}
  if(body.action==='logout'){const token=req.headers.get('cookie')?.match(/(?:^|;\s*)__Host-teachcraft_remedial=([a-f0-9]{64})(?:;|$)/)?.[1];if(token){const db=await remedialReady();await db.prepare('DELETE FROM remedial_sessions WHERE token_hash=?').bind(await tokenHash(token)).run();}return reply({ok:true},200,remedialCookie('',true));}
  const row=await remedialIdentity(req);if(!row)return reply({loginRequired:true,error:'أدخل رمز الوصول أولًا.'},401);
  const result=await studentChapterAction(row,body),fresh=await remedialIdentity(req);return reply({...await remedialView(fresh!),...result});
 }catch(error){const message=error instanceof Error?error.message:'تعذّر إتمام الطلب.';return reply({error:message.includes('D1_')?'تعذّر حفظ تقدمك. أعد المحاولة.':message},message.includes('محاولات كثيرة')?429:400);}
}
