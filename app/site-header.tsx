'use client';
import {useEffect,useRef,useState} from 'react';
import {BookOpen,ClipboardList,Flag,Menu,Settings,X,KeyRound} from 'lucide-react';
import Brand from '@/components/brand';
import AppearanceToggle from './appearance-toggle';
import MotionToggle from './motion-toggle';
import {usePathname} from 'next/navigation';

export default function SiteHeader(){
  const pathname=usePathname();
  const [open,setOpen]=useState(false);
  const header=useRef<HTMLElement>(null),toggle=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    if(!open)return;
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);toggle.current?.focus();}};
    const outside=(event:PointerEvent)=>{if(!header.current?.contains(event.target as Node))setOpen(false);};
    document.addEventListener('keydown',escape);document.addEventListener('pointerdown',outside);
    return()=>{document.removeEventListener('keydown',escape);document.removeEventListener('pointerdown',outside);};
  },[open]);
  return <header ref={header} className="topbar catalog-topbar tc-header">
    <a className="tc-skip" href="#main-content">انتقل إلى المحتوى</a>
    <Brand href="/"/>
    <nav id="catalog-navigation" className={'tc-navigation'+(open?' is-open':'')} aria-label="القائمة الرئيسية" onClick={()=>setOpen(false)}>
      <a href="/" aria-current={pathname==='/'?'page':undefined}><BookOpen size={17}/>الصفوف والدروس</a>
      <a href="/tools"><ClipboardList size={17}/>الكشوف والشهادات</a>
      <a href="/initiatives"><Flag size={17}/>مبادرات وطني الغالي</a>
      <a href="/remedial" aria-current={pathname==='/remedial'?'page':undefined}><KeyRound size={17}/>خطتي العلاجية</a>
      <a className="tc-teacher-link" href="/teacher"><Settings size={17}/>مساحة المعلم</a>
    </nav>
    <div className="tc-header-actions"><MotionToggle/><AppearanceToggle/><button ref={toggle} type="button" className="tc-menu-toggle" aria-controls="catalog-navigation" aria-expanded={open} aria-label={open?'إغلاق القائمة الرئيسية':'فتح القائمة الرئيسية'} onClick={()=>setOpen(value=>!value)}>{open?<X size={23} aria-hidden="true"/>:<Menu size={23} aria-hidden="true"/>}</button></div>
  </header>;
}
