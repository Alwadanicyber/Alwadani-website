import {database} from './database';
import {ensureContinuousSpeed} from './continuous-speed';
import {HOME_CAN_COURSE_ID} from './home-can-learning';
import {hasLegacyHomeCanDefinition,addHomeCanDictation} from './home-can-course';
import type {TeacherCourse} from './course-types';
// Keep the original 16 exercises and written responses. Archive the old game
// and certificate, then open the new listen/write station before a fresh game.
export async function updateStudentHomeDictation(student:{id:string;attempt:number;snapshot:string},course:TeacherCourse){
 if(course.id!==HOME_CAN_COURSE_ID||!hasLegacyHomeCanDefinition(course.definition))return false;
 await ensureContinuousSpeed();
 const db=database(),id=student.id,attempt=student.attempt,old=student.snapshot,target={...course,definition:addHomeCanDictation(course.definition)},saved=JSON.stringify(target),now=new Date().toISOString();
 const guard='EXISTS(SELECT 1 FROM students WHERE id=? AND snapshot IS ?) AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?)',bindings=[id,old,id,attempt];
 const results=await db.batch([
  db.prepare('INSERT OR IGNORE INTO student_sessions(student,attempt,started) SELECT id,1,created FROM students WHERE id=?').bind(id),
  db.prepare(`INSERT OR IGNORE INTO student_attempts(student,attempt,course,snapshot,answers,reads,score,total,answered,completed,created)
   SELECT s.id,?,s.course,s.snapshot,COALESCE((SELECT json_group_array(json_object('question',question,'choice',choice,'correct',correct)) FROM answers WHERE student=s.id),'[]'),COALESCE((SELECT json_group_array(lesson) FROM reads WHERE student=s.id),'[]'),COALESCE((SELECT SUM(correct) FROM answers WHERE student=s.id),0),json_array_length(s.snapshot,'$.definition.questions'),(SELECT COUNT(*) FROM answers WHERE student=s.id),s.completed,?
   FROM students s JOIN student_sessions v ON v.student=s.id WHERE s.id=? AND v.attempt=? AND s.snapshot IS ?`).bind(attempt,now,id,attempt,old),
  db.prepare(`DELETE FROM answers WHERE student=? AND question>=17 AND ${guard}`).bind(id,...bindings),
  db.prepare(`DELETE FROM reads WHERE student=? AND lesson>=2 AND ${guard}`).bind(id,...bindings),
  db.prepare(`INSERT OR IGNORE INTO student_sentence_answers(student,attempt,question,response) SELECT student,attempt+1,question,response FROM student_sentence_answers WHERE student=? AND attempt=? AND question<17 AND ${guard}`).bind(id,attempt,...bindings),
  db.prepare(`INSERT OR IGNORE INTO student_answer_times(student,attempt,stage,question,elapsed_ms) SELECT student,attempt+1,stage,question,elapsed_ms FROM student_answer_times WHERE student=? AND attempt=? AND stage='quiz' AND question<17 AND ${guard}`).bind(id,attempt,...bindings),
  db.prepare(`INSERT OR IGNORE INTO student_speed_clocks(student,attempt,run,elapsed_ms,prefix_ms,running_since,valid) SELECT student,attempt+1,'',CASE WHEN prefix_ms>0 THEN prefix_ms ELSE elapsed_ms+CASE WHEN running_since IS NULL THEN 0 ELSE MAX(0,?-running_since) END END,0,NULL,valid FROM student_speed_clocks WHERE student=? AND attempt=? AND run='' AND ${guard}`).bind(Date.parse(now),id,attempt,...bindings),
  db.prepare(`UPDATE students SET snapshot=?,completed=NULL WHERE id=? AND snapshot IS ? AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?)`).bind(saved,id,old,id,attempt),
  db.prepare('UPDATE student_sessions SET attempt=attempt+1,started=? WHERE student=? AND attempt=? AND EXISTS(SELECT 1 FROM students WHERE id=? AND snapshot=?)').bind(now,id,attempt,id,saved),
 ]);return results[results.length-1].meta.changes===1;
}
