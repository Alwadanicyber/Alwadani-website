import {database} from './database';
import {wordScenes} from './chores-learning';
import {GameError} from './balloon-assessment';
export const dictationWords=['wake up','get up','get dressed','comic book','leaves','trash can'];
export const DICTATION_POINTS=dictationWords.length;
const spellingTips=['wake up من كلمتين. wake تنتهي بحرف e، ثم مسافة وup.','get up من كلمتين. get ثم مسافة وup.','get dressed من كلمتين. dressed تحتوي على حرفَي s وتنتهي بـ ed.','comic book من كلمتين. book تحتوي على حرفَي o.','leaves كتابة جمع leaf. احرص على الترتيب ea ثم ves.','trash can من كلمتين. trash تنتهي بـ sh، ثم مسافة وcan.'];
export const dictationSchema='CREATE TABLE IF NOT EXISTS student_dictation_answers(student TEXT NOT NULL REFERENCES students(id),attempt INTEGER NOT NULL,question INTEGER NOT NULL,text TEXT NOT NULL,correct INTEGER NOT NULL,created TEXT NOT NULL,PRIMARY KEY(student,attempt,question))';
export type DictationAnswer={question:number;text:string;correct:number;expected:string;reason:string};
export type DictationState={items:{id:number;scene:string;audio:string}[];answers:DictationAnswer[];total:number;completed:boolean};
export async function dictationSnapshot(student?:string,attempt=1):Promise<DictationState>{
 const saved=student?(await database().prepare('SELECT question,text,correct FROM student_dictation_answers WHERE student=? AND attempt=? ORDER BY question').bind(student,attempt).all()).results:[];
 const answers=saved.map(r=>{const expected=dictationWords[Number(r.question)-1];return {...r,expected,reason:Number(r.correct)?'إملاء صحيح!':`الإملاء الصحيح: ${expected}. ${spellingTips[Number(r.question)-1]}`} as DictationAnswer;});
 return {items:dictationWords.map((audio,i)=>({id:i+1,audio,scene:wordScenes[audio]})),answers,total:DICTATION_POINTS,completed:answers.length===DICTATION_POINTS};
}
export async function answerDictation(student:string,attempt:number,question:unknown,text:unknown,elapsed:number|null=null){
 if(!Number.isInteger(question)||!dictationWords[Number(question)-1])throw new GameError('كلمة إملاء غير صالحة.');
 if(typeof text!=='string'||!text.trim()||text.length>100||/[<>\x00-\x1f]/.test(text))throw new GameError('اكتب الكلمة بالإنجليزية، حتى 100 حرف.');
 const db=database(),previous=await db.prepare('SELECT COUNT(*) AS n FROM student_dictation_answers WHERE student=? AND attempt=? AND question<?').bind(student,attempt,question).first<{n:number}>();
 if(previous?.n!==Number(question)-1)throw new GameError('أكمل كلمات الإملاء بالترتيب.');
 const correct=text.trim().toLowerCase().replace(/\s+/g,' ')===dictationWords[Number(question)-1]?1:0;
 await db.batch([
  ...(elapsed===null?[]:[db.prepare("INSERT OR IGNORE INTO student_answer_times(student,attempt,stage,question,elapsed_ms) SELECT ?,?,'dictation',?,? WHERE EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?) AND NOT EXISTS(SELECT 1 FROM student_dictation_answers WHERE student=? AND attempt=? AND question=?)").bind(student,attempt,question,elapsed,student,attempt,student,attempt,question)]),
  db.prepare('INSERT OR IGNORE INTO student_dictation_answers(student,attempt,question,text,correct,created) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM student_sessions WHERE student=? AND attempt=?)').bind(student,attempt,question,text.trim(),correct,new Date().toISOString(),student,attempt)
 ]);
}
export async function allDictationResults(){return (await database().prepare('SELECT student,attempt,COUNT(*) AS answered,SUM(correct) AS score FROM student_dictation_answers GROUP BY student,attempt').all()).results as unknown as {student:string;attempt:number;answered:number;score:number}[];}
