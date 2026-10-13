import {database} from './database';
import type {TeacherCourse} from './course-types';
import {TIME_PLACE_COURSE_ID} from './time-place-learning';
export function prepositionGameStart(course:TeacherCourse){
 const questions=course.definition.questions,index=questions.findIndex(q=>q.kind==='preposition-balloon');
 return course.id===TIME_PLACE_COURSE_ID&&index>0&&questions.slice(index).every(q=>q.kind==='preposition-balloon'&&q.lesson===course.definition.lessons.length-1)?questions[index].id:null;
}
export async function restartPrepositionGame(student:{id:string;attempt:number;snapshot:string},course:TeacherCourse){
 const first=prepositionGameStart(course);if(first===null)return false;
 const db=database(),id=student.id,attempt=student.attempt,old=student.snapshot,saved=JSON.stringify(course),now=new Date().toISOString();
 const results=await db.batch([
  db.prepare(`INSERT OR IGNORE INTO student_attempts(student,attempt,course,snapshot,answers,reads,score,total,answered,completed,created)
   SELECT s.id,?,s.course,s.snapshot,COALESCE((SELECT json_group_array(json_object('question',question,'choice',choice,'correct',correct)) FROM answers WHERE student=s.id),'[]'),COALESCE((SELECT json_group_array(lesson) FROM reads WHERE student=s.id),'[]'),COALESCE((SELECT SUM(correct) FROM answers WHERE student=s.id),0),json_array_length(s.snapshot,'$.definition.questions'),(SELECT COUNT(*) FROM answers WHERE student=s.id),s.completed,?
   FROM students s JOIN student_sessions v ON v.student=s.id WHERE s.id=? AND v.attempt=? AND s.snapshot IS ?`).bind(attempt,now,id,attempt,old),
  db.prepare('DELETE FROM answers WHERE student=? AND question>=? AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?) AND EXISTS(SELECT 1 FROM students WHERE id=? AND snapshot IS ?)').bind(id,first,id,attempt,id,old),
  db.prepare('UPDATE students SET snapshot=?,completed=NULL WHERE id=? AND snapshot IS ? AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?)').bind(saved,id,old,id,attempt),
  db.prepare('UPDATE student_sessions SET attempt=attempt+1,started=? WHERE student=? AND attempt=? AND EXISTS(SELECT 1 FROM students WHERE id=? AND snapshot=?)').bind(now,id,attempt,id,saved),
 ]);return results[results.length-1].meta.changes===1;
}
