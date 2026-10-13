'use client';
import '../../competition.css';
import {useEffect,useState} from 'react';
import {Timer,Save,CheckCircle2,Trophy,Target} from 'lucide-react';
import {competitionDate,riyadhLocal,riyadhInstant,type CompetitionState} from '@/lib/competition';
import {rankingDescription,type RankingMode} from '@/lib/ranking-mode';
export default function CompetitionSettings({courseId,onSaved}:{courseId:string;onSaved:()=>void}){
  const [saved,setSaved]=useState<CompetitionState|null>(null),[enabled,setEnabled]=useState(false),[showCountdown,setShowCountdown]=useState(true),[mode,setMode]=useState('days'),[days,setDays]=useState('3'),[hours,setHours]=useState('0'),[minutes,setMinutes]=useState('0'),[localDate,setLocalDate]=useState(''),[prize,setPrize]=useState('');
  const [rankingMode,setRankingMode]=useState<RankingMode>('balanced'),[rankingDraft,setRankingDraft]=useState<'accuracy'|'speed'|''>('');
  const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  function fillRanking(value:RankingMode){setRankingMode(value);setRankingDraft(value==='accuracy'||value==='speed'?value:'');}
  function fill(value:CompetitionState){setSaved(value);setEnabled(value.enabled);setShowCountdown(value.showCountdown);setPrize(value.prize);setMode(value.endsAt?'date':'days');setLocalDate(value.endsAt?riyadhLocal(value.endsAt):'');setDays('3');setHours('0');setMinutes('0');}
  useEffect(()=>{
    const controller=new AbortController();setLoading(true);setSaved(null);setError('');setNotice('');
    void (async()=>{try{const res=await fetch('/api/teacher/competition?course='+encodeURIComponent(courseId),{signal:controller.signal,cache:'no-store'}),data=await res.json() as {competition:CompetitionState;rankingMode:RankingMode;error?:string};if(!res.ok)throw new Error(data.error||'تعذّر تحميل الإعدادات.');if(!controller.signal.aborted){fill(data.competition);fillRanking(data.rankingMode);}}catch(e){if(!controller.signal.aborted)setError((e as Error).message);}finally{if(!controller.signal.aborted)setLoading(false);}})();
    return()=>controller.abort();
  },[courseId]);
  async function save(event:React.FormEvent){
    event.preventDefault();setBusy(true);setError('');setNotice('');
    try{
      const endsAt=enabled&&mode==='date'?riyadhInstant(localDate):null;
      const response=await fetch('/api/teacher/competition',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({course:courseId,enabled,showCountdown,mode,days:days===''?null:Number(days),hours:hours===''?null:Number(hours),minutes:minutes===''?null:Number(minutes),endsAt,prize})}),data=await response.json() as {competition:CompetitionState;rankingMode:RankingMode;error?:string};
      if(!response.ok)throw new Error(data.error||'تعذّر حفظ الإعدادات.');
      fill(data.competition);fillRanking(data.rankingMode);setNotice(enabled?'تم حفظ موعد المنافسة. العدّاد ثابت ولا يبدأ من جديد عند تحديث الصفحة.':'تم إلغاء موعد النهاية والعدّاد لهذا الدرس.');onSaved();
    }catch(e){setError((e as Error).message);}finally{setBusy(false);}
  }
  async function saveRanking(choice:'accuracy'|'speed'|'default'){
    setBusy(true);setError('');setNotice('');
    try{const response=await fetch('/api/teacher/competition',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({course:courseId,action:'ranking',rankingMode:choice})}),data=await response.json() as {competition:CompetitionState;rankingMode:RankingMode;error?:string};if(!response.ok)throw new Error(data.error||'تعذّر حفظ طريقة المنافسة.');fillRanking(data.rankingMode);setNotice('تم حفظ طريقة المنافسة. النتائج والتقدم والشهادات محفوظة.');onSaved();}
    catch(e){setError((e as Error).message);}finally{setBusy(false);}
  }
  return <section className="competition-settings" id="ranking-settings"><div className="section-heading"><div><div className="eyebrow">LEADERBOARD MODE</div><h2><Trophy size={23}/>طريقة المنافسة</h2><p>اختر طريقة ترتيب هذا الدرس؛ موعد النهاية والعدّاد إعداد مستقل.</p></div></div>
    {!loading&&saved&&<div className="ranking-mode-editor"><fieldset disabled={busy}><div className="ranking-mode-options" role="group" aria-label="طريقة المنافسة"><button type="button" className={rankingDraft==='speed'?'selected':''} aria-pressed={rankingDraft==='speed'} onClick={()=>setRankingDraft('speed')}><Timer size={30}/><strong>الأسرع</strong><span>أقل وقت حل لمحاولة مكتملة أولًا. عند تساوي الوقت: الدرجة الأعلى، ثم من بدأ أولًا.</span></button><button type="button" className={rankingDraft==='accuracy'?'selected':''} aria-pressed={rankingDraft==='accuracy'} onClick={()=>setRankingDraft('accuracy')}><Target size={30}/><strong>الأدق</strong><span>أعلى درجة أولًا. عند تساوي الدرجة: من سجّل اسمه وبدأ الدرس أولًا. السرعة لا تؤثر.</span></button></div><p className="event-setting-help">الطريقة المحفوظة: {rankingDescription(rankingMode)}</p>{rankingDraft==='speed'&&<p className="event-setting-help">يبدأ الوقت عند بدء الحل ويستمر أثناء التصحيح والانتقال بين الأسئلة والتحميل؛ يتوقف فقط أثناء عرض الشرح، ثم يستأنف من الوقت المحفوظ. من لم يُسجّل وقت محاولته يحتاج إلى إكمال محاولة جديدة ليدخل ترتيب السرعة بوقت فعلي. الشهادة تحتفظ بأعلى درجة، حتى إن كانت محاولة أخرى أسرع.</p>}<div className="ranking-mode-actions"><button type="button" className="primary" disabled={!rankingDraft} onClick={()=>rankingDraft&&void saveRanking(rankingDraft)}><Save size={17}/>حفظ طريقة المنافسة</button><button type="button" className="secondary" onClick={()=>void saveRanking('default')}>استعادة طريقة الدرس الأصلية</button></div></fieldset></div>}
    <div className="section-heading"><div><div className="eyebrow">COMPETITION SETTINGS</div><h2><Timer size={23}/>موعد المنافسة والعدّاد</h2><p>إعداد مستقل لهذا الدرس، يظهر على لوحة النتائج لجميع الطلاب والطالبات.</p></div></div>
    {loading?<p role="status">جارٍ تحميل إعدادات المنافسة…</p>:saved?<form onSubmit={save}>
      <fieldset disabled={busy}><label className="event-toggle"><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/>تحديد نهاية للمنافسة</label>
      {enabled&&<><div className="event-mode-options"><label><input type="radio" name={'deadline-mode-'+courseId} checked={mode==='days'} onChange={()=>setMode('days')}/>أحدد مدة بالأيام</label><label><input type="radio" name={'deadline-mode-'+courseId} checked={mode==='date'} onChange={()=>setMode('date')}/>أحدد تاريخًا ووقتًا</label></div>
      {mode==='days'?<><div className="event-duration-inputs"><label>عدد الأيام<input type="number" min="0" max="3650" step="1" required value={days} onChange={e=>setDays(e.target.value)}/></label><label>الساعات الإضافية<input type="number" min="0" max="23" step="1" required value={hours} onChange={e=>setHours(e.target.value)}/></label><label>الدقائق الإضافية<input type="number" min="0" max="59" step="1" required value={minutes} onChange={e=>setMinutes(e.target.value)}/></label></div><p className="event-setting-help">تبدأ المدة عند الضغط على «حفظ إعدادات المنافسة»، ويُحفظ موعد النهاية للجميع.</p></>:<label className="event-date-input">تاريخ ووقت النهاية · بتوقيت السعودية<input type="datetime-local" required value={localDate} onChange={e=>setLocalDate(e.target.value)} dir="ltr"/></label>}
      <label className="event-toggle"><input type="checkbox" checked={showCountdown} onChange={e=>setShowCountdown(e.target.checked)}/>إظهار العدّاد التنازلي للطلاب</label><label className="event-prize-input">إعلان الجائزة (اختياري)<input maxLength={200} placeholder="مثال: جائزة للمركز الأول" value={prize} onChange={e=>setPrize(e.target.value)}/></label>
      <p className="event-setting-help">تُحتسب أفضل محاولة مكتملة قبل النهاية. بعدها يثبت ترتيب المنافسة، وتبقى المحاولات والشهادات متاحة للتعلّم. تمديد الموعد يسمح باحتساب المحاولات حتى الموعد الجديد.</p></>}
      <button className="primary" type="submit"><Save size={17}/>{busy?'جارٍ الحفظ…':'حفظ إعدادات المنافسة'}</button></fieldset>
      {saved.enabled&&saved.endsAt&&<p className="event-saved-deadline">الموعد المحفوظ: {competitionDate(saved.endsAt)} · بتوقيت السعودية{saved.ended?' · انتهت المنافسة':''}</p>}
    </form>:null}
    {error&&<p className="error-banner" role="alert">{error}</p>}{notice&&<p className="teacher-notice" role="status"><CheckCircle2 size={17}/>{notice}</p>}
  </section>;
}
