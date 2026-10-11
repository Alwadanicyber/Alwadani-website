export type CompetitionSettings={enabled:boolean;showCountdown:boolean;endsAt:string|null;prize:string;updated:string|null};
export type CompetitionState=CompetitionSettings&{serverNow:string;ended:boolean};
export const defaultCompetition=(course:string):CompetitionSettings=>({
  enabled:course==='chores-grade-4',showCountdown:true,
  endsAt:course==='chores-grade-4'?'2026-10-14T13:00:00.000Z':null,
  prize:course==='chores-grade-4'?'جائزة للمركز الأول':'',updated:null,
});
export function competitionState(settings:CompetitionSettings,now=Date.now()):CompetitionState{
  return {...settings,serverNow:new Date(now).toISOString(),ended:!!(settings.enabled&&settings.endsAt&&now>=Date.parse(settings.endsAt))};
}
export function countdownParts(end:string,now:number){
  const total=Math.max(0,Math.ceil((Date.parse(end)-now)/1000));
  return {days:Math.floor(total/86400),hours:Math.floor(total%86400/3600),minutes:Math.floor(total%3600/60),seconds:total%60};
}
export function riyadhLocal(iso:string){return new Date(Date.parse(iso)+3*3600000).toISOString().slice(0,16);}
export function riyadhInstant(local:string){
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local))throw new Error('اختر تاريخًا ووقتًا صحيحين.');
  const value=new Date(local+':00+03:00');
  if(!Number.isFinite(value.getTime())||riyadhLocal(value.toISOString())!==local)throw new Error('اختر تاريخًا ووقتًا صحيحين.');
  return value.toISOString();
}
export function competitionDate(iso:string){return new Date(iso).toLocaleString('ar-SA',{calendar:'gregory',weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'Asia/Riyadh'});}
export function parseCompetition(input:unknown,now=Date.now()):CompetitionSettings{
  if(!input||typeof input!=='object')throw new Error('راجع إعدادات المنافسة.');
  const b=input as Record<string,unknown>;
  if(typeof b.enabled!=='boolean'||typeof b.showCountdown!=='boolean'||typeof b.prize!=='string'||b.prize.trim().length>200||/[<>\x00-\x1f]/.test(b.prize))throw new Error('راجع الإعلان وإعدادات العدّاد.');
  let endsAt:string|null=null;
  if(b.enabled){
    if(b.mode==='days'){
      const days=b.days,hours=b.hours,minutes=b.minutes;
      if(!Number.isInteger(days)||Number(days)<0||Number(days)>3650||!Number.isInteger(hours)||Number(hours)<0||Number(hours)>23||!Number.isInteger(minutes)||Number(minutes)<0||Number(minutes)>59)throw new Error('أدخل مدة صحيحة بالأيام والساعات والدقائق.');
      const duration=(Number(days)*86400+Number(hours)*3600+Number(minutes)*60)*1000;
      if(duration<60000||duration>3650*86400000)throw new Error('اختر مدة من دقيقة إلى 3650 يومًا.');
      endsAt=new Date(now+duration).toISOString();
    }else if(b.mode==='date'&&typeof b.endsAt==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(b.endsAt)){
      const time=Date.parse(b.endsAt);
      if(!Number.isFinite(time)||new Date(time).toISOString()!==b.endsAt||time<=now||time>now+3650*86400000)throw new Error('اختر موعدًا مستقبليًا صحيحًا خلال 3650 يومًا.');
      endsAt=b.endsAt;
    }else throw new Error('اختر عدد الأيام أو تاريخ النهاية.');
  }
  return {enabled:b.enabled,showCountdown:b.showCountdown,endsAt,prize:b.prize.trim(),updated:new Date(now).toISOString()};
}
