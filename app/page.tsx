import Catalog from './catalog';
import Classroom from './classroom';
import {getCourse,publicCourse} from '@/lib/courses';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{course?:string;grade?:string}>}){const params=await searchParams;if(!params.course)return <Catalog initialGrade={params.grade}/>;try{const course=await getCourse(params.course);if(!course)return <div className="standalone fallback" dir="rtl"><h1>الدرس غير متاح حاليًا</h1><p>قد يكون محفوظًا كمسودة أو غير منشور.</p><a className="primary" href="/">عرض جميع الدروس</a></div>;return <Classroom key={course.id} course={publicCourse(course)}/>;}catch{return <div className="standalone fallback"><h2>تعذّر تحميل الدرس</h2><a href="/" className="primary">العودة إلى الدروس</a></div>;}}
