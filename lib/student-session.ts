export async function hashToken(token:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).map(b=>b.toString(16).padStart(2,'0')).join('');}
export const cookieName=(course:string)=>course==='life-stories'?'grammar_student':'grammar_student_'+course.replaceAll('-','_');
export async function identity(req:Request,course:string){const token=req.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName(course)+'='))?.split('=')[1];return token&&/^[a-f0-9-]{36}$/.test(token)?hashToken(token):undefined;}
