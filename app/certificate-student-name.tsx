'use client';
import {useEffect,useState} from 'react';
import {useLearningAudio} from './learning-audio';
export default function CertificateStudentName({name,onCelebrate}:{name:string;onCelebrate:()=>void}){
 const [burst,setBurst]=useState(0),[active,setActive]=useState(false),audio=useLearningAudio();
 useEffect(()=>{if(!active)return;const timer=window.setTimeout(()=>setActive(false),1200);return()=>window.clearTimeout(timer);},[burst,active]);
 return <h3 className="certificate-student-name"><button type="button" className="certificate-name-button" aria-label={'احتفل باسمك: '+name} onClick={()=>{setBurst(n=>n+1);setActive(true);audio.playEffect('correct');onCelebrate();}}><span className="certificate-name-word">{name}</span>{active&&<span key={burst} className="certificate-name-sparks" aria-hidden="true">{Array.from({length:16},(_,i)=><i key={i} style={{'--ray':i*22.5+'deg','--spark-distance':(55+i%4*17)+'px','--spark-delay':i%4*.035+'s'} as React.CSSProperties}>✦</i>)}</span>}</button><small className="certificate-name-hint">✨ اضغط اسمك لتحتفل بإنجازك</small></h3>;
}
