'use client';

import {useEffect,useRef,type CSSProperties} from 'react';

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
  {text:'Focus',x:33,y:23,size:24,tilt:6,time:20},
  {text:'Smile',x:18,y:8,size:26,tilt:-8,time:22},
  {text:'Practice',x:79,y:64,size:24,tilt:9,time:23},
  {text:'Success',x:21,y:81,size:25,tilt:-6,time:19},
  {text:'Journey',x:59,y:17,size:23,tilt:10,time:24},
  {text:'Together',x:45,y:79,size:25,tilt:-9,time:21},
  {text:'English',x:8,y:28,size:26,tilt:8,time:24},
  {text:'Listen',x:64,y:8,size:22,tilt:-6,time:22},
  {text:'Speak',x:89,y:31,size:25,tilt:10,time:20},
  {text:'Write',x:26,y:14,size:23,tilt:-8,time:26},
  {text:'Friends',x:49,y:42,size:24,tilt:7,time:23},
  {text:'School',x:4,y:91,size:25,tilt:-7,time:25},
  {text:'Bright',x:74,y:40,size:24,tilt:9,time:21},
  {text:'Knowledge',x:38,y:91,size:21,tilt:-6,time:27},
  {text:'Curious',x:18,y:57,size:23,tilt:8,time:22},
  {text:'Kind',x:92,y:74,size:27,tilt:-9,time:24},
  {text:'Future',x:60,y:71,size:24,tilt:6,time:20},
  {text:'Ideas',x:43,y:29,size:24,tilt:-10,time:25},
  {text:'Enjoy',x:29,y:38,size:24,tilt:8,time:22},
  {text:'Ready',x:85,y:87,size:23,tilt:-7,time:26},
  {text:'Brave',x:52,y:57,size:25,tilt:9,time:21},
  {text:'Skills',x:72,y:94,size:23,tilt:-8,time:24},
  {text:'Magic',x:10,y:67,size:24,tilt:7,time:23},
  {text:'Welcome',x:69,y:28,size:22,tilt:-6,time:27},
];

export default function SiteAtmosphere(){
  const atmosphere=useRef<HTMLDivElement>(null);
  const bursts=useRef<HTMLDivElement>(null);
  const active=useRef(true);

  useEffect(()=>{
    const query=window.matchMedia('(prefers-reduced-motion: reduce)');
    const motion=Array.from(atmosphere.current?.querySelectorAll<HTMLSpanElement>('.site-atmosphere-word')??[])
      .map(element=>({element,label:element.firstElementChild as HTMLSpanElement,x:0,y:0}));
    let pointer:{x:number;y:number;type:string}|null=null;
    let frame=0;
    let lastTime=0;
    let releaseTimer:ReturnType<typeof setTimeout>|undefined;
    const clearRelease=()=>{
      if(releaseTimer!==undefined)clearTimeout(releaseTimer);
      releaseTimer=undefined;
    };
    const resetMotion=()=>{
      clearRelease();
      pointer=null;
      cancelAnimationFrame(frame);
      frame=0;
      lastTime=0;
      for(const word of motion){word.x=0;word.y=0;word.element.style.removeProperty('transform');}
    };
    const animate=(time:number)=>{
      frame=0;
      if(!active.current||document.hidden){resetMotion();return;}
      const ease=1-Math.exp(-Math.min(lastTime?time-lastTime:16,48)/75);
      lastTime=time;
      // Read every position before writing transforms; CSS drift stays independent of the repulsion.
      const bounds=pointer?motion.map(word=>word.label.getBoundingClientRect()):[];
      let moving=false;
      motion.forEach((word,index)=>{
        let targetX=0,targetY=0;
        if(pointer){
          const rect=bounds[index];
          const dx=rect.left+rect.width/2-word.x-pointer.x;
          const dy=rect.top+rect.height/2-word.y-pointer.y;
          const distance=Math.hypot(dx,dy);
          const radius=(pointer.type==='touch'?165:145)+Math.min(rect.width/2,45);
          if(distance<radius){
            const angle=distance>.5?Math.atan2(dy,dx):index*2.4;
            const force=Math.pow(1-distance/radius,.65)*130;
            targetX=Math.cos(angle)*force;
            targetY=Math.sin(angle)*force;
          }
        }
        word.x+=(targetX-word.x)*ease;
        word.y+=(targetY-word.y)*ease;
        if(Math.abs(word.x)<.1&&Math.abs(word.y)<.1&&!targetX&&!targetY){
          word.x=0;word.y=0;word.element.style.removeProperty('transform');
        }else{
          moving=true;
          word.element.style.transform=`translate(${word.x.toFixed(2)}px,${word.y.toFixed(2)}px)`;
        }
      });
      if(pointer||moving)frame=requestAnimationFrame(animate);
      else lastTime=0;
    };
    const schedule=()=>{if(!frame&&active.current&&!document.hidden)frame=requestAnimationFrame(animate);};
    const repel=(event:PointerEvent)=>{
      if(!active.current||document.hidden)return;
      clearRelease();
      pointer={x:event.clientX,y:event.clientY,type:event.pointerType};
      schedule();
    };
    const release=()=>{clearRelease();pointer=null;schedule();};
    const pointerUp=(event:PointerEvent)=>{
      if(event.pointerType==='mouse')return;
      clearRelease();
      releaseTimer=setTimeout(release,450);
    };
    const pointerOut=(event:PointerEvent)=>{if(event.relatedTarget===null)release();};
    const applyPreference=()=>{
      const next=!query.matches;
      active.current=next;
      document.documentElement.dataset.siteEffects=next?'on':'off';
      if(!next){bursts.current?.replaceChildren();resetMotion();}
    };
    const updateVisibility=()=>{
      document.documentElement.dataset.siteVisible=document.hidden?'off':'on';
      if(document.hidden)resetMotion();
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
      repel(event);
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
    document.addEventListener('pointermove',repel,{passive:true});
    document.addEventListener('pointerup',pointerUp,{passive:true});
    document.addEventListener('pointercancel',release,{passive:true});
    document.addEventListener('pointerout',pointerOut,{passive:true});
    window.addEventListener('blur',release);
    document.addEventListener('keydown',keyDown);
    return()=>{
      query.removeEventListener('change',applyPreference);
      document.removeEventListener('visibilitychange',updateVisibility);
      document.removeEventListener('pointerdown',pointerDown);
      document.removeEventListener('pointermove',repel);
      document.removeEventListener('pointerup',pointerUp);
      document.removeEventListener('pointercancel',release);
      document.removeEventListener('pointerout',pointerOut);
      window.removeEventListener('blur',release);
      document.removeEventListener('keydown',keyDown);
      resetMotion();
      bursts.current?.replaceChildren();
    };
  },[]);

  return <>
    <div className="site-atmosphere" ref={atmosphere} aria-hidden="true" dir="ltr">
      <div className="site-atmosphere-wash"/>
      <div className="site-atmosphere-orbit site-atmosphere-orbit-one"/>
      <div className="site-atmosphere-orbit site-atmosphere-orbit-two"/>
      {words.map((word,index)=><span key={word.text} className="site-atmosphere-word" style={{
        left:`${word.x}%`,top:`${word.y}%`,fontSize:`${word.size}px`,
        '--word-tilt':`${word.tilt}deg`,'--word-time':`${word.time}s`,
        '--word-delay':`${-index*2.3}s`,
        '--word-mobile-x':`${3+(index%4)*24}%`,'--word-mobile-y':`${5+Math.floor(index/4)*9.5}%`,
      } as CSSProperties}><span className="site-atmosphere-word-label">{word.text}</span></span>)}
      <span className="site-atmosphere-spark site-atmosphere-spark-one">✦</span>
      <span className="site-atmosphere-spark site-atmosphere-spark-two">✦</span>
      <span className="site-atmosphere-spark site-atmosphere-spark-three">✧</span>
    </div>
    <div className="site-interaction-effects" ref={bursts} aria-hidden="true"/>
  </>;
}
