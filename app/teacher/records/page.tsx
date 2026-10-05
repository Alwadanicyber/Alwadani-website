import {grades} from '@/lib/grades';
import {requireOwner} from '../owner';
import TeacherShell from '../shell';
import Records from './records';
export const dynamic='force-dynamic';
export default async function RecordsPage({searchParams}:{searchParams:Promise<{grade?:string}>}){const owner=await requireOwner(),query=await searchParams;return <TeacherShell username={owner.username} current="records"><Records initialGrade={grades.some(g=>g.id===query.grade)?(query.grade||'all'):'all'}/></TeacherShell>;}
