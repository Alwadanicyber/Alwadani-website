import {teacherAccess} from '@/lib/teacher';
import {getCourse} from '@/lib/courses';
import {getCompetition,saveCompetition} from '@/lib/course-competition';
import {parseCompetition} from '@/lib/competition';
import {getRankingMode,saveRankingMode} from '@/lib/course-ranking';
import {parseRankingChoice} from '@/lib/ranking-mode';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const validId=(id:unknown):id is string=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,128}$/.test(id);
export async function GET(req:Request){
  if(!await teacherAccess())return reply({error:'هذه الصفحة مخصصة لمالك الموقع.'},403);
  const course=new URL(req.url).searchParams.get('course');
  if(!validId(course))return reply({error:'اختر درسًا صحيحًا.'},400);
  try{
    if(!await getCourse(course,true))return reply({error:'الدرس غير موجود أو في المحذوفات.'},404);
    return reply({competition:await getCompetition(course),rankingMode:await getRankingMode(course)});
  }catch(e){console.error(e);return reply({error:'تعذّر تحميل إعدادات المنافسة.'},503);}
}
export async function PUT(req:Request){
  if(!await teacherAccess())return reply({error:'هذه الصفحة مخصصة لمالك الموقع.'},403);
  if(req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'طلب غير صالح.'},403);
  let body:Record<string,unknown>,settings,rankingChoice;
  try{const raw=await req.text();if(raw.length>4096)throw new Error('الإعلان طويل جدًا.');body=JSON.parse(raw);if(!validId(body.course))throw new Error('اختر درسًا صحيحًا.');if(body.action==='ranking')rankingChoice=parseRankingChoice(body.rankingMode);else settings=parseCompetition(body);}
  catch(e){return reply({error:e instanceof Error?e.message:'راجع إعدادات المنافسة.'},400);}
  try{
    const course=body.course as string;
    if(!await getCourse(course,true))return reply({error:'الدرس غير موجود أو في المحذوفات.'},404);
    if(rankingChoice)return reply({competition:await getCompetition(course),rankingMode:await saveRankingMode(course,rankingChoice)});
    return reply({competition:await saveCompetition(course,settings!),rankingMode:await getRankingMode(course)});
  }catch(e){console.error(e);return reply({error:'تعذّر حفظ إعدادات المنافسة. حاول مجددًا.'},503);}
}
