'use client';
import {useEffect,useRef,useState} from 'react';
import {flushSync} from 'react-dom';
import Link from 'next/link';
import {CheckCircle2,ChevronLeft,ChevronRight,Volume2,Square} from 'lucide-react';
import SiteHeader from '../site-header';
import {readingChapters} from '@/lib/reading-course';
import {readingAlphabet} from '@/lib/reading-alphabet';
import {alphabetReviewLetter,letterExamSections,type LetterExamClip,type LetterExamSection} from '@/lib/reading-letter-exams';
import ReadingLetterExam,{LetterExamButton,ReadingLetterPassage} from './reading-letter-exam';
import {readingPhonemeBank,readingWordBank} from './reading-phonemes';
import {ReadingMouthDialog,ReadingMouthPreview} from './reading-mouth-models';
import {additionalMouthModels,readingMouthSelection,type MouthSelection} from './reading-mouth-data';
import ReadingPatternCard from './reading-pattern-card';
import {useReadingAudio} from './use-reading-audio';
import {shPracticeTiming} from './sh-practice-timing';
import './reading.css';

// Old text-question results stay in v1; they do not count as sound-test results.
const storageKey='alwadani-reading-sounds-v3';
const legacyStorageKey='alwadani-reading-sounds-v2';
type Progress=Record<string,{score:number;total:number}>;
function Highlight({text}:{text:string}){
 return <>{text.split(/(sh)/gi).map((part,i)=>part.toLowerCase()==='sh'?<mark key={i}>{part}</mark>:part)}</>;
}

export default function ReadingCourse(){
 const [index,setIndex]=useState(0),[alphabet,setAlphabet]=useState(true);
 const [answers,setAnswers]=useState<Record<number,number>>({}),[heard,setHeard]=useState<Record<string,boolean>>({});
 const [submitted,setSubmitted]=useState(false),[best,setBest]=useState<Progress>({});
 const [notice,setNotice]=useState('');
 const chapter=readingChapters[index];
 const practiceBank=`practice-v4-${chapter.id}`;
 const shSentences=chapter.sh.split(/(?<=[.!?])\s+/);
 const [mouthModel,setMouthModel]=useState<MouthSelection|null>(null);
 const mouthDialog=useRef<HTMLDialogElement>(null);
 const mouthVideo=useRef<HTMLVideoElement>(null);
 const examDialog=useRef<HTMLDialogElement>(null);
 const [examSection,setExamSection]=useState<LetterExamSection|null>(null);
 const {active:playing,notice:audioNotice,stop:stopAudio,play:playAudio}=useReadingAudio(
  alphabet?'alphabet':`chapter-${chapter.id}`,alphabet?undefined:practiceBank,
  alphabet||chapter.id<=2?'aep-consonants':'aep-vowels',
 );
 useEffect(()=>{
  const timer=window.setTimeout(()=>{
   try{
    const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');
    const legacy=JSON.parse(localStorage.getItem(legacyStorageKey)||'{}');
    const valid:Progress={};
    for(const chapter of readingChapters){
     const total=chapter.quiz.length;
     const result=saved?.[chapter.id];
     if(result?.total===total&&Number.isInteger(result.score)&&result.score>=0&&result.score<=total){
      valid[chapter.id]={score:result.score,total};
      continue;
     }
     const oldScore=legacy?.[chapter.id];
     const oldTotal=chapter.quiz.filter(question=>!question.wordAudio).length;
     if(Number.isInteger(oldScore)&&oldScore>=0&&oldScore<=oldTotal){
      valid[chapter.id]={score:oldScore,total:oldTotal};
     }
    }
    setBest(valid);
   }catch{setNotice('يمكنك التعلم والاختبار؛ حفظ التقدم غير متاح في هذا المتصفح.');}
   const match=window.location.hash.match(/^#chapter-(\d+)$/);
   if(match){const n=Number(match[1]);if(n>=1&&n<=readingChapters.length){setIndex(n-1);setAlphabet(false);}}
  },0);
  return()=>window.clearTimeout(timer);
 },[]);
 const score=chapter.quiz.reduce((n,q,i)=>n+(answers[i]===q.answer?1:0),0);
 const completed=Object.keys(best).length;
 function stopPlayback(){
  mouthVideo.current?.pause();
  stopAudio();
 }
 function play(...args:Parameters<typeof playAudio>){
  mouthVideo.current?.pause();
  return playAudio(...args);
 }
 function showMouthModel(selection:MouthSelection){
  stopPlayback();
  // Keep playback in the tap handler so mobile browsers allow sound.
  flushSync(()=>setMouthModel(selection));
  mouthDialog.current?.showModal();
  void mouthVideo.current?.play().catch(()=>{});
 }
 function closeMouthModel(){
  stopPlayback();
  setMouthModel(null);
 }
 function navigate(next:number){
  stopPlayback();setIndex(next);setAlphabet(false);setAnswers({});setHeard({});setSubmitted(false);
  window.history.replaceState(null,'',`#chapter-${next+1}`);window.scrollTo({top:0,behavior:'auto'});
 }
 function showAlphabet(){
  stopPlayback();setAlphabet(true);window.history.replaceState(null,'','#alphabet');window.scrollTo({top:0,behavior:'auto'});
 }
 function playClip(kind:'sound'|'word',value:string,id?:string){
  const sound=kind==='sound';
  void play(`${kind}-${value.toLowerCase()}`,{
   id, bankName:sound?readingPhonemeBank(value):readingWordBank(value),
  });
 }
 function showExam(section:LetterExamSection){
  stopPlayback();
  flushSync(()=>setExamSection(section));
  examDialog.current?.showModal();
 }
 function closeExam(){
  stopPlayback();
  setExamSection(null);
 }
 function playExam(clip:LetterExamClip,id:string,onStart?:()=>void){
  const bankName=clip.kind==='sound'?readingPhonemeBank(clip.value):clip.bank??'alphabet';
  void play(`${clip.kind}-${clip.value}`,{bankName,id,onStart});
 }
 function playQuizWord(word:string,question:number,key:string){
  const wordAudio=chapter.quiz[question].wordAudio;
  void play(`word-${word.toLowerCase()}`,{
   id:key,quizQuestion:wordAudio?undefined:question,bankName:wordAudio?`chapter-${chapter.id}`:practiceBank,
   onStart:()=>setHeard(previous=>({...previous,[key]:true})),
  });
 }
 function submit(){
  if(Object.keys(answers).length!==chapter.quiz.length)return;
  stopPlayback();setSubmitted(true);
  const total=chapter.quiz.length;
  const previous=best[chapter.id];
  const bestScore=previous?.total===total?Math.max(previous.score,score):score;
  const next={...best,[chapter.id]:{score:bestScore,total}};setBest(next);
  try{localStorage.setItem(storageKey,JSON.stringify(next));}catch{setNotice('ظهرت نتيجتك، لكن تعذّر حفظها في هذا المتصفح.');}
 }
 const audioControls=<div className="reading-audio-controls"><button type="button" className="reading-audio" onClick={stopPlayback}><Square size={14}/> إيقاف الصوت</button><span role="status" aria-live="polite">{audioNotice}</span></div>;
 return <div className="reading-page" dir="rtl"><SiteHeader/><main id="main-content" className="reading-main">
  <Link className="reading-back" href="/?grade=general">← العودة إلى الدروس العامة / الأخرى</Link>
  <div className="reading-view-tabs" role="group" aria-label="صفحات دورة القراءة">
   <button type="button" aria-pressed={alphabet} onClick={showAlphabet}>١. لوحة الحروف والأصوات</button>
   <button type="button" aria-pressed={!alphabet} onClick={()=>navigate(0)}>الفصول والاختبارات الصوتية</button>
  </div>
  {notice&&<p role="status">{notice}</p>}
  {alphabet?<section className="reading-alphabet" aria-labelledby="alphabet-title">
   <header className="reading-alphabet-header"><div><p className="reading-kicker">YOUR FIRST SOUNDS · A–Z</p><h1 id="alphabet-title">الحروف وأصواتها</h1><p>اضغط الحرف الكبير لتسمع صوته، ثم استمع إلى الكلمتين. مع X، اسمع /ks/ في آخر الكلمتين.</p><p>نتعلم صوت الحرف داخل الكلمة، وليس اسمه. بعض الحروف لها أصوات أخرى ستأتي في الفصول التالية.</p></div><span className="reading-alphabet-badge">26 حرفًا<br/>52 كلمة</span></header>
   {audioControls}
   {letterExamSections.map(section=><section key={section.id} className="reading-alphabet-group" aria-labelledby={`letters-${section.id}`}>
    <div className="reading-letter-group-heading">
     <h2 id={`letters-${section.id}`} lang="en" dir="ltr">{section.title}</h2>
     <LetterExamButton section={section} onOpen={showExam}/>
    </div>
    <div className="reading-alphabet-grid" dir="ltr">{readingAlphabet.filter(item=>section.letters.includes(item.letter)).map(item=>{
    const model=readingMouthSelection(item.ipa,item.letter,item.examples);
    return <article className="reading-letter-card" key={item.letter}>
    <button type="button" className="reading-letter-sound" aria-label={`صوت الحرف ${item.letter.toUpperCase()}`} aria-pressed={playing===`sound-${item.letter}`} onClick={()=>void playClip('sound',item.letter)}><span lang="en">{item.letter.toUpperCase()}<small>{item.letter}</small></span><span className="reading-letter-ipa">/{item.ipa}/ <Volume2 size={18}/></span></button>
    {model&&<ReadingMouthPreview selection={model} context={item.letter.toUpperCase()} onShow={showMouthModel}/>}
    <div className="reading-letter-examples">{item.examples.map(word=><button type="button" key={word} aria-label={`استمع إلى ${word}`} aria-pressed={playing===`word-${word.toLowerCase()}`} onClick={()=>void playClip('word',word)}><Volume2 size={16}/><span lang="en">{word}</span></button>)}</div>
    <p dir="rtl">{item.tip}</p>
   </article>;
   })}</div>
    <ReadingLetterPassage text={section.passage}/>
   </section>)}
   <ReadingLetterPassage text={alphabetReviewLetter} title="اقرأ رسالة المراجعة من A إلى Z"/>
   <section className="reading-extra-mouth" aria-labelledby="extra-mouth-heading">
    <h2 id="extra-mouth-heading">أصوات إضافية في النطق الأمريكي</h2>
    <div className="reading-extra-mouth-grid" dir="ltr">{additionalMouthModels.map(id=>
     <ReadingMouthPreview key={id} selection={{kind:'video',id}} showSound onShow={showMouthModel}/>
    )}</div>
   </section>
   <div className="reading-alphabet-footer"><p>الترتيب: الحروف ← الحروف الثنائية الساكنة ← حروف العلة الثنائية والمركّبة ← باقي أنماط القراءة.</p><button type="button" className="reading-primary" onClick={()=>navigate(0)}>تدريب الحروف واختبارها <ChevronLeft size={18}/></button></div>
  </section>:<>
   <div className="reading-progress"><span>اختبارات صوتية أُنجزت: <bdi dir="ltr">{completed} / {readingChapters.length}</bdi></span><progress value={completed} max={readingChapters.length}/><small>أفضل نتيجة محفوظة على هذا المتصفح.</small></div>
   <div className="reading-layout">
    <nav className="reading-chapters" aria-label="فصول دورة القراءة">
     <h2>رحلتك بالترتيب</h2>
     <div className="reading-chapter-select">
      <label htmlFor="reading-chapter-select">اختر الفصل</label>
      <select id="reading-chapter-select" value={index} onChange={event=>navigate(Number(event.target.value))}>
       {readingChapters.map((item,i)=><option key={item.id} value={i}>{item.id}. {item.title}</option>)}
      </select>
     </div>
     <div className="reading-chapter-list">
      {readingChapters.map((item,i)=><button type="button" key={item.id} aria-current={index===i?'step':undefined} onClick={()=>navigate(i)}>
       <span className="reading-number">{String(item.id).padStart(2,'0')}</span>
       <span>{item.title}<small lang="en" dir="ltr">{item.en}</small></span>
       {best[item.id]!==undefined&&<span className="reading-best" dir="ltr" aria-label={`أفضل نتيجة ${best[item.id].score} من ${best[item.id].total}`}>{best[item.id].score}/{best[item.id].total}</span>}
      </button>)}
     </div>
    </nav>
    <article className="reading-content" aria-labelledby="chapter-title"><div className="reading-chapter-label">الفصل {chapter.id} من {readingChapters.length}</div><h1 id="chapter-title">{chapter.title}</h1><p className="reading-goal">{chapter.goal}</p>
     {chapter.id===1&&<button type="button" className="reading-audio" onClick={showAlphabet}>افتح لوحة الحروف: ٢٦ حرفًا ومثالان لكل حرف</button>}
     <section aria-label="الشرح والتدريب">
      <h2>١. افهم النمط واسمع الكلمات</h2>
      <p>استمع إلى الصوت أو الكلمة، وانتبه إلى الحروف المظلّلة.</p>
      <div className="reading-patterns">{chapter.patterns.map(pattern=>{
       const section=chapter.id===1?letterExamSections.find(item=>item.title===pattern.pattern):undefined;
       return <ReadingPatternCard key={pattern.pattern} pattern={pattern} playing={playing} onPlay={playClip} onShowMouth={showMouthModel}
        action={section&&<LetterExamButton section={section} onOpen={showExam}/>}>
        {section&&<ReadingLetterPassage text={section.passage}/>}
       </ReadingPatternCard>;
      })}</div>
      {chapter.id===1&&<ReadingLetterPassage text={alphabetReviewLetter} title="اقرأ رسالة المراجعة من A إلى Z"/>}
      <aside className="reading-tip">💡 {chapter.note}</aside>
     </section>
     <section className="reading-passages"><h2>٢. اقرأ وطبّق</h2><p>اسمع النموذج، ثم اقرأ بنفسك. عند التعثر، قسّم الكلمة إلى أصوات وادمجها مرة أخرى.</p>{chapter.passages.map(p=><div key={p.page} className="reading-passage"><div className="reading-passage-top"><h3 lang="en" dir="ltr">{p.title}</h3><div className="reading-passage-buttons"><button type="button" className="reading-audio" aria-pressed={playing===`passage-${p.page}`} onClick={()=>void play(`passage-${p.page}`)}><Volume2 size={17}/> استمع للنص</button><button type="button" className="reading-audio" aria-pressed={playing===`slow-passage-${p.page}`} onClick={()=>void play(`slow-passage-${p.page}`)}>استمع ببطء</button></div></div><p lang="en" dir="ltr" className="reading-english">{p.text}</p></div>)}</section>
     <section className="reading-sh" aria-labelledby="reading-sh-heading">
      <div className="reading-passage-top">
       <h2 id="reading-sh-heading">٣. دقيقة مع صوت <bdi lang="en">sh /ʃ/</bdi></h2>
       <div className="reading-passage-buttons">
        <button type="button" className="reading-audio" aria-pressed={playing==='sound-sh'} onClick={()=>playClip('sound','sh')}>
         <Volume2 size={17} aria-hidden="true"/> اسمع صوت <bdi lang="en">sh</bdi>
        </button>
        <ReadingMouthPreview selection={{kind:'video',id:'sh'}} context="sh" onShow={showMouthModel}/>
        <button type="button" className="reading-audio" aria-pressed={playing==='practice-sh'} onClick={()=>void play('practice-sh',{bankName:practiceBank})}>
         <Volume2 size={17} aria-hidden="true"/> اسمع النص كاملًا
        </button>
       </div>
      </div>
      <p>اسمع <bdi lang="en">sh</bdi> في أول الكلمة أو آخرها، ثم استمع إلى الجمل وكرّرها.</p>
      <div className="reading-word-bank" lang="en" dir="ltr">
       {['ship','fish','shell'].map(word=><button type="button" key={word} aria-label={`Listen: ${word}`} aria-pressed={playing===`sh-word:${word}`} onClick={()=>playClip('word',word,`sh-word:${word}`)}>
        <Volume2 size={15} aria-hidden="true"/><span><Highlight text={word}/></span>
       </button>)}
      </div>
      <ol className="reading-sh-sentences" lang="en" dir="ltr">
       {shSentences.map((sentence,i)=>{
        const id=`practice-sh:${i}`;
        return <li key={id}><button type="button" className="reading-sh-sentence" aria-label={`Listen to sentence ${i+1}: ${sentence}`} aria-pressed={playing===id}
         onClick={()=>void play('practice-sh',{id,bankName:practiceBank,range:shPracticeTiming[chapter.id][i]})}>
         <Volume2 size={18} aria-hidden="true"/><span><Highlight text={sentence}/></span>
        </button></li>;
       })}
      </ol>
     </section>
     {audioControls}
     <section className="reading-quiz" aria-labelledby="quiz-title"><h2 id="quiz-title">٤. اختر النطق الصحيح</h2><p>اقرأ الكلمة، واسمع الخيارات الصوتية، ثم اختر النطق المطابق. يمكنك تشغيل كل خيار أكثر من مرة. لن تظهر الكلمات خلف الخيارات إلا بعد التصحيح.</p><form onSubmit={e=>{e.preventDefault();submit();}}>{chapter.quiz.map((q,qi)=><fieldset key={`${chapter.id}-${qi}`}><legend><span>كيف ننطق هذه الكلمة؟</span><strong className="reading-target-word" lang="en" dir="ltr">{q.word}</strong></legend><div className="reading-sound-options">{q.options.map((word,oi)=>{
      const key=`${qi}:${oi}`,correct=submitted&&oi===q.answer,wrong=submitted&&answers[qi]===oi&&!correct;
      return <div className={'reading-sound-option'+(answers[qi]===oi?' is-selected':'')+(correct?' is-correct':'')+(wrong?' is-wrong':'')} key={oi}>
       <button type="button" className="reading-choice-play" aria-label={`استمع إلى النطق ${oi+1} للسؤال ${qi+1}`} aria-pressed={playing===key} onClick={()=>playQuizWord(word,qi,key)}><Volume2 size={24}/><span>استمع إلى النطق {oi+1}</span></button>
       <label><input type="radio" name={`question-${qi}`} value={oi} required disabled={submitted||!heard[key]} checked={answers[qi]===oi} onChange={()=>setAnswers(a=>({...a,[qi]:oi}))}/><span>{submitted?(correct?'النطق الصحيح':answers[qi]===oi?'اختيارك':'خيار آخر'):heard[key]?'اختر هذا النطق':'استمع أولًا للاختيار'}</span></label>
       {submitted&&<span className="reading-choice-reveal" lang="en" dir="ltr">{word}{correct&&<CheckCircle2 size={18}/>}</span>}
      </div>;
     })}</div>{submitted&&<p className="reading-feedback">{answers[qi]===q.answer?'أحسنت!':'محاولة جيدة، اسمع النطق الصحيح ثم جرّب مجددًا.'} {q.reason}</p>}</fieldset>)}
      {!submitted?<button className="reading-primary" type="submit" disabled={Object.keys(answers).length!==chapter.quiz.length}>اعرض نتيجة الاستماع</button>:<div className="reading-result" role="status"><strong>نتيجتك: <bdi dir="ltr">{score} / {chapter.quiz.length}</bdi></strong><p>{score===chapter.quiz.length?'أحسنت الاستماع! يمكنك متابعة الفصل التالي.':'يمكنك إعادة تشغيل الخيارات ومراجعة التفسير، ثم المحاولة من جديد.'}</p><p>أفضل نتيجة: <bdi dir="ltr">{best[chapter.id]?.score} / {chapter.quiz.length}</bdi></p><button type="button" className="reading-audio" onClick={()=>{stopPlayback();setAnswers({});setHeard({});setSubmitted(false);}}>إعادة الاختبار الصوتي</button></div>}
     </form></section>
     <footer className="reading-pagination"><button type="button" onClick={()=>index===0?showAlphabet():navigate(index-1)}><ChevronRight size={18}/> {index===0?'لوحة الحروف':'الفصل السابق'}</button>{index<readingChapters.length-1?<button type="button" className="reading-primary" onClick={()=>navigate(index+1)}>الفصل التالي <ChevronLeft size={18}/></button>:<Link className="reading-download" href="/?grade=general">العودة إلى الدروس</Link>}</footer>
    </article>
   </div>
  </>}
  <ReadingLetterExam key={examSection?.id} section={examSection} dialog={examDialog} playing={playing} notice={audioNotice}
   onPlay={playExam} onStop={stopPlayback} onClose={closeExam}/>
  <ReadingMouthDialog selection={mouthModel} dialog={mouthDialog} video={mouthVideo} playing={playing} notice={audioNotice}
   onClose={closeMouthModel} onVideoPlay={stopAudio} onSound={playClip}/>
 </main></div>;
}
