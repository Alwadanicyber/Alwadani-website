export type Result={score:number;total:number;answered:number;completed:string|null;attempt:number;created:string;solveMs?:number|null;estimatedSolveMs?:number|null;title?:string;quizScore?:number;quizTotal?:number;gameScore?:number;gameTotal?:number;gameCompleted?:string|null;dictationScore?:number;dictationTotal?:number};
export type Rank=Result&{id:string;name:string;percentage:number;position:number;attempts:number};
export const resultPercent=(r:Result)=>r.total>0?r.score/r.total*100:0;
export function compareResults(a:Result,b:Result){
  const completion=Number(!!b.completed)-Number(!!a.completed);
  if(completion)return completion;
  const grade=resultPercent(b)-resultPercent(a);
  if(grade)return grade;
  if(a.completed&&b.completed){
    const time=(r:Result)=>typeof r.solveMs==='number'&&r.solveMs>0?r.solveMs:typeof r.estimatedSolveMs==='number'&&r.estimatedSolveMs>0?r.estimatedSolveMs:null;
    const timeA=time(a),timeB=time(b);
    if(timeA!==null&&timeB!==null)return timeA-timeB;
    if(timeA!==null)return -1;
    if(timeB!==null)return 1;
    return 0;
  }
  return (b.total>0?b.answered/b.total:0)-(a.total>0?a.answered/a.total:0);
}
export function betterResult(a:Result,b:Result){return compareResults(a,b)<0;}
