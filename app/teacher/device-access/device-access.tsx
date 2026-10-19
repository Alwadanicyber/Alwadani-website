'use client';
import {useEffect,useState} from 'react';
import {CheckCircle2,Smartphone,Save} from 'lucide-react';
import {gradeLabel} from '@/lib/grades';
import {courseStudentAccess,type StudentAccess} from '@/lib/student-access';
import type {TeacherCourse} from '@/lib/course-types';

type AccessReply={courses:TeacherCourse[];changed:number;error?:string};
export default function DeviceAccess(){
 const [courses,setCourses]=useState<TeacherCourse[]>([]),[choices,setChoices]=useState<Record<string,StudentAccess>>({}),[allMode,setAllMode]=useState<StudentAccess>('single');
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState('');
 async function load(){setLoading(true);setError('');try{const response=await fetch('/api/teacher',{cache:'no-store'}),data=await response.json() as AccessReply;if(!response.ok)throw new Error(data.error);setCourses(data.courses);setChoices({});}catch(e){setError((e as Error).message);}finally{setLoading(false);}}
 useEffect(()=>{void load();},[]);
 async function save(course:string,studentAccess:StudentAccess){
  if(busy)return;setBusy(course);setError('');setNotice('');
  try{
   const response=await fetch('/api/teacher/device-access',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({course,studentAccess})}),data=await response.json() as AccessReply;
   if(!response.ok)throw new Error(data.error);
   setCourses(data.courses);setChoices(current=>course==='all'?{}:Object.fromEntries(Object.entries(current).filter(([id])=>id!==course)));
   setNotice((course==='all'?`تم تطبيق الإعداد على ${data.changed} من الدروس الحالية.`:'تم حفظ إعداد هذا الدرس.')+' '+(studentAccess==='single'?'يسمح الآن باسم واحد لكل درس على المتصفح نفسه.':'يمكن الآن لعدة طلاب استخدام المتصفح نفسه، كلٌّ باسمه.')+' النتائج والتقدم محفوظان.');
  }catch(e){setError((e as Error).message);}finally{setBusy('');}
 }
 return <main><div className="page-heading"><div><div className="eyebrow">STUDENT ACCESS</div><h1>استخدام الأجهزة<span>.</span></h1><p>اختر طالبًا واحدًا أو عدة طلاب على المتصفح نفسه لكل درس.</p></div><Smartphone size={38}/></div>
 {error&&<div className="error-banner" role="alert">{error}{!courses.length&&<button onClick={()=>void load()}>حاول مجددًا</button>}</div>}
 {notice&&<div className="teacher-notice" role="status"><CheckCircle2 size={19}/>{notice}</div>}
 <section className="standalone device-access-help"><h2>كيف يعمل الإعداد؟</h2><p><strong>طالب واحد:</strong> بعد بدء الدرس باسم طالب، يُمنع إدخال اسم آخر لهذا الدرس على المتصفح نفسه. يستطيع الطالب متابعة إجاباته وإعادة المحاولة باسمه.</p><p><strong>عدة طلاب:</strong> يظهر زر «طالب آخر على هذا الجهاز» داخل الدرس، ويبدأ الطالب التالي باسمه وبنتيجة مستقلة.</p><p>القيد لكل درس، ويعتمد على بيانات المتصفح. المتصفح الآخر أو التصفح الخاص أو مسح بيانات الموقع قد يسمح بتسجيل اسم جديد؛ لا يتحقق هذا الخيار من هوية صاحب الاسم. تغيير الإعداد لا يحذف المشاركات أو النتائج السابقة.</p></section>
 {loading?<p role="status">جارٍ تحميل إعدادات الدروس…</p>:courses.length?<>
 <section className="standalone device-access-bulk"><h2>تطبيق على جميع الدروس الحالية</h2><p>يشمل الدروس المنشورة والمسودات. يظل بإمكانك تغيير أي درس وحده أدناه؛ راجع إعداد الدروس الجديدة عند إضافتها.</p><form onSubmit={e=>{e.preventDefault();void save('all',allMode);}}><label htmlFor="all-device-access">اختيار لجميع الدروس</label><select id="all-device-access" value={allMode} disabled={!!busy} onChange={e=>setAllMode(e.target.value as StudentAccess)}><option value="single">طالب واحد على المتصفح نفسه</option><option value="shared">عدة طلاب على المتصفح نفسه</option></select><button className="primary" disabled={!!busy}><Save size={17}/>{busy==='all'?'جارٍ التطبيق…':'تطبيق على جميع الدروس'}</button></form></section>
 <section className="device-access-lessons" aria-label="إعداد كل درس"><h2>إعداد كل درس</h2>{courses.map(c=>{const saved=courseStudentAccess(c),choice=choices[c.id]??saved;return <article className="standalone device-access-course" key={c.id}><div><span className="grade-badge">{gradeLabel(c.grade)} · {c.published===1?'منشور':'مسودة'}</span><h3>{c.title}</h3><p>الإعداد المحفوظ: {saved==='single'?'طالب واحد على المتصفح نفسه':'عدة طلاب على المتصفح نفسه'}</p></div><form onSubmit={e=>{e.preventDefault();void save(c.id,choice);}}><label htmlFor={'access-'+c.id}>استخدام المتصفح</label><select id={'access-'+c.id} value={choice} disabled={!!busy} onChange={e=>setChoices(current=>({...current,[c.id]:e.target.value as StudentAccess}))}><option value="single">طالب واحد على المتصفح نفسه</option><option value="shared">عدة طلاب على المتصفح نفسه</option></select><button className="secondary" disabled={!!busy||choice===saved}><Save size={17}/>{busy===c.id?'جارٍ الحفظ…':'حفظ الإعداد'}</button></form></article>;})}</section>
 </>:<section className="standalone"><p>أضف درسًا أولًا لتحديد طريقة استخدام الأجهزة.</p><a className="secondary" href="/teacher">إدارة الدروس</a></section>}
 </main>;
}
