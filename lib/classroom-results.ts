import {database} from './database';
import type {TeacherCourse} from './course-types';
import {CHORES_COURSE_ID} from './chores-learning';
import {gameSchema,allGameResults,BALLOON_POINTS} from './balloon-assessment';
import {dictationSchema,allDictationResults,DICTATION_POINTS} from './chores-dictation';
import {answerTimingSchema,allAnswerTimes} from './answer-timing';
import {withLeaderboardBaseline,excludedTeacherEntry} from './leaderboard-baselines';
import {compareResults,betterResult,resultPercent,type Result,type Rank} from './result-ranking';
import {sentenceResponseSchema} from './tenses-learning';
import {getCompetition} from './course-competition';
import {getRankingMode} from './course-ranking';
import {allContinuousTimes} from './continuous-speed';
import {rankingUsesTime,compareCompetitionResults} from './ranking-mode';
import {studentModerationSchema,type StudentParticipation} from './student-moderation';
export {betterResult,resultPercent} from './result-ranking';
export type {Result,Rank} from './result-ranking';
const prepared=new WeakMap<object,Promise<void>>();
export async function ensureClassroomResults(){const db=database();let ready=prepared.get(db);if(!ready){ready=db.batch([db.prepare('CREATE TABLE IF NOT EXISTS student_sessions(student TEXT PRIMARY KEY REFERENCES students(id),attempt INTEGER NOT NULL DEFAULT 1,started TEXT NOT NULL)'),db.prepare('CREATE TABLE IF NOT EXISTS student_attempts(student TEXT NOT NULL REFERENCES students(id),attempt INTEGER NOT NULL,course TEXT NOT NULL,snapshot TEXT NOT NULL,answers TEXT NOT NULL,reads TEXT NOT NULL,score INTEGER NOT NULL,total INTEGER NOT NULL,answered INTEGER NOT NULL,completed TEXT,created TEXT NOT NULL,PRIMARY KEY(student,attempt))'),db.prepare('CREATE INDEX IF NOT EXISTS idx_student_attempts_course ON student_attempts(course)'),db.prepare(gameSchema),db.prepare('CREATE INDEX IF NOT EXISTS idx_student_game_runs_attempt ON student_game_runs(student,attempt)'),db.prepare(dictationSchema),db.prepare(answerTimingSchema),db.prepare(studentModerationSchema),db.prepare(sentenceResponseSchema)]).then(()=>{}).catch(e=>{prepared.delete(db);throw e;});prepared.set(db,ready);}await ready;}
export async function archiveAndRestart(id:string,attempt:number,course:TeacherCourse,expectedSnapshot:string|null){
 const db=database(),now=new Date().toISOString(),saved=JSON.stringify(course);
 // Presentation settings do not change the material a learner has already read.
 const content=(c:TeacherCourse)=>JSON.stringify({...c,studentGender:undefined,studentAccess:undefined,rankingMode:undefined,definition:{...c.definition,studentGender:undefined,studentAccess:undefined}});
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
 const rankingMode=course.rankingMode??await getRankingMode(course.id),required=course.id===CHORES_COURSE_ID,learningOnly=rankingMode==='participation',untimed=!rankingUsesTime(rankingMode),competition=await getCompetition(course.id),deadline=!learningOnly&&competition.enabled?competition.endsAt:null;
 const compareAttempt=(a:Result,b:Result)=>rankingMode==='speed'?compareCompetitionResults(a,b,rankingMode):betterResult(a,b)?-1:betterResult(b,a)?1:0;
 const compareRows=(a:Rank,b:Rank)=>(learningOnly?a.name.localeCompare(b.name,'ar'):rankingMode==='balanced'?compareResults(a,b):compareCompetitionResults(a,b,rankingMode))||(rankingMode==='accuracy'||rankingMode==='speed'?a.created.localeCompare(b.created)||((entryOrder.get(a.id)||0)-(entryOrder.get(b.id)||0)):(a.completed||a.created).localeCompare(b.completed||b.created))||a.id.localeCompare(b.id);
 const [live,history,games,dictations,times,moderation,competitionGames,fastGames,continuousTimes]=await Promise.all([
  db.prepare(`SELECT s.id,s.name,s.created,s.rowid AS _entryOrder,s.completed,COALESCE(v.attempt,1) AS attempt,COUNT(a.question) AS answered,COALESCE(SUM(a.correct),0) AS score,COALESCE(json_array_length(s.snapshot,'$.definition.questions'),?) AS total,COALESCE(json_extract(s.snapshot,'$.title'),?) AS title FROM students s LEFT JOIN answers a ON a.student=s.id LEFT JOIN student_sessions v ON v.student=s.id WHERE s.course=? GROUP BY s.id`).bind(course.definition.questions.length,course.title,course.id).all(),
  db.prepare('SELECT student,attempt,score,total,answered,completed,created,json_extract(snapshot,\'$.title\') AS title FROM student_attempts WHERE course=?').bind(course.id).all(),required?allGameResults():Promise.resolve([]),required?allDictationResults():Promise.resolve([]),untimed?Promise.resolve([]):allAnswerTimes(),
  db.prepare('SELECT m.student,m.removed FROM student_moderation m JOIN students s ON s.id=m.student WHERE s.course=?').bind(course.id).all<{student:string;removed:string}>(),
  required&&deadline?allGameResults(deadline,rankingMode==='speed'):Promise.resolve([]),required&&rankingMode==='speed'?allGameResults(undefined,true):Promise.resolve([]),rankingMode==='speed'?allContinuousTimes(course.id):Promise.resolve([])
 ]);
 const continuousMap=new Map(continuousTimes.map(t=>[t.student+':'+t.attempt,t]));
 const entryOrder=new Map(live.results.map(r=>[String(r.id),Number(r._entryOrder)]));
 const rows=new Map<string,Rank>(),gameMap=new Map(games.map(g=>[g.student+':'+g.attempt,g])),dictationMap=new Map(dictations.map(d=>[d.student+':'+d.attempt,d])),timeMap=new Map(times.map(t=>[t.student+':'+t.attempt+':'+t.stage,t]));let certificate:Result|null=null,previousCertificate:Result|null=null;
 const unrestrictedGameMap=rankingMode==='speed'&&required?new Map(fastGames.map(g=>[g.student+':'+g.attempt,g])):gameMap,competitionGameMap=deadline?new Map(competitionGames.map(g=>[g.student+':'+g.attempt,g])):unrestrictedGameMap;
 const combined=(r:Result,student:string,selectedGames=gameMap):Result=>{
  // Accuracy and participation never use durations, but still include every required stage.
  const key=student+':'+r.attempt,quiz=timeMap.get(key+':quiz');
  const quizMs=quiz?.samples===r.total?quiz.elapsed:null;
  if(!required){const clock=continuousMap.get(key),elapsed=clock?(clock.valid&&clock.finished_at!==null?clock.elapsed:null):quizMs;return untimed?r:{...r,solveMs:r.completed?elapsed:null};}
  const game=selectedGames.get(key),dictation=dictationMap.get(key),dictationTime=timeMap.get(key+':dictation');
  const completed=r.completed&&game?.completed&&dictation?.answered===DICTATION_POINTS?game.completed:null;
  const dictationMs=dictationTime?.samples===DICTATION_POINTS?dictationTime.elapsed:null;
  const solveMs=rankingMode==='speed'&&game?.wholeTimingSeen?(completed?game.wholeSolveMs:null):completed&&quizMs!==null&&dictationMs!==null&&typeof game?.solveMs==='number'?quizMs+dictationMs+game.solveMs:null;
  return {...r,...(untimed?{}:{solveMs}),quizScore:r.score,quizTotal:r.total,dictationScore:dictation?.score??0,dictationTotal:DICTATION_POINTS,gameScore:game?.score??0,gameTotal:BALLOON_POINTS,gameCompleted:game?.completed??null,score:r.score+(dictation?.score??0)+(game?.score??0),total:r.total+DICTATION_POINTS+BALLOON_POINTS,answered:r.answered+(dictation?.answered??0)+(game?.completed?BALLOON_POINTS:Math.min(game?.solved??0,BALLOON_POINTS-1)),completed};
 };
 for(const raw of live.results){const {_entryOrder,...source}=raw as unknown as Rank&{_entryOrder:number},r={...source,...combined(source,source.id,unrestrictedGameMap)},bestGrade=combined(source,source.id);rows.set(r.id,{...r,percentage:resultPercent(r),position:0,attempts:r.attempt});if(r.id===studentId&&source.completed)previousCertificate=source;if(r.id===studentId&&bestGrade.completed)certificate=bestGrade;}
 for(const raw of history.results){const source=raw as unknown as Result&{student:string},r=combined(source,source.student,unrestrictedGameMap),bestGrade=combined(source,source.student),current=rows.get(source.student);if(current&&compareAttempt(r,current)<0)rows.set(source.student,{...current,...r,created:current.created,id:source.student,percentage:resultPercent(r)});if(source.student===studentId&&source.completed&&(!previousCertificate||betterResult(source,previousCertificate)))previousCertificate=source;if(source.student===studentId&&bestGrade.completed&&(!certificate||betterResult(bestGrade,certificate)))certificate=bestGrade;}
 const joined=new Map(live.results.map(r=>[String(r.id),String(r.created)]));
 const removed=new Map(moderation.results.map(r=>[r.student,r.removed]));
 const allResults=[...rows.values()].map(r=>rankingMode==='balanced'?withLeaderboardBaseline(course.id,r,joined.get(r.id)||''):r).sort(compareRows);
 // Prize rankings use the best completed attempt strictly before the deadline.
 // Learning, later retries and certificates retain their unrestricted best result.
 const competitionRows=new Map<string,Rank>();
 for(const raw of [...live.results,...history.results]){
  const {_entryOrder,...source}=raw as unknown as Rank&{student?:string;_entryOrder?:number},id=source.student||source.id,current=rows.get(id);
  if(!current)continue;
  const result=combined(source,id,competitionGameMap);
  if(deadline&&(result.completed?Date.parse(result.completed)>=Date.parse(deadline):competition.ended))continue;
  if(deadline&&Date.parse(joined.get(id)||'')>=Date.parse(deadline))continue;
  const previous=competitionRows.get(id);
  if(!previous||compareAttempt(result,previous)<0)competitionRows.set(id,{...current,...result,created:current.created,percentage:resultPercent(result)});
 }
 const eligible=[...competitionRows.values()].map(r=>rankingMode==='balanced'?withLeaderboardBaseline(course.id,r,joined.get(r.id)||''):r).sort(compareRows);
 const leaderboard=eligible.filter(r=>!removed.has(r.id)&&!excludedTeacherEntry(course.id,r,joined.get(r.id)||'')).map((r,i)=>({...r,position:i+1}));
 const places=new Map(leaderboard.map(r=>[r.id,r.position]));
 const official=new Map(leaderboard.map(r=>[r.id,r]));
 const participants:StudentParticipation[]=teacherView?allResults.map(r=>({...r,...official.get(r.id),position:places.get(r.id)||0,removedAt:removed.get(r.id)||null,competing:places.has(r.id)})):[];
 return {competition,rankingMode,leaderboard,bestResult:studentId?(()=>{const own=allResults.find(r=>r.id===studentId);return own?{...own,position:places.get(studentId)||0}:null;})():null,certificate,...(required?{previousCertificate}: {}),...(teacherView?{participants}:{})};
}
