'use client';
import {useState} from 'react';
import {BookOpen,ChevronDown,Eye,EyeOff,Bus,Sun,House} from 'lucide-react';
import {choresWords,extraChoresWords,choresDialogue,perfectSchoolDay} from '@/lib/chores-learning';

export function ChoresWelcome({onPlay}:{onPlay:()=>void}){
 return <section className="chores-welcome" aria-label="رحلة الأعمال المنزلية"><div className="chores-welcome-copy"><span className="chores-kicker">UNIT 2 · CHORES</span><h2>يوم صغير، إنجازات كبيرة<span>!</span></h2><p>استيقظ، استعد للرحلة، وساعد جدك وجدتك. تعلّم معنى كل عبارة، ثم اختبر فهمك في تحدّي البالونات.</p><div className="chores-route" aria-label="رحلة الدرس"><span><Sun size={17}/>صباحي</span><i aria-hidden="true">←</i><span><Bus size={17}/>رحلتي</span><i aria-hidden="true">←</i><span><House size={17}/>أساعد أسرتي</span></div><button className="primary" onClick={onPlay}>🎈 جرّب لعبة المعاني</button></div><div className="chores-welcome-art" aria-hidden="true"><span className="chores-art-sun">☀</span><span className="chores-art-cloud one"/><span className="chores-art-cloud two"/><div className="chores-art-bus"><span>54</span><i/><i/><b>ALWADANI</b><em/><em/></div><div className="chores-art-road"/><span className="chores-art-leaf">✦</span></div></section>;
}
export default function ChoresStudy({station}:{station:number}){
 const [showTranslations,setShowTranslations]=useState(true);
 const group=station===0?'morning':station===1?'bus':station===2?'home':null;
 const words=group?choresWords.filter(w=>w.group===group):[];
 const lines=station===3?choresDialogue:station===5?perfectSchoolDay:[];
 return <div className="chores-study">
 {words.length>0&&<section className="chores-vocabulary" aria-label="بطاقات الكلمات المترجمة"><div className="chores-study-heading"><div><span className="chores-kicker">WORDS IN CONTEXT</span><h3>كلمات أفهمها وأستخدمها</h3></div><button className="secondary compact" aria-pressed={!showTranslations} onClick={()=>setShowTranslations(v=>!v)}>{showTranslations?<EyeOff size={16}/>:<Eye size={16}/>} {showTranslations?'أخْفِ الترجمة واختبر نفسك':'أظهر الترجمة'}</button></div><div className="chores-word-grid">{words.map(w=><article className="chores-word-card" key={w.en}><span className="chores-word-icon" aria-hidden="true">{w.icon}</span><h4 dir="ltr">{w.en}</h4><p className="chores-word-meaning">{showTranslations?w.ar:'تذكّر معناها، ثم أظهر الترجمة'}</p><div className="chores-word-example" dir="ltr">{w.example}</div>{showTranslations&&<small>{w.translation}</small>}<details><summary>تلميح للفهم <ChevronDown size={14}/></summary><p>{w.tip}</p></details></article>)}</div></section>}
 {station===0&&<div className="chores-contrast"><div><span aria-hidden="true">👀</span><strong dir="ltr">wake up</strong><p>عيني مفتوحة، وقد أبقى في السرير.</p></div><span className="chores-contrast-arrow" aria-hidden="true">←</span><div><span aria-hidden="true">🛏️</span><strong dir="ltr">get up</strong><p>أترك السرير وأبدأ يومي.</p></div></div>}
 {lines.length>0&&<section className="chores-reader" aria-label={station===3?'القصة مع الترجمة':'يومي المدرسي المثالي مع الترجمة'}><div className="chores-study-heading"><div><span className="chores-kicker">READ & UNDERSTAND</span><h3>{station===3?'القصة، جملةً ومعنى':'My Perfect School Day · يوم مدرسي مثالي'}</h3></div><BookOpen size={24}/></div><p className="chores-reader-help">اقرأ الإنجليزية أولًا، ثم افتح الترجمة. يمكنك مراجعة أي جملة قبل التدريب.</p>{lines.map(([en,ar],i)=><details key={en} className="chores-reader-line"><summary><span className="chores-line-number">{i+1}</span><span dir="ltr">{en}</span><ChevronDown size={16}/></summary><p>{ar}</p></details>)}</section>}
 {station===4&&<div className="chores-timeline" aria-label="ترتيب اليوم"><span>☀️ <b>في الصباح</b>أستيقظ ← أنهض ← أستحم ← أستعد للحافلة</span><span>🌷 <b>بعد الظهر</b>أزور جدي وجدتي وأساعدهما</span><span>🌙 <b>قبل النوم</b>أخلع ملابسي وأنظّف أسناني</span></div>}
 {(station===3||station===6)&&<details className="chores-extra-words"><summary>قاموس الكلمات الأخرى في الصفحات <ChevronDown size={16}/></summary><div>{extraChoresWords.map(([en,ar])=><p key={en}><b dir="ltr">{en}</b><span>{ar}</span></p>)}</div></details>}
 </div>;
}
