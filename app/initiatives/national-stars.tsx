import type {CSSProperties} from 'react';
// Deterministic positions keep the server and client markup identical.
export default function NationalStars(){return <div className="ni-starfield" aria-hidden="true">{Array.from({length:48},(_,i)=><span key={i} style={{left:((i*67+11)%101)+'%',top:((i*43+7)%103)+'%','--star-size':(i%5===0?9:3+i%4)+'px','--star-duration':(18+i%17)+'s','--star-delay':(-i*1.7)+'s'} as CSSProperties}>✦</span>)}</div>;}
