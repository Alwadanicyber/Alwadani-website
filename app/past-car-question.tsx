'use client';
import {useEffect,useLayoutEffect,useId,useRef,useState,type CSSProperties} from 'react';
import {Volume2,Flag,ArrowLeft,MoveHorizontal,RotateCcw} from 'lucide-react';
import type {PublicCourse} from '@/lib/course-types';
import {pastWord,routeLabels,type PastRoute} from '@/lib/past-simple-learning';
import {PastPicture,RallyCar} from './past-simple-pictures';
import {useLearningAudio} from './learning-audio';
import PastText from './past-simple-text';
import './past-simple.css';

const clamp=(x:number)=>Math.max(.105,Math.min(.895,x));
const laneFor=(x:number)=>Math.min(3,Math.max(0,Math.floor(x*4)));
const routeText=(s:string)=>s==='double + ed'?'pp + ed':s;
type Phase='ready'|'driving'|'saving'|'error'|'feedback';
type Props={question:PublicCourse['questions'][number];answer?:{choice:number;answerText:string;correct:number;reason:string};busy:boolean;last:boolean;onChoice:(index:number)=>Promise<unknown>;onContinue:()=>void};
export default function PastCarQuestion({question,answer,busy,last,onChoice,onContinue}:Props){
 const helpId=useId(),road=useRef<HTMLDivElement>(null),fresh=useRef(false),pending=useRef(false),next=useRef(onContinue),answerRef=useRef(answer),sendRef=useRef<(i:number)=>void>(()=>{}),audio=useLearningAudio(),w=pastWord(question.prompt),correct=!!answer?.correct;
 next.current=onContinue;answerRef.current=answer;
 const roundMs=Math.max(4000,7000-Math.floor(Math.max(0,question.id-9)/2)*1000),previousQuestion=useRef(question.id),runStarted=useRef(false);
 const initialX=answer?(answer.choice+.5)/4:.5;
 const runtime=useRef({x:initialX,elapsed:answer?roundMs:0,left:false,right:false,phase:(answer?'feedback':'ready') as Phase,pointerId:-1,pointerX:0,originX:initialX,dragging:false});
 const [phase,setPhase]=useState<Phase>(answer?'feedback':'ready'),[drive,setDrive]=useState({x:initialX,progress:answer?1:0}),[size,setSize]=useState({width:600,height:510}),[submittedLane,setSubmittedLane]=useState<number|null>(answer?.choice??null),[sending,setSending]=useState(false);
 const editable=!answer&&!busy&&!sending&&(phase==='ready'||phase==='driving');
 function start(){const r=runtime.current;if(!editable)return;runStarted.current=true;if(r.phase!=='driving'){r.phase='driving';setPhase('driving');audio.playEffect('tap');}}
 function clearInputs(){const r=runtime.current;r.left=false;r.right=false;r.dragging=false;}
 async function saveCrossing(lane:number){
  if(pending.current||answerRef.current)return;
  pending.current=true;fresh.current=true;setSending(true);setSubmittedLane(lane);runtime.current.phase='saving';setPhase('saving');
  try{await onChoice(lane);}finally{pending.current=false;setSending(false);if(!answerRef.current){runtime.current.phase='error';setPhase('error');}}
 }
 sendRef.current=(i:number)=>{void saveCrossing(i);};
 useEffect(()=>{const node=road.current;if(!node)return;const resize=()=>setSize({width:node.clientWidth,height:node.clientHeight});resize();const observer=new ResizeObserver(resize);observer.observe(node);node.focus({preventScroll:true});return()=>observer.disconnect();},[]);
 useEffect(()=>{const hide=()=>{if(document.hidden)clearInputs();};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide);},[]);
 useLayoutEffect(()=>{
  if(previousQuestion.current===question.id)return;
  previousQuestion.current=question.id;const r=runtime.current;
  r.elapsed=answer?roundMs:0;r.phase=answer?'feedback':runStarted.current?'driving':'ready';
  if(answer){r.x=(answer.choice+.5)/4;clearInputs();}
  fresh.current=false;pending.current=false;setSending(false);setSubmittedLane(answer?.choice??null);setDrive({x:r.x,progress:answer?1:0});setPhase(r.phase);
 },[question.id]);
 useEffect(()=>{if(answer){runtime.current.phase=answer.correct&&runStarted.current?'saving':'feedback';if(!answer.correct)clearInputs();setPhase(runtime.current.phase);setDrive({x:(answer.choice+.5)/4,progress:1});}},[answer]);
 useEffect(()=>{
  if(phase!=='driving')return;
  let frame=0,lastFrame=performance.now(),lastPaint=0;
  const tick=(now:number)=>{const r=runtime.current;if(r.phase!=='driving')return;const elapsed=Math.max(0,now-lastFrame),dt=Math.min(80,elapsed);lastFrame=now;r.elapsed=Math.min(roundMs,r.elapsed+elapsed);
   if(!r.dragging)r.x=clamp(r.x+(Number(r.right)-Number(r.left))*dt*.0008);
   const progress=r.elapsed/roundMs;
   if(now-lastPaint>=32||progress===1){setDrive({x:r.x,progress});lastPaint=now;}
   if(progress>=1){r.phase='saving';sendRef.current(laneFor(r.x));return;}
   frame=requestAnimationFrame(tick);
  };frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[phase,question.id,roundMs]);
 useEffect(()=>{if(!answer?.correct||!fresh.current||busy)return;const timer=setTimeout(()=>{fresh.current=false;next.current();},160);return()=>clearTimeout(timer);},[answer?.correct,busy,question.id]);
 function keyDown(e:React.KeyboardEvent){if(!['ArrowLeft','ArrowRight','a','A','d','D'].includes(e.key)||!editable)return;e.preventDefault();const r=runtime.current;if(['ArrowLeft','a','A'].includes(e.key))r.left=true;else r.right=true;start();}
 function keyUp(e:React.KeyboardEvent){if(['ArrowLeft','a','A'].includes(e.key)){e.preventDefault();runtime.current.left=false;}if(['ArrowRight','d','D'].includes(e.key)){e.preventDefault();runtime.current.right=false;}}
 function pointerDown(e:React.PointerEvent<HTMLDivElement>){if(!editable)return;e.currentTarget.focus({preventScroll:true});e.currentTarget.setPointerCapture(e.pointerId);const r=runtime.current;r.pointerId=e.pointerId;r.pointerX=e.clientX;r.originX=r.x;r.dragging=true;}
 function pointerMove(e:React.PointerEvent<HTMLDivElement>){const r=runtime.current;if(!editable||!r.dragging||r.pointerId!==e.pointerId)return;const delta=e.clientX-r.pointerX;if(Math.abs(delta)<6&&r.phase==='ready')return;r.x=clamp(r.originX+delta/size.width);setDrive({x:r.x,progress:r.elapsed/roundMs});start();}
 function pointerEnd(e:React.PointerEvent<HTMLDivElement>){if(runtime.current.pointerId!==e.pointerId)return;runtime.current.dragging=false;runtime.current.pointerId=-1;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}
 const lane=laneFor(drive.x),carWidth=Math.max(50,Math.min(94,size.width*.18)),carHeight=carWidth*170/140,gate=202,top=(1-drive.progress)*(size.height-carHeight-16)+drive.progress*gate,remaining=Math.max(0,Math.ceil((roundMs-runtime.current.elapsed)/1000));
 return <section className="past-rally past-driving-game" aria-label="سباق القيادة إلى الماضي">
  <div className="past-rally-heading"><span><Flag size={19}/>سباق أفعال الماضي</span><span>قد السيارة إلى البوابة الصحيحة</span></div>
  <div className="past-rally-target"><PastPicture scene={question.picture||question.prompt} small/><div><strong dir="ltr" lang="en">{question.prompt}</strong><p>{w?.ar}</p><button className="past-audio" onClick={()=>audio.pronounce(question.prompt)} aria-label={'اسمع '+question.prompt}><Volume2 size={18}/>اسمع الفعل</button></div></div>
  <p className="past-drive-instructions" id={helpId}><MoveHorizontal size={22}/><span>وجّه بالأسهم <bdi dir="ltr">← →</bdi> أو اسحب داخل الطريق. وجّه مرة لبدء السباق. الأفعال التالية تبدأ تلقائيًا، وتزداد السرعة تدريجيًا.</span></p>
  <div ref={road} className={'past-drive-road '+phase+(answer?(correct?' won':' stopped'):'')} role="group" tabIndex={0} aria-label="مساحة قيادة السيارة" aria-describedby={helpId} onKeyDown={keyDown} onKeyUp={keyUp} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={e=>{pointerEnd(e);clearInputs();}} onBlur={clearInputs} style={{'--drive-scroll-duration':(roundMs/20000)+'s'} as CSSProperties}>
   <div className="past-drive-dashboard"><span>{phase==='ready'?'حرّك السيارة لتبدأ':phase==='saving'?(correct?'✓ أحسنت!':'جارٍ حفظ العبور…'):phase==='error'?'العبور لم يُحفظ بعد':phase==='feedback'?'وصلت إلى البوابة':'اقتربت البوابة'}</span><strong aria-label="ثواني الوصول إلى البوابة"><bdi dir="ltr">{remaining}</bdi><small>ث</small></strong></div>
   <div className="past-drive-gates" role="list" aria-label="بوابات قواعد الماضي" dir="ltr">{question.options.map((option,i)=><div role="listitem" key={option} className={(lane===i?'selected ':'')+(answer?.answerText===option?'right':'')}><bdi dir="ltr" lang="en">{routeText(option)}</bdi><small dir="rtl" lang="ar">{routeLabels[option as PastRoute]}</small><span aria-hidden="true">{i+1}</span></div>)}</div>
   <div className="past-drive-finish" aria-hidden="true"/><div className="past-drive-stripes" aria-hidden="true"><i/><i/><i/></div>
   <div className="past-drive-car" style={{left:drive.x*100+'%',top:top+'px',width:carWidth+'px','--steer':runtime.current.left?-6:runtime.current.right?6:0} as CSSProperties}><RallyCar/><strong dir="ltr" lang="en">{question.prompt}</strong></div>
   {phase==='ready'&&<div className="past-drive-ready"><MoveHorizontal size={28}/><span>أنت تقود السيارة</span><small>اسحب أو استخدم السهمين لبدء الجولة</small></div>}
  </div>
   <div className="past-drive-lane" aria-live="polite"><span>مسارك الحالي</span><bdi dir="ltr" lang="en">{routeText(question.options[lane])}</bdi></div>
  {!answer&&!busy&&!sending&&phase==='error'&&submittedLane!==null&&<div className="past-drive-save-error" role="alert"><p>تعذّر حفظ عبور البوابة. سيُعاد إرسال المسار نفسه.</p><button className="secondary" onClick={()=>void saveCrossing(submittedLane)}><RotateCcw size={18}/>إعادة حفظ العبور</button></div>}
  {correct&&runStarted.current&&(fresh.current||busy)&&<p className="past-drive-success" role="status">✓ <bdi dir="ltr" lang="en">{w?.past}</bdi></p>}
  {answer&&(!correct||(!fresh.current&&!busy))&&<div className={'past-rally-feedback '+(correct?'correct':'')} role="status"><strong>{correct?'وصلت إلى الماضي الصحيح!':'لنراجع الطريق الذي قدت إليه'}</strong>{!correct&&<div className="past-drive-route-review"><div><span>مسارك</span><bdi dir="ltr" lang="en">{routeText(question.options[answer.choice])}</bdi></div><div><span>المسار الصحيح</span><bdi dir="ltr" lang="en">{routeText(answer.answerText)}</bdi></div></div>}<p dir="rtl"><PastText text={answer.reason}/></p><div className="past-transform" dir="ltr" lang="en"><span>{question.prompt}</span><b>→</b><strong>{w?.past||question.prompt}</strong></div>{<button className="primary" disabled={busy||sending} onClick={onContinue}>{last?'أكمل الرحلة واعرض نتيجتك':'فهمت السبب، أكمل القيادة'}<ArrowLeft size={18}/></button>}</div>}
  {audio.audioNotice&&<p role="status">{audio.audioNotice}</p>}
 </section>;
}
