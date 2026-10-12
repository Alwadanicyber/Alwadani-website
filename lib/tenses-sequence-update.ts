import {database} from './database';
import type {TeacherCourse} from './course-types';
import {TENSES_COURSE_ID} from './tenses-learning';
import {hasOldTensesSequence,hasNewTensesSequence,tenseQuestionKey} from './tenses-sequence';
// Rearrange the same material without erasing answers or completed certificates.
// The original balloon/sentence game, when present, is archived but not mapped
// to the newer classification game because the questions are different.
export async function updateStudentTensesSequence(student:{id:string;attempt:number;snapshot:string},current:TeacherCourse,latest:TeacherCourse){
 if(current.id!==TENSES_COURSE_ID||!hasOldTensesSequence(current.definition)||!hasNewTensesSequence(latest.definition))return false;
 const mapping=new Map<number,number>();
 for(const old of current.definition.questions){const matches=latest.definition.questions.filter(q=>tenseQuestionKey(q)===tenseQuestionKey(old));if(matches.length===1)mapping.set(old.id,matches[0].id);}
 if(!current.definition.questions.slice(0,12).every(q=>mapping.has(q.id))||new Set([...mapping.values()].filter(id=>id<=12)).size!==12)return false;
 const id=student.id,attempt=student.attempt,old=student.snapshot,saved=JSON.stringify(latest),now=new Date().toISOString(),db=database();
 const gameUnchanged=current.definition.questions.slice(12).every(q=>mapping.has(q.id));
 const mapped=(value:string)=>`CASE ${value} ${[...mapping].map(([from,to])=>`WHEN ${from} THEN ${to}`).join(' ')} END`;
 const guard='EXISTS(SELECT 1 FROM students WHERE id=? AND snapshot IS ?) AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?)';
 const bindings=[id,old,id,attempt];
 const hasRead=(lesson:number)=>`EXISTS(SELECT 1 FROM student_attempts h,json_each(h.reads) r WHERE h.student=? AND h.attempt=? AND r.value=${lesson})`;
 const result=await db.batch([
  db.prepare('INSERT OR IGNORE INTO student_sessions(student,attempt,started) SELECT id,1,created FROM students WHERE id=?').bind(id),
  db.prepare(`INSERT OR IGNORE INTO student_attempts(student,attempt,course,snapshot,answers,reads,score,total,answered,completed,created)
   SELECT s.id,?,s.course,s.snapshot,COALESCE((SELECT json_group_array(json_object('question',question,'choice',choice,'correct',correct)) FROM answers WHERE student=s.id),'[]'),COALESCE((SELECT json_group_array(lesson) FROM reads WHERE student=s.id),'[]'),COALESCE((SELECT SUM(correct) FROM answers WHERE student=s.id),0),json_array_length(s.snapshot,'$.definition.questions'),(SELECT COUNT(*) FROM answers WHERE student=s.id),s.completed,?
   FROM students s JOIN student_sessions v ON v.student=s.id WHERE s.id=? AND v.attempt=? AND s.snapshot IS ?`).bind(attempt,now,id,attempt,old),
  db.prepare(`DELETE FROM answers WHERE student=? AND ${guard}`).bind(id,...bindings),
  db.prepare(`INSERT OR IGNORE INTO answers(student,question,choice,correct)
   SELECT h.student,${mapped("json_extract(a.value,'$.question')")},json_extract(a.value,'$.choice'),json_extract(a.value,'$.correct') FROM student_attempts h,json_each(h.answers) a
   WHERE h.student=? AND h.attempt=? AND ${mapped("json_extract(a.value,'$.question')")} IS NOT NULL AND ${guard}`).bind(id,attempt,...bindings),
  db.prepare(`DELETE FROM reads WHERE student=? AND ${guard}`).bind(id,...bindings),
  ...[0,1].map(lesson=>db.prepare(`INSERT OR IGNORE INTO reads(student,lesson) SELECT ?,? WHERE ${hasRead(1)} AND ${hasRead(2)} AND ${guard}`).bind(id,lesson,id,attempt,id,attempt,...bindings)),
  db.prepare(`INSERT OR IGNORE INTO reads(student,lesson) SELECT ?,2 WHERE ${hasRead(0)} AND ${guard}`).bind(id,id,attempt,...bindings),
  ...(gameUnchanged?[db.prepare(`INSERT OR IGNORE INTO reads(student,lesson) SELECT ?,3 WHERE ${hasRead(3)} AND ${guard}`).bind(id,id,attempt,...bindings)]:[]),
  db.prepare(`INSERT OR IGNORE INTO student_answer_times(student,attempt,stage,question,elapsed_ms)
   SELECT t.student,?,'quiz',${mapped('t.question')},t.elapsed_ms FROM student_answer_times t WHERE t.student=? AND t.attempt=? AND t.stage='quiz' AND ${mapped('t.question')} IS NOT NULL AND EXISTS(SELECT 1 FROM answers a WHERE a.student=t.student AND a.question=${mapped('t.question')}) AND ${guard}`).bind(attempt+1,id,attempt,...bindings),
  db.prepare(`INSERT OR IGNORE INTO student_sentence_answers(student,attempt,question,response)
   SELECT t.student,?,${mapped('t.question')},t.response FROM student_sentence_answers t WHERE t.student=? AND t.attempt=? AND ${mapped('t.question')} IS NOT NULL AND ${guard}`).bind(attempt+1,id,attempt,...bindings),
  db.prepare(`UPDATE students SET snapshot=?,completed=CASE WHEN (SELECT COUNT(*) FROM answers WHERE student=?)=20 AND (SELECT COUNT(*) FROM reads WHERE student=?)=4 THEN completed ELSE NULL END WHERE id=? AND snapshot IS ? AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?)`).bind(saved,id,id,id,old,id,attempt),
  db.prepare('UPDATE student_sessions SET attempt=attempt+1,started=? WHERE student=? AND attempt=? AND EXISTS(SELECT 1 FROM students WHERE id=? AND snapshot=?)').bind(now,id,attempt,id,saved),
 ]);
 return result[result.length-1].meta.changes===1;
}
