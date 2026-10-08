'use client';
import {useEffect,useRef,useState} from 'react';

// Use the same canvas width as the downloaded certificate, then fit it to the editor.
const canvasWidth=1050;
export default function CustomPreview({html,label,ratio,compact}:{html:string;label:string;ratio:number;compact:boolean}){
  const container=useRef<HTMLDivElement>(null);
  const [scale,setScale]=useState(0.5);
  useEffect(()=>{
    const element=container.current;if(!element)return;
    function measure(){
      const width=element!.clientWidth;
      const heightLimit=compact?Math.min(460,window.innerHeight*0.45):Infinity;
      setScale(Math.min(1,width/canvasWidth,heightLimit/(canvasWidth/ratio)));
    }
    const observer=new ResizeObserver(measure);observer.observe(element);measure();
    window.addEventListener('resize',measure);
    return()=>{observer.disconnect();window.removeEventListener('resize',measure);};
  },[ratio,compact]);
  return <div ref={container} className="cert-preview-space"><div className="cert-preview cert-scaled-preview" aria-label={label} style={{width:canvasWidth*scale,height:canvasWidth/ratio*scale}}><div className="cert-preview-canvas" style={{width:canvasWidth,transform:`scale(${scale})`}} dangerouslySetInnerHTML={{__html:html}}/></div></div>;
}
