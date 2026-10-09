'use client';
import {useEffect,useRef,useState} from 'react';

export function useLearningAudio(){
 const context=useRef<AudioContext|null>(null),muted=useRef(false);
 const [sound,setSound]=useState(true),[speaking,setSpeaking]=useState(''),[audioNotice,setAudioNotice]=useState('');
 useEffect(()=>()=>{window.speechSynthesis?.cancel();void context.current?.close();},[]);
 function unlock(){
  try{const Audio=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!Audio){setAudioNotice('المؤثرات الصوتية غير متاحة في هذا المتصفح.');return null;}const c=context.current||(context.current=new Audio());if(c.state==='suspended')void c.resume().catch(()=>setAudioNotice('اضغط زر الصوت لتفعيل المؤثرات.'));return c;}catch{setAudioNotice('تعذّر تشغيل الصوت في هذا المتصفح.');return null;}
 }
 function toggleSound(){muted.current=!muted.current;setSound(!muted.current);if(!muted.current)unlock();}
 function popSound(correct:boolean){
  if(muted.current)return;const c=unlock();if(!c)return;
  // A short, quiet noise burst makes the balloon pop; two tones distinguish the result.
  const length=Math.ceil(c.sampleRate*.13),buffer=c.createBuffer(1,length,c.sampleRate),samples=buffer.getChannelData(0);
  for(let i=0;i<length;i++)samples[i]=(Math.random()*2-1)*Math.exp(-i/(c.sampleRate*.025));
  const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=buffer;filter.type='highpass';filter.frequency.value=700;gain.gain.value=.2;source.connect(filter).connect(gain).connect(c.destination);source.start();source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
  [correct?660:220,correct?880:165].forEach((frequency,i)=>{const oscillator=c.createOscillator(),volume=c.createGain(),time=c.currentTime+.08+i*.09;oscillator.type='sine';oscillator.frequency.value=frequency;volume.gain.setValueAtTime(0,time);volume.gain.linearRampToValueAtTime(.065,time+.01);volume.gain.exponentialRampToValueAtTime(.001,time+.16);oscillator.connect(volume).connect(c.destination);oscillator.start(time);oscillator.stop(time+.17);oscillator.onended=()=>{oscillator.disconnect();volume.disconnect();};});
 }
 function pronounce(text:string){
  if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){setAudioNotice('النطق غير متاح في هذا المتصفح. جرّب متصفحًا يدعم النطق.');return;}
  const synthesis=window.speechSynthesis;synthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-US';utterance.rate=.78;utterance.volume=.85;
  const voices=synthesis.getVoices();utterance.voice=voices.find(v=>v.lang==='en-US')||voices.find(v=>v.lang.startsWith('en'))||null;
  utterance.onstart=()=>setSpeaking(text);utterance.onend=()=>setSpeaking('');utterance.onerror=event=>{setSpeaking('');if(event.error!=='interrupted'&&event.error!=='canceled')setAudioNotice('تعذّر النطق. تحقق من صوت الجهاز وحاول مجددًا.');};setAudioNotice('');synthesis.speak(utterance);
 }
 return {sound,toggleSound,unlock,popSound,pronounce,speaking,audioNotice};
}
