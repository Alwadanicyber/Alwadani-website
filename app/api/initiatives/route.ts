import {initiativesReady,listInitiatives,initiativeProgress,initiativeShieldPosts,initiativeReply as reply} from '@/lib/initiatives';
import {initiativeBody,initiativeId,submission,type InitiativePost} from '@/lib/initiatives-core';
import {tokenHash} from '@/lib/teacher';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{const initiatives=await listInitiatives(),id=new URL(req.url).searchParams.get('id');if(!id)return reply({initiatives});if(!initiativeId(id)||!initiatives.some(i=>i.id===id))return reply({error:'المبادرة غير موجودة.'},404);const posts=await (await initiativesReady()).prepare("SELECT id,initiative_id,name,kind,text,created FROM national_initiative_posts WHERE initiative_id=? AND status='approved' ORDER BY created DESC,id DESC LIMIT 60").bind(id).all<InitiativePost>();return reply({initiatives,initiative:initiatives.find(i=>i.id===id),posts:posts.results,shieldPosts:await initiativeShieldPosts(id)});}catch{return reply({error:'تعذّر تحميل المبادرات. حاول مجددًا.'},503);}}
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'افتح المشاركة من الموقع نفسه.'},403);
 let post,body;try{body=await initiativeBody(req);if(body.action==='prayer'||body.action==='survey'){if(!initiativeId(body.initiativeId)||typeof body.id!=='string'||!/^[a-f0-9-]{36}$/.test(body.id))throw new Error('طلب غير صالح.');post={initiativeId:body.initiativeId};}else post=submission(body);}catch(e){return reply({error:(e as Error).message},400);}
 try{const db=await initiativesReady(),now=Date.now(),bucket=await tokenHash('initiative:'+post.initiativeId+':'+String(body.action||'post')+':'+(req.headers.get('cf-connecting-ip')||'local'));
 const limit=await db.prepare('INSERT INTO national_initiative_limits(bucket,count,expires) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN expires<=? THEN 1 ELSE count+1 END,expires=CASE WHEN expires<=? THEN ? ELSE expires END RETURNING count').bind(bucket,now+3600000,now,now,now+3600000).first<{count:number}>();
 if(!limit||limit.count>120)return reply({error:'وصلت المشاركات من هذه الشبكة للحد المؤقت. حاول بعد ساعة.'},429);
 if(body.action==='prayer'||body.action==='survey'){
  const initiative=await db.prepare('SELECT open FROM national_initiatives WHERE id=?').bind(post.initiativeId).first<{open:number}>();if(!initiative?.open)return reply({error:'المشاركة مغلقة حاليًا.'},409);
  if(body.action==='prayer'){await db.prepare('INSERT OR IGNORE INTO national_initiative_prayers(id,initiative_id) VALUES(?,?)').bind(body.id,post.initiativeId).run();const n=await db.prepare('SELECT COUNT(*) n FROM national_initiative_prayers WHERE initiative_id=?').bind(post.initiativeId).first<{n:number}>();return reply({ok:true,dua:n?.n||0});}
  if(!Array.isArray(body.answers)||body.answers.length!==3||body.answers.some(v=>!Number.isInteger(v)||v<0||v>2)||!Number.isInteger(body.rating)||Number(body.rating)<1||Number(body.rating)>5)return reply({error:'أكمل الأسئلة الثلاثة وتقييم المبادرة.'},400);
  const score=body.answers.reduce((n:number,v:number,i:number)=>n+(v===[0,1,0][i]?1:0),0);await db.prepare('INSERT OR IGNORE INTO national_initiative_surveys(id,initiative_id,answers,rating,score) VALUES(?,?,?,?,?)').bind(body.id,post.initiativeId,JSON.stringify(body.answers),body.rating,score).run();return reply({ok:true,score});
 }
 if(!('id' in post))return reply({error:'طلب غير صالح.'},400);
 const existing=await db.prepare('SELECT id FROM national_initiative_posts WHERE id=? AND initiative_id=?').bind(post.id,post.initiativeId).first();if(existing)return reply({ok:true,initiative:await initiativeProgress(post.initiativeId),shieldPosts:await initiativeShieldPosts(post.initiativeId)});
 const result=await db.prepare("INSERT OR IGNORE INTO national_initiative_posts(id,initiative_id,name,class_name,kind,text,image,audio,status,created) SELECT ?,?,?,?,?,?,?,?,'pending',? FROM national_initiatives WHERE id=? AND open=1 AND (SELECT COUNT(*) FROM national_initiative_posts WHERE initiative_id=?)<1000").bind(post.id,post.initiativeId,post.name,post.className,post.kind,post.text,post.image,post.audio,now,post.initiativeId,post.initiativeId).run();
 if(result.meta.changes!==1)return reply({error:'المشاركة مغلقة حاليًا أو وصلت المبادرة للحد الأقصى.'},409);
 await db.prepare('DELETE FROM national_initiative_limits WHERE expires<?').bind(now).run();return reply({ok:true,initiative:await initiativeProgress(post.initiativeId),shieldPosts:await initiativeShieldPosts(post.initiativeId)},201);
 }catch{return reply({error:'تعذّر حفظ المشاركة. لم يتم تأكيد إرسالها؛ حاول مجددًا.'},503);}
}
