'use client';
import {useEffect,useState} from 'react';

export default function useWorkspaceNavigation(){
  const [open,setOpen]=useState(true),[mobile,setMobile]=useState(false);
  useEffect(()=>{
    const query=window.matchMedia('(max-width: 760px)');
    const update=()=>{setMobile(query.matches);setOpen(!query.matches);};
    update();query.addEventListener('change',update);
    return()=>query.removeEventListener('change',update);
  },[]);
  useEffect(()=>{
    if(!mobile||!open)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false);};
    window.addEventListener('keydown',close);
    return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',close);};
  },[mobile,open]);
  return {open,setOpen,mobile};
}
