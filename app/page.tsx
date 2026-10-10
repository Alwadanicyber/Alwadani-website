import type {Metadata} from 'next';
import {SITE_TITLE,SITE_DESCRIPTION,pageMetadata} from '@/lib/site';
import Catalog from './catalog';
import Classroom from './classroom';
import {getCourse,publicCourse} from '@/lib/courses';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<{course?:string;grade?:string}>}):Promise<Metadata>{
  const params=await searchParams;
  if(params.course){try{const course=await getCourse(params.course);if(course)return pageMetadata(course.title+' | TeachCraft',course.description,'/?course='+encodeURIComponent(course.id));}catch{}return {title:'الدرس غير متاح | TeachCraft',robots:{index:false,follow:true}};}
  return pageMetadata(SITE_TITLE,SITE_DESCRIPTION,'/');
}

export default async function Page({searchParams}:{searchParams:Promise<{course?:string;grade?:string}>}){const params=await searchParams;if(!params.course)return <Catalog initialGrade={params.grade}/>;try{const course=await getCourse(params.course);if(!course)return <div className="standalone fallback" dir="rtl"><h1>الدرس غير متاح حاليًا</h1><p>قد يكون محفوظًا كمسودة أو غير منشور.</p><a className="primary" href="/">عرض جميع الدروس</a></div>;return <Classroom key={course.id} course={publicCourse(course)}/>;}catch{return <div className="standalone fallback"><h2>تعذّر تحميل الدرس</h2><a href="/" className="primary">العودة إلى الدروس</a></div>;}}
