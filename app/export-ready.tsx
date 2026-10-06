'use client';
import {useEffect,useState} from 'react';
import {Download} from 'lucide-react';
export default function ExportReady({file}:{file:File|null}){
  const [url,setUrl]=useState('');
  useEffect(()=>{if(!file){setUrl('');return;}const next=URL.createObjectURL(file);setUrl(next);return()=>URL.revokeObjectURL(next);},[file]);
  return file&&url?<p className="export-ready" role="status"><span>الملف جاهز. إذا لم يبدأ التنزيل اضغط:</span><a className="secondary compact" href={url} download={file.name}><Download size={16}/><b dir="ltr">{file.name}</b></a></p>:null;
}
