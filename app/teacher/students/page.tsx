import {listCourses} from '@/lib/courses';
import {ensureClassroomResults,classroomResults} from '@/lib/classroom-results';
import {teacherIdentity} from '@/lib/teacher';
import TeacherPage from '../page';
import TeacherParticipants from './participants';

export const dynamic='force-dynamic';
export default async function TeacherStudents({searchParams}:{searchParams:Promise<{course?:string}>}){
  const owner=await teacherIdentity();
  if(!owner)return <TeacherPage searchParams={Promise.resolve({})}/>;
  const query=await searchParams;
  await ensureClassroomResults();
  const courses=await listCourses(true),selected=courses.find(c=>c.id===query.course)||courses[0];
  const results=selected?await classroomResults(selected,undefined,true):null;
  return <TeacherParticipants username={owner.username}
    courses={courses.map(c=>({id:c.id,title:c.title,grade:c.grade,studentGender:c.studentGender||c.definition.studentGender||'male'}))}
    initialCourse={selected?.id||''} initialParticipants={results?.participants||[]}/>;
}
