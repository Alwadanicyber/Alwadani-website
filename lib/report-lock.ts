import {database} from './database';
const hex=(v:ArrayBuffer)=>Array.from(new Uint8Array(v),b=>b.toString(16).padStart(2,'0')).join('');
export async function reportLockReady(){const db=database();await db.batch([
 db.prepare('CREATE TABLE IF NOT EXISTS teacher_report_lock(id INTEGER PRIMARY KEY,pin_salt TEXT NOT NULL,pin_hash TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS teacher_report_unlocks(token TEXT PRIMARY KEY,expires INTEGER NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS teacher_report_lock_attempts(id INTEGER PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL)'),
 ]);return db;}
export async function reportToken(req:Request){const token=req.headers.get('cookie')?.match(/(?:^|;\s*)teacher_reports_unlock=([a-f0-9]{64})(?:;|$)/)?.[1];return token?hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))):'';}
export async function reportUnlocked(req:Request){const token=await reportToken(req);if(!token)return false;const db=await reportLockReady();return !!await db.prepare('SELECT token FROM teacher_report_unlocks WHERE token=? AND expires>?').bind(token,Date.now()).first();}
export async function reportPinHash(pin:string,salt:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256));}
export const reportLockCookie=(token:string,age=1800)=>'teacher_reports_unlock='+token+'; Path=/api/teacher/reports; HttpOnly; Secure; SameSite=Strict; Max-Age='+age;
