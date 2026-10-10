'use client';
import {useState} from 'react';
import {Medal,Search,ChevronLeft,ChevronRight,Clock3} from 'lucide-react';
import type {Rank} from '@/lib/classroom-results';
import {formatSolveTime} from '@/lib/solve-time';
const medalNames=['الميدالية الذهبية، المركز الأول','الميدالية الفضية، المركز الثاني','الميدالية البرونزية، المركز الثالث'];
function SolveTime({row}:{row:Rank}){const measured=typeof row.solveMs==='number',time=measured?row.solveMs:row.estimatedSolveMs;return row.completed?<span className="competition-time"><Clock3 size={13}/>{typeof time==='number'?<>{measured?'وقت الحل':'وقت تقديري'} <bdi dir="ltr">{formatSolveTime(time)}</bdi></>:'الوقت غير مسجّل'}</span>:null;}
export default function ClassroomLeaderboard({rows,studentId}:{rows:Rank[];studentId?:string}){
 const [search,setSearch]=useState(''),[page,setPage]=useState(0),perPage=20;
 const filtered=rows.filter(r=>r.name.includes(search.trim())),pages=Math.max(1,Math.ceil(filtered.length/perPage)),current=Math.min(page,pages-1),visible=filtered.slice(current*perPage,(current+1)*perPage),mine=rows.find(r=>r.id===studentId);
 return <div className="competition-board"><div className="competition-top"><span><b>{rows.length}</b> طالبًا وطالبة في المنافسة</span>{mine&&<strong>مركزك #{mine.position} · أفضل نتيجة {Math.round(mine.percentage)}%</strong>}</div>
 <p className="competition-rule">الميداليات بعد إكمال الرحلة: الدرجة أولًا، وعند التعادل يتقدّم الأسرع في الحل. الوقت بالدقائق والثواني، ويستبعد الشرح والتحميل والتصحيح.</p>
 {rows.some(r=>typeof r.estimatedSolveMs==='number')&&<p className="competition-rule">الأوقات التقديرية قيم مبدئية أضافها المعلم للنتائج القديمة، ويحل وقت الحل الفعلي محلها عند إكمال محاولة جديدة يُقاس وقتها.</p>}
 {rows.some(r=>r.completed)&&<div className="competition-podium">{rows.filter(r=>r.completed).slice(0,3).map(r=><article key={r.id} className={'podium-'+r.position}><span role="img" aria-label={medalNames[r.position-1]}>{['🥇','🥈','🥉'][r.position-1]}</span><strong>{r.name}</strong><b>{Math.round(r.percentage)}%</b><small dir="ltr">{r.score} / {r.total}</small><SolveTime row={r}/></article>)}</div>}
 <label className="competition-search"><Search size={19}/><input aria-label="ابحث باسم الطالب في لوحة النتائج" placeholder="ابحث باسم الطالب أو الطالبة" value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}}/></label>
 <div className="competition-list" aria-label="جميع نتائج الطلاب">{visible.map(r=><article key={r.id} className={'competition-row'+(r.id===studentId?' my-result':'')}><span className={'competition-position'+(r.completed&&r.position<=3?' competition-medal medal-'+r.position:'')} aria-label={r.completed&&r.position<=3?medalNames[r.position-1]:`المركز ${r.position}`}>{r.completed&&r.position<=3?<Medal size={25}/>:r.position}</span><div className="competition-name"><strong>{r.name}{r.id===studentId&&<small>أنت</small>}</strong><span>{r.completed?(r.gameTotal?'أكمل الرحلة':'أكمل الاختبار'):r.answered?'يتدرّب':'يستعد'} · المحاولات {r.attempts}</span></div><div className="competition-score"><b>{Math.round(r.percentage)}%</b><span>{r.score} / {r.total} · حل {r.answered} / {r.total}</span>{r.gameTotal&&<span className="competition-parts">التدريبات {r.quizScore} / {r.quizTotal} · الإملاء {r.dictationScore} / {r.dictationTotal} · البالونات {r.gameScore} / {r.gameTotal}{!r.gameCompleted?' · اللعبة مطلوبة':''}</span>}<SolveTime row={r}/></div></article>)}</div>
 {!visible.length&&<p className="competition-empty">{search?'لم نجد اسمًا مطابقًا.':'المركز الأول بانتظار أول طالب يبدأ رحلته.'}</p>}
 <div className="competition-pages"><button className="secondary compact" disabled={current===0} onClick={()=>setPage(current-1)}><ChevronRight size={17}/>السابق</button><span>الصفحة {current+1} / {pages} · {filtered.length} نتيجة</span><button className="secondary compact" disabled={current>=pages-1} onClick={()=>setPage(current+1)}>التالي<ChevronLeft size={17}/></button></div>
 </div>;
}
