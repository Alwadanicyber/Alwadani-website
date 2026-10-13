'use client';
import {useEffect,useRef,useState} from 'react';
import {Target,Volume2,VolumeX,CheckCircle2,ArrowLeft} from 'lucide-react';
import type {PublicCourse} from '@/lib/course-types';
import {prepositionAim,balloonBurstPieces,PREPOSITION_ARROW_MS} from '@/lib/preposition-motion';
import {completeTimePlacePrompt} from '@/lib/time-place-learning';
import LearningText from './learning-text';
import {useLearningAudio} from './learning-audio';
type Answer={choice:number;correct:number;answerText:string;reason:string};
type Shot=ReturnType<typeof prepositionAim>&{choice:number;x:number;y:number};
export default function PrepositionBalloonQuestion({question,answer,busy,last,onChoice,onContinue}:{question:PublicCourse['questions'][number];answer?:Answer;busy:boolean;last:boolean;onChoice:(index:number)=>void;onContinue:()=>void}){
 const stage=useRef<HTMLDivElement>(null),continueButton=useRef<HTMLButtonElement>(null),pending=useRef(false);
 const [shot,setShot]=useState<Shot|null>(null),[aim,setAim]=useState(0),audio=useLearningAudio();
 const wrong=!!answer&&!answer.correct,paused=!!answer;
 useEffect(()=>{if(!busy&&!answer){pending.current=false;setShot(null);}},[busy,answer]);
 useEffect(()=>{if(wrong)continueButton.current?.focus({preventScroll:true});},[wrong]);
 function aimAt(clientX:number,clientY:number){
  if(pending.current||busy||answer||!stage.current)return;
  const board=stage.current.getBoundingClientRect();
  setAim(prepositionAim(board.width,board.height,clientX-board.left,clientY-board.top).bowAngle);
 }
 function aimBalloon(button:HTMLButtonElement){const box=button.getBoundingClientRect();aimAt(box.left+box.width/2,box.top+box.height/2);}
 function shoot(index:number,button:HTMLButtonElement){
  if(pending.current||busy||answer||!stage.current)return;
  pending.current=true;
  const board=stage.current.getBoundingClientRect(),target=button.getBoundingClientRect(),x=target.left-board.left+target.width/2,y=target.top-board.top+target.height/2;
  const direction=prepositionAim(board.width,board.height,x,y);
  setAim(direction.bowAngle);setShot({...direction,choice:index,x,y});audio.playEffect('pop');onChoice(index);
 }
 const completedPhrase=answer?completeTimePlacePrompt(question.prompt,answer.answerText):'';
 return <div className="prep-balloon-game"><div className="prep-balloon-heading"><span><Target size={19}/>تحدي حرف الجر · أطلق السهم</span><button className="secondary compact" aria-pressed={audio.sound} onClick={audio.toggleSound}>{audio.sound?<Volume2 size={18}/>:<VolumeX size={18}/>} {audio.sound?'الصوت مفعّل':'الصوت مكتوم'}</button></div>
  <div className="prep-balloon-prompt"><small>أي حرف جر يكمل العبارة؟</small><h3 dir="ltr">{question.prompt}</h3><p>وجّه القوس ثم اضغط البالونة المناسبة · أو استخدم Tab ثم Enter</p></div>
  <div ref={stage} className={'prep-balloon-stage'+(paused?' paused':'')} aria-label="ساحة بالونات حروف الجر" onPointerMove={event=>aimAt(event.clientX,event.clientY)} onPointerLeave={()=>{if(!pending.current)setAim(0);}} style={{'--arrow-time':PREPOSITION_ARROW_MS+'ms'} as React.CSSProperties}>
   <span className="prep-sky-cloud cloud-one" aria-hidden="true"/><span className="prep-sky-cloud cloud-two" aria-hidden="true"/><span className="prep-ground" aria-hidden="true"/>
   {question.options.map((option,i)=><button key={question.id+':'+option} type="button" className={'prep-flying-balloon prep-balloon-color-'+i+(shot?.choice===i?' hit':'')} aria-label={'أطلق السهم على بالونة '+option} disabled={busy||!!answer} style={{'--lane':((i+.5)*100/question.options.length)+'%','--flight':(9+i*.6)+'s','--delay':(-2-i*1.7)+'s'} as React.CSSProperties} onFocus={event=>aimBalloon(event.currentTarget)} onPointerDown={event=>aimBalloon(event.currentTarget)} onClick={event=>shoot(i,event.currentTarget)}><span dir="ltr">{option}</span><i aria-hidden="true"/></button>)}
   <div className={'prep-bow-mount'+(shot?' released':'')} aria-hidden="true" style={{'--bow-angle':aim+'deg'} as React.CSSProperties}><svg className="prep-bow" viewBox="0 0 140 70"><defs><linearGradient id={'bow-'+question.id} x1="0" x2="1"><stop stopColor="#6f431f"/><stop offset=".5" stopColor="#daaa61"/><stop offset="1" stopColor="#77471e"/></linearGradient></defs><path d="M16 20Q70 88 124 20" fill="none" stroke={'url(#bow-'+question.id+')'} strokeWidth="9" strokeLinecap="round"/><path className="prep-bow-string" d="M16 20L70 56L124 20" fill="none" stroke="#fff8e5" strokeWidth="2"/><path d="M70 43V64" fill="none" stroke="#314e58" strokeWidth="10" strokeLinecap="round"/>{!shot&&<path d="M70 53V10M62 20L70 5L78 20" fill="none" stroke="#173f57" strokeWidth="4" strokeLinecap="round"/>}</svg></div>
   {shot&&<><svg className="prep-arrow-shot" viewBox="0 0 60 16" aria-hidden="true" style={{'--dx':shot.dx+'px','--dy':shot.dy+'px','--angle':shot.angle+'deg'} as React.CSSProperties}><path d="M0 8H54M44 1L56 8L44 15M4 1L12 8L4 15" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg><div className={'prep-balloon-burst prep-balloon-color-'+shot.choice} aria-hidden="true" style={{left:shot.x,top:shot.y} as React.CSSProperties}><span className="prep-pop-ring"/><span className="prep-pop-flash"/>{balloonBurstPieces.map((piece,i)=><i key={i} style={{'--piece-x':piece.dx+'px','--piece-y':piece.dy+'px','--piece-turn':piece.rotation+'deg','--piece-delay':(PREPOSITION_ARROW_MS+piece.delay)+'ms'} as React.CSSProperties}/>)}</div></>}
   {wrong&&<div className={'prep-balloon-correction'+(shot?' after-shot':'')} role="alert"><span className="prep-correction-kicker">توقفت الحركة · فرصة للفهم</span><h4>اخترت <bdi dir="ltr">{question.options[answer.choice]}</bdi>، والصحيح <bdi dir="ltr">{answer.answerText}</bdi>.</h4><p className="prep-completed-phrase" dir="ltr">{completedPhrase}</p><p dir="rtl"><LearningText text={answer.reason}/></p><button ref={continueButton} className="primary" disabled={busy} onClick={onContinue}>{last?'فهمت، أكمل الرحلة':'فهمت، أكمل اللعب'}<ArrowLeft size={18}/></button></div>}
  </div>
  {!answer?<p className="prep-game-status" role="status">{busy?'السهم وصل… جارٍ حفظ إجابتك':'البالونات تتحرك؛ اختر الحرف حسب المعنى.'}</p>:answer.correct?<div className="prep-game-success" role="status"><CheckCircle2 size={23}/><div><strong>أحسنت! <bdi dir="ltr">{completedPhrase}</bdi></strong><p>{last?'أكملت لعبة حروف الجر.':'ننتقل تلقائيًا إلى البالونة التالية…'}</p></div>{last&&<button className="primary" disabled={busy} onClick={onContinue}>استلم شهادتك</button>}</div>:null}
  {audio.audioNotice&&<p className="audio-notice" role="status">{audio.audioNotice}</p>}
 </div>;
}
