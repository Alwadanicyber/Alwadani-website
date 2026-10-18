'use client';
import {useEffect,useRef} from 'react';
export default function InlineCertificateText({value,label,editing,isName,onChange,onFinish}:{value:string;label:string;editing:boolean;isName:boolean;onChange:(text:string)=>void;onFinish:()=>void}){
 const input=useRef<HTMLTextAreaElement>(null);
 useEffect(()=>{if(editing){input.current?.focus();input.current?.select();}},[editing]);
 if(!editing)return <div className="cert-canvas-text" dir="auto" data-placeholder="انقر مرتين للكتابة هنا">{value}</div>;
 return <textarea ref={input} className="cert-inline-text" aria-label={'تحرير '+label+' على الشهادة'} aria-describedby="certificate-inline-help" dir="auto" value={value} maxLength={isName?120:1500} spellCheck={false} onChange={event=>onChange(isName?event.target.value.replace(/[\r\n]+/g,' '):event.target.value)} onPointerDown={event=>event.stopPropagation()} onKeyDown={event=>{event.stopPropagation();if(event.key==='Escape'||((event.ctrlKey||event.metaKey)&&event.key==='Enter')){event.preventDefault();onFinish();}}} onBlur={onFinish}/>;
}
