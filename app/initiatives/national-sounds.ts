'use client';
let context:AudioContext|null=null,enabled=true;
export function setNationalEffectsEnabled(value:boolean){enabled=value;}
// Short, locally synthesized effects; the anthem and submitted voice recordings stay separate.
export function playNationalSound(kind:'tap'|'reveal'|'verify'='reveal'){
 if(!enabled||typeof window==='undefined')return;
 try{context??=new AudioContext();const audio=context;void audio.resume().catch(()=>{});const start=audio.currentTime;
 const notes=kind==='tap'?[[850,0,.055,.035]]:kind==='verify'?[[523.25,0,.14,.045],[659.25,.08,.16,.04],[783.99,.16,.25,.035]]:[[1100,0,.04,.025],[659.25,.045,.12,.035],[987.77,.12,.2,.025]];
 for(const [frequency,delay,duration,volume] of notes){const oscillator=audio.createOscillator(),gain=audio.createGain(),at=start+delay;oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,at);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(at);oscillator.stop(at+duration+.02);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};}
 }catch{/* A sound restriction must never prevent opening a contribution. */}
}
