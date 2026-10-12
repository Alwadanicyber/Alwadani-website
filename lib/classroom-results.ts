import {database} from './database';
import type {TeacherCourse} from './course-types';
import {CHORES_COURSE_ID} from './chores-learning';
import {gameSchema,allGameResults,BALLOON_POINTS} from './balloon-assessment';
import {dictationSchema,allDictationResults,DICTATION_POINTS} from './chores-dictation';
import {answerTimingSchema,allAnswerTimes} from './answer-timing';
import {withLeaderboardBaseline,excludedTeacherEntry} from './leaderboard-baselines';
import {compareResults,betterResult,resultPercent,type Result,type Rank} from './result-ranking';
import {sentenceResponseSchema,TENSES_COURSE_ID} from './tenses-learning';
import {getCompetition} from './course-competition';
import {studentModerationSchema,type StudentParticipation} from './student-moderation';
export {betterResult,resultPercent} from './result-ranking';
export type {Result,Rank} from './result-ranking';
const prepared=new WeakMap<object,Promise<void>>();
export async function ensureClassroomResults(){const db=database();let ready=prepared.get(db);if(!ready){ready=db.batch([db.prepare('CREATE TABLE IF NOT EXISTS student_sessions(student TEXT PRIMARY KEY REFERENCES students(id),attempt INTEGER NOT NULL DEFAULT 1,started TEXT NOT NULL)'),db.prepare('CREATE TABLE IF NOT EXISTS student_attempts(student TEXT NOT NULL REFERENCES students(id),attempt INTEGER NOT NULL,course TEXT NOT NULL,snapshot TEXT NOT NULL,answers TEXT NOT NULL,reads TEXT NOT NULL,score INTEGER NOT NULL,total INTEGER NOT NULL,answered INTEGER NOT NULL,completed TEXT,created TEXT NOT NULL,PRIMARY KEY(student,attempt))'),db.prepare('CREATE INDEX IF NOT EXISTS idx_student_attempts_course ON student_attempts(course)'),db.prepare(gameSchema),db.prepare('CREATE INDEX IF NOT EXISTS idx_student_game_runs_attempt ON student_game_runs(student,attempt)'),db.prepare(dictationSchema),db.prepare(answerTimingSchema),db.prepare(studentModerationSchema),db.prepare(sentenceResponseSchema)]).then(()=>{}).catch(e=>{prepared.delete(db);throw e;});prepared.set(db,ready);}await ready;}
export async function archiveAndRestart(id:string,attempt:number,course:TeacherCourse,expectedSnapshot:string|null){
 const db=database(),now=new Date().toISOString(),saved=JSON.stringify(course);
 // Audience wording does not change the material a learner has already read.
 const content=(c:TeacherCourse)=>JSON.stringify({...c,studentGender:undefined,definition:{...c.definition,studentGender:undefined}});
 const sameContent=saved===expectedSnapshot||expectedSnapshot!==null&&content(course)===content(JSON.parse(expectedSnapshot));
 await db.batch([
  db.prepare('INSERT OR IGNORE INTO student_sessions(student,attempt,started) SELECT id,1,created FROM students WHERE id=?').bind(id),
  db.prepare(`INSERT OR IGNORE INTO student_attempts(student,attempt,course,snapshot,answers,reads,score,total,answered,completed,created)
   SELECT s.id,?,s.course,COALESCE(s.snapshot,?),COALESCE((SELECT json_group_array(json_object('question',question,'choice',choice,'correct',correct)) FROM answers WHERE student=s.id),'[]'),COALESCE((SELECT json_group_array(lesson) FROM reads WHERE student=s.id),'[]'),COALESCE((SELECT SUM(correct) FROM answers WHERE student=s.id),0),COALESCE(json_array_length(s.snapshot,'$.definition.questions'),?),(SELECT COUNT(*) FROM answers WHERE student=s.id),s.completed,?
   FROM students s JOIN student_sessions v ON v.student=s.id WHERE s.id=? AND v.attempt=? AND s.snapshot IS ?`).bind(attempt,saved,course.definition.questions.length,now,id,attempt,expectedSnapshot),
  db.prepare('DELETE FROM answers WHERE student=? AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?) AND EXISTS(SELECT 1 FROM students WHERE id=? AND snapshot IS ?)').bind(id,id,attempt,id,expectedSnapshot),
  ...(sameContent?[]:[db.prepare('DELETE FROM reads WHERE student=? AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?) AND EXISTS(SELECT 1 FROM students WHERE id=? AND snapshot IS ?)').bind(id,id,attempt,id,expectedSnapshot)]),
  db.prepare('UPDATE students SET snapshot=?,completed=NULL WHERE id=? AND snapshot IS ? AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?)').bind(saved,id,expectedSnapshot,id,attempt),
  db.prepare('UPDATE student_sessions SET attempt=attempt+1,started=? WHERE student=? AND attempt=? AND EXISTS(SELECT 1 FROM students WHERE id=? AND snapshot=?)').bind(now,id,attempt,id,saved)
 ]);
}
export async function classroomResults(course:TeacherCourse,studentId?:string,teacherView=false){
 const db=database();
 const required=course.id===CHORES_COURSE_ID,learningOnly=course.id===TENSES_COURSE_ID,competition=await getCompetition(course.id),deadline=!learningOnly&&competition.enabled?competition.endsAt:null;
 const [live,history,games,dictations,times,moderation,competitionGames]=await Promise.all([
  db.prepare(`SELECT s.id,s.name,s.created,s.completed,COALESCE(v.attempt,1) AS attempt,COUNT(a.question) AS answered,COALESCE(SUM(a.correct),0) AS score,COALESCE(json_array_length(s.snapshot,'$.definition.questions'),?) AS total,COALESCE(json_extract(s.snapshot,'$.title'),?) AS title FROM students s LEFT JOIN answers a ON a.student=s.id LEFT JOIN student_sessions v ON v.student=s.id WHERE s.course=? GROUP BY s.id`).bind(course.definition.questions.length,course.title,course.id).all(),
  db.prepare('SELECT student,attempt,score,total,answered,completed,created,json_extract(snapshot,\'$.title\') AS title FROM student_attempts WHERE course=?').bind(course.id).all(),required?allGameResults():Promise.resolve([]),required?allDictationResults():Promise.resolve([]),learningOnly?Promise.resolve([]):allAnswerTimes(),
  db.prepare('SELECT m.student,m.removed FROM student_moderation m JOIN students s ON s.id=m.student WHERE s.course=?').bind(course.id).all<{student:string;removed:string}>(),
  required&&deadline?allGameResults(deadline):Promise.resolve([])
 ]);
 const rows=new Map<string,Rank>(),gameMap=new Map(games.map(g=>[g.student+':'+g.attempt,g])),dictationMap=new Map(dictations.map(d=>[d.student+':'+d.attempt,d])),timeMap=new Map(times.map(t=>[t.student+':'+t.attempt+':'+t.stage,t]));let certificate:Result|null=null,previousCertificate:Result|null=null;
 const competitionGameMap=deadline?new Map(competitionGames.map(g=>[g.student+':'+g.attempt,g])):gameMap;
 const combined=(r:Result,student:string,selectedGames=gameMap):Result=>{
  // Lesson 02 is for learning at the student's own pace. Neither live nor
  // archived durations may influence its best grade, ordering or certificate.
  if(learningOnly)return r;
  const key=student+':'+r.attempt,quiz=timeMap.get(key+':quiz');
  const quizMs=quiz?.samples===r.total?quiz.elapsed:null;
  if(!required)return {...r,solveMs:r.completed?quizMs:null};
  const game=selectedGames.get(key),dictation=dictationMap.get(key),dictationTime=timeMap.get(key+':dictation');
  const completed=r.completed&&game?.completed&&dictation?.answered===DICTATION_POINTS?game.completed:null;
  const dictationMs=dictationTime?.samples===DICTATION_POINTS?dictationTime.elapsed:null;
  const solveMs=completed&&quizMs!==null&&dictationMs!==null&&typeof game?.solveMs==='number'?quizMs+dictationMs+game.solveMs:null;
  return {...r,solveMs,quizScore:r.score,quizTotal:r.total,dictationScore:dictation?.score??0,dictationTotal:DICTATION_POINTS,gameScore:game?.score??0,gameTotal:BALLOON_POINTS,gameCompleted:game?.completed??null,score:r.score+(dictation?.score??0)+(game?.score??0),total:r.total+DICTATION_POINTS+BALLOON_POINTS,answered:r.answered+(dictation?.answered??0)+(game?.completed?BALLOON_POINTS:Math.min(game?.solved??0,BALLOON_POINTS-1)),completed};
 };
 for(const raw of live.results){const source=raw as unknown as Rank,r={...source,...combined(source,source.id)};rows.set(r.id,{...r,percentage:resultPercent(r),position:0,attempts:r.attempt});if(r.id===studentId&&source.completed)previousCertificate=source;if(r.id===studentId&&r.completed)certificate=r;}
 for(const raw of history.results){const source=raw as unknown as Result&{student:string},r=combined(source,source.student),current=rows.get(source.student);if(current&&betterResult(r,current))rows.set(source.student,{...current,...r,id:source.student,percentage:resultPercent(r)});if(source.student===studentId&&source.completed&&(!previousCertificate||betterResult(source,previousCertificate)))previousCertificate=source;if(source.student===studentId&&r.completed&&(!certificate||betterResult(r,certificate)))certificate=r;}
 const joined=new Map(live.results.map(r=>[String(r.id),String(r.created)]));
 const removed=new Map(moderation.results.map(r=>[r.student,r.removed]));
 const allResults=[...rows.values()].map(r=>withLeaderboardBaseline(course.id,r,joined.get(r.id)||'')).sort((a,b)=>learningOnly?a.name.localeCompare(b.name,'ar')||a.id.localeCompare(b.id):compareResults(a,b)||(a.completed||a.created).localeCompare(b.completed||b.created)||a.id.localeCompare(b.id));
 // Prize rankings use the best completed attempt strictly before the deadline.
 // Learning, later retries and certificates retain their unrestricted best result.
 const competitionRows=new Map<string,Rank>();
 for(const raw of [...live.results,...history.results]){
  const source=raw as unknown as Rank&{student?:string},id=source.student||source.id,current=rows.get(id);
  if(!current)continue;
  const result=combined(source,id,competitionGameMap);
  if(deadline&&(result.completed?Date.parse(result.completed)>=Date.parse(deadline):competition.ended))continue;
  if(deadline&&Date.parse(joined.get(id)||'')>=Date.parse(deadline))continue;
  const previous=competitionRows.get(id);
  if(!previous||betterResult(result,previous))competitionRows.set(id,{...current,...result,percentage:resultPercent(result)});
 }
 const eligible=[...competitionRows.values()].map(r=>withLeaderboardBaseline(course.id,r,joined.get(r.id)||'')).sort((a,b)=>learningOnly?a.name.localeCompare(b.name,'ar')||a.id.localeCompare(b.id):compareResults(a,b)||(a.completed||a.created).localeCompare(b.completed||b.created)||a.id.localeCompare(b.id));
 const leaderboard=eligible.filter(r=>!removed.has(r.id)&&!excludedTeacherEntry(course.id,r,joined.get(r.id)||'')).map((r,i)=>({...r,position:i+1}));
 const places=new Map(leaderboard.map(r=>[r.id,r.position]));
 const official=new Map(leaderboard.map(r=>[r.id,r]));
 const participants:StudentParticipation[]=teacherView?allResults.map(r=>({...r,...official.get(r.id),position:places.get(r.id)||0,removedAt:removed.get(r.id)||null,competing:places.has(r.id)})):[];
 return {competition,leaderboard,bestResult:studentId?(()=>{const own=allResults.find(r=>r.id===studentId);return own?{...own,position:places.get(studentId)||0}:null;})():null,certificate,...(required?{previousCertificate}: {}),...(teacherView?{participants}:{})};
}
