import {database} from './database';
import {CHORES_COURSE_ID,balloonWords,balloonLevels,makeBalloonRounds,initialBalloonRun,popBalloon,type BalloonDifficulty,type BalloonRound,type BalloonRun} from './chores-learning';
export const BALLOON_POINTS=balloonWords.length;
type SavedState={run:BalloonRun;roundIndex:number;points:number;answered:number;log:{round:number;choice:string;correct:boolean;first:boolean}[]};
type SavedGame={id:string;student:string;attempt:number;difficulty:BalloonDifficulty;rounds:string;state:string;revision:number;completed:string|null};
export type AssessedGame={id:string;revision:number;difficulty:BalloonDifficulty;lives:number;score:number;solved:number;answered:number;roundIndex:number;total:number;feedback:BalloonRun['feedback'];status:BalloonRun['status'];popped:string[];completed:string|null;word:{en:string;ar?:string;tip?:string};options:BalloonRound['options']};
export type GameBest={score:number;total:number;completed:string;difficulty:BalloonDifficulty};
export class GameError extends Error{constructor(message:string,public status=400){super(message);}}
export const gameSchema=`CREATE TABLE IF NOT EXISTS student_game_runs(id TEXT PRIMARY KEY,student TEXT NOT NULL REFERENCES students(id),attempt INTEGER NOT NULL,difficulty TEXT NOT NULL,rounds TEXT NOT NULL,state TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 0,score INTEGER NOT NULL DEFAULT 0,answered INTEGER NOT NULL DEFAULT 0,solved INTEGER NOT NULL DEFAULT 0,status TEXT NOT NULL DEFAULT 'playing',created TEXT NOT NULL,completed TEXT)`;
function visible(g:SavedGame):AssessedGame{const state=JSON.parse(g.state) as SavedState,rounds=JSON.parse(g.rounds) as BalloonRound[],r=rounds[state.roundIndex];return {id:g.id,revision:g.revision,difficulty:g.difficulty,lives:state.run.lives,score:state.points,solved:state.run.score,answered:state.answered,roundIndex:state.roundIndex,total:rounds.length,feedback:state.run.feedback,status:state.run.status,popped:state.run.popped,completed:g.completed,word:state.run.feedback?{en:r.word.en,ar:r.word.ar,tip:r.word.tip}:{en:r.word.en},options:r.options};}
export async function gameSnapshot(student:string,attempt:number){const db=database();const [latest,best]=await Promise.all([db.prepare('SELECT * FROM student_game_runs WHERE student=? AND attempt=? ORDER BY created DESC,id DESC LIMIT 1').bind(student,attempt).first<SavedGame>(),db.prepare("SELECT score,completed,difficulty FROM student_game_runs WHERE student=? AND attempt=? AND status='won' ORDER BY score DESC,completed ASC LIMIT 1").bind(student,attempt).first<{score:number;completed:string;difficulty:BalloonDifficulty}>()]);return {game:latest?visible(latest):null,gameBest:best?{...best,total:BALLOON_POINTS}:null};}
export async function startGame(student:string,attempt:number,difficulty:unknown,restart=false){
 if(typeof difficulty!=='string'||!Object.hasOwn(balloonLevels,difficulty))throw new GameError('اختر مستوى صعوبة صالحًا.');
 const db=database(),current=await gameSnapshot(student,attempt);if(!restart&&current.game&&current.game.difficulty===difficulty)return;
 const id=crypto.randomUUID(),now=new Date().toISOString(),state:SavedState={run:{...initialBalloonRun,popped:[]},roundIndex:0,points:0,answered:0,log:[]};
 const changed=await db.prepare('INSERT INTO student_game_runs(id,student,attempt,difficulty,rounds,state,created) SELECT ?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?)').bind(id,student,attempt,difficulty,JSON.stringify(makeBalloonRounds(Math.random,difficulty as BalloonDifficulty)),JSON.stringify(state),now,student,attempt).run();
 if(!changed.meta.changes)throw new GameError('تغيّرت المحاولة. أعد تحميل تقدمك.',409);
}
export async function gameStep(student:string,attempt:number,body:{action?:string;run?:string;revision?:number;selection?:string},questionCount:number,lessonCount:number,dictationCount:number){
 if(typeof body.run!=='string'||!Number.isInteger(body.revision))throw new GameError('أعد تحميل جولة اللعبة قبل المتابعة.',409);
 const db=database(),g=await db.prepare('SELECT * FROM student_game_runs WHERE id=? AND student=? AND attempt=?').bind(body.run,student,attempt).first<SavedGame>();
 if(!g||g.revision!==body.revision)throw new GameError('تقدّمت اللعبة. أعد تحميل الجولة.',409);
 const state=JSON.parse(g.state) as SavedState,rounds=JSON.parse(g.rounds) as BalloonRound[],r=rounds[state.roundIndex];
 if(state.run.status!=='playing')throw new GameError('انتهت هذه الجولة. ابدأ جولة جديدة.');
 if(body.action==='game-pop'){
  if(state.run.feedback)throw new GameError('اقرأ التصحيح أو انتظر الانتقال إلى الكلمة التالية.');
  if(typeof body.selection!=='string')throw new GameError('بالونة غير صالحة.');
  const next=popBalloon(state.run,r,body.selection,rounds.length);if(next===state.run)throw new GameError('بالونة غير صالحة أو تم اختيارها بالفعل.');
  const first=state.run.popped.length===0,correct=body.selection===r.word.en;if(first){state.answered++;if(correct)state.points++;}state.log.push({round:state.roundIndex,choice:body.selection,correct,first});state.run=next;
 }else if(body.action==='game-next'){
  if(state.run.feedback!=='correct'||state.roundIndex>=rounds.length-1)throw new GameError('أجب عن الكلمة الحالية أولًا.');
  state.roundIndex++;state.run={...state.run,feedback:null,popped:[]};
 }else if(body.action==='game-resume'){
  if(state.run.feedback!=='wrong')throw new GameError('لا يوجد تصحيح معلّق.');state.run={...state.run,feedback:null};
 }else throw new GameError('طلب لعبة غير صالح.');
 const now=state.run.status==='won'?new Date().toISOString():null;
 const updates=[db.prepare('UPDATE student_game_runs SET state=?,revision=revision+1,score=?,answered=?,solved=?,status=?,completed=? WHERE id=? AND student=? AND attempt=? AND revision=? AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?)').bind(JSON.stringify(state),state.points,state.answered,state.run.score,state.run.status,now,g.id,student,attempt,g.revision,student,attempt)];
 if(now)updates.push(db.prepare("UPDATE students SET completed=? WHERE id=? AND EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?) AND EXISTS(SELECT 1 FROM student_game_runs WHERE id=? AND revision=? AND status='won') AND (SELECT COUNT(*) FROM answers WHERE student=?)=? AND (SELECT COUNT(*) FROM reads WHERE student=?)=? AND (SELECT COUNT(*) FROM student_dictation_answers WHERE student=? AND attempt=?)=?").bind(now,student,student,attempt,g.id,g.revision+1,student,questionCount,student,lessonCount,student,attempt,dictationCount));
 const results=await db.batch(updates);if(!results[0].meta.changes)throw new GameError('تقدّمت اللعبة. أعد تحميل الجولة.',409);
}
export async function allGameResults(){return (await database().prepare("SELECT g.student,g.attempt,b.score,b.completed,g.solved FROM (SELECT student,attempt,MAX(solved) AS solved FROM student_game_runs GROUP BY student,attempt) g LEFT JOIN student_game_runs b ON b.id=(SELECT id FROM student_game_runs WHERE student=g.student AND attempt=g.attempt AND status='won' ORDER BY score DESC,completed ASC,id ASC LIMIT 1)").all()).results as unknown as {student:string;attempt:number;score:number|null;completed:string|null;solved:number}[];}
