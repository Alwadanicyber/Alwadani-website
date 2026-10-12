import {database} from './database';
import type {TeacherCourse,Definition} from './course-types';
import {TENSES_COURSE_ID} from './tenses-learning';
const legacyPrompts=['يقرأ الطفل كل يوم. اختر الزمن المناسب.','الأطفال يلعبون كرة القدم الآن. اختر الزمن المناسب.','رتّب جملة: هي تقرأ كتابًا مصورًا الآن.','رتّب جملة: هو لا يستقل الحافلة كل يوم.','رتّب سؤالًا: هل يقرأ كل يوم؟','رتّب سؤالًا: هل هم يلعبون كرة القدم الآن؟','أمي تقود السيارة إلى العمل كل صباح. اختر الزمن.','الطفل يؤدي واجبه في هذه اللحظة. اختر الزمن.'];
export function hasLegacyTensesGame(definition:Definition){
 return definition.lessons.length===4&&definition.questions.length===20&&definition.lessons[3].en==='Time Detectives'&&definition.questions.slice(12).every((q,i)=>q.id===i+13&&q.prompt===legacyPrompts[i]&&q.kind===(i>=2&&i<=5?'sentence-build':'tense-sort'));
}
export function isSentenceTensesGame(definition:Definition){return definition.questions.length===20&&definition.questions.slice(12).every(q=>q.kind==='tense-sort'&&/^[A-Za-z]/.test(q.prompt));}
export async function updateStudentTensesGame(student:{id:string;attempt:number;snapshot:string},current:TeacherCourse,latest:TeacherCourse){
 if(current.id!==TENSES_COURSE_ID||!hasLegacyTensesGame(current.definition)||!isSentenceTensesGame(latest.definition))return false;
 // Keep answers only when the original quiz and its grading keys match exactly.
 const keys=(d:Definition)=>d.questions.slice(0,12).map(({reason,...q})=>q);
 if(JSON.stringify(keys(current.definition))!==JSON.stringify(keys(latest.definition)))return false;
 const db=database(),id=student.id,attempt=student.attempt,saved=JSON.stringify(latest),old=student.snapshot,now=new Date().toISOString();
 const results=await db.batch([
  db.prepare('INSERT OR IGNORE INTO student_sessions(student,attempt,started) SELECT id,1,created FROM students WHERE id=?').bind(id),
  db.prepare(`INSERT OR IGNORE INTO student_attempts(student,attempt,course,snapshot,answers,reads,score,total,answered,completed,created)
   SELECT s.id,?,s.course,s.snapshot,COALESCE((SELECT json_group_array(json_object('question',question,'choice',choice,'correct',correct)) FROM answers WHERE student=s.id),'[]'),COALESCE((SELECT json_group_array(lesson) FROM reads WHERE student=s.id),'[]'),COALESCE((SELECT SUM(correct) FROM answers WHERE student=s.id),0),json_array_length(s.snapshot,'$.definition.questions'),(SELECT COUNT(*) FROM answers WHERE student=s.id),s.completed,?
   FROM students s JOIN student_sessions v ON v.student=s.id WHERE s.id=? AND v.attempt=? AND s.snapshot IS ?`).bind(attempt,now,id,attempt,old),
  db.prepare('DELETE FROM answers WHERE student=? AND question>12 AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?) AND EXISTS(SELECT 1 FROM students WHERE id=? AND snapshot IS ?)').bind(id,id,attempt,id,old),
  db.prepare('DELETE FROM reads WHERE student=? AND lesson>=3 AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?) AND EXISTS(SELECT 1 FROM students WHERE id=? AND snapshot IS ?)').bind(id,id,attempt,id,old),
  db.prepare("INSERT OR IGNORE INTO student_answer_times(student,attempt,stage,question,elapsed_ms) SELECT student,?,'quiz',question,elapsed_ms FROM student_answer_times t WHERE student=? AND attempt=? AND stage='quiz' AND question<=12 AND EXISTS(SELECT 1 FROM answers a WHERE a.student=t.student AND a.question=t.question) AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?) AND EXISTS(SELECT 1 FROM students WHERE id=? AND snapshot IS ?)").bind(attempt+1,id,attempt,id,attempt,id,old),
  db.prepare('UPDATE students SET snapshot=?,completed=NULL WHERE id=? AND snapshot IS ? AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?)').bind(saved,id,old,id,attempt),
  db.prepare('UPDATE student_sessions SET attempt=attempt+1,started=? WHERE student=? AND attempt=? AND EXISTS(SELECT 1 FROM students WHERE id=? AND snapshot=?)').bind(now,id,attempt,id,saved),
 ]);
 return results[results.length-1].meta.changes===1;
}
