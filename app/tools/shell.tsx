'use client';
import Brand from '@/components/brand';
import {useEffect,useState} from 'react';
import {ClipboardList,Award,BookOpen,Menu,Moon,Sun,Settings} from 'lucide-react';
import {applyTheme} from '../theme';
import useWorkspaceNavigation from '../use-workspace-navigation';
export default function ToolsShell({current,children}:{current:'records'|'certificates'|'home';children:React.ReactNode}){
  const {open,setOpen,mobile}=useWorkspaceNavigation();
  const [dark,setDark]=useState(false);
  useEffect(()=>setDark(document.documentElement.dataset.theme==='dark'),[]);
  return <div className="teacher-workspace public-tools"><header className="topbar teacher-topbar"><div className="teacher-topbar-start"><button className="workspace-menu" aria-label="إظهار أو إخفاء القائمة" aria-controls="public-tools-navigation" aria-expanded={open} onClick={()=>setOpen(!open)}><Menu size={22}/></button><Brand href="/tools"/></div><button className="secondary compact" onClick={()=>{applyTheme(dark?'light':'dark');setDark(!dark);}}>{dark?<Sun size={17}/>:<Moon size={17}/>}<span>{dark?'نهاري':'ليلي'}</span></button></header>{mobile&&open&&<button type="button" className="workspace-nav-backdrop" aria-label="إغلاق القائمة" onClick={()=>setOpen(false)}/>}<div className={'workspace-layout '+(!open?'nav-collapsed':'')}><aside id="public-tools-navigation" className="workspace-sidebar" hidden={!open}><div className="sidebar-label">TeachCraft · أدوات متاحة للجميع</div><nav aria-label="أدوات التعليم" onClick={()=>{if(mobile)setOpen(false);}}><a href="/" ><BookOpen size={19}/>الصفوف والدروس</a><a href="/tools/records" aria-current={current==='records'?'page':undefined}><ClipboardList size={19}/>الكشوفات</a><a href="/tools/certificates" aria-current={current==='certificates'?'page':undefined}><Award size={19}/>الشهادات</a></nav><div className="sidebar-bottom"><p className="field-help">عملك محفوظ في هذا المتصفح. احتفظ بنسخة قابلة للتعديل لنقله أو استعادته.</p><a href="/teacher"><Settings size={17}/>إدارة دروس مالك الموقع</a></div></aside><div className="workspace-content">{children}</div></div></div>;
}
