'use client';

import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {Pause,Sparkles} from 'lucide-react';

const preferenceKey='alwadani-site-effects';
const words=[
  {text:'Learn',x:5,y:15,size:36,tilt:-12,time:19},
  {text:'Discover',x:77,y:21,size:25,tilt:9,time:24},
  {text:'Dream',x:46,y:9,size:22,tilt:-7,time:21},
  {text:'Create',x:16,y:39,size:27,tilt:7,time:25},
  {text:'Inspire',x:86,y:47,size:32,tilt:-11,time:22},
  {text:'Explore',x:57,y:34,size:22,tilt:8,time:26},
  {text:'Imagine',x:31,y:65,size:24,tilt:-9,time:23},
  {text:'Grow',x:6,y:77,size:37,tilt:10,time:20},
  {text:'Hello',x:72,y:81,size:31,tilt:-8,time:24},
  {text:'Achieve',x:52,y:94,size:22,tilt:8,time:27},
  {text:'Read',x:91,y:10,size:21,tilt:-8,time:23},
  {text:'Think',x:39,y:48,size:20,tilt:10,time:25},
  {text:'Wonder',x:3,y:57,size:23,tilt:-6,time:26},
  {text:'Share',x:63,y:59,size:21,tilt:9,time:22},
  {text:'Believe',x:19,y:94,size:23,tilt:-9,time:28},
  {text:'Play',x:88,y:96,size:26,tilt:8,time:20},
];

export default function SiteAtmosphere(){
  const [enabled,setEnabled]=useState(true);
  const bursts=useRef<HTMLDivElement>(null);
  const active=useRef(true);

  useEffect(()=>{
    const query=window.matchMedia('(prefers-reduced-motion: reduce)');
    const readPreference=()=>{
      let stored:string|null=null;
      try{stored=localStorage.getItem(preferenceKey);}catch{}
      return stored==='on'||(stored!=='off'&&!query.matches);
    };
    const applyPreference=()=>{
      const next=readPreference();
      active.current=next;
      setEnabled(next);
      document.documentElement.dataset.siteEffects=next?'on':'off';
      if(!next)bursts.current?.replaceChildren();
    };
    const updateVisibility=()=>{
      document.documentElement.dataset.siteVisible=document.hidden?'off':'on';
    };

    const burst=(element:Element,x:number,y:number)=>{
      if(!active.current||document.hidden||!bursts.current)return;
      if(element.matches(':disabled,[aria-disabled="true"]'))return;
      if(element instanceof HTMLLabelElement&&element.control?.matches(':disabled'))return;
      const bounds=element.getBoundingClientRect();
      if(!bounds.width||!bounds.height)return;
      const mark=document.createElement('span');
      mark.className='site-click-burst';
      mark.style.left=`${x}px`;
      mark.style.top=`${y}px`;
      mark.innerHTML='<i class="site-click-ring"></i><i class="site-click-ring site-click-ring-second"></i>'+
        '<i class="site-click-star"></i>'.repeat(4);
      // Keep rapid interactions bounded; visual effects never wait for a save or intercept a click.
      while(bursts.current.childElementCount>=6)bursts.current.firstElementChild?.remove();
      bursts.current.appendChild(mark);
      mark.addEventListener('animationend',event=>{
        if(event.target===mark)mark.remove();
      });
    };
    const selector='button,a[href],summary,label,[role="button"],[role="tab"],[role="radio"],[role="checkbox"]';
    const pointerDown=(event:PointerEvent)=>{
      if(event.button!==0||!(event.target instanceof Element))return;
      const element=event.target.closest(selector);
      if(element)burst(element,event.clientX,event.clientY);
    };
    const keyDown=(event:KeyboardEvent)=>{
      if(event.repeat||!['Enter',' '].includes(event.key)||!(event.target instanceof Element))return;
      if(event.target.matches('input,textarea,select,[contenteditable="true"]'))return;
      const element=event.target.closest(selector);
      if(!element)return;
      const bounds=element.getBoundingClientRect();
      burst(element,bounds.left+bounds.width/2,bounds.top+bounds.height/2);
    };
    applyPreference();
    updateVisibility();
    query.addEventListener('change',applyPreference);
    document.addEventListener('visibilitychange',updateVisibility);
    document.addEventListener('pointerdown',pointerDown,{passive:true});
    document.addEventListener('keydown',keyDown);
    return()=>{
      query.removeEventListener('change',applyPreference);
      document.removeEventListener('visibilitychange',updateVisibility);
      document.removeEventListener('pointerdown',pointerDown);
      document.removeEventListener('keydown',keyDown);
      bursts.current?.replaceChildren();
    };
  },[]);

  function toggle(){
    const next=!active.current;
    active.current=next;
    setEnabled(next);
    document.documentElement.dataset.siteEffects=next?'on':'off';
    try{localStorage.setItem(preferenceKey,next?'on':'off');}catch{}
    if(!next)bursts.current?.replaceChildren();
  }

  return <>
    <div className="site-atmosphere" aria-hidden="true" dir="ltr">
      <div className="site-atmosphere-wash"/>
      <div className="site-atmosphere-orbit site-atmosphere-orbit-one"/>
      <div className="site-atmosphere-orbit site-atmosphere-orbit-two"/>
      {words.map((word,index)=><span key={word.text} className="site-atmosphere-word" style={{
        left:`${word.x}%`,top:`${word.y}%`,fontSize:`${word.size}px`,
        '--word-tilt':`${word.tilt}deg`,'--word-time':`${word.time}s`,
        '--word-delay':`${-index*2.3}s`,
      } as CSSProperties}>{word.text}</span>)}
      <span className="site-atmosphere-spark site-atmosphere-spark-one">✦</span>
      <span className="site-atmosphere-spark site-atmosphere-spark-two">✦</span>
      <span className="site-atmosphere-spark site-atmosphere-spark-three">✧</span>
    </div>
    <div className="site-interaction-effects" ref={bursts} aria-hidden="true"/>
    <button type="button" className="site-effects-toggle" onClick={toggle}
      aria-label={enabled?'إيقاف المؤثرات والحركة الخلفية':'تشغيل المؤثرات والحركة الخلفية'}
      aria-pressed={enabled} title={enabled?'إيقاف المؤثرات والحركة الخلفية':'تشغيل المؤثرات والحركة الخلفية'}>
      {enabled?<Pause size={15}/>:<Sparkles size={16}/>}
      <span>{enabled?'إيقاف الحركة':'تشغيل الحركة'}</span>
    </button>
  </>;
}
