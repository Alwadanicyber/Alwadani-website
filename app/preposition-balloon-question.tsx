'use client';
import {useEffect,useRef,useState} from 'react';
import {Target,Volume2,VolumeX,CheckCircle2,ArrowLeft} from 'lucide-react';
import type {PublicCourse} from '@/lib/course-types';
import {useLearningAudio} from './learning-audio';
type Answer={choice:number;correct:number;answerText:string;reason:string};
export default function PrepositionBalloonQuestion({question,answer,busy,last,onChoice,onContinue}:{question:PublicCourse['questions'][number];answer?:Answer;busy:boolean;last:boolean;onChoice:(index:number)=>void;onContinue:()=>void}){
 const stage=useRef<HTMLDivElement>(null),continueButton=useRef<HTMLButtonElement>(null),pending=useRef(false),[shot,setShot]=useState<{choice:number;dx:number;dy:number;angle:number}|null>(null),audio=useLearningAudio();
 const wrong=!!answer&&!answer.correct,paused=!!answer;
 useEffect(()=>{if(!busy&&!answer){pending.current=false;setShot(null);}},[busy,answer]);
 useEffect(()=>{if(wrong)continueButton.current?.focus({preventScroll:true});},[wrong]);
 function shoot(index:number,button:HTMLButtonElement){
  if(pending.current||busy||answer||!stage.current)return;
  pending.current=true;const board=stage.current.getBoundingClientRect(),target=button.getBoundingClientRect(),x=board.width/2,y=board.height-43,dx=target.left-board.left+target.width/2-x,dy=target.top-board.top+target.height/2-y;
  setShot({choice:index,dx,dy,angle:Math.atan2(dy,dx)*180/Math.PI});audio.playEffect('pop');onChoice(index);
 }
 const completedPhrase=answer?question.prompt.replace('___',answer.answerText):'';
 return <div className="prep-balloon-game"><div className="prep-balloon-heading"><span><Target size={19}/>تحدي حرف الجر · أطلق السهم</span><button className="secondary compact" aria-pressed={audio.sound} onClick={audio.toggleSound}>{audio.sound?<Volume2 size={18}/>:<VolumeX size={18}/>} {audio.sound?'الصوت مفعّل':'الصوت مكتوم'}</button></div>
  <div className="prep-balloon-prompt"><small>أي حرف جر يكمل العبارة؟</small><h3 dir="ltr">{question.prompt}</h3><p>اضغط البالونة المناسبة لإطلاق السهم · أو استخدم Tab ثم Enter</p></div>
  <div ref={stage} className={'prep-balloon-stage'+(paused?' paused':'')} aria-label="ساحة بالونات حروف الجر"><span className="prep-sky-cloud cloud-one" aria-hidden="true"/><span className="prep-sky-cloud cloud-two" aria-hidden="true"/><span className="prep-ground" aria-hidden="true"/>
   {question.options.map((option,i)=><button key={question.id+':'+option} type="button" className={'prep-flying-balloon prep-balloon-color-'+i+(shot?.choice===i?' hit':'')} aria-label={'أطلق السهم على بالونة '+option} disabled={busy||!!answer} style={{'--lane':((i+.5)*100/question.options.length)+'%','--flight':(9+i*.6)+'s','--delay':(-2-i*1.7)+'s'} as React.CSSProperties} onClick={event=>shoot(i,event.currentTarget)}><span dir="ltr">{option}</span><i aria-hidden="true"/><span className="prep-balloon-spark" aria-hidden="true">✦</span></button>)}
   <svg className="prep-bow" viewBox="0 0 140 70" aria-label="قوس إطلاق السهم" role="img"><path d="M16 20Q70 88 124 20" fill="none" stroke="#a56d35" strokeWidth="9" strokeLinecap="round"/><path d="M16 20L70 56L124 20" fill="none" stroke="#fff8e5" strokeWidth="2"/><path d="M70 64V10M62 20L70 5L78 20" fill="none" stroke="#173f57" strokeWidth="4" strokeLinecap="round"/></svg>
   {shot&&<svg className="prep-arrow-shot" viewBox="0 0 60 16" aria-hidden="true" style={{'--dx':shot.dx+'px','--dy':shot.dy+'px','--angle':shot.angle+'deg'} as React.CSSProperties}><path d="M0 8H54M44 1L56 8L44 15M4 1L12 8L4 15" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>}
   {wrong&&<div className="prep-balloon-correction" role="alert"><span className="prep-correction-kicker">توقفت الحركة · فرصة للفهم</span><h4>اخترت <bdi>{question.options[answer.choice]}</bdi>، والصحيح <bdi>{answer.answerText}</bdi>.</h4><p className="prep-completed-phrase" dir="ltr">{completedPhrase}</p><p>{answer.reason}</p><button ref={continueButton} className="primary" disabled={busy} onClick={onContinue}>{last?'فهمت، أكمل الرحلة':'فهمت، أكمل اللعب'}<ArrowLeft size={18}/></button></div>}
  </div>
  {!answer?<p className="prep-game-status" role="status">{busy?'السهم وصل… جارٍ حفظ إجابتك':'البالونات تتحرك؛ اختر الحرف حسب المعنى.'}</p>:answer.correct?<div className="prep-game-success" role="status"><CheckCircle2 size={23}/><div><strong>أحسنت! <bdi>{completedPhrase}</bdi></strong><p>{last?'أكملت لعبة حروف الجر.':'ننتقل تلقائيًا إلى البالونة التالية…'}</p></div>{last&&<button className="primary" disabled={busy} onClick={onContinue}>استلم شهادتك</button>}</div>:null}
  {audio.audioNotice&&<p className="audio-notice" role="status">{audio.audioNotice}</p>}
 </div>;
}
