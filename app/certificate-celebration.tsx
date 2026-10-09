'use client';
import {useEffect,useState} from 'react';
import {Sparkles} from 'lucide-react';
export default function CertificateCelebration(){
 const [active,setActive]=useState(true),[round,setRound]=useState(0);
 useEffect(()=>{const timer=window.setTimeout(()=>setActive(false),6500);return()=>window.clearTimeout(timer);},[round]);
 return <><div className="certificate-edge-party" aria-hidden="true" key={round}>{active&&Array.from({length:32},(_,i)=><i key={i} className={i%3===0?'party-star':'party-ribbon'} style={{'--edge':i%2?'100%':'0%','--drift':(i%2?-1:1)*(80+i%7*22)+'px','--delay':(i%16*.11)+'s','--spin':(i%2?-1:1)*(200+i*17)+'deg','--party-color':['#d0a65b','#a8cbb6','#aea2d7','#e6acb9'][i%4]} as React.CSSProperties}>{i%3===0?'✦':''}</i>)}</div><div className="certificate-party-control"><span role="status">✨ أنجزت الدرس! هذه لحظتك الجميلة.</span><button className="secondary compact" onClick={()=>{setActive(true);setRound(r=>r+1);}}><Sparkles size={17}/>احتفل مرة أخرى</button></div></>;
}
