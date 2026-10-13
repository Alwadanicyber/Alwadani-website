export function continuousElapsed(clock:{elapsed_ms:number;running_since:number|null;finished_at:number|null},now:number){return Math.min(86_400_000,clock.elapsed_ms+(clock.running_since!==null&&clock.finished_at===null?Math.max(0,now-clock.running_since):0));}
export const speedViewForTab=(tab:string,mode:string)=>tab==='learn'&&mode==='explain'||tab==='videos'?'explain':'solve';
