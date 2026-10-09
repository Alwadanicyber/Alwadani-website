import {database} from '@/lib/database';
import {hashToken,cookieName,identity} from '@/lib/student-session';
import {getCourse,originalCourse,publicCourse} from '@/lib/courses';
import type {TeacherCourse} from '@/lib/course-types';
import {answerOrder} from '@/lib/answer-order';
import {CHORES_COURSE_ID} from '@/lib/chores-learning';
import {ensureClassroomResults,archiveAndRestart,classroomResults} from '@/lib/classroom-results';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200,headers:Record<string,string>={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});
const stableCourse=(c:TeacherCourse):TeacherCourse=>({id:c.id,title:c.title,description:c.description,published:1,definition:c.definition,updated:''});
async function context(req:Request,courseId:string){
 await ensureClassroomResults();const db=database(),latest=await getCourse(courseId);if(!latest)throw new Error('الدرس غير منشور أو غير موجود.');
 const id=await identity(req,courseId);
 const readStudent=()=>id?db.prepare('SELECT s.id,s.name,s.completed,s.snapshot,COALESCE(v.attempt,1) AS attempt FROM students s LEFT JOIN student_sessions v ON v.student=s.id WHERE s.id=? AND s.course=?').bind(id,courseId).first<any>():null;
 let student=await readStudent(),course:TeacherCourse=student?.snapshot?JSON.parse(student.snapshot):student&&courseId==='life-stories'?originalCourse:latest,migrated=false;
 if(student&&courseId===CHORES_COURSE_ID&&[4,7].includes(course.definition.lessons.length)&&latest.definition.lessons.length===3){
  await archiveAndRestart(student.id,student.attempt,stableCourse(latest),student.snapshot);student=await readStudent();course=JSON.parse(student.snapshot);migrated=true;
 }
 return {id,student,course:stableCourse(course),latest:stableCourse(latest),grade:latest.grade||'general',migrated};
}
async function snapshot(student:any,course:TeacherCourse,grade='general',migrated=false){
 const db=database(),id=student?.id;let answers:any[]=[],reads:any[]=[];
 if(id){const [a,r]=await Promise.all([db.prepare('SELECT question,choice,correct FROM answers WHERE student=? ORDER BY question').bind(id).all(),db.prepare('SELECT lesson FROM reads WHERE student=?').bind(id).all()]);answers=a.results;reads=r.results;}
 const visible=publicCourse(course),orders=new Map<number,number[]>();
 if(id)visible.questions=await Promise.all(visible.questions.map(async q=>{const order=await answerOrder(student.attempt>1?id+':attempt:'+student.attempt:id,course.id,q.id,q.options.length);orders.set(q.id,order);return {...q,options:order.map(i=>q.options[i])};}));
 const results=await classroomResults(course,id);
 return {student:student?{id:student.id,name:student.name,completed:student.completed,attempt:student.attempt||1}:null,course:{...visible,grade},answers:answers.map(a=>{const q=course.definition.questions.find(q=>q.id===a.question),order=orders.get(a.question);return {...a,choice:order?order.indexOf(a.choice):a.choice,answer:order&&q?order.indexOf(q.answer):q?.answer,reason:q?.reason,answerText:q?.options[q.answer]};}),reads:reads.map(r=>r.lesson),...results,...(migrated?{notice:'أصبح الدرس 3 مشاهد قصيرة. نتيجتك السابقة محفوظة، ويمكنك تحسينها في المحاولة الجديدة.'}:{})};
}
export async function GET(req:Request){try{const {student,course,grade,migrated}=await context(req,new URL(req.url).searchParams.get('course')||'life-stories');return reply(await snapshot(student,course,grade,migrated));}catch(e){console.error(e);return reply({error:'تعذّر تحميل الدرس والنتائج. حاول مجددًا.'},503);}}
export async function POST(req:Request){try{
 if(req.headers.get('origin')&&new URL(req.headers.get('origin')!).origin!==new URL(req.url).origin)return reply({error:'طلب غير صالح.'},403);
 const body=await req.json() as {course?:string;action?:string;name?:string;lesson:number;question:number;choice:number;attempt?:number};
 const courseId=body.course||'life-stories',db=database();let {id,student,course,latest,grade,migrated}=await context(req,courseId);
 if(body.action==='start'){
  const name=typeof body.name==='string'?body.name.trim():'';if(name.length<2||name.length>60||/[<>\x00-\x1f]/.test(name))return reply({error:'أدخل اسمًا من حرفين إلى ٦٠ حرفًا.'},400);
  if(student?.name===name)return reply(await snapshot(student,course,grade,migrated));
  course=latest;const token=crypto.randomUUID();id=await hashToken(token);const saved=JSON.stringify(course),now=new Date().toISOString();
  await db.batch([db.prepare('INSERT INTO students(id,name,created,course,snapshot) VALUES(?,?,?,?,?)').bind(id,name,now,courseId,saved),db.prepare('INSERT INTO student_sessions(student,attempt,started) VALUES(?,1,?)').bind(id,now)]);
  student={id,name,completed:null,snapshot:saved,attempt:1};return reply(await snapshot(student,course,grade),200,{'Set-Cookie':`${cookieName(courseId)}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${new URL(req.url).protocol==='https:'?'; Secure':''}`});
 }
 if(!id||!student)return reply({error:'أدخل اسمك أولًا لبدء التعلم.'},401);
 const attempt=student.attempt;
 if(body.attempt!==attempt&&!(body.attempt===undefined&&attempt===1))return reply({error:'تغيّرت المحاولة. أعد تحميل تقدمك قبل الإجابة.'},409);
 await db.prepare('INSERT OR IGNORE INTO student_sessions(student,attempt,started) SELECT id,1,created FROM students WHERE id=?').bind(id).run();
 const {questions,lessons}=course.definition;
 if(body.action==='retry'){
  await archiveAndRestart(id,attempt,latest,student.snapshot);const current=await context(req,courseId);return reply(await snapshot(current.student,current.course,current.grade));
 }else if(body.action==='read'){
  if(!Number.isInteger(body.lesson)||!lessons[body.lesson])return reply({error:'درس غير صالح.'},400);
  await db.prepare('INSERT OR IGNORE INTO reads(student,lesson) SELECT ?,? WHERE EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?)').bind(id,body.lesson,id,attempt).run();
 }else if(body.action==='answer'){
  const q=questions.find(q=>q.id===body.question);if(!q||!Number.isInteger(body.choice)||!q.options[body.choice])return reply({error:'إجابة غير صالحة.'},400);
  if(!await db.prepare('SELECT lesson FROM reads WHERE student=? AND lesson=?').bind(id,q.lesson).first())return reply({error:'أكمل مشاهدة شرح الدرس أولًا.'},400);
  const count=await db.prepare('SELECT COUNT(*) AS n FROM answers WHERE student=? AND question<?').bind(id,q.id).first<{n:number}>();if(count?.n!==questions.filter(x=>x.id<q.id).length)return reply({error:'أكمل الأسئلة بالترتيب.'},400);
  const order=await answerOrder(student.attempt>1?id+':attempt:'+student.attempt:id,course.id,q.id,q.options.length),choice=order[body.choice];
  await db.prepare('INSERT OR IGNORE INTO answers(student,question,choice,correct) SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?)').bind(id,q.id,choice,choice===q.answer?1:0,id,attempt).run();
 }else if(body.action==='complete'){
  const now=new Date().toISOString(),changed=await db.prepare('UPDATE students SET completed=COALESCE(completed,?) WHERE id=? AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?) AND (SELECT COUNT(*) FROM answers WHERE student=?)=? AND (SELECT COUNT(*) FROM reads WHERE student=?)=?').bind(now,id,id,attempt,id,questions.length,id,lessons.length).run();
  if(!changed.meta.changes)return reply({error:'أكمل جميع المشاهد والأسئلة للحصول على الشهادة.'},400);
  student.completed=student.completed||now;
 }else return reply({error:'طلب غير صالح.'},400);
 const currentAttempt=await db.prepare('SELECT attempt FROM student_sessions WHERE student=?').bind(id).first<{attempt:number}>();
 if(currentAttempt?.attempt!==attempt)return reply({error:'تغيّرت المحاولة. أعد تحميل تقدمك قبل الإجابة.'},409);
 return reply(await snapshot(student,course,grade,migrated));
}catch(e){console.error(e);return reply({error:'تعذّر حفظ التقدم. حاول مجددًا.'},503);}}
