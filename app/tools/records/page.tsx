import {pageMetadata} from '@/lib/site';
export const metadata=pageMetadata('كشوف متابعة الطلاب | الودعاني','أنشئ كشف متابعة للطلاب، وأضف الدرجات والواجبات والحضور والتعليقات المخصصة، ثم اطبعه أو شاركه.','/tools/records');
import Records from '../../teacher/records/records';
import ToolsShell from '../shell';
export default function PublicRecordsPage(){return <ToolsShell current="records"><Records initialGrade="all" publicMode/></ToolsShell>;}
