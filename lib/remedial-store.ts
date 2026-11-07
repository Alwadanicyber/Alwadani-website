import {database} from './database';
import {randomToken,tokenHash,setupKey} from './teacher';
import {normalizeAccessCode,type RemedialPlan,nextChapterTime,validateRemedialPlan,gradeRemedialExam} from './remedial-model';
const DAY=86400000;
export type PlanRow={id:string;title:string;description:string;definition:string;chapter_count:number;published:number;version:number;created:number;updated:number};
export type AssignmentRow={id:string;plan_id:string;student_name:string;code_hash:string;code_cipher:string;code_hint:string;active:number;snapshot:string|null;plan_version:number;chapter_count:number;next_index:number;unlocked_at:number;ready_for_exam:number;override_index:number;version:number;run:number;last_score:number|null;last_total:number|null;created:number;updated:number};
const schema=[
 'CREATE TABLE IF NOT EXISTS remedial_plans(id TEXT PRIMARY KEY,title TEXT NOT NULL,description TEXT NOT NULL,definition TEXT NOT NULL,chapter_count INTEGER NOT NULL,published INTEGER NOT NULL DEFAULT 0,version INTEGER NOT NULL DEFAULT 1,created INTEGER NOT NULL,updated INTEGER NOT NULL)',
 'CREATE TABLE IF NOT EXISTS remedial_assignments(id TEXT PRIMARY KEY,plan_id TEXT NOT NULL REFERENCES remedial_plans(id),student_name TEXT NOT NULL,code_hash TEXT NOT NULL UNIQUE,code_cipher TEXT NOT NULL,code_hint TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1,snapshot TEXT,plan_version INTEGER NOT NULL DEFAULT 0,chapter_count INTEGER NOT NULL DEFAULT 0,next_index INTEGER NOT NULL DEFAULT 0,unlocked_at INTEGER NOT NULL DEFAULT 0,ready_for_exam INTEGER NOT NULL DEFAULT 0,override_index INTEGER NOT NULL DEFAULT -1,version INTEGER NOT NULL DEFAULT 1,run INTEGER NOT NULL DEFAULT 1,last_score INTEGER,last_total INTEGER,created INTEGER NOT NULL,updated INTEGER NOT NULL)',
 'CREATE INDEX IF NOT EXISTS remedial_assignments_plan ON remedial_assignments(plan_id,updated)',
 'CREATE TABLE IF NOT EXISTS remedial_sessions(token_hash TEXT PRIMARY KEY,assignment_id TEXT NOT NULL REFERENCES remedial_assignments(id),expires INTEGER NOT NULL)',
 'CREATE TABLE IF NOT EXISTS remedial_attempts(id TEXT PRIMARY KEY,assignment_id TEXT NOT NULL REFERENCES remedial_assignments(id),run INTEGER NOT NULL,chapter_id TEXT NOT NULL,chapter_title TEXT NOT NULL,score INTEGER NOT NULL,total INTEGER NOT NULL,passed INTEGER NOT NULL,detail TEXT NOT NULL,submitted INTEGER NOT NULL)',
 'CREATE INDEX IF NOT EXISTS remedial_attempts_student ON remedial_attempts(assignment_id,submitted)',
 'CREATE TABLE IF NOT EXISTS remedial_login_limits(bucket TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL)'
];
const initialized=new WeakMap<object,Promise<void>>();
export async function remedialReady(){const db=database();let p=initialized.get(db);if(!p){p=db.batch(schema.map(s=>db.prepare(s))).then(()=>{}).catch(e=>{initialized.delete(db);throw e;});initialized.set(db,p);}await p;return db;}
async function cipherKey(){const secret=setupKey();if(!secret)throw new Error('إعداد المعلّم غير متاح.');return crypto.subtle.importKey('raw',await crypto.subtle.digest('SHA-256',new TextEncoder().encode('TeachCraft remedial '+secret)),{name:'AES-GCM'},false,['encrypt','decrypt']);}
export async function encryptCode(code:string){const iv=crypto.getRandomValues(new Uint8Array(12)),data=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await cipherKey(),new TextEncoder().encode(code)));return btoa(String.fromCharCode(...iv,...data));}
export async function decryptCode(cipher:string){const bytes=Uint8Array.from(atob(cipher),c=>c.charCodeAt(0));return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12)},await cipherKey(),bytes.slice(12)));}
const cookieName='__Host-teachcraft_remedial';
export const remedialCookie=(token:string,remove=false)=>`${cookieName}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${remove?0:30*86400}`;
export async function remedialIdentity(req:Request){const raw=req.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith(cookieName+'='))?.slice(cookieName.length+1);if(!raw||!/^[a-f0-9]{64}$/.test(raw))return null;const db=await remedialReady();return db.prepare('SELECT a.* FROM remedial_sessions s JOIN remedial_assignments a ON a.id=s.assignment_id WHERE s.token_hash=? AND s.expires>?').bind(await tokenHash(raw),Date.now()).first<AssignmentRow>();}
export async function remedialLogin(req:Request,value:unknown){
 const db=await remedialReady(),now=Date.now(),bucket=await tokenHash('remedial:'+ (req.headers.get('cf-connecting-ip')||'local'));
 const limit=await db.prepare('SELECT count,expires FROM remedial_login_limits WHERE bucket=?').bind(bucket).first<{count:number;expires:number}>();if(limit&&limit.expires>now&&limit.count>=20)throw new Error('محاولات كثيرة. انتظر ١٥ دقيقة ثم حاول مجددًا.');
 let code='';try{code=normalizeAccessCode(value);}catch{}
 const assignment=code?await db.prepare('SELECT * FROM remedial_assignments WHERE code_hash=?').bind(await tokenHash(code)).first<AssignmentRow>():null;
 if(!assignment||!assignment.active){await db.prepare('INSERT INTO remedial_login_limits(bucket,count,expires) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN expires<=? THEN 1 ELSE count+1 END,expires=CASE WHEN expires<=? THEN ? ELSE expires END').bind(bucket,now+900000,now,now,now+900000).run();throw new Error('رمز الوصول غير صحيح أو موقوف. راجع معلّمك.');}
 const token=randomToken();await db.batch([db.prepare('DELETE FROM remedial_sessions WHERE expires<=?').bind(now),db.prepare('INSERT INTO remedial_sessions(token_hash,assignment_id,expires) VALUES(?,?,?)').bind(await tokenHash(token),assignment.id,now+30*DAY)]);return {token,assignment};
}
export async function initializeSnapshot(row:AssignmentRow,plan:PlanRow){const db=await remedialReady();if(!row.snapshot&&row.active&&plan.published){await db.prepare('UPDATE remedial_assignments SET snapshot=?,plan_version=?,chapter_count=?,version=version+1,updated=? WHERE id=? AND snapshot IS NULL AND active=1').bind(plan.definition,plan.version,plan.chapter_count,Date.now(),row.id).run();return (await db.prepare('SELECT * FROM remedial_assignments WHERE id=?').bind(row.id).first<AssignmentRow>())!;}return row;}
export async function remedialView(initial:AssignmentRow){
 const db=await remedialReady(),plan=await db.prepare('SELECT * FROM remedial_plans WHERE id=?').bind(initial.plan_id).first<PlanRow>();if(!plan)throw new Error('الخطة غير متاحة.');
 if(!initial.active||!plan.published)return {studentName:initial.student_name,planTitle:plan.title,paused:true,message:!initial.active?'أوقف المعلم الوصول مؤقتًا.':'الخطة قيد الإعداد أو موقوفة مؤقتًا.',serverNow:Date.now()};
 const row=await initializeSnapshot(initial,plan),definition=validateRemedialPlan(JSON.parse(row.snapshot!),true),now=Date.now(),completed=row.next_index>=definition.chapters.length,locked=!completed&&row.override_index!==row.next_index&&row.unlocked_at>now;
 const attempts=(await db.prepare('SELECT chapter_id,MAX(CASE WHEN passed=1 THEN score END) AS score,MAX(total) AS total FROM remedial_attempts WHERE assignment_id=? AND run=? GROUP BY chapter_id').bind(row.id,row.run).all<{chapter_id:string;score:number|null;total:number}>()).results;
 const current=!completed&&!locked?definition.chapters[row.next_index]:null;
 return {assignmentId:row.id,studentName:row.student_name,planTitle:definition.title,description:definition.description,version:row.version,completed,paused:false,locked,unlockAt:locked?row.unlocked_at:null,serverNow:now,passPercent:definition.passPercent,delayHours:definition.delayHours,dailyLimit:definition.dailyLimit,currentIndex:row.next_index,readyForExam:!!row.ready_for_exam,chapters:definition.chapters.map((c,i)=>({id:c.id,title:c.title,status:i<row.next_index?'passed':i===row.next_index?(locked?'locked':'current'):'locked',score:attempts.find(a=>a.chapter_id===c.id)?.score??null,total:c.questions.length})),chapter:current?{id:current.id,title:current.title,body:current.body,questions:row.ready_for_exam?current.questions.map(q=>({id:q.id,prompt:q.prompt,choices:q.choices})):[]}:null};
}
export async function studentChapterAction(row:AssignmentRow,body:Record<string,unknown>){
 const db=await remedialReady(),plan=await db.prepare('SELECT * FROM remedial_plans WHERE id=?').bind(row.plan_id).first<PlanRow>();if(!plan?.published||!row.active||!row.snapshot)throw new Error('الخطة غير متاحة حاليًا.');
 if(body.version!==row.version)throw new Error('تغيّر التقدم. حدّث الصفحة ثم حاول مجددًا.');
 const definition=validateRemedialPlan(JSON.parse(row.snapshot),true),chapter=definition.chapters[row.next_index],now=Date.now();if(!chapter||body.chapterId!==chapter.id)throw new Error('هذا الفصل غير متاح.');if(row.override_index!==row.next_index&&row.unlocked_at>now)throw new Error('لم يحن موعد الفصل التالي بعد.');
 const condition='id=? AND version=? AND active=1 AND next_index=? AND EXISTS(SELECT 1 FROM remedial_plans p WHERE p.id=remedial_assignments.plan_id AND p.published=1)';
 if(body.action==='exam'){const result=await db.prepare(`UPDATE remedial_assignments SET ready_for_exam=1,version=version+1,updated=? WHERE ${condition}`).bind(now,row.id,row.version,row.next_index).run();if(!result.meta.changes)throw new Error('تغيّر التقدم. حدّث الصفحة.');return {};}
 if(body.action!=='submit'||!row.ready_for_exam)throw new Error('أكمل قراءة الفصل وافتح الاختبار أولًا.');
 const result=gradeRemedialExam(chapter,body.answers,definition.passPercent),unlock=result.passed?nextChapterTime(now,definition):row.unlocked_at;
 const changes=await db.batch([
  db.prepare(`INSERT INTO remedial_attempts(id,assignment_id,run,chapter_id,chapter_title,score,total,passed,detail,submitted) SELECT ?,?,?,?,?,?,?,?,?,? FROM remedial_assignments WHERE ${condition}`).bind(crypto.randomUUID(),row.id,row.run,chapter.id,chapter.title,result.score,result.total,result.passed?1:0,JSON.stringify(result.detail),now,row.id,row.version,row.next_index),
  db.prepare(`UPDATE remedial_assignments SET next_index=next_index+?,unlocked_at=?,ready_for_exam=?,override_index=?,last_score=?,last_total=?,version=version+1,updated=? WHERE ${condition}`).bind(result.passed?1:0,unlock,result.passed?0:1,result.passed?-1:row.override_index,result.score,result.total,now,row.id,row.version,row.next_index)
 ]);if(changes[0].meta.changes!==1||changes[1].meta.changes!==1)throw new Error('حُفظ تحديث آخر. حدّث الصفحة لمشاهدة تقدمك.');return {result};
}
