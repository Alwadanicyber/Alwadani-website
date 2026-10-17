import {database} from './database';
import {defaultAssistantSettings,type AssistantSettings} from './assistant-core';
export const assistantSchema=[
 'CREATE TABLE IF NOT EXISTS assistant_settings(id INTEGER PRIMARY KEY CHECK(id=1),enabled INTEGER NOT NULL,daily_limit INTEGER NOT NULL,visitor_limit INTEGER NOT NULL,updated TEXT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS assistant_usage(bucket TEXT NOT NULL,window INTEGER NOT NULL,count INTEGER NOT NULL DEFAULT 0,expires INTEGER NOT NULL,PRIMARY KEY(bucket,window))',
 'CREATE TABLE IF NOT EXISTS assistant_calls(request TEXT PRIMARY KEY,bucket TEXT NOT NULL,created INTEGER NOT NULL)',
];
const ready=new WeakMap<object,Promise<void>>();
export async function ensureAssistant(){const db=database();let p=ready.get(db);if(!p){p=db.batch(assistantSchema.map(sql=>db.prepare(sql))).then(()=>{}).catch(e=>{ready.delete(db);throw e;});ready.set(db,p);}await p;}
export async function assistantSettings():Promise<AssistantSettings>{await ensureAssistant();const row=await database().prepare('SELECT enabled,daily_limit,visitor_limit FROM assistant_settings WHERE id=1').first<{enabled:number;daily_limit:number;visitor_limit:number}>();return row?{enabled:!!row.enabled,dailyLimit:row.daily_limit,visitorLimit:row.visitor_limit}:defaultAssistantSettings;}
export async function saveAssistantSettings(s:AssistantSettings){await ensureAssistant();await database().prepare('INSERT INTO assistant_settings(id,enabled,daily_limit,visitor_limit,updated) VALUES(1,?,?,?,?) ON CONFLICT(id) DO UPDATE SET enabled=excluded.enabled,daily_limit=excluded.daily_limit,visitor_limit=excluded.visitor_limit,updated=excluded.updated').bind(Number(s.enabled),s.dailyLimit,s.visitorLimit,new Date().toISOString()).run();return s;}
export const dayWindow=(now:number)=>Math.floor(now/86400000)*86400000;
export async function assistantUsage(now=Date.now()){await ensureAssistant();return (await database().prepare("SELECT count FROM assistant_usage WHERE bucket='global' AND window=?").bind(dayWindow(now)).first<{count:number}>())?.count||0;}
export class AssistantLimit extends Error{constructor(message:string,public status=429,public retryAfter=60){super(message);}}
async function claim(bucket:string,window:number,expires:number,limit:number){const row=await database().prepare('INSERT INTO assistant_usage(bucket,window,count,expires) VALUES(?,?,1,?) ON CONFLICT(bucket,window) DO UPDATE SET count=count+1 WHERE count<? RETURNING count').bind(bucket,window,expires,limit).first<{count:number}>();return row!==null;}
export async function reserveAssistant({visitor,network,requestId,settings,now=Date.now()}:{visitor:string;network:string;requestId:string;settings:AssistantSettings;now?:number}){
 await ensureAssistant();const db=database(),day=dayWindow(now),minute=Math.floor(now/60000)*60000,reset=day+86400000;
 const duplicate=await db.prepare('INSERT OR IGNORE INTO assistant_calls(request,bucket,created) VALUES(?,?,?)').bind(requestId,visitor,now).run();
 if(!duplicate.meta.changes)throw new AssistantLimit('أُرسل هذا الطلب بالفعل. انتظر الرد، أو اكتب رسالة جديدة.',409,5);
 // Each counter is capped atomically. Global quota is claimed last, only after local checks pass.
 if(!await claim('visitor-minute:'+visitor,minute,minute+120000,3)||!await claim('network-minute:'+network,minute,minute+120000,12))throw new AssistantLimit('أرسلت عدة أسئلة بسرعة. انتظر دقيقة ثم حاول مجددًا.');
 if(!await claim('visitor-day:'+visitor,day,reset+86400000,settings.visitorLimit))throw new AssistantLimit('وصلت إلى حد الأسئلة لهذا المتصفح اليوم. يمكنك متابعة الدرس والعودة غدًا.',429,Math.ceil((reset-now)/1000));
 if(!await claim('global',day,reset+86400000,settings.dailyLimit))throw new AssistantLimit('اكتمل حد المساعد اليومي للموقع. تبقى الدروس والتصحيحات متاحة، ويتجدد المساعد غدًا.',429,Math.ceil((reset-now)/1000));
 await db.batch([db.prepare('DELETE FROM assistant_usage WHERE expires<?').bind(now),db.prepare('DELETE FROM assistant_calls WHERE created<?').bind(day-86400000)]);
}
