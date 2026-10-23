import {teacherAccess} from '@/lib/teacher';
import {initiativesReady,listInitiatives,initiativeReply as reply} from '@/lib/initiatives';
import {initiativeBody,initiativeSettings,initiativeId} from '@/lib/initiatives-core';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{if(!await teacherAccess())return reply({error:'سجّل دخول المالك أولًا.'},403);const initiatives=await listInitiatives(),url=new URL(req.url),id=url.searchParams.get('id')||'dir-alwatan',status=url.searchParams.get('status')||'pending';if(!initiativeId(id)||!['pending','approved','hidden'].includes(status))return reply({error:'اختيار غير صالح.'},400);const posts=await (await initiativesReady()).prepare('SELECT id,initiative_id,name,class_name,kind,text,status,created FROM national_initiative_posts WHERE initiative_id=? AND status=? ORDER BY created DESC,id DESC LIMIT 100').bind(id,status).all();const survey=await (await initiativesReady()).prepare('SELECT COUNT(*) count,AVG(rating) rating,AVG(score) score FROM national_initiative_surveys WHERE initiative_id=?').bind(id).first();return reply({initiatives,posts:posts.results,survey});}catch{return reply({error:'تعذّر تحميل الإدارة.'},503);}}
export async function POST(req:Request){
 try{if(!await teacherAccess()||req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'طلب غير مصرح به.'},403);}catch{return reply({error:'تعذّر التحقق من الدخول.'},503);}
 let body;try{body=await initiativeBody(req);}catch(e){return reply({error:(e as Error).message},400);}
 try{const db=await initiativesReady();if(body.action==='moderate'){
 if(typeof body.id!=='string'||!/^[a-f0-9-]{36}$/.test(body.id)||!['approved','hidden','pending'].includes(String(body.status)))return reply({error:'اختيار غير صالح.'},400);
 const result=await db.prepare('UPDATE national_initiative_posts SET status=? WHERE id=?').bind(body.status,body.id).run();if(!result.meta.changes)return reply({error:'المشاركة غير موجودة.'},404);
 }else if(body.action==='save'||body.action==='create'){
 let settings;try{const previous=body.action==='save'?(await listInitiatives()).find(i=>i.id===body.id):undefined;settings=initiativeSettings({...previous,...body});}catch(e){return reply({error:(e as Error).message},400);}
 const id=body.action==='create'?'initiative-'+crypto.randomUUID():body.id;if(!initiativeId(id))return reply({error:'معرّف غير صالح.'},400);
 const {title,description,school,goal,open}=settings;
 const identity=db.prepare('INSERT INTO national_initiative_identity(initiative_id,coordinator_name,coordinator_title,principal_name,principal_title,slogan) VALUES(?,?,?,?,?,?) ON CONFLICT(initiative_id) DO UPDATE SET coordinator_name=excluded.coordinator_name,coordinator_title=excluded.coordinator_title,principal_name=excluded.principal_name,principal_title=excluded.principal_title,slogan=excluded.slogan').bind(id,settings.coordinatorName,settings.coordinatorTitle,settings.principalName,settings.principalTitle,settings.slogan);
 if(body.action==='create')await db.batch([db.prepare('INSERT INTO national_initiatives(id,title,description,school,goal,open) VALUES(?,?,?,?,?,?)').bind(id,title,description,school,goal,open),identity]);else{if(!(await listInitiatives()).some(i=>i.id===id))return reply({error:'المبادرة غير موجودة.'},404);await db.batch([db.prepare('UPDATE national_initiatives SET title=?,description=?,school=?,goal=?,open=? WHERE id=?').bind(title,description,school,goal,open,id),identity]);}
 return reply({ok:true,id});
 }else return reply({error:'إجراء غير صالح.'},400);return reply({ok:true});
 }catch{return reply({error:'تعذّر حفظ التغيير.'},503);}
}
