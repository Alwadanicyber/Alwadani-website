import {pageMetadata} from '@/lib/site';
import Initiatives from '../initiatives';
import '../initiatives.css';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){return pageMetadata('شارك في مبادرات وطني الغالي | الودعاني','شارك برسالة أو بطاقة أو رسمة أو صوت، وساهم في اكتمال درع المبادرة.','/initiatives/'+encodeURIComponent((await params).id));}
export default async function Page({params}:{params:Promise<{id:string}>}){return <Initiatives id={(await params).id}/>;}
