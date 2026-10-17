'use client';
import {useEffect,useState} from 'react';
import {Sparkles,Save,RefreshCw,Search,BookOpen,Check} from 'lucide-react';
import {defaultAssistantSettings,type AssistantSettings as Config} from '@/lib/assistant-core';
import {grades,gradeLabel} from '@/lib/grades';
import '../../learning-assistant.css';
type CourseOption={id:string;title:string;grade:string;published:boolean};
type ResponseData={settings:Config;courses:CourseOption[];available:boolean;used:number;error?:string};
export default function AssistantSettings(){
 const [settings,setSettings]=useState<Config>(defaultAssistantSettings),[courses,setCourses]=useState<CourseOption[]>([]),[search,setSearch]=useState(''),[available,setAvailable]=useState(false),[used,setUsed]=useState(0),[loading,setLoading]=useState(true),[loaded,setLoaded]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 function accept(d:ResponseData){setSettings(d.settings);setCourses(d.courses);setAvailable(d.available);setUsed(d.used);setLoaded(true);}
 async function load(){setLoading(true);setError('');try{const r=await fetch('/api/teacher/assistant',{cache:'no-store'}),d=await r.json() as ResponseData;if(!r.ok)throw new Error(d.error);accept(d);}catch(e){setError((e as Error).message||'تعذّر تحميل المساعد.');}finally{setLoading(false);}}
 useEffect(()=>{void load();},[]);
 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');setNotice('');try{const r=await fetch('/api/teacher/assistant',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(settings)}),d=await r.json() as ResponseData;if(!r.ok)throw new Error(d.error);accept(d);setNotice(!d.settings.enabled?'تم إيقاف المساعد وحفظ اختيار الدروس.':d.settings.courseMode==='all'?'تم تفعيل المساعد لجميع الدروس.':d.settings.courseIds.length?'تم حفظ الاختيار؛ يظهر المساعد في الدروس المحددة فقط.':'تم الحفظ دون دروس مختارة؛ لن يظهر المساعد في أي درس.');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 function toggle(id:string){setSettings(s=>({...s,courseIds:s.courseIds.includes(id)?s.courseIds.filter(value=>value!==id):[...s.courseIds,id]}));setNotice('');}
 const disabled=loading||busy||!loaded,query=search.trim().toLocaleLowerCase(),filtered=courses.filter(c=>(c.title+' '+gradeLabel(c.grade)).toLocaleLowerCase().includes(query));
 return <section className="standalone assistant-settings">
  <div className="assistant-settings-heading"><h2><Sparkles size={23} style={{display:'inline',verticalAlign:'middle',marginInlineEnd:9}}/>مساعد الدرس بالذكاء الاصطناعي</h2><span className="assistant-binding-status">{loading?'جارٍ الفحص…':available?'خدمة الذكاء الاصطناعي مرتبطة':'الخدمة تحتاج ربطًا'}</span></div>
  <p>اختر الدروس التي يستفيد فيها الطلاب من شرح القواعد والتعبيرات وتصحيح الجمل. يُحفظ اختيارك في حساب الموقع.</p>
  {error&&<p className="error-banner" role="alert">{error}<button onClick={()=>void load()}>تحديث القائمة</button></p>}
  {notice&&<p className="teacher-notice" role="status">{notice}</p>}
  <form onSubmit={e=>void save(e)}>
   <div className="assistant-settings-form">
    <label className="assistant-settings-toggle"><input type="checkbox" checked={settings.enabled} disabled={disabled} onChange={e=>setSettings(s=>({...s,enabled:e.target.checked}))}/>تشغيل المساعد للطلاب</label>
   </div>
   <fieldset className="assistant-scope" disabled={disabled}>
    <legend>أين يظهر المساعد؟</legend>
    <div className="assistant-scope-options">
     <label className={settings.courseMode==='all'?'is-selected':''}><input type="radio" name="assistant-course-mode" value="all" checked={settings.courseMode==='all'} onChange={()=>setSettings(s=>({...s,courseMode:'all'}))}/><span><strong>جميع الدروس</strong><small>يشمل الدروس الجديدة التي تنشرها لاحقًا.</small></span></label>
     <label className={settings.courseMode==='selected'?'is-selected':''}><input type="radio" name="assistant-course-mode" value="selected" checked={settings.courseMode==='selected'} onChange={()=>setSettings(s=>({...s,courseMode:'selected'}))}/><span><strong>دروس محددة</strong><small>اختر الدروس التي تريد ظهور المساعد فيها.</small></span></label>
    </div>
    {settings.courseMode==='selected'&&<div className="assistant-course-panel">
     <div className="assistant-course-toolbar"><span><Check size={16}/>{settings.courseIds.length.toLocaleString('ar-SA')} من {courses.length.toLocaleString('ar-SA')} دروس مختارة</span><button type="button" onClick={()=>setSettings(s=>({...s,courseIds:[]}))} disabled={!settings.courseIds.length}>إلغاء التحديد</button></div>
     <label className="assistant-course-search"><Search size={17}/><span className="sr-only">ابحث عن درس أو صف</span><input type="search" placeholder="ابحث باسم الدرس أو الصف…" value={search} onChange={e=>setSearch(e.target.value)}/></label>
     <div className="assistant-course-list">
      {grades.map(grade=>{const items=filtered.filter(c=>c.grade===grade.id);return items.length?<div className="assistant-course-group" key={grade.id}><h3>{grade.label}</h3>{items.map(course=><label className={'assistant-course-option '+(settings.courseIds.includes(course.id)?'is-selected':'')} key={course.id}><input type="checkbox" checked={settings.courseIds.includes(course.id)} onChange={()=>toggle(course.id)} disabled={settings.courseIds.length>=300&&!settings.courseIds.includes(course.id)}/><BookOpen size={17}/><span dir="auto">{course.title}</span><small>{course.published?'منشور':'مسودة'}</small></label>)}</div>:null;})}
      {!filtered.length&&<p className="assistant-course-empty">{courses.length?'لا توجد دروس مطابقة للبحث.':'لا توجد دروس متاحة للاختيار.'}</p>}
     </div>
     <p className="assistant-settings-help">{settings.courseIds.length?'لن يظهر المساعد في بقية الدروس. الدرس الجديد يحتاج إلى تحديده هنا، والمسودة تظهر للطلاب بعد نشرها فقط.':'لم تختر أي درس بعد. إذا حفظت هكذا، فلن يظهر المساعد في أي درس.'}</p>
    </div>}
   </fieldset>
   <div className="assistant-settings-form">
    <label>الحد اليومي للموقع كله (حتى ٨٠ رسالة)<input type="number" min={1} max={80} required value={settings.dailyLimit} disabled={disabled} onChange={e=>setSettings(s=>({...s,dailyLimit:Number(e.target.value)}))}/></label>
    <label>حد المتصفح يوميًا (حتى ٣٠ رسالة)<input type="number" min={1} max={30} required value={settings.visitorLimit} disabled={disabled} onChange={e=>setSettings(s=>({...s,visitorLimit:Number(e.target.value)}))}/></label>
   </div>
   <div className="assistant-settings-actions"><button className="primary" disabled={disabled}><Save size={17}/>{busy?'جارٍ الحفظ…':'حفظ إعدادات المساعد'}</button><button className="secondary" type="button" disabled={loading||busy} onClick={()=>void load()}><RefreshCw size={17}/>تحديث القائمة والاستخدام</button><span className="assistant-quota">الطلبات المحجوزة اليوم: <bdi dir="ltr">{used} / {settings.dailyLimit}</bdi></span></div>
  </form>
  <p className="assistant-settings-help">تتجدد الحدود الساعة ٣ صباحًا بتوقيت السعودية. تُحسب الطلبات التي أُرسلت للخدمة حتى إن تعذّر وصول الرد. لا نخزّن نص المحادثة في قاعدة البيانات، ولا تُرسل أسماء الطلاب أو درجاتهم تلقائيًا. الحد مرتبط بالمتصفح ولا يثبت هوية الشخص.</p>
  <p className="assistant-settings-help">المزود: Cloudflare Workers AI، والنموذج Gemma 4. تضع المنصة حدودًا إضافية للاستخدام. الحصة المجانية تُحتسب على حساب Cloudflare كله، وقد توجد رسوم على الحساب المدفوع عند تجاوزها؛ راجع <a href="https://developers.cloudflare.com/workers-ai/platform/pricing/" target="_blank" rel="noopener noreferrer">تفاصيل الاستخدام والتكلفة</a>.</p>
  {!loading&&!available&&<p className="assistant-settings-help">للمطور: يحتاج Worker إلى ربط Workers AI باسم AI. لا تضع أي مفتاح في صفحات الطلاب.</p>}
 </section>;
}
