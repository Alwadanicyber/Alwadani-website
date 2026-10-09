'use client';
import {useEffect,useRef,useState} from 'react';
import {CheckCircle2,Keyboard,Volume2,ArrowLeft} from 'lucide-react';
import {Progress} from '@/components/ui/progress';
import type {DictationState} from '@/lib/chores-dictation';
import ChoresPicture from './chores-picture';
import {useLearningAudio} from './learning-audio';

export default function ChoresDictation({state,busy,onAction,onFinish}:{state:DictationState;busy:boolean;onAction:(body:Record<string,unknown>)=>Promise<{dictation?:DictationState|null}|null>;onFinish:()=>void}){
 const [index,setIndex]=useState(()=>{const first=state.items.findIndex(w=>!state.answers.some(a=>a.question===w.id));return first<0?state.items.length-1:first;}),[text,setText]=useState('');
 const input=useRef<HTMLInputElement>(null),justSubmitted=useRef<number|null>(null),audio=useLearningAudio();
 const word=state.items[index],answer=state.answers.find(a=>a.question===word.id),score=state.answers.reduce((n,a)=>n+a.correct,0);
 function next(){justSubmitted.current=null;if(index<state.items.length-1){setIndex(index+1);setText('');}else onFinish();}
 useEffect(()=>{if(!answer){input.current?.focus({preventScroll:true});audio.pronounce(word.audio);}},[word.id]);
 useEffect(()=>{if(!answer?.correct||justSubmitted.current!==word.id)return;const timer=window.setTimeout(next,1400);return()=>window.clearTimeout(timer);},[answer?.question,answer?.correct]);
 async function submit(e:React.FormEvent){e.preventDefault();if(busy||answer||!text.trim())return;audio.unlock();justSubmitted.current=word.id;const result=await onAction({action:'dictation-answer',question:word.id,text});const checked=result?.dictation?.answers.find(a=>a.question===word.id);if(checked){audio.playEffect(checked.correct?'correct':'wrong');if(!checked.correct)audio.pronounce(word.audio);}}
 return <section className="dictation-station" aria-label="محطة إملاء الكلمات"><div className="dictation-heading"><div><span className="chores-kicker">LISTEN & WRITE</span><h2>شاهد، اسمع، واكتب<span>!</span></h2><p>6 كلمات قصيرة. انظر إلى الصورة، واسمع النطق بالإنجليزية، ثم اكتب ما سمعت.</p></div><span className="dictation-heading-icon" aria-hidden="true"><Keyboard size={36}/></span></div>
 <div className="dictation-progress"><span>الكلمة {index+1} / {state.total}</span><b>نقاط الإملاء {score} / {state.total}</b></div><Progress value={state.answers.length/state.total*100} aria-label="تقدم محطة الإملاء"/>
 <div className="dictation-card"><div className="dictation-image"><ChoresPicture scene={word.scene}/><button className={'dictation-listen'+(audio.speaking?' is-speaking':'')} type="button" onClick={()=>{audio.unlock();audio.pronounce(word.audio);}} aria-label="اسمع كلمة الإملاء بالإنجليزية"><Volume2 size={24}/>{audio.speaking?'استمع…':'اسمع الكلمة'}<small>يمكنك سماعها أكثر من مرة</small></button></div>
 <div className="dictation-writing"><span className="pill">٤. تحدّي الإملاء</span><h3>{answer?'إجابتك محفوظة':'ما الكلمة التي سمعتها؟'}</h3><form onSubmit={submit}><label htmlFor="dictation-word">اكتب الكلمة بالإنجليزية</label><input ref={input} id="dictation-word" className="dictation-input" dir="ltr" lang="en" value={answer?.text??text} onChange={e=>setText(e.target.value)} disabled={busy||!!answer} maxLength={100} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} placeholder="اكتب هنا…" required aria-describedby="dictation-help"/>{!answer&&<button className="primary" disabled={busy||!text.trim()}><CheckCircle2 size={18}/>{busy?'جارٍ التصحيح…':'تحقّق من إملائي'}</button>}</form><p className="dictation-help" id="dictation-help">نقطة للإملاء الصحيح من أول إجابة. الحروف الكبيرة والصغيرة مقبولة.</p>
 {answer&&<div className={'dictation-feedback '+(answer.correct?'success':'correction')} role="status"><strong>{answer.correct?'إملاء صحيح، أحسنت!':'نتعلّم من الخطأ'}</strong><b dir="ltr" lang="en">{answer.expected}</b><p>{answer.reason}</p>{answer.correct&&justSubmitted.current===word.id?<span className="visual-auto-next">أحسنت! ننتقل تلقائيًا…</span>:<button className="primary" disabled={busy} onClick={next}>{index===state.items.length-1?'انتقل إلى لعبة البالونات النهائية':'فهمت، الكلمة التالية'}<ArrowLeft size={17}/></button>}</div>}
 </div></div>{audio.audioNotice&&<p className="audio-notice" role="status">{audio.audioNotice} استخدم زر «اسمع الكلمة» للمحاولة مجددًا.</p>}
 {state.completed&&<p className="dictation-completed" role="status"><CheckCircle2 size={19}/>أكملت الإملاء! نتيجتك {score} / {state.total}. اللعبة النهائية مفتوحة الآن.<button className="secondary compact" onClick={onFinish}>ابدأ البالونات</button></p>}
 </section>;
}
