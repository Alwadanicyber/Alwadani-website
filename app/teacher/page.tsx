import { setupKey, teacherAccount, teacherIdentity } from '@/lib/teacher';
import TeacherDashboard from './dashboard';
import TeacherLogin from './login';
import {grades} from '@/lib/grades';
export const dynamic = 'force-dynamic';
export default async function TeacherPage({searchParams}:{searchParams:Promise<{grade?:string}>}) {
  const query=await searchParams;const gradeFilter=grades.some(g=>g.id===query.grade)?query.grade:undefined;
  try {
    if (!setupKey()) return <TeacherLogin mode="unconfigured" />;
    const identity = await teacherIdentity();
    if (identity) return <TeacherDashboard username={identity.username} gradeFilter={gradeFilter} />;
    return <TeacherLogin mode={await teacherAccount() ? 'login' : 'setup'} />;
  } catch {
    return <TeacherLogin mode="unconfigured" />;
  }
}
