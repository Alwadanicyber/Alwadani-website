import {database} from './database';
import type {TeacherCourse} from './course-types';
import {CHORES_COURSE_ID} from './chores-learning';
import {gameSchema,allGameResults,BALLOON_POINTS} from './balloon-assessment';
import {dictationSchema,allDictationResults,DICTATION_POINTS} from './chores-dictation';
export type Result={score:number;total:number;answered:number;completed:string|null;attempt:number;created:string;title?:string;quizScore?:number;quizTotal?:number;gameScore?:number;gameTotal?:number;gameCompleted?:string|null;dictationScore?:number;dictationTotal?:number};
export type Rank=Result&{id:string;name:string;percentage:number;position:number;attempts:number};
export const resultPercent=(r:Result)=>r.total>0?r.score/r.total*100:0;
export function betterResult(a:Result,b:Result){return resultPercent(a)>resultPercent(b)||resultPercent(a)===resultPercent(b)&&(!!a.completed&&!b.completed||!!a.completed===!!b.completed&&a.answered>b.answered);}
const prepared=new WeakMap<object,Promise<void>>();
export async function ensureClassroomResults(){const db=database();let ready=prepared.get(db);if(!ready){ready=db.batch([db.prepare('CREATE TABLE IF NOT EXISTS student_sessions(student TEXT PRIMARY KEY REFERENCES students(id),attempt INTEGER NOT NULL DEFAULT 1,started TEXT NOT NULL)'),db.prepare('CREATE TABLE IF NOT EXISTS student_attempts(student TEXT NOT NULL REFERENCES students(id),attempt INTEGER NOT NULL,course TEXT NOT NULL,snapshot TEXT NOT NULL,answers TEXT NOT NULL,reads TEXT NOT NULL,score INTEGER NOT NULL,total INTEGER NOT NULL,answered INTEGER NOT NULL,completed TEXT,created TEXT NOT NULL,PRIMARY KEY(student,attempt))'),db.prepare('CREATE INDEX IF NOT EXISTS idx_student_attempts_course ON student_attempts(course)'),db.prepare(gameSchema),db.prepare('CREATE INDEX IF NOT EXISTS idx_student_game_runs_attempt ON student_game_runs(student,attempt)'),db.prepare(dictationSchema)]).then(()=>{}).catch(e=>{prepared.delete(db);throw e;});prepared.set(db,ready);}await ready;}
export async function archiveAndRestart(id:string,attempt:number,course:TeacherCourse,expectedSnapshot:string|null){
 const db=database(),now=new Date().toISOString(),saved=JSON.stringify(course);
 await db.batch([
  db.prepare('INSERT OR IGNORE INTO student_sessions(student,attempt,started) SELECT id,1,created FROM students WHERE id=?').bind(id),
  db.prepare(`INSERT OR IGNORE INTO student_attempts(student,attempt,course,snapshot,answers,reads,score,total,answered,completed,created)
   SELECT s.id,?,s.course,COALESCE(s.snapshot,?),COALESCE((SELECT json_group_array(json_object('question',question,'choice',choice,'correct',correct)) FROM answers WHERE student=s.id),'[]'),COALESCE((SELECT json_group_array(lesson) FROM reads WHERE student=s.id),'[]'),COALESCE((SELECT SUM(correct) FROM answers WHERE student=s.id),0),COALESCE(json_array_length(s.snapshot,'$.definition.questions'),?),(SELECT COUNT(*) FROM answers WHERE student=s.id),s.completed,?
   FROM students s JOIN student_sessions v ON v.student=s.id WHERE s.id=? AND v.attempt=? AND s.snapshot IS ?`).bind(attempt,saved,course.definition.questions.length,now,id,attempt,expectedSnapshot),
  db.prepare('DELETE FROM answers WHERE student=? AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?) AND EXISTS(SELECT 1 FROM students WHERE id=? AND snapshot IS ?)').bind(id,id,attempt,id,expectedSnapshot),
  ...(saved===expectedSnapshot?[]:[db.prepare('DELETE FROM reads WHERE student=? AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?) AND EXISTS(SELECT 1 FROM students WHERE id=? AND snapshot IS ?)').bind(id,id,attempt,id,expectedSnapshot)]),
  db.prepare('UPDATE students SET snapshot=?,completed=NULL WHERE id=? AND snapshot IS ? AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?)').bind(saved,id,expectedSnapshot,id,attempt),
  db.prepare('UPDATE student_sessions SET attempt=attempt+1,started=? WHERE student=? AND attempt=? AND EXISTS(SELECT 1 FROM students WHERE id=? AND snapshot=?)').bind(now,id,attempt,id,saved)
 ]);
}
export async function classroomResults(course:TeacherCourse,studentId?:string){
 const db=database();
 const required=course.id===CHORES_COURSE_ID;
 const [live,history,games,dictations]=await Promise.all([
  db.prepare(`SELECT s.id,s.name,s.created,s.completed,COALESCE(v.attempt,1) AS attempt,COUNT(a.question) AS answered,COALESCE(SUM(a.correct),0) AS score,COALESCE(json_array_length(s.snapshot,'$.definition.questions'),?) AS total,COALESCE(json_extract(s.snapshot,'$.title'),?) AS title FROM students s LEFT JOIN answers a ON a.student=s.id LEFT JOIN student_sessions v ON v.student=s.id WHERE s.course=? GROUP BY s.id`).bind(course.definition.questions.length,course.title,course.id).all(),
  db.prepare('SELECT student,attempt,score,total,answered,completed,created,json_extract(snapshot,\'$.title\') AS title FROM student_attempts WHERE course=?').bind(course.id).all(),required?allGameResults():Promise.resolve([]),required?allDictationResults():Promise.resolve([])
 ]);
 const rows=new Map<string,Rank>(),gameMap=new Map(games.map(g=>[g.student+':'+g.attempt,g])),dictationMap=new Map(dictations.map(d=>[d.student+':'+d.attempt,d]));let certificate:Result|null=null,previousCertificate:Result|null=null;
 const combined=(r:Result,student:string):Result=>{if(!required)return r;const game=gameMap.get(student+':'+r.attempt),dictation=dictationMap.get(student+':'+r.attempt);return {...r,quizScore:r.score,quizTotal:r.total,dictationScore:dictation?.score??0,dictationTotal:DICTATION_POINTS,gameScore:game?.score??0,gameTotal:BALLOON_POINTS,gameCompleted:game?.completed??null,score:r.score+(dictation?.score??0)+(game?.score??0),total:r.total+DICTATION_POINTS+BALLOON_POINTS,answered:r.answered+(dictation?.answered??0)+(game?.completed?BALLOON_POINTS:Math.min(game?.solved??0,BALLOON_POINTS-1)),completed:r.completed&&game?.completed&&dictation?.answered===DICTATION_POINTS?game.completed:null};};
 for(const raw of live.results){const source=raw as unknown as Rank,r={...source,...combined(source,source.id)};rows.set(r.id,{...r,percentage:resultPercent(r),position:0,attempts:r.attempt});if(r.id===studentId&&source.completed)previousCertificate=source;if(r.id===studentId&&r.completed)certificate=r;}
 for(const raw of history.results){const source=raw as unknown as Result&{student:string},r=combined(source,source.student),current=rows.get(source.student);if(current&&betterResult(r,current))rows.set(source.student,{...current,...r,id:source.student,percentage:resultPercent(r)});if(source.student===studentId&&source.completed&&(!previousCertificate||betterResult(source,previousCertificate)))previousCertificate=source;if(source.student===studentId&&r.completed&&(!certificate||betterResult(r,certificate)))certificate=r;}
 const leaderboard=[...rows.values()].sort((a,b)=>b.percentage-a.percentage||Number(!!b.completed)-Number(!!a.completed)||b.answered/b.total-a.answered/a.total||(a.completed||a.created).localeCompare(b.completed||b.created)).map((r,i)=>({...r,position:i+1}));
 return {leaderboard,bestResult:studentId?leaderboard.find(r=>r.id===studentId)||null:null,certificate,...(required?{previousCertificate}: {})};
}
