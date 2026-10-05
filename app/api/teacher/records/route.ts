import {teacherAccess} from '@/lib/teacher';
import {createRecord,deleteRecord,findRecord,listRecords,updateRecord} from '@/lib/record-store';
import {validateRecord,validRecordId} from '@/lib/records';
export const dynamic='force-dynamic';
const reply=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(req:Request){
  if(!await teacherAccess())return reply({error:'الكشوف خاصة بالمعلم.'},403);
  try{
    const id=new URL(req.url).searchParams.get('id');
    if(id!==null){if(!validRecordId(id))return reply({error:'معرف الكشف غير صالح.'},400);const record=await findRecord(id);return record?reply({record}):reply({error:'الكشف غير موجود.'},404);}
    return reply({records:await listRecords()});
  }catch(error){console.error(error);return reply({error:'تعذّر تحميل الكشوف. حاول مجددًا.'},503);}
}
async function save(req:Request,edit:boolean){
  if(!await teacherAccess())return reply({error:'غير مصرح بإدارة الكشوف.'},403);
  if(req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'طلب غير صالح.'},403);
  let body,content;
  try{const raw=await req.text();if(raw.length>350000)return reply({error:'حجم الكشف كبير جدًا.'},400);body=JSON.parse(raw);content=validateRecord(body);if(edit&&(!validRecordId(body.id)||!Number.isSafeInteger(body.version)||body.version<1))throw new Error('راجع معرف الكشف وإصداره.');}
  catch(error){return reply({error:error instanceof Error?error.message:'بيانات الكشف غير صالحة.'},400);}
  try{
    if(!edit)return reply({record:await createRecord(content)},201);
    const record=await updateRecord(body.id,body.version,content);
    if(!record)return reply({error:'تغيّر الكشف من جلسة أخرى. احفظ تعديلاتك كنسخة جديدة أو افتح النسخة المحفوظة.',conflict:true},409);
    return reply({record});
  }catch(error){console.error(error);return reply({error:'تعذّر حفظ الكشف. تعديلاتك ما زالت ظاهرة؛ أعد محاولة الحفظ.'},503);}
}
export async function POST(req:Request){return save(req,false);}
export async function PUT(req:Request){return save(req,true);}
export async function DELETE(req:Request){
  if(!await teacherAccess())return reply({error:'غير مصرح بحذف الكشوف.'},403);
  if(req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'طلب غير صالح.'},403);
  let body;try{const raw=await req.text();if(raw.length>1000)throw new Error();body=JSON.parse(raw);if(!validRecordId(body.id)||!Number.isSafeInteger(body.version)||body.version<1)throw new Error();}catch{return reply({error:'راجع الكشف المطلوب حذفه.'},400);}
  try{if(!await deleteRecord(body.id,body.version))return reply({error:'تغيّر الكشف أو حُذف من جلسة أخرى. حدّث القائمة قبل المحاولة.'},409);return reply({deleted:true});}catch{return reply({error:'تعذّر حذف الكشف. حاول مجددًا.'},503);}
}
