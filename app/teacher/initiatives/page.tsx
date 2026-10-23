import {requireOwner} from '../owner';
import TeacherShell from '../shell';
import InitiativeAdmin from './initiative-admin';
import '../../initiatives/initiatives.css';
export const dynamic='force-dynamic';
export default async function Page(){const owner=await requireOwner();return <TeacherShell username={owner.username} current="initiatives"><InitiativeAdmin/></TeacherShell>;}
