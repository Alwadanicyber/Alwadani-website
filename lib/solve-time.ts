export const MAX_SOLVE_MS=86_400_000;
export class SolveTimeError extends Error{}
export function parseSolveMs(value:unknown):number|null{
  if(value===undefined||value===null)return null;
  if(typeof value!=='number'||!Number.isSafeInteger(value)||value<1||value>MAX_SOLVE_MS)throw new SolveTimeError('وقت الحل غير صالح. أعد تحميل السؤال وحاول مجددًا.');
  return value;
}
export function formatSolveTime(ms:number){
  const hundredths=Math.round(ms/10),minutes=Math.floor(hundredths/6000),seconds=Math.floor(hundredths/100)%60;
  return `${minutes}:${String(seconds).padStart(2,'0')}.${String(hundredths%100).padStart(2,'0')}`;
}
export class ActiveSolveTimer{
  private started:number|null=null;
  private elapsed:number;
  private clock:()=>number;
  constructor(initial=0,clock=()=>performance.now()){this.clock=clock;this.elapsed=Number.isFinite(initial)?Math.max(0,initial):0;}
  resume(){if(this.started===null)this.started=this.clock();}
  pause(){if(this.started!==null){this.elapsed+=Math.max(0,this.clock()-this.started);this.started=null;}}
  value(){return Math.min(MAX_SOLVE_MS,Math.round(this.elapsed+(this.started===null?0:Math.max(0,this.clock()-this.started))));}
  capture(){this.pause();return Math.max(1,this.value());}
}
