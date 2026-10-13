import {database} from './database';
import {MAX_SOLVE_MS} from './solve-time';
export {continuousElapsed} from './continuous-speed-time';
export const continuousSpeedSchema="CREATE TABLE IF NOT EXISTS student_speed_clocks(student TEXT NOT NULL REFERENCES students(id),attempt INTEGER NOT NULL,run TEXT NOT NULL DEFAULT '',elapsed_ms INTEGER NOT NULL DEFAULT 0,prefix_ms INTEGER NOT NULL DEFAULT 0,running_since INTEGER,finished_at INTEGER,valid INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(student,attempt,run))";
type Clock={elapsed_ms:number;prefix_ms:number;running_since:number|null;finished_at:number|null;valid:number};
const ready=new WeakMap<object,Promise<void>>();
export async function ensureContinuousSpeed(){const db=database();let p=ready.get(db);if(!p){p=db.prepare(continuousSpeedSchema).run().then(()=>{}).catch(e=>{ready.delete(db);throw e;});ready.set(db,p);}await p;}
export async function resumeSpeedClock(student:string,attempt:number,now=Date.now()){
 await ensureContinuousSpeed();const db=database();
 await db.prepare(`INSERT OR IGNORE INTO student_speed_clocks(student,attempt,run,elapsed_ms,prefix_ms,running_since,valid)
 SELECT ?,?,'',0,0,?,CASE WHEN NOT EXISTS(SELECT 1 FROM answers WHERE student=?) THEN 1 ELSE 0 END
 WHERE EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?)`).bind(student,attempt,now,student,student,attempt).run();
 await setSpeedView(student,attempt,'','solve',now);
}
export async function setSpeedView(student:string,attempt:number,run:string,view:'solve'|'explain',now=Date.now()){
 await ensureContinuousSpeed();const db=database();
 const guard='student=? AND attempt=? AND run=? AND finished_at IS NULL AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?)';
 if(view==='solve')await db.prepare(`UPDATE student_speed_clocks SET running_since=COALESCE(running_since,?) WHERE ${guard}`).bind(now,student,attempt,run,student,attempt).run();
 else await db.prepare(`UPDATE student_speed_clocks SET elapsed_ms=MIN(?,elapsed_ms+CASE WHEN running_since IS NULL THEN 0 ELSE MAX(0,?-running_since) END),running_since=NULL WHERE ${guard}`).bind(MAX_SOLVE_MS,now,student,attempt,run,student,attempt).run();
}
export async function startSpeedGame(student:string,attempt:number,run:string,now=Date.now()){
 await setSpeedView(student,attempt,'','explain',now);
 const db=database(),prefix=await db.prepare("SELECT * FROM student_speed_clocks WHERE student=? AND attempt=? AND run=''").bind(student,attempt).first<Clock>();
 await db.prepare(`INSERT OR IGNORE INTO student_speed_clocks(student,attempt,run,elapsed_ms,prefix_ms,running_since,valid)
 SELECT ?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?)`).bind(student,attempt,run,prefix?.elapsed_ms||0,prefix?.elapsed_ms||0,now,prefix?.valid||0,student,attempt).run();
 await setSpeedView(student,attempt,run,'solve',now);
}
export async function finishSpeedClock(student:string,attempt:number,run='',now=Date.now()){
 await ensureContinuousSpeed();await database().prepare(`UPDATE student_speed_clocks SET elapsed_ms=MIN(?,elapsed_ms+CASE WHEN running_since IS NULL THEN 0 ELSE MAX(0,?-running_since) END),running_since=NULL,finished_at=? WHERE student=? AND attempt=? AND run=? AND finished_at IS NULL AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?)`).bind(MAX_SOLVE_MS,now,now,student,attempt,run,student,attempt).run();
}
export async function allContinuousTimes(course:string){await ensureContinuousSpeed();return (await database().prepare("SELECT c.student,c.attempt,c.elapsed_ms AS elapsed,c.valid,c.finished_at FROM student_speed_clocks c JOIN students s ON s.id=c.student WHERE s.course=? AND c.run=''").bind(course).all()).results as unknown as {student:string;attempt:number;elapsed:number;valid:number;finished_at:number|null}[];}

export async function markSpeedPrefix(student:string,attempt:number,now=Date.now()){
 await ensureContinuousSpeed();await database().prepare("UPDATE student_speed_clocks SET prefix_ms=MIN(?,elapsed_ms+CASE WHEN running_since IS NULL THEN 0 ELSE MAX(0,?-running_since) END) WHERE student=? AND attempt=? AND run='' AND prefix_ms=0 AND finished_at IS NULL AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?)").bind(MAX_SOLVE_MS,now,student,attempt,student,attempt).run();
}
