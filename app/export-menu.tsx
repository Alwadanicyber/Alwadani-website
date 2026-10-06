'use client';
import {useState} from 'react';
import {Download,ChevronDown} from 'lucide-react';
export type ExportFormat='pdf'|'docx'|'png'|'csv'|'html'|'json';
const names:Record<ExportFormat,[string,string]>={pdf:['PDF','ملف جاهز للطباعة يحافظ على التصميم'],docx:['Word (.docx)','فتح الملف في Microsoft Word'],png:['صورة PNG','صورة واضحة للمشاركة'],csv:['Excel / CSV','جدول بيانات يفتح في Excel'],html:['HTML','نسخة تفتح في المتصفح'],json:['نسخة قابلة للاستعادة','استعادة العمل وتعديله داخل الموقع']};
export default function ExportMenu({label,formats,onExport,disabled}:{label:string;formats:ExportFormat[];onExport:(format:ExportFormat)=>void;disabled?:boolean}){
  const [open,setOpen]=useState(false);
  return <div className="export-menu"><button type="button" className="secondary" disabled={disabled} aria-expanded={open} onClick={()=>setOpen(!open)}><Download size={17}/>{label}<ChevronDown size={15}/></button>{open&&<><button type="button" className="export-dismiss" aria-label="إغلاق خيارات التنزيل" onClick={()=>setOpen(false)}/><div className="export-options" role="menu" aria-label={'صيغ '+label}>{formats.map(format=><button type="button" role="menuitem" key={format} onClick={()=>{setOpen(false);onExport(format);}}><strong>{names[format][0]}</strong><small>{names[format][1]}</small></button>)}</div></>}</div>;
}
