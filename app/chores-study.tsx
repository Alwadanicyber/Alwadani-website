'use client';
import {useState} from 'react';
import {BookOpen,ChevronDown,Eye,EyeOff,Bus,Sun,House,Volume2} from 'lucide-react';
import {choresWords,extraChoresWords,choresDialogue,perfectSchoolDay,wordScenes} from '@/lib/chores-learning';

import ChoresPicture from './chores-picture';
import {useLearningAudio} from './learning-audio';
export function ChoresWelcome({onPlay}:{onPlay:()=>void}){
 return <section className="chores-welcome" aria-label="رحلة الأعمال المنزلية"><div className="chores-welcome-copy"><span className="chores-kicker">UNIT 2 · CHORES</span><h2>يوم صغير، إنجازات كبيرة<span>!</span></h2><p>استيقظ، استعد للرحلة، وساعد جدك وجدتك. تعلّم معنى كل عبارة، ثم اختبر فهمك في تحدّي البالونات.</p><div className="chores-route" aria-label="رحلة الدرس"><span><Sun size={17}/>صباحي</span><i aria-hidden="true">←</i><span><Bus size={17}/>رحلتي</span><i aria-hidden="true">←</i><span><House size={17}/>أساعد أسرتي</span></div><button className="primary" onClick={onPlay}>🎈 جرّب لعبة المعاني</button></div><div className="chores-welcome-art" aria-hidden="true"><span className="chores-art-sun">☀</span><span className="chores-art-cloud one"/><span className="chores-art-cloud two"/><div className="chores-art-bus"><span>54</span><i/><i/><b>ALWADANI</b><em/><em/></div><div className="chores-art-road"/><span className="chores-art-leaf">✦</span></div></section>;
}
export default function ChoresStudy({station,legacy=false}:{station:number;legacy?:boolean}){
 const [showTranslations,setShowTranslations]=useState(true),[revealed,setRevealed]=useState<string[]>([]);
 const {pronounce,speaking,audioNotice}=useLearningAudio();
 const group=station===0?'morning':station===1?'bus':station===2?'home':null;
 const words=group?choresWords.filter(w=>w.group===group):[];
 const last=legacy?(station===3||station===6):station===3;
 function listen(en:string){setRevealed(r=>r.includes(en)?r:[...r,en]);pronounce(en);}
 function reader(title:string,lines:string[][]){return <details className="chores-reader"><summary className="chores-reader-title"><BookOpen size={20}/>{title}<ChevronDown size={16}/></summary><p className="chores-reader-help">افتح أي جملة لرؤية ترجمتها، واضغط السماعة لسماعها.</p>{lines.map(([en,ar],i)=><div className="chores-reader-row" key={en}><details className="chores-reader-line"><summary><span className="chores-line-number">{i+1}</span><span dir="ltr">{en}</span><ChevronDown size={16}/></summary><p>{ar}</p></details><button className="word-speaker" onClick={()=>pronounce(en)} aria-label={'اسمع الجملة: '+en}><Volume2 size={17}/></button></div>)}</details>;}
 return <div className="chores-study">
 {words.length>0&&<section className="chores-vocabulary" aria-label="بطاقات الكلمات المترجمة"><div className="chores-study-heading"><div><span className="chores-kicker">LOOK · LISTEN · LEARN</span><h3>كلمات أفهمها وأستخدمها</h3><p className="chores-reader-help">انظر للرسم، واضغط السماعة. يظهر المعنى مع النطق.</p></div><button className="secondary compact" aria-pressed={!showTranslations} onClick={()=>{setShowTranslations(v=>!v);setRevealed([]);}}>{showTranslations?<EyeOff size={16}/>:<Eye size={16}/>} {showTranslations?'أخْفِ الترجمة واختبر نفسك':'أظهر الترجمة'}</button></div><div className="chores-word-grid">{words.map(w=>{const visible=showTranslations||revealed.includes(w.en);return <article className={'chores-word-card'+(speaking===w.en?' is-speaking':'')} key={w.en}><ChoresPicture scene={wordScenes[w.en]}/><div className="chores-word-label"><h4 dir="ltr">{w.en}</h4><button className="word-speaker" onClick={()=>listen(w.en)} aria-label={'اسمع نطق '+w.en} aria-pressed={speaking===w.en}><Volume2 size={19}/></button></div><p className="chores-word-meaning" aria-live="polite">{visible?w.ar:'تذكّر معناها، ثم اضغط السماعة أو أظهر الترجمة'}</p><details><summary>مثال وتلميح <ChevronDown size={14}/></summary><div className="chores-word-example" dir="ltr">{w.example}</div><small>{w.translation}</small><p>{w.tip}</p></details></article>;})}</div></section>}
 {station===0&&<div className="chores-contrast"><div><span aria-hidden="true">👀</span><strong dir="ltr">wake up</strong><p>أفتح عيني.</p></div><span className="chores-contrast-arrow" aria-hidden="true">←</span><div><span aria-hidden="true">🛏️</span><strong dir="ltr">get up</strong><p>أترك السرير.</p></div></div>}
 {((!legacy&&station===3)||(legacy&&station===4))&&<><div className="chores-day-pictures" aria-label="يومي بالصور">{['wake up','get on the bus','grandparents','get undressed'].map(en=><button key={en} onClick={()=>listen(en)}><ChoresPicture scene={wordScenes[en]}/><strong dir="ltr">{en}</strong><span>{choresWords.find(w=>w.en===en)?.ar}</span><Volume2 size={16}/></button>)}</div><div className="chores-now"><span>🔁 <b>كل صباح</b><strong dir="ltr">I get dressed.</strong></span><span>⏱️ <b>الآن</b><strong dir="ltr">I am getting dressed.</strong></span></div></>}
 {station===3&&reader('القصة كاملة مع الترجمة',choresDialogue)}
 {((!legacy&&station===3)||(legacy&&station===5))&&reader('My Perfect School Day · يومي المدرسي المثالي',perfectSchoolDay)}
 {last&&<details className="chores-extra-words"><summary>جميع الكلمات الإضافية في الصفحات <ChevronDown size={16}/></summary><div>{extraChoresWords.map(([en,ar])=><p key={en}><b dir="ltr">{en}</b><span>{ar}</span><button className="word-speaker" onClick={()=>pronounce(en)} aria-label={'اسمع نطق '+en}><Volume2 size={17}/></button></p>)}</div></details>}
 {audioNotice&&<p className="audio-notice" role="status">{audioNotice}</p>}
 </div>;
}
