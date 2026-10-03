import { setupKey, teacherAccount, teacherIdentity } from '@/lib/teacher';
import TeacherDashboard from './dashboard';
import TeacherLogin from './login';
export const dynamic = 'force-dynamic';
export default async function TeacherPage() {
  try {
    if (!setupKey()) return <TeacherLogin mode="unconfigured" />;
    const identity = await teacherIdentity();
    if (identity) return <TeacherDashboard username={identity.username} />;
    return <TeacherLogin mode={await teacherAccount() ? 'login' : 'setup'} />;
  } catch {
    return <TeacherLogin mode="unconfigured" />;
  }
}
