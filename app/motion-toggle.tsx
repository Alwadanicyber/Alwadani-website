'use client';
import {useEffect,useState} from 'react';
import {Pause,Play} from 'lucide-react';
import {applyMotionPreference,motionEnabled,MOTION_EVENT} from './motion-preference';

export default function MotionToggle(){
 const [enabled,setEnabled]=useState(true);
 const [systemReduced,setSystemReduced]=useState(false);
 useEffect(()=>{
  const query=window.matchMedia('(prefers-reduced-motion: reduce)');
  const sync=()=>{setEnabled(motionEnabled());setSystemReduced(query.matches);};
  sync();query.addEventListener('change',sync);window.addEventListener(MOTION_EVENT,sync);
  return()=>{query.removeEventListener('change',sync);window.removeEventListener(MOTION_EVENT,sync);};
 },[]);
 const label=systemReduced?'الحركة مخفّضة حسب إعداد جهازك':enabled?'إيقاف حركة الخلفية':'تشغيل حركة الخلفية';
 return <button type="button" className="appearance-toggle tc-motion-toggle" aria-label={label} aria-pressed={!enabled} title={label} disabled={systemReduced} onClick={()=>applyMotionPreference(!enabled)}>
  {enabled?<Pause size={18} aria-hidden="true"/>:<Play size={18} aria-hidden="true"/>}
 </button>;
}
