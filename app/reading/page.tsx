import type {Metadata} from 'next';
import ReadingCourse from './reading-course';
export const metadata:Metadata={title:'أساسيات القراءة الإنجليزية | TeachCraft',description:'دورة قراءة مجانية للجميع: لوحة أصوات الحروف A–Z مع مثالين لكل حرف، ثم الحروف الثنائية وحروف العلة واختبارات بخيارات صوتية.'};
export default function Page(){return <ReadingCourse/>;}
