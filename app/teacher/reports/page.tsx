import {requireOwner} from '../owner';
import TeacherShell from '../shell';
import Reports from './reports';
import './reports.css';
export const dynamic='force-dynamic';
export default async function Page(){const owner=await requireOwner();return <TeacherShell username={owner.username} current="reports"><Reports/></TeacherShell>;}
