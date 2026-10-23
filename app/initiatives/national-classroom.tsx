'use client';
import {useRef,useState} from 'react';
import {playNationalSound} from './national-sounds';
const phrases=['أحبك يا وطني','وطني الغالي','الوطن في قلوبنا','فداء للوطن','حفظ الله وطننا','دام عزك يا وطن'];
const books=[{left:'30.5%',top:'65%',width:'16%',height:'19%'},{left:'49.5%',top:'55%',width:'11%',height:'14%'},{left:'75%',top:'53%',width:'10%',height:'12%'}];
export default function NationalClassroom(){
 const sequence=useRef(0),[notes,setNotes]=useState(['','','']),[board,setBoard]=useState(0),[announcement,setAnnouncement]=useState('المس دفاتر الطلاب الخضراء أو السبورة لتظهر كلماتهم للوطن.');
 function write(index:number){const text=phrases[sequence.current++%phrases.length];playNationalSound('reveal');setNotes(values=>values.map((v,i)=>i===index?text:v));setAnnouncement(text);}
 function pray(){playNationalSound('reveal');setBoard(value=>value+1);setAnnouncement('حفظ الله قيادتنا وجنودنا البواسل');}
 return <div className="ni-classroom"><div className="ni-classroom-scene"><img className="ni-participation-banner" src="/national/participate.webp" alt="طلاب يكتبون في دفاتر خضراء ومعلم أمام السبورة" width={1200} height={675}/><button type="button" className="ni-classroom-board" aria-label="السبورة والمعلم: إظهار دعاء للقيادة والجنود" onClick={pray}>{board>0&&<span key={board} className="ni-classroom-writing" aria-hidden="true">حفظ الله قيادتنا<br/>وجنودنا البواسل</span>}</button>{books.map((position,index)=><button type="button" key={index} className={'ni-classroom-book ni-classroom-book-'+index} style={position} aria-label={'دفتر الطالب '+(index+1)+': كتابة عبارة وطنية'} onClick={()=>write(index)}>{notes[index]&&<span key={notes[index]} className="ni-classroom-writing" aria-hidden="true">{notes[index]}</span>}</button>)}</div><p className="ni-classroom-status" role="status" aria-live="polite">{announcement}</p></div>;
}
