import type {Metadata} from 'next';
import ReadingCourse from './reading-course';
export const metadata:Metadata={title:'أساسيات القراءة الإنجليزية | TeachCraft',description:'دورة قراءة مجانية للجميع: عشرة فصول مرتبة، أصوات الحروف والدمج، نصوص قراءة واختبار بعد كل فصل.'};
export default function Page(){return <ReadingCourse/>;}
