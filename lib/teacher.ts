import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
export async function teacherAccess(){const user=await getChatGPTUser();return !!user&&!!env.TEACHER_EMAIL&&user.email.toLowerCase()===env.TEACHER_EMAIL.toLowerCase();}
