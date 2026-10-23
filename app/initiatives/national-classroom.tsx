'use client';
import {useEffect,useRef,useState} from 'react';
import {playNationalSound} from './national-sounds';
const phrases=['أحبك يا وطني','وطني الغالي','الوطن في قلوبنا','فداء للوطن','حفظ الله وطننا','دام عزك يا وطن'];
const boardPhrases=['إلى حماة الوطن: شكرًا لعطائكم وشجاعتكم. بكم نفخر، ولكم ندعو.','اللهم احفظ جنودنا المرابطين، وردّهم إلى أهلهم سالمين.','وطني الغالي، بك أعتز، ولأجلك أتعلّم وأعمل وأبني المستقبل.','نفخر بحماة الوطن ونقدّر إخلاصهم وشجاعتهم. حفظكم الله وحفظ وطننا آمنًا مطمئنًا.'];
function Writing({text}:{text:string}){const [written,setWritten]=useState('');useEffect(()=>{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setWritten(text);return;}const letters=Array.from(text);let n=0;setWritten('');const timer=setInterval(()=>{n++;setWritten(letters.slice(0,n).join(''));if(n>=letters.length)clearInterval(timer);},32);return()=>clearInterval(timer);},[text]);return <span className="ni-classroom-writing ni-classroom-typed" aria-hidden="true">{written}{written.length<text.length&&<i className="ni-writing-cursor"/>}</span>;}
const books=[{left:'30.5%',top:'65%',width:'16%',height:'19%'},{left:'49.5%',top:'55%',width:'11%',height:'14%'},{left:'75%',top:'53%',width:'10%',height:'12%'}];
export default function NationalClassroom(){
 const sequence=useRef(0),[notes,setNotes]=useState(['','','']),[board,setBoard]=useState(0),[announcement,setAnnouncement]=useState('');
 function write(index:number){const text=phrases[sequence.current++%phrases.length];playNationalSound('reveal');setNotes(values=>values.map((v,i)=>i===index?text:v));setAnnouncement(text);}
 function pray(){playNationalSound('reveal');setBoard(value=>value+1);setAnnouncement(boardPhrases[board%boardPhrases.length]);}
 return <div className="ni-classroom"><div className="ni-classroom-scene"><img className="ni-participation-banner" src="/national/participate.webp" alt="طلاب يكتبون في دفاتر خضراء ومعلم أمام السبورة" width={1200} height={675}/><button type="button" className="ni-classroom-board" aria-label="السبورة والمعلم: كتابة العبارة الوطنية التالية" onClick={pray}>{board>0&&<Writing key={board} text={boardPhrases[(board-1)%boardPhrases.length]}/>}</button>{books.map((position,index)=><button type="button" key={index} className={'ni-classroom-book ni-classroom-book-'+index} style={position} aria-label={'دفتر الطالب '+(index+1)+': كتابة عبارة وطنية'} onClick={()=>write(index)}>{notes[index]&&<Writing key={notes[index]} text={notes[index]}/>}</button>)}</div><p className="ni-classroom-status sr-only" role="status" aria-live="polite">{announcement}</p></div>;
}
