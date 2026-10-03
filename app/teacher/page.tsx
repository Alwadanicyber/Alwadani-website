import {requireChatGPTUser} from '@/app/chatgpt-auth';
import {teacherAccess} from '@/lib/teacher';
import TeacherDashboard from './dashboard';
export const dynamic='force-dynamic';
export default async function TeacherPage(){await requireChatGPTUser('/teacher');if(!await teacherAccess())return <div className="standalone fallback" dir="rtl"><h1>مساحة المعلم خاصة بمالك الموقع</h1><p>يمكنك التعلم دون تسجيل دخول من صفحة الدروس.</p><a href="/" className="primary">عرض الدروس</a><a href="/signout-with-chatgpt?return_to=/teacher" className="secondary">تبديل الحساب</a></div>;return <TeacherDashboard/>;}
