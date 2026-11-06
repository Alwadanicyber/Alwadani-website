export const MOTION_EVENT='teachcraft-motion-change';
const MOTION_KEY='teachcraft-motion';

export function motionEnabled():boolean {
 if(typeof window==='undefined')return true;
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return false;
 try{return window.localStorage.getItem(MOTION_KEY)!=='off';}catch{return true;}
}

export function applyMotionPreference(enabled:boolean):void {
 try{window.localStorage.setItem(MOTION_KEY,enabled?'on':'off');}catch{}
 document.documentElement.dataset.siteEffects=motionEnabled()?'on':'off';
 window.dispatchEvent(new Event(MOTION_EVENT));
}
