'use client';
import {useEffect,useRef,useState} from 'react';
import {gradeLabel} from '@/lib/grades';
import {Timer,Trophy,RotateCcw,Flag} from 'lucide-react';
import {competitionDate,countdownParts,type CompetitionState} from '@/lib/competition';
import {rankingDescription,type RankingMode} from '@/lib/ranking-mode';
export default function CompetitionBanner({competition,grade,onEnd,rankingMode='balanced'}:{competition?:CompetitionState;grade?:string;onEnd:()=>void;rankingMode?:RankingMode}){
  const [now,setNow]=useState(0),notified=useRef(''),callback=useRef(onEnd);callback.current=onEnd;
  useEffect(()=>{
    if(!competition?.enabled||!competition.endsAt)return;
    // Anchor to the server's clock; a device clock change cannot restart the timer.
    const received=performance.now(),server=Date.parse(competition.serverNow),end=Date.parse(competition.endsAt);
    function tick(){const time=server+performance.now()-received;setNow(time);if(time>=end&&notified.current!==competition!.endsAt){notified.current=competition!.endsAt!;callback.current();}}
    tick();const timer=window.setInterval(tick,1000);return ()=>window.clearInterval(timer);
  },[competition?.enabled,competition?.endsAt,competition?.serverNow]);
  if(!competition?.enabled||!competition.endsAt)return null;
  const ended=competition.ended||now>0&&now>=Date.parse(competition.endsAt),parts=countdownParts(competition.endsAt,now||Date.parse(competition.serverNow));
  return <aside className={'leaderboard-event'+(ended?' event-ended':'')} aria-label="موعد منافسة الدرس">
    <div className="event-heading"><span className="event-icon">{ended?<Flag size={26}/>:<Trophy size={26}/>}</span><div><span className="event-eyebrow">{ended?'النتائج النهائية':'تحدّي المنافسة'}{grade&&' · '+gradeLabel(grade)}</span><h3>{ended?'انتهت المنافسة، شكرًا لمشاركتكم!':'موعد نهاية المنافسة'}</h3></div></div>
    <p className="event-deadline">{ended?'انتهت المنافسة يوم ':'تنتهي المنافسة يوم '}<time dateTime={competition.endsAt}>{competitionDate(competition.endsAt)}</time><small>بتوقيت السعودية</small></p>
    {competition.prize&&<p className="event-prize"><Trophy size={18}/>{competition.prize}</p>}
    <p className="event-retries"><RotateCcw size={18}/>{ended?'تستطيع متابعة التعلّم والمحاولة. نتائج المنافسة تعتمد على أفضل محاولة مكتملة قبل موعد النهاية.':'يمكنك المحاولة أكثر من مرة؛ سنختار أفضل محاولة مكتملة حسب طريقة المنافسة قبل موعد النهاية. '+rankingDescription(rankingMode)}</p>
    {competition.showCountdown&&!ended&&<div className="event-countdown" role="timer" aria-label="الوقت المتبقي للمنافسة" aria-live="off"><span className="countdown-caption"><Timer size={17}/>الوقت المتبقي</span><div>{(['days','hours','minutes','seconds'] as const).map((key,i)=><span className="countdown-unit" key={key}><strong>{String(parts[key]).padStart(2,'0')}</strong><small>{['أيام','ساعات','دقائق','ثوانٍ'][i]}</small></span>)}</div></div>}
  </aside>;
}
