import {listCourses} from '@/lib/courses';
import {grades} from '@/lib/grades';
import {BookOpen,GraduationCap} from 'lucide-react';
import {requireOwner} from '../owner';
import TeacherShell from '../shell';
export const dynamic='force-dynamic';
export default async function TeacherClasses(){const owner=await requireOwner(),courses=await listCourses(true);return <TeacherShell username={owner.username} current="classes"><main><div className="page-heading"><div><div className="eyebrow">YOUR CLASSROOMS</div><h1>صفوفك الدراسية<span>.</span></h1><p>اختر الصف لإدارة دروسه أو إنشاء كشف خاص به.</p></div><GraduationCap size={40}/></div><div className="grade-groups">{[...new Set(grades.map(g=>g.stage))].map(stage=><section key={stage}><h2>{stage}</h2><div className="grade-grid">{grades.filter(g=>g.stage===stage).map(grade=><article className="grade-card" key={grade.id}><span className="grade-card-symbol"><BookOpen size={22}/></span><strong>{grade.label}</strong><span>{courses.filter(c=>c.grade===grade.id).length} دروس</span><div className="course-card-actions"><a className="secondary compact" href={'/teacher?grade='+grade.id}>إدارة الدروس</a><a className="secondary compact" href={'/teacher/records?grade='+grade.id}>الكشوفات</a></div></article>)}</div></section>)}</div><footer><span>ALWADANI</span><small>مساحة المعلم</small></footer></main></TeacherShell>;}
