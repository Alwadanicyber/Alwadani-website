import {hashToken} from './student-session';
export const assistantCookie='__Host-teachcraft_assistant';
export function assistantToken(req:Request){const value=req.headers.get('cookie')?.split(';').map(p=>p.trim()).find(p=>p.startsWith(assistantCookie+'='))?.slice(assistantCookie.length+1);return value&&/^[a-f0-9-]{36}$/.test(value)?value:null;}
export function assistantSession(req:Request){const old=assistantToken(req),token=old||crypto.randomUUID();return {token,...(!old?{cookie:`${assistantCookie}=${token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=86400`}:{})};}
export async function assistantBuckets(token:string,network:string,pepper:string,now=Date.now()){const day=Math.floor(now/86400000);return {visitor:await hashToken('assistant:'+token),network:await hashToken('assistant:'+pepper+':'+day+':'+network)};}
