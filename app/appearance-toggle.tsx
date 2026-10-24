'use client';
import {useEffect,useState} from 'react';
import {Moon,Sun} from 'lucide-react';
import {applyTheme} from './theme';

export default function AppearanceToggle(){
  const [dark,setDark]=useState(false);
  useEffect(()=>{
    const sync=()=>setDark(document.documentElement.dataset.theme==='dark');
    sync();window.addEventListener('alwadani-theme-change',sync);
    return()=>window.removeEventListener('alwadani-theme-change',sync);
  },[]);
  return <button type="button" className="appearance-toggle" aria-label={dark?'تفعيل النمط النهاري':'تفعيل النمط الليلي'} aria-pressed={dark} title={dark?'النمط النهاري':'النمط الليلي'} onClick={()=>applyTheme(dark?'light':'dark')}>
    {dark?<Sun size={19}/>:<Moon size={19}/>}<span className="sr-only">{dark?'نهاري':'ليلي'}</span>
  </button>;
}
