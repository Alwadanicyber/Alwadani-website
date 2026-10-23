import {pageMetadata} from '@/lib/site';
import Initiatives from './initiatives';
import './initiatives.css';
export const metadata=pageMetadata('مبادرات وطني الغالي | الودعاني','مساحة للمبادرات الوطنية ومشاركات الطلاب: رسائل ورسومات تضيء درع الوطن.','/initiatives');
export default function Page(){return <Initiatives/>;}
