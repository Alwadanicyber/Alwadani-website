'use client';
import {useEffect,useRef,useState} from 'react';
import {Users,Search,Trash2,RotateCcw,RefreshCw,CheckCircle2,Clock3} from 'lucide-react';
import {audienceWords,type Gender} from '@/lib/audience';
import {gradeLabel} from '@/lib/grades';
import {formatSolveTime} from '@/lib/solve-time';
import type {StudentParticipation} from '@/lib/student-moderation';
import {AlertDialog,AlertDialogContent,AlertDialogHeader,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel,AlertDialogAction} from '@/components/ui/alert-dialog';
import TeacherShell from '../shell';

type CourseOption={id:string;title:string;grade?:string;studentGender:Gender};
type ParticipantsResponse={participants:StudentParticipation[];error?:string};
export default function TeacherParticipants({username,courses,initialCourse,initialParticipants}:{username:string;courses:CourseOption[];initialCourse:string;initialParticipants:StudentParticipation[]}){
  const [courseId,setCourseId]=useState(initialCourse),[rows,setRows]=useState(initialParticipants),[search,setSearch]=useState(''),[showRemoved,setShowRemoved]=useState(false);
  const [loading,setLoading]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[target,setTarget]=useState<StudentParticipation|null>(null),[dialogError,setDialogError]=useState('');
  const firstLoad=useRef(true),course=courses.find(c=>c.id===courseId),words=audienceWords(course||{});
  async function load(signal?:AbortSignal){
    if(!courseId)return;
    setLoading(true);setError('');
    try{
      const response=await fetch('/api/teacher/students?course='+encodeURIComponent(courseId),{signal,cache:'no-store'});
      const data=await response.json() as ParticipantsResponse;if(!response.ok)throw new Error(data.error||'تعذّر تحميل المشاركات.');
      if(!signal?.aborted)setRows(data.participants);
    }catch(e){if(!signal?.aborted)setError((e as Error).message);}
    finally{if(!signal?.aborted)setLoading(false);}
  }
  useEffect(()=>{
    if(firstLoad.current){firstLoad.current=false;return;}
    const controller=new AbortController();void load(controller.signal);return ()=>controller.abort();
  },[courseId]); // Each selected lesson has its own participant list.
  async function mutate(row:StudentParticipation,restore=false){
    if(busy)return;
    setBusy(true);setError('');setDialogError('');setNotice('');
    try{
      const response=await fetch('/api/teacher/students',{method:restore?'PATCH':'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({course:courseId,id:row.id,...(restore?{action:'restore'}:{})})});
      const data=await response.json() as ParticipantsResponse;if(!response.ok)throw new Error(data.error||'تعذّر حفظ التغيير.');
      setRows(data.participants);setTarget(null);
      setNotice(restore?'تمت استعادة المشاركة ونتيجتها السابقة.':'تم حذف المشاركة من المنافسة وإعادة ترتيب النتائج. يمكنك استعادتها من المحذوفات.');
    }catch(e){if(restore)setError((e as Error).message);else setDialogError((e as Error).message);}
    finally{setBusy(false);}
  }
  const active=rows.filter(r=>!r.removedAt),removed=rows.filter(r=>!!r.removedAt),query=search.trim().toLocaleLowerCase('ar');
  const visible=(showRemoved?removed:active).filter(r=>r.name.toLocaleLowerCase('ar').includes(query));
  return <TeacherShell username={username} current="students"><main>
    <div className="page-heading"><div><div className="eyebrow">CLASSROOM RESULTS</div><h1>المشاركون والنتائج<span>.</span></h1><p>راجع الأسماء والنتائج، واحذف المشاركات غير المناسبة من المنافسة.</p></div><Users size={38}/></div>
    {error&&<div className="error-banner" role="alert">{error}<button disabled={busy||loading} onClick={()=>void load()}>إعادة المحاولة</button></div>}
    {notice&&<div className="teacher-notice" role="status"><CheckCircle2 size={19}/>{notice}</div>}
    {courses.length?<>
      <div className="participants-toolbar"><label htmlFor="participants-course">الدرس<select id="participants-course" value={courseId} disabled={busy||loading} onChange={event=>{setCourseId(event.target.value);setRows([]);setSearch('');setShowRemoved(false);setError('');setNotice('');setTarget(null);}}>{courses.map(c=><option key={c.id} value={c.id}>{c.title} — {gradeLabel(c.grade)}</option>)}</select></label><button className="secondary" disabled={busy||loading} onClick={()=>void load()}><RefreshCw size={17}/>{loading?'جارٍ التحديث…':'تحديث النتائج'}</button></div>
      <div className="teacher-library-tabs" aria-label="عرض المشاركات"><button className="secondary" aria-pressed={!showRemoved} disabled={busy} onClick={()=>{setShowRemoved(false);setSearch('');}}><Users size={17}/>المشاركات ({active.length})</button><button className="secondary" aria-pressed={showRemoved} disabled={busy} onClick={()=>{setShowRemoved(true);setSearch('');}}><Trash2 size={17}/>المحذوفات ({removed.length})</button></div>
      <label className="participants-search"><Search size={19}/><input type="search" aria-label={'ابحث باسم '+words.student} placeholder={'ابحث باسم '+words.student} value={search} onChange={event=>setSearch(event.target.value)}/></label>
      {showRemoved&&<p className="trash-help">هذه المشاركات لا تظهر في لوحة المنافسة. استعادتها تعيد الاسم وأفضل نتيجة إلى ترتيبها الصحيح.</p>}
      {loading?<p role="status">جارٍ تحميل المشاركات…</p>:visible.length?<div className="participant-grid">{visible.map(row=>{
        const measured=typeof row.solveMs==='number',time=measured?row.solveMs:row.estimatedSolveMs;
        return <article className={'participant-card '+(row.removedAt?'participant-removed':'')} key={row.id}>
          <div className="participant-card-heading"><span className="participant-place">{row.competing?'المركز #'+row.position:row.removedAt?'محذوفة من المنافسة':'خارج المنافسة'}</span><span className="pill">{row.completed?words.finishedJourney:'قيد التدريب'}</span></div>
          <h2 dir="auto">{row.name}</h2><div className="participant-result"><strong>{Math.round(row.percentage)}%</strong><span><bdi dir="ltr">{row.score} / {row.total}</bdi> نقطة</span></div>
          <div className="participant-details"><span>عدد المحاولات: {row.attempts}</span>{row.completed&&<span><Clock3 size={14}/>{typeof time==='number'?<>{measured?'وقت الحل':'وقت تقديري'} <bdi dir="ltr">{formatSolveTime(time)}</bdi></>:'الوقت غير مسجّل'}</span>}</div>
          <small className="participant-date">بدء المشاركة: <time dateTime={row.created}>{new Date(row.created).toLocaleString('ar-SA',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Riyadh'})}</time></small>
          {row.removedAt?<button className="secondary" disabled={busy} onClick={()=>void mutate(row,true)} aria-label={'استعادة مشاركة '+row.name}><RotateCcw size={17}/>استعادة المشاركة</button>:<button className="secondary danger" disabled={busy} onClick={()=>{setTarget(row);setDialogError('');}} aria-label={'حذف مشاركة '+row.name}><Trash2 size={17}/>حذف المشاركة</button>}
        </article>;
      })}</div>:<div className="standalone teacher-empty"><Users size={30}/><h2>{query?'لا توجد أسماء مطابقة':showRemoved?'لا توجد مشاركات محذوفة':'لا توجد مشاركات في هذا الدرس بعد'}</h2><p>{query?'جرّب كتابة جزء آخر من الاسم.':showRemoved?'ستظهر هنا المشاركات التي تحذفها.':'ستظهر الأسماء والنتائج هنا عند بدء الحل.'}</p></div>}
    </>:<div className="standalone teacher-empty"><h2>أضف درسًا لعرض المشاركات</h2><a className="primary" href="/teacher">إدارة الدروس</a></div>}
    <AlertDialog open={target!==null} onOpenChange={open=>{if(!open&&!busy)setTarget(null);}}><AlertDialogContent dir="rtl" className="delete-course-dialog"><AlertDialogHeader><AlertDialogTitle>حذف مشاركة «{target?.name}»؟</AlertDialogTitle><AlertDialogDescription>سيختفي الاسم وجميع نتائج محاولاته من لوحة المنافسة في هذا الدرس، وسيُعاد ترتيب المراكز والميداليات. يمكنك استعادة المشاركة ونتائجها من المحذوفات إذا حُذفت بالخطأ.</AlertDialogDescription></AlertDialogHeader>{dialogError&&<p className="delete-course-error" role="alert">{dialogError}</p>}<AlertDialogFooter><AlertDialogCancel disabled={busy}>إلغاء</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={busy} onClick={event=>{event.preventDefault();if(target)void mutate(target);}}>{busy?'جارٍ الحذف…':'حذف المشاركة'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <footer><span>TEACHCRAFT</span><small>مساحة المعلم · خاصة بمالك الموقع</small></footer>
  </main></TeacherShell>;
}
