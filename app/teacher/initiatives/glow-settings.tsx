'use client';
import {useEffect,useState} from 'react';
import {defaultInitiativeGlow,initiativeGlowColors,initiativeGlowPresentation,type InitiativeGlow} from '@/lib/initiative-glow';

export default function InitiativeGlowSettings({value,busy,onSave}:{value:InitiativeGlow;busy:boolean;onSave:(glow:InitiativeGlow)=>Promise<boolean>}){
 const [draft,setDraft]=useState(value),[saved,setSaved]=useState(false),[failed,setFailed]=useState(false);
 useEffect(()=>{setDraft(value);},[value.color,value.nameEffect,value.frameEffect,value.intensity]);
 const changed=JSON.stringify(draft)!==JSON.stringify(value);
 function change(next:Partial<InitiativeGlow>){setDraft(previous=>({...previous,...next}));setSaved(false);setFailed(false);}
 async function save(e:React.FormEvent){e.preventDefault();setSaved(false);setFailed(false);if(await onSave(draft))setSaved(true);else setFailed(true);}
 return <section className="ni-glow-settings" aria-labelledby="ni-glow-title">
  <div className="ni-section-heading"><div><span className="ni-kicker">لمستك الخاصة</span><h2 id="ni-glow-title">مظهر توهج الأسماء والإطارات</h2><p>اختر المظهر لهذه المبادرة. يُطبّق على المشاركين الذين فعّلت لهم توهج الاسم أو الإطار من إدارة المشاركات أدناه.</p></div></div>
  <div className="ni-glow-layout"><form onSubmit={save}><fieldset disabled={busy} className="ni-glow-controls"><legend className="sr-only">خيارات مظهر التوهج</legend>
   <fieldset className="ni-glow-colors"><legend>لون التوهج</legend><div>{initiativeGlowColors.map(option=><button type="button" key={option.color} aria-pressed={draft.color===option.color} onClick={()=>change({color:option.color})}><span className="ni-glow-swatch" style={{background:option.color}} aria-hidden="true"/>{option.name}</button>)}</div></fieldset>
   <label className="ni-glow-custom">أو اختر لونًا مخصصًا<span><input type="color" aria-label="لون التوهج المخصص" value={draft.color} onChange={e=>change({color:e.target.value})}/><code dir="ltr">{draft.color}</code></span></label>
   <div className="ni-glow-selects"><label>طريقة توهج الاسم<select value={draft.nameEffect} onChange={e=>change({nameEffect:e.target.value as InitiativeGlow['nameEffect']})}><option value="steady">توهج ثابت</option><option value="pulse">نبض هادئ</option><option value="shimmer">لمعة تمر على الاسم</option></select></label>
   <label>طريقة توهج الإطار<select value={draft.frameEffect} onChange={e=>change({frameEffect:e.target.value as InitiativeGlow['frameEffect']})}><option value="steady">إطار مضيء ثابت</option><option value="pulse">هالة نابضة</option><option value="orbit">ضوء يدور حول الإطار</option></select></label>
   <label>قوة التوهج<select value={draft.intensity} onChange={e=>change({intensity:e.target.value as InitiativeGlow['intensity']})}><option value="soft">خفيف</option><option value="medium">متوسط</option><option value="strong">بارز</option></select></label></div>
   <div className="ni-admin-actions"><button type="submit" className="primary" disabled={!changed||busy}>{busy?'جارٍ الحفظ…':'حفظ مظهر التوهج'}</button><button type="button" className="secondary" disabled={!changed||busy} onClick={()=>{setDraft(value);setSaved(false);setFailed(false);}}>التراجع عن التغييرات</button><button type="button" className="secondary" onClick={()=>change(defaultInitiativeGlow)}>استعادة الذهبي الأصلي</button></div>
   <p className="ni-glow-save-state" role={failed?'alert':'status'}>{failed?'تعذّر الحفظ. راجع رسالة الخطأ ثم أعد المحاولة.':changed?'تغييرات المعاينة لم تُحفظ بعد.':saved?'تم حفظ المظهر لهذه المبادرة.':'هذا هو المظهر المحفوظ حاليًا.'}</p>
  </fieldset></form>
  <aside className="ni-glow-preview" {...initiativeGlowPresentation(draft)} aria-label="معاينة مباشرة للتوهج"><span className="ni-kicker">معاينة مباشرة</span><div className="ni-glow-preview-card"><p>توهج الاسم والإطار معًا</p><div className="ni-name-frame"><strong className="ni-participant-glow">اسم المشارك</strong></div></div><div className="ni-glow-preview-separate"><div><small>الاسم فقط</small><strong className="ni-participant-glow">اسم المشارك</strong></div><div><small>الإطار فقط</small><strong className="ni-name-frame">اسم المشارك</strong></div></div><p className="ni-glow-preview-note">يتغير المظهر هنا فور الاختيار. على الجوال تُبسّط الحركة، ويُحترم إعداد تقليل الحركة.</p></aside></div>
 </section>;
}
