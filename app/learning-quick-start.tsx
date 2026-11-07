import {ArrowLeft,Award,BookOpen,ClipboardList,Play} from 'lucide-react';

type AvailableGrade={id:string;label:string;courses:number};
type ResumeCourse={id:string;title:string;percent:number};
const countFormat=new Intl.NumberFormat('ar-SA');

export default function LearningQuickStart({grades,resume,onChooseGrade}:{grades:AvailableGrade[];resume:ResumeCourse|null;onChooseGrade:(id:string)=>void}){
 return <section className="tc-quick-start" aria-labelledby="quick-start-heading">
  <div className="tc-quick-heading"><div><span className="tc-section-overline">خطوتك القادمة</span><h2 id="quick-start-heading">ابدأ من هنا</h2></div><p>للتعلّم، أو ليومٍ تعليمي أكثر ترتيبًا.</p></div>
  <div className="tc-start-layout">
   <div className="tc-student-start">
    <div className="tc-start-icon"><BookOpen size={23} aria-hidden="true"/></div>
    <div className="tc-start-copy"><h3>{resume?'أكمل ما بدأته':'دروس جاهزة للتعلّم'}</h3><p>{resume?'تقدّمك محفوظ في هذا المتصفح.':'اختر صفًا تتوفر فيه دروس، وابدأ بخطوة بسيطة.'}</p>
     {resume?<a className="tc-resume-link" href={'/?course='+encodeURIComponent(resume.id)}><Play size={17} aria-hidden="true"/><span>{resume.title}<small>أكملت {countFormat.format(resume.percent)}٪</small></span><ArrowLeft size={18} aria-hidden="true"/></a>:
      <div className="tc-ready-grades">{grades.length?grades.map(item=><button type="button" key={item.id} onClick={()=>onChooseGrade(item.id)}>{item.label}<span>{countFormat.format(item.courses)} دروس</span><ArrowLeft size={15} aria-hidden="true"/></button>):<a href="#grades">تصفّح الصفوف<ArrowLeft size={16} aria-hidden="true"/></a>}</div>}
     <a className="rm-home-link" href="/remedial">لديك خطة علاجية؟ ادخل برمز معلّمك<ArrowLeft size={16} aria-hidden="true"/></a>
    </div>
   </div>
   <div className="tc-teacher-start" aria-label="اختصارات أدوات المعلم">
    <a href="/tools/records"><span className="tc-shortcut-icon"><ClipboardList size={23} aria-hidden="true"/></span><span><strong>نظّم متابعة طلابك</strong><small>الأسماء والمهام والدرجات في كشف واحد</small></span><ArrowLeft size={18} aria-hidden="true"/></a>
    <a href="/tools/certificates"><span className="tc-shortcut-icon is-gold"><Award size={23} aria-hidden="true"/></span><span><strong>احتفِ بإنجازهم</strong><small>شهادات بلمستك، جاهزة للطباعة</small></span><ArrowLeft size={18} aria-hidden="true"/></a>
   </div>
  </div>
 </section>;
}
