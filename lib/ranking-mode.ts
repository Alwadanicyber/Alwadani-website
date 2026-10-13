import type {Result} from './result-ranking';
export type RankingMode='accuracy'|'speed'|'balanced'|'participation';
export type RankingChoice='accuracy'|'speed'|'default';
export function defaultRankingMode(course:string):RankingMode{
 return course==='life-stories-time-place-grade-9'?'accuracy':course==='present-tenses-grade-4-02'?'participation':'balanced';
}
export function parseRankingChoice(value:unknown):RankingChoice{
 if(value!=='accuracy'&&value!=='speed'&&value!=='default')throw new Error('اختر المنافسة بالأسرع أو بالأدق.');
 return value;
}
export const rankingUsesTime=(mode:RankingMode)=>mode==='speed'||mode==='balanced';
const percent=(r:Result)=>r.total>0?r.score/r.total:0;
const measuredTime=(r:Result)=>typeof r.solveMs==='number'&&r.solveMs>0?r.solveMs:null;
// Enrollment order is applied between students, never the completion/retry date.
export function compareCompetitionResults(a:Result,b:Result,mode:RankingMode){
 if(mode==='accuracy')return percent(b)-percent(a);
 if(mode==='speed'){
  const completion=Number(!!b.completed)-Number(!!a.completed);if(completion)return completion;
  if(a.completed&&b.completed){
   const ta=measuredTime(a),tb=measuredTime(b);
   if(ta!==null&&tb!==null&&ta!==tb)return ta-tb;
   if(ta!==null&&tb===null)return -1;if(tb!==null&&ta===null)return 1;
  }
 }
 return percent(b)-percent(a)||Number(!!b.completed)-Number(!!a.completed)||(b.total>0?b.answered/b.total:0)-(a.total>0?a.answered/a.total:0);
}
export function rankingDescription(mode:RankingMode){
 return mode==='speed'?'الأسرع: أقل وقت حل بعد إكمال الدرس أولًا. عند تساوي الوقت تتقدّم الدرجة الأعلى، ثم من بدأ أولًا.':mode==='accuracy'?'الأدق: أعلى درجة أولًا. عند تساوي الدرجة يتقدّم من سجّل اسمه وبدأ الدرس أولًا، دون احتساب السرعة.':mode==='participation'?'المشاركات حسب الاسم، للتعلّم على مهل دون ترتيب بالسرعة.':'الدرجة أولًا، وعند التعادل يتقدّم الأسرع في الحل.';
}
