'use client';
import '../../competition.css';
import {useEffect,useState} from 'react';
import {Timer,Save,CheckCircle2} from 'lucide-react';
import {competitionDate,riyadhLocal,riyadhInstant,type CompetitionState} from '@/lib/competition';
export default function CompetitionSettings({courseId,onSaved}:{courseId:string;onSaved:()=>void}){
  const [saved,setSaved]=useState<CompetitionState|null>(null),[enabled,setEnabled]=useState(false),[showCountdown,setShowCountdown]=useState(true),[mode,setMode]=useState('days'),[days,setDays]=useState('3'),[hours,setHours]=useState('0'),[minutes,setMinutes]=useState('0'),[localDate,setLocalDate]=useState(''),[prize,setPrize]=useState('');
  const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  function fill(value:CompetitionState){setSaved(value);setEnabled(value.enabled);setShowCountdown(value.showCountdown);setPrize(value.prize);setMode(value.endsAt?'date':'days');setLocalDate(value.endsAt?riyadhLocal(value.endsAt):'');setDays('3');setHours('0');setMinutes('0');}
  useEffect(()=>{
    const controller=new AbortController();setLoading(true);setSaved(null);setError('');setNotice('');
    void (async()=>{try{const res=await fetch('/api/teacher/competition?course='+encodeURIComponent(courseId),{signal:controller.signal,cache:'no-store'}),data=await res.json() as {competition:CompetitionState;error?:string};if(!res.ok)throw new Error(data.error||'تعذّر تحميل الإعدادات.');if(!controller.signal.aborted)fill(data.competition);}catch(e){if(!controller.signal.aborted)setError((e as Error).message);}finally{if(!controller.signal.aborted)setLoading(false);}})();
    return()=>controller.abort();
  },[courseId]);
  async function save(event:React.FormEvent){
    event.preventDefault();setBusy(true);setError('');setNotice('');
    try{
      const endsAt=enabled&&mode==='date'?riyadhInstant(localDate):null;
      const response=await fetch('/api/teacher/competition',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({course:courseId,enabled,showCountdown,mode,days:days===''?null:Number(days),hours:hours===''?null:Number(hours),minutes:minutes===''?null:Number(minutes),endsAt,prize})}),data=await response.json() as {competition:CompetitionState;error?:string};
      if(!response.ok)throw new Error(data.error||'تعذّر حفظ الإعدادات.');
      fill(data.competition);setNotice(enabled?'تم حفظ موعد المنافسة. العدّاد ثابت ولا يبدأ من جديد عند تحديث الصفحة.':'تم إلغاء موعد النهاية والعدّاد لهذا الدرس.');onSaved();
    }catch(e){setError((e as Error).message);}finally{setBusy(false);}
  }
  return <section className="competition-settings"><div className="section-heading"><div><div className="eyebrow">COMPETITION SETTINGS</div><h2><Timer size={23}/>موعد المنافسة والعدّاد</h2><p>إعداد مستقل لهذا الدرس، يظهر على لوحة النتائج لجميع الطلاب والطالبات.</p></div></div>
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
