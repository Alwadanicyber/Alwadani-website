'use client';
import {useEffect,useRef,useState} from 'react';
type Effect='pop'|'correct'|'wrong'|'tap';
const effectNames:Effect[]=['pop','correct','wrong','tap'];
let effectFiles:Promise<Partial<Record<Effect,ArrayBuffer>>>|null=null;
function loadEffects(){return effectFiles||(effectFiles=Promise.all(effectNames.map(async name=>{try{const r=await fetch('/audio/'+name+'-v2.wav');return [name,r.ok?await r.arrayBuffer():null] as const;}catch{return [name,null] as const;}})).then(entries=>Object.fromEntries(entries.filter(([,bytes])=>bytes))));}
export function useLearningAudio(){
 const context=useRef<AudioContext|null>(null),buffers=useRef<Partial<Record<Effect,AudioBuffer>>>({}),muted=useRef(false),speechId=useRef(0);
 const [sound,setSound]=useState(true),[speaking,setSpeaking]=useState(''),[audioNotice,setAudioNotice]=useState(''),[audioState,setAudioState]=useState('ready');
 useEffect(()=>{void loadEffects();return()=>{speechId.current++;window.speechSynthesis?.cancel();void context.current?.close();};},[]);
 function unlock(){try{
  const Audio=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!Audio){setAudioNotice('المؤثرات الصوتية غير متاحة في هذا المتصفح.');return null;}
  let c=context.current;if(!c){c=new Audio();context.current=c;c.onstatechange=()=>setAudioState(c!.state);const active=c;void loadEffects().then(async files=>{for(const name of effectNames){const bytes=files[name];if(bytes)try{buffers.current[name]=await active.decodeAudioData(bytes.slice(0));}catch{/* A synthesized cue remains available. */}}});}
  if(c.state==='suspended')void c.resume().then(()=>setAudioState(c!.state)).catch(()=>setAudioNotice('اضغط «جرّب الصوت» لتفعيل المؤثرات.'));else setAudioState(c.state);return c;
 }catch{setAudioNotice('تعذّر تشغيل الصوت. اضغط «جرّب الصوت» مجددًا.');return null;}}
 function toggleSound(){muted.current=!muted.current;setSound(!muted.current);if(!muted.current)unlock();}
 function playEffect(name:Effect){if(muted.current)return;const c=unlock();if(!c)return;const buffer=buffers.current[name];
  if(buffer){const source=c.createBufferSource(),gain=c.createGain();source.buffer=buffer;gain.gain.value=.8;source.connect(gain).connect(c.destination);source.start();source.onended=()=>{source.disconnect();gain.disconnect();};return;}
  const frequencies=name==='correct'?[523,659,784]:name==='wrong'?[294,247]:name==='tap'?[700]:[150,90];
  frequencies.forEach((f,i)=>{const o=c.createOscillator(),gain=c.createGain(),start=c.currentTime+i*.1;o.frequency.setValueAtTime(f,start);o.type=name==='pop'?'triangle':'sine';gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.22,start+.008);gain.gain.exponentialRampToValueAtTime(.001,start+.17);o.connect(gain).connect(c.destination);o.start(start);o.stop(start+.18);o.onended=()=>{o.disconnect();gain.disconnect();};});
 }
 function popSound(correct:boolean){playEffect('pop');playEffect(correct?'correct':'wrong');}
 function speak(lines:{text:string;lang:string}[]){
  if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){setAudioNotice('النطق غير متاح في هذا المتصفح.');return;}
  const id=++speechId.current,synthesis=window.speechSynthesis;synthesis.cancel();const voices=synthesis.getVoices();setAudioNotice('');
  lines.forEach((line,i)=>{const u=new SpeechSynthesisUtterance(line.text);u.lang=line.lang;u.rate=line.lang.startsWith('en')?.8:.95;u.volume=1;u.voice=voices.find(v=>v.lang===line.lang)||voices.find(v=>v.lang.startsWith(line.lang.slice(0,2)))||null;
   u.onstart=()=>{if(id===speechId.current)setSpeaking(lines[0].text);};u.onend=()=>{if(id===speechId.current&&i===lines.length-1)setSpeaking('');};u.onerror=e=>{if(id===speechId.current){setSpeaking('');if(e.error!=='interrupted'&&e.error!=='canceled')setAudioNotice('تعذّر النطق. تحقق من صوت الجهاز وحاول مجددًا.');}};synthesis.speak(u);});
 }
 function pronounce(text:string){speak([{text,lang:'en-US'}]);}
 function narrate(en:string,ar:string){speak([{text:en,lang:'en-US'},{text:ar,lang:'ar-SA'}]);}
 function explain(ar:string){speak([{text:ar,lang:'ar-SA'}]);}
 function stopSpeaking(){speechId.current++;window.speechSynthesis?.cancel();setSpeaking('');}
 return {sound,toggleSound,unlock,playEffect,popSound,pronounce,narrate,explain,stopSpeaking,speaking,audioNotice,audioState};
}
