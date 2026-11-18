'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {CheckCircle2,ChevronLeft,ChevronRight,Download,Volume2,Square} from 'lucide-react';
import SiteHeader from '../site-header';
import {readingChapters} from '@/lib/reading-course';
import {readingAlphabet,readingAudioPath} from '@/lib/reading-alphabet';
import './reading.css';

// Old text-question results stay in v1; they do not count as sound-test results.
const storageKey='alwadani-reading-sounds-v2';
type Progress=Record<string,number>;
function Highlight({text}:{text:string}){
 return <>{text.split(/(sh)/gi).map((part,i)=>part.toLowerCase()==='sh'?<mark key={i}>{part}</mark>:part)}</>;
}

export default function ReadingCourse(){
 const [index,setIndex]=useState(0),[alphabet,setAlphabet]=useState(true);
 const [answers,setAnswers]=useState<Record<number,number>>({}),[heard,setHeard]=useState<Record<string,boolean>>({});
 const [submitted,setSubmitted]=useState(false),[best,setBest]=useState<Progress>({});
 const [notice,setNotice]=useState(''),[audioNotice,setAudioNotice]=useState(''),[playing,setPlaying]=useState('');
 const audioRef=useRef<HTMLAudioElement|null>(null);
 useEffect(()=>{
  const timer=window.setTimeout(()=>{
   try{
    const saved=JSON.parse(localStorage.getItem(storageKey)||'{}'),valid:Progress={};
    for(const c of readingChapters){const n=saved?.[c.id];if(Number.isInteger(n)&&n>=0&&n<=c.quiz.length)valid[c.id]=n;}
    setBest(valid);
   }catch{setNotice('يمكنك التعلم والاختبار؛ حفظ التقدم غير متاح في هذا المتصفح.');}
   const match=window.location.hash.match(/^#chapter-(\d+)$/);
   if(match){const n=Number(match[1]);if(n>=1&&n<=readingChapters.length){setIndex(n-1);setAlphabet(false);}}
  },0);
  return()=>{window.clearTimeout(timer);audioRef.current?.pause();window.speechSynthesis?.cancel();};
 },[]);
 const chapter=readingChapters[index];
 const score=chapter.quiz.reduce((n,q,i)=>n+(answers[i]===q.answer?1:0),0);
 const completed=Object.keys(best).length;
 function stopAudio(){
  const audio=audioRef.current;audioRef.current=null;
  if(audio){audio.pause();audio.currentTime=0;}
  window.speechSynthesis?.cancel();setPlaying('');
 }
 function navigate(next:number){
  stopAudio();setIndex(next);setAlphabet(false);setAnswers({});setHeard({});setSubmitted(false);setAudioNotice('');
  window.history.replaceState(null,'',`#chapter-${next+1}`);window.scrollTo({top:0,behavior:'auto'});
 }
 function showAlphabet(){
  stopAudio();setAlphabet(true);setAudioNotice('');window.history.replaceState(null,'','#alphabet');window.scrollTo({top:0,behavior:'auto'});
 }
 async function playClip(kind:'sound'|'word',value:string,key?:string){
  stopAudio();setAudioNotice('');
  const path=readingAudioPath(kind,value),audio=new Audio(path);audioRef.current=audio;
  const fail=()=>{if(audioRef.current===audio){setPlaying('');setAudioNotice('تعذّر تحميل الصوت. اضغط زر الاستماع للمحاولة من جديد، وتحقق من اتصالك.');}};
  audio.onerror=fail;
  audio.onended=()=>{if(audioRef.current===audio){audioRef.current=null;setPlaying('');}};
  try{
   await audio.play();
   if(audioRef.current===audio){setPlaying(path);if(key)setHeard(h=>({...h,[key]:true}));}
  }catch{fail();}
 }
 function speak(text:string){
  stopAudio();setAudioNotice('');
  if(!('speechSynthesis' in window)){setAudioNotice('صوت النص غير متاح هنا. أصوات الحروف وخيارات الاختبار تعمل بأزرارها.');return;}
  const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.75;
  const voice=window.speechSynthesis.getVoices().find(v=>v.lang==='en-US');if(voice)u.voice=voice;
  u.onerror=e=>{if(e.error!=='canceled'&&e.error!=='interrupted')setAudioNotice('تعذّر تشغيل النص. جرّب مرة أخرى أو اقرأه مع المعلم.');};
  window.speechSynthesis.speak(u);
 }
 function submit(){
  if(Object.keys(answers).length!==chapter.quiz.length)return;
  stopAudio();setSubmitted(true);
  const next={...best,[chapter.id]:Math.max(best[chapter.id]??0,score)};setBest(next);
  try{localStorage.setItem(storageKey,JSON.stringify(next));}catch{setNotice('ظهرت نتيجتك، لكن تعذّر حفظها في هذا المتصفح.');}
 }
 const audioControls=<div className="reading-audio-controls"><button type="button" className="reading-audio" onClick={stopAudio}><Square size={14}/> إيقاف الصوت</button><span role="status" aria-live="polite">{audioNotice}</span></div>;
 return <div className="reading-page" dir="rtl"><SiteHeader/><main id="main-content" className="reading-main">
  <Link className="reading-back" href="/?grade=general">← العودة إلى الدروس العامة / الأخرى</Link>
  <div className="reading-view-tabs" role="group" aria-label="صفحات دورة القراءة">
   <button type="button" aria-pressed={alphabet} onClick={showAlphabet}>١. لوحة الحروف والأصوات</button>
   <button type="button" aria-pressed={!alphabet} onClick={()=>navigate(0)}>الفصول والاختبارات الصوتية</button>
  </div>
  {notice&&<p role="status">{notice}</p>}
  {alphabet?<section className="reading-alphabet" aria-labelledby="alphabet-title">
   <header className="reading-alphabet-header"><div><p className="reading-kicker">YOUR FIRST SOUNDS · A–Z</p><h1 id="alphabet-title">الحروف وأصواتها</h1><p>اضغط الحرف الكبير لتسمع صوته مرتين، ثم اسمع كلمتين تبدأان به. في X نسمع الصوت في نهاية الكلمتين.</p><p>نتعلم صوت الحرف داخل الكلمة، وليس اسمه. بعض الحروف لها أصوات أخرى ستأتي في الفصول التالية.</p></div><span className="reading-alphabet-badge">26 حرفًا<br/>52 كلمة</span></header>
   {audioControls}
   <div className="reading-alphabet-grid" dir="ltr">{readingAlphabet.map(item=><article className="reading-letter-card" key={item.letter}>
    <button type="button" className="reading-letter-sound" aria-label={`صوت الحرف ${item.letter.toUpperCase()}`} aria-pressed={playing===readingAudioPath('sound',item.letter)} onClick={()=>void playClip('sound',item.letter)}><span lang="en">{item.letter.toUpperCase()}<small>{item.letter}</small></span><span className="reading-letter-ipa">/{item.ipa}/ <Volume2 size={18}/></span></button>
    <div className="reading-letter-examples">{item.examples.map(word=><button type="button" key={word} aria-label={`استمع إلى ${word}`} aria-pressed={playing===readingAudioPath('word',word)} onClick={()=>void playClip('word',word)}><Volume2 size={16}/><span lang="en">{word}</span></button>)}</div>
    <p dir="rtl">{item.tip}</p>
   </article>)}</div>
   <div className="reading-alphabet-footer"><p>الترتيب: الحروف ← الحروف الثنائية الساكنة ← حروف العلة الثنائية والمركّبة ← باقي أنماط القراءة.</p><button type="button" className="reading-primary" onClick={()=>navigate(0)}>تدريب الحروف واختبارها <ChevronLeft size={18}/></button><a href="/reading/reading-guide.pdf" className="reading-audio" target="_blank" rel="noreferrer"><Download size={18}/> الدليل الأصلي المصوّر</a></div>
  </section>:<>
   <div className="reading-progress"><span>اختبارات صوتية أُنجزت: <bdi dir="ltr">{completed} / {readingChapters.length}</bdi></span><progress value={completed} max={readingChapters.length}/><small>أفضل نتيجة محفوظة على هذا المتصفح فقط. نتائج الاختبارات النصية السابقة منفصلة عن هذه الاختبارات الصوتية الجديدة.</small></div>
   <div className="reading-layout"><nav className="reading-chapters" aria-label="فصول دورة القراءة"><h2>رحلتك بالترتيب</h2>{readingChapters.map((c,i)=><button type="button" key={c.id} aria-current={index===i?'step':undefined} onClick={()=>navigate(i)}><span className="reading-number">{String(c.id).padStart(2,'0')}</span><span>{c.title}<small lang="en" dir="ltr">{c.en}</small></span>{best[c.id]!==undefined&&<span className="reading-best" dir="ltr" aria-label={`أفضل نتيجة ${best[c.id]} من ${c.quiz.length}`}>{best[c.id]}/{c.quiz.length}</span>}</button>)}</nav>
    <article className="reading-content" aria-labelledby="chapter-title"><div className="reading-chapter-label">الفصل {chapter.id} من {readingChapters.length} · <a href={`/reading/reading-guide.pdf#page=${chapter.page}`} target="_blank" rel="noreferrer">الشرح المصوّر في الدليل ↗</a></div><h1 id="chapter-title">{chapter.title}</h1><p className="reading-goal">{chapter.goal}</p>
     {chapter.id===1&&<button type="button" className="reading-audio" onClick={showAlphabet}>افتح لوحة الحروف: ٢٦ حرفًا ومثالان لكل حرف</button>}
     <section aria-label="الشرح والتدريب"><h2>١. افهم النمط واسمع الكلمات</h2><p>اضغط الكلمة لسماعها، ثم كرّرها.</p><div className="reading-patterns">{chapter.patterns.map(p=><div className="reading-pattern" key={p.pattern}><h3 lang="en" dir="ltr">{p.pattern}</h3><p>{p.tip}</p><div className="reading-word-bank" lang="en" dir="ltr">{p.words.split(' ').map((w,i)=><button type="button" key={i} onClick={()=>speak(w)} aria-label={`Listen: ${w}`}><Volume2 size={14}/>{w}</button>)}</div></div>)}</div><aside className="reading-tip">💡 {chapter.note}</aside></section>
     <section className="reading-passages"><h2>٢. اقرأ وطبّق</h2><p>اسمع النموذج، ثم اقرأ بنفسك. عند التعثر، قسّم الكلمة إلى أصوات وادمجها مرة أخرى.</p>{chapter.passages.map(p=><div key={p.page} className="reading-passage"><div className="reading-passage-top"><h3 lang="en" dir="ltr">{p.title}</h3><button type="button" className="reading-audio" onClick={()=>speak(p.text)}><Volume2 size={17}/> استمع للنص</button></div><p lang="en" dir="ltr" className="reading-english">{p.text}</p><a href={`/reading/reading-guide.pdf#page=${p.page}`} target="_blank" rel="noreferrer">من الدليل · صفحة {p.page} ↗</a></div>)}</section>
     <section className="reading-sh"><div className="reading-passage-top"><h2>٣. دقيقة مع صوت <b lang="en">sh /ʃ/</b></h2><button type="button" className="reading-audio" onClick={()=>speak(chapter.sh)}><Volume2 size={17}/> استمع ببطء</button></div><p>قراءة إضافية بمساعدة المعلم؛ قد تحتوي أنماطًا لم ندرسها بعد. ابدأ ببطء، ثم كرّر بسلاسة. الحروف المظللة هي sh.</p><p className="reading-english" lang="en" dir="ltr"><Highlight text={chapter.sh}/></p><p>قل <b lang="en">ship → fish → shell</b>. تدرّب على الصوت، ولا تحاول الفوز بالسرعة.</p></section>
     {audioControls}
     <section className="reading-quiz" aria-labelledby="quiz-title"><h2 id="quiz-title">٤. اختر النطق الصحيح</h2><p>اقرأ الكلمة، واسمع الخيارات الصوتية، ثم اختر النطق المطابق. يمكنك تشغيل كل خيار أكثر من مرة. لن تظهر الكلمات خلف الخيارات إلا بعد التصحيح.</p><form onSubmit={e=>{e.preventDefault();submit();}}>{chapter.quiz.map((q,qi)=><fieldset key={`${chapter.id}-${qi}`}><legend><span>كيف ننطق هذه الكلمة؟</span><strong className="reading-target-word" lang="en" dir="ltr">{q.word}</strong></legend><div className="reading-sound-options">{q.options.map((word,oi)=>{
      const key=`${qi}:${oi}`,correct=submitted&&oi===q.answer,wrong=submitted&&answers[qi]===oi&&!correct;
      return <div className={'reading-sound-option'+(answers[qi]===oi?' is-selected':'')+(correct?' is-correct':'')+(wrong?' is-wrong':'')} key={oi}>
       <button type="button" className="reading-choice-play" aria-label={`استمع إلى النطق ${oi+1} للسؤال ${qi+1}`} aria-pressed={playing===readingAudioPath('word',word)} onClick={()=>void playClip('word',word,key)}><Volume2 size={24}/><span>استمع إلى النطق {oi+1}</span></button>
       <label><input type="radio" name={`question-${qi}`} value={oi} required disabled={submitted||!heard[key]} checked={answers[qi]===oi} onChange={()=>setAnswers(a=>({...a,[qi]:oi}))}/><span>{submitted?(correct?'النطق الصحيح':answers[qi]===oi?'اختيارك':'خيار آخر'):heard[key]?'اختر هذا النطق':'استمع أولًا للاختيار'}</span></label>
       {submitted&&<span className="reading-choice-reveal" lang="en" dir="ltr">{word}{correct&&<CheckCircle2 size={18}/>}</span>}
      </div>;
     })}</div>{submitted&&<p className="reading-feedback">{answers[qi]===q.answer?'أحسنت!':'محاولة جيدة، اسمع النطق الصحيح ثم جرّب مجددًا.'} {q.reason}</p>}</fieldset>)}
      {!submitted?<button className="reading-primary" type="submit" disabled={Object.keys(answers).length!==chapter.quiz.length}>اعرض نتيجة الاستماع</button>:<div className="reading-result" role="status"><strong>نتيجتك: <bdi dir="ltr">{score} / {chapter.quiz.length}</bdi></strong><p>{score===chapter.quiz.length?'أحسنت الاستماع! يمكنك متابعة الفصل التالي.':'يمكنك إعادة تشغيل الخيارات ومراجعة التفسير، ثم المحاولة من جديد.'}</p><p>أفضل نتيجة: <bdi dir="ltr">{best[chapter.id]} / {chapter.quiz.length}</bdi></p><button type="button" className="reading-audio" onClick={()=>{stopAudio();setAnswers({});setHeard({});setSubmitted(false);}}>إعادة الاختبار الصوتي</button></div>}
     </form></section>
     <footer className="reading-pagination"><button type="button" onClick={()=>index===0?showAlphabet():navigate(index-1)}><ChevronRight size={18}/> {index===0?'لوحة الحروف':'الفصل السابق'}</button>{index<readingChapters.length-1?<button type="button" className="reading-primary" onClick={()=>navigate(index+1)}>الفصل التالي <ChevronLeft size={18}/></button>:<Link className="reading-download" href="/?grade=general">العودة إلى الدروس</Link>}</footer>
     <p className="reading-source">المصدر: دليل أساسيات القراءة الإنجليزية المرفق. ترتيب الفصول مكيّف لبدء الحروف ثم الحروف الثنائية ثم حروف العلة المركّبة. الاختبارات وفقرات sh تدريب إضافي. أصوات اللوحة والاختبارات نماذج نطق أمريكية مولّدة صوتيًا ومحفوظة مع الدورة.</p>
    </article>
   </div>
  </>}
 </main></div>;
}
