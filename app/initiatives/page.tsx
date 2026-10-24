import {pageMetadata} from '@/lib/site';
import Initiatives from './initiatives';
import './initiatives.css';
export const metadata=pageMetadata('درع الوطن | مجمع الملك عبدالله','مساحة للمبادرات الوطنية ومشاركات الطلاب: رسائل ورسومات تضيء درع الوطن.','/initiatives');
export default function Page(){return <Initiatives id="dir-alwatan"/>;}
