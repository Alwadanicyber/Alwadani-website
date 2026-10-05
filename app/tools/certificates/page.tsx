import {pageMetadata} from '@/lib/site';
export const metadata=pageMetadata('شهادات الطلاب | الودعاني','أنشئ شهادات جميلة بأسماء الطلاب، واختر النماذج والنصوص والخلفيات، ثم اطبعها أو شاركها.','/tools/certificates');
import Certificates from './studio';
import ToolsShell from '../shell';
export default function CertificatesPage(){return <ToolsShell current="certificates"><Certificates/></ToolsShell>;}
