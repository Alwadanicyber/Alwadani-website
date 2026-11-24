import {useEffect,useId,useRef,useState,type FormEvent,type RefObject} from 'react';
import {Check,ChevronLeft,Headphones,RotateCcw,X} from 'lucide-react';
import {letterExamLevels,type LetterExamClip,type LetterExamLevel,type LetterExamSection} from '@/lib/reading-letter-exams';

const storageKey='alwadani-reading-letter-exams-v1';
type Scores=Record<string,number>;

function loadScores():Scores{
 if(typeof window==='undefined') return {};
 try {
  const raw=JSON.parse(window.localStorage.getItem(storageKey)??'{}');
  if(raw && typeof raw==='object') return raw;
 } catch { /* The exams also work with storage disabled. */ }
 return {};
}

export function ReadingLetterPassage({text,title='اقرأ نص المجموعة'}:{text:string;title?:string}){
 return <div className="reading-letter-passage">
  <h3>{title}</h3>
  <p dir="ltr" lang="en">{text.split(/\[([a-z]+)\]/gi).map((part,index)=>
   index%2 ? <mark key={index}>{part}</mark> : part
  )}</p>
 </div>;
}

export function LetterExamButton({section,onOpen}:{section:LetterExamSection;onOpen:(section:LetterExamSection)=>void}){
 return <button className="reading-audio" type="button" aria-haspopup="dialog" onClick={()=>onOpen(section)}>
  <Headphones size={18} aria-hidden="true"/> اختبارات <bdi lang="en" dir="ltr">{section.title}</bdi>
 </button>;
}

type Props={
 section:LetterExamSection|null;
 dialog:RefObject<HTMLDialogElement|null>;
 playing:string;
 notice:string;
 onPlay:(clip:LetterExamClip,id:string,onStart?:()=>void)=>void;
 onStop:()=>void;
 onClose:()=>void;
};

export default function ReadingLetterExam({section,dialog,playing,notice,onPlay,onStop,onClose}:Props){
 const heading=useId();
 const stepHeading=useRef<HTMLParagraphElement>(null);
 const [level,setLevel]=useState<LetterExamLevel|null>(null);
 const [answers,setAnswers]=useState<string[]>([]);
 const [choice,setChoice]=useState('');
 const [heard,setHeard]=useState(false);
 const [scores,setScores]=useState(loadScores);
 const [saved,setSaved]=useState(true);
 const levelIndex=letterExamLevels.findIndex(item=>item.id===level);
 const questions=section&&level?section.exams[level]:[];
 const number=answers.length;
 const question=questions[number];
 const completed=level!==null&&number===questions.length;
 const score=completed?questions.filter((item,index)=>item.answer===answers[index]).length:0;
 const scoreKey=section&&level?`${section.id}:${level}`:'';
 const audioId=`letter-exam:${scoreKey}:${number}`;

 useEffect(()=>{
  if(level) stepHeading.current?.focus();
 },[level,number]);

 function start(next:LetterExamLevel|null){
  onStop();
  setLevel(next);
  setAnswers([]);
  setChoice('');
  setHeard(false);
  setSaved(true);
 }

 function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(!question||!heard||!question.options.includes(choice)) return;
  const next=[...answers,choice];
  onStop();
  setAnswers(next);
  setChoice('');
  setHeard(false);
  if(next.length!==questions.length) return;
  const result=questions.filter((item,index)=>item.answer===next[index]).length;
  const previous=loadScores();
  const prior=previous[scoreKey];
  const best=Number.isInteger(prior)&&prior>=0&&prior<=questions.length?Math.max(prior,result):result;
  const updated={...previous,[scoreKey]:best};
  setScores(updated);
  try { window.localStorage.setItem(storageKey,JSON.stringify(updated)); }
  catch { setSaved(false); }
 }

 function nextLevel(){
  const next=letterExamLevels[levelIndex+1];
  start(next?.id??null);
 }

 return <dialog ref={dialog} className="reading-mouth-dialog reading-letter-exam" aria-labelledby={heading} onClose={onClose}>
  {section&&<>
   <header className="reading-mouth-dialog-header">
    <h2 id={heading}>اختبارات <bdi lang="en" dir="ltr">{section.title}</bdi></h2>
    <button className="reading-audio" type="button" aria-label="إغلاق الاختبار" onClick={()=>dialog.current?.close()}><X size={20} aria-hidden="true"/></button>
   </header>
   {!level&&<div className="reading-exam-levels">
    {letterExamLevels.map(item=>{
     const total=section.exams[item.id].length;
     const best=scores[`${section.id}:${item.id}`];
     return <button key={item.id} type="button" className="reading-audio" onClick={()=>start(item.id)}>
      <span>{item.title}<small>{total} أسئلة{Number.isInteger(best)&&best>=0&&best<=total?<> · أفضل نتيجة <bdi dir="ltr">{best}/{total}</bdi></>:null}</small></span>
      <ChevronLeft size={18} aria-hidden="true"/>
     </button>;
    })}
   </div>}
   {question&&<form onSubmit={submit} key={number}>
    <p className="reading-exam-counter" ref={stepHeading} tabIndex={-1}><strong>{letterExamLevels[levelIndex].title}</strong><bdi dir="ltr">{number+1} / {questions.length}</bdi></p>
    <progress value={number} max={questions.length} aria-label="تقدّم الاختبار"/>
    <fieldset>
     <legend>{level==='word'?'استمع واختر الكلمة التي سمعتها.':question.position==='first'?'استمع واختر أول حرف في الكلمة.':question.position==='last'?'استمع واختر آخر حرف في الكلمة.':'استمع واختر الحرف الذي يمثّل الصوت.'}</legend>
     <button className="reading-audio" type="button" aria-pressed={playing===audioId} onClick={()=>onPlay(question.clip,audioId,()=>setHeard(true))}>
      <Headphones size={19} aria-hidden="true"/> {question.clip.kind==='sound'?'استمع للصوت':'استمع للكلمة'}
     </button>
     <div className="reading-exam-choices" dir="ltr">
      {question.options.map(option=><label key={option}>
       <input type="radio" name="exam-choice" value={option} checked={choice===option} disabled={!heard} onChange={()=>setChoice(option)}/>
       <span lang="en">{level==='word'?option:option.toUpperCase()}</span>
      </label>)}
     </div>
    </fieldset>
    <div className="reading-exam-actions">
     <button className="reading-primary" type="submit" disabled={!heard||!choice}>{number+1===questions.length?'اعرض النتيجة':'السؤال التالي'}</button>
     <button className="reading-audio" type="button" onClick={()=>start(null)}>المستويات</button>
    </div>
   </form>}
   {completed&&<>
    <p role="status" className="reading-result" ref={stepHeading} tabIndex={-1}><strong>نتيجتك <bdi dir="ltr">{score} / {questions.length}</bdi></strong>{!saved&&<span> تعذّر حفظ النتيجة على هذا المتصفح.</span>}</p>
    <details className="reading-exam-review">
     <summary>راجع إجاباتك</summary>
     <ol>{questions.map((item,index)=>{
      const id=`${audioId}:review:${index}`;
      return <li key={index}>
       <button className="reading-audio" type="button" aria-label={`استمع للسؤال ${index+1}`} aria-pressed={playing===id} onClick={()=>onPlay(item.clip,id)}>
        <Headphones size={17} aria-hidden="true"/>
       </button>
       <span>{answers[index]===item.answer?'إجابة صحيحة':'الإجابة الصحيحة'} <bdi dir="ltr" lang="en">{level==='word'?item.answer:item.answer.toUpperCase()}</bdi>
        {answers[index]!==item.answer&&<> · اخترت <bdi lang="en">{level==='word'?answers[index]:answers[index].toUpperCase()}</bdi></>}
        {level!=='word'&&item.clip.kind==='word'&&<> · <bdi lang="en">{item.clip.value}</bdi></>}
       </span>
       {answers[index]===item.answer&&<Check size={17} aria-hidden="true"/>}
      </li>;
     })}</ol>
    </details>
    <div className="reading-exam-actions">
     <button className="reading-primary" type="button" onClick={nextLevel}>{levelIndex+1<letterExamLevels.length?'المستوى التالي':'المستويات'}</button>
     <button className="reading-audio" type="button" onClick={()=>start(level)}><RotateCcw size={17} aria-hidden="true"/> أعد الاختبار</button>
    </div>
   </>}
   {notice&&<p role="status">{notice}</p>}
  </>}
 </dialog>;
}
