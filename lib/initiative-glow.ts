import type {CSSProperties} from 'react';

export type InitiativeGlow={color:string;nameEffect:'steady'|'pulse'|'shimmer';frameEffect:'steady'|'pulse'|'orbit';intensity:'soft'|'medium'|'strong'};
export const defaultInitiativeGlow:InitiativeGlow={color:'#e8c26a',nameEffect:'pulse',frameEffect:'pulse',intensity:'medium'};
export const initiativeGlowColors=[
 {name:'ذهبي',color:'#e8c26a'}, {name:'أخضر زمردي',color:'#4fd9a5'},
 {name:'أزرق سماوي',color:'#67c8ff'}, {name:'بنفسجي',color:'#bf9bff'},
 {name:'وردي',color:'#ff96bf'}, {name:'فضي',color:'#d9e3ed'},
] as const;

export function initiativeGlowSettings(value:unknown):InitiativeGlow{
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('راجع خيارات التوهج.');
 const v=value as Record<string,unknown>;
 if(typeof v.color!=='string'||!/^#[a-f0-9]{6}$/i.test(v.color)||typeof v.nameEffect!=='string'||!['steady','pulse','shimmer'].includes(v.nameEffect)||typeof v.frameEffect!=='string'||!['steady','pulse','orbit'].includes(v.frameEffect)||typeof v.intensity!=='string'||!['soft','medium','strong'].includes(v.intensity))throw new Error('اختر لونًا صالحًا وطريقة التوهج وشدته من الخيارات المتاحة.');
 return {color:v.color.toLowerCase(),nameEffect:v.nameEffect as InitiativeGlow['nameEffect'],frameEffect:v.frameEffect as InitiativeGlow['frameEffect'],intensity:v.intensity as InitiativeGlow['intensity']};
}

export function initiativeGlowPresentation(value?:InitiativeGlow){
 const glow=value||defaultInitiativeGlow;
 const rgb=[1,3,5].map(start=>parseInt(glow.color.slice(start,start+2),16));
 const mix=(white:number)=>'#'+rgb.map(channel=>Math.round(channel*(1-white)+255*white).toString(16).padStart(2,'0')).join('');
 const ink='#'+rgb.map(channel=>Math.round(channel*.36).toString(16).padStart(2,'0')).join('');
 return {'data-ni-glow':'','data-ni-name-effect':glow.nameEffect,'data-ni-frame-effect':glow.frameEffect,'data-ni-glow-intensity':glow.intensity,style:{'--ni-glow-rgb':rgb.join(' '),'--ni-glow-text':mix(.72),'--ni-glow-ink':ink} as CSSProperties};
}
