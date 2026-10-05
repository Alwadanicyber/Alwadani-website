import {database} from './database';
import type {RecordContent,RecordSummary,TeacherRecord} from './records';

// Additive and idempotent: existing installations need no dashboard SQL step.
// The matching migration is also included for independent installations/backups.
export const RECORD_TABLE_SQL='CREATE TABLE IF NOT EXISTS teacher_records (id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, grade TEXT NOT NULL, class_name TEXT NOT NULL, teacher_name TEXT NOT NULL, student_count INTEGER NOT NULL, task_count INTEGER NOT NULL, content TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, created TEXT NOT NULL, updated TEXT NOT NULL)';
async function ready(){await database().prepare(RECORD_TABLE_SQL).run();return database();}
type RecordRow={id:string;content:string;version:number;created:string;updated:string};
const decode=(row:RecordRow):TeacherRecord=>({...JSON.parse(row.content) as RecordContent,id:row.id,version:row.version,created:row.created,updated:row.updated});
export async function listRecords():Promise<RecordSummary[]>{
  const db=await ready();const result=await db.prepare("SELECT id,title,COALESCE(json_extract(content,'$.format'),'electronic') AS format,grade,class_name AS className,teacher_name AS teacherName,student_count AS studentCount,task_count AS taskCount,version,updated FROM teacher_records ORDER BY updated DESC").all<RecordSummary>();return result.results;
}
export async function findRecord(id:string){const db=await ready();const row=await db.prepare('SELECT id,content,version,created,updated FROM teacher_records WHERE id=?').bind(id).first<RecordRow>();return row?decode(row):null;}
export async function createRecord(content:RecordContent){
  const db=await ready(),id=crypto.randomUUID(),now=new Date().toISOString();
  await db.prepare('INSERT INTO teacher_records(id,title,grade,class_name,teacher_name,student_count,task_count,content,version,created,updated) VALUES(?,?,?,?,?,?,?,?,1,?,?)').bind(id,content.title,content.grade,content.className,content.teacherName,content.students.length,content.tasks.length,JSON.stringify(content),now,now).run();
  return {...content,id,version:1,created:now,updated:now};
}
export async function updateRecord(id:string,version:number,content:RecordContent){
  const db=await ready(),now=new Date().toISOString();
  const row=await db.prepare('UPDATE teacher_records SET title=?,grade=?,class_name=?,teacher_name=?,student_count=?,task_count=?,content=?,version=version+1,updated=? WHERE id=? AND version=? RETURNING id,content,version,created,updated').bind(content.title,content.grade,content.className,content.teacherName,content.students.length,content.tasks.length,JSON.stringify(content),now,id,version).first<RecordRow>();return row?decode(row):null;
}
export async function deleteRecord(id:string,version:number){const db=await ready();const result=await db.prepare('DELETE FROM teacher_records WHERE id=? AND version=?').bind(id,version).run();return result.meta.changes===1;}
