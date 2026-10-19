'use client';
import {useMemo,useState} from 'react';
import {CalendarDays,Clock3,Check,RotateCcw,Search} from 'lucide-react';
import type {PublicCourse} from '@/lib/course-types';
import {tokenPool,sentenceTimeClue} from '@/lib/tenses-learning';
import TensesScene from './tenses-scene';
import LearningPrompt from './learning-prompt';
const displayWord=(word:string)=>word==='i'?'I':word;
type Question=PublicCourse['questions'][number];
export default function TensesGameQuestion({question,answer,busy,onChoice,onSentence,topic='tenses'}:{question:Question;topic?:'tenses'|'home';answer?:{response?:string;answerText:string;correct:number};busy:boolean;onChoice:(index:number)=>void;onSentence:(text:string)=>void}){
 const [selected,setSelected]=useState<string[]>([]);
 const [hint,setHint]=useState(false),clue=sentenceTimeClue(question.prompt),showClue=hint||!!answer&&!answer.correct;
 const pool=useMemo(()=>{const p=tokenPool(question.options);let seed=question.options.join('|').split('').reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,question.id);for(let i=p.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[p[i],p[j]]=[p[j],p[i]];}return p;},[question.id,question.options.join('|')]);
 const sentence=selected.map(id=>pool.find(t=>t.id===id)!.word).join(' '),locked=!!answer||busy;
 return <div className="time-detective-question"><span className="tense-game-kicker">{topic==='home'?'🧩 اصنع سؤالًا باستخدام CAN':<>🕵 محقق الزمن · {question.kind==='sentence-build'?'اصنع الجملة':'اكتشف زمن الجملة'}</>}</span>{question.picture&&<TensesScene scene={question.picture} challenge/>}<p className="tense-game-prompt" dir="auto">{topic==='home'?<LearningPrompt text={question.prompt}/>:showClue&&clue?<>{question.prompt.slice(0,clue.index)}<mark>{clue.text}</mark>{question.prompt.slice(clue.index+clue.text.length)}</>:question.prompt}</p>
  {question.kind==='tense-sort'&&clue&&<div className="tense-game-clue">{!showClue?<button className="secondary" onClick={()=>setHint(true)} disabled={busy}><Search size={18}/>أظهر الدليل</button>:<p role="status"><b><bdi dir="ltr">{clue.text}</bdi> = {clue.arabic}</b><span>{clue.explanation}</span></p>}</div>}
  {question.kind==='tense-sort'?<><p className="tense-game-instruction">هل تصف الجملة عادة متكررة أم فعلًا يحدث الآن؟</p><div className="tense-houses">{question.options.map((option,i)=><button className={'tense-house '+(option==='Simple Present'?'simple':'continuous')} key={option} disabled={locked} onClick={()=>onChoice(i)}>{option==='Simple Present'?<CalendarDays size={32}/>:<Clock3 size={32}/>}<strong>{option==='Simple Present'?'عادة متكررة · مضارع بسيط':'فعل الآن · مضارع مستمر'}</strong><small dir="ltr">{option}</small></button>)}</div></>:<>
   <div className={'game-sentence-track'+(answer?(answer.correct?' correct':' incorrect'):'')} dir="ltr" aria-label="الكلمات المرتبة">{answer?<strong>{(answer.response||answer.answerText).replace(/\bi\b/g,'I')}</strong>:selected.length?selected.map(id=><button key={id} onClick={()=>setSelected(s=>s.filter(value=>value!==id))} disabled={locked} aria-label={'أعد الكلمة '+pool.find(t=>t.id===id)!.word+' إلى الصندوق'}>{displayWord(pool.find(t=>t.id===id)!.word)}</button>):<span dir="rtl">اضغط الكلمات بالترتيب لبناء الجملة هنا</span>}</div>
   {!answer&&<><div className="game-word-pool" dir="ltr" aria-label="صندوق الكلمات">{pool.map(t=><button key={t.id} disabled={locked||selected.includes(t.id)} onClick={()=>setSelected(s=>[...s,t.id])}>{displayWord(t.word)}</button>)}</div><div className="game-word-actions"><button className="primary" disabled={locked||!selected.length} onClick={()=>onSentence(sentence)}><Check size={18}/>{busy?'جارٍ التصحيح…':'تحقق من جملتي'}</button><button className="secondary" disabled={locked||!selected.length} onClick={()=>setSelected([])}><RotateCcw size={17}/>أعد ترتيب الكلمات</button></div><p className="tense-tip">توجد كلمات إضافية للتحدّي. اختر ما تحتاجه فقط. اضغط كلمة في الجملة لتعيدها.</p></>}
  </>}
 </div>;
}
