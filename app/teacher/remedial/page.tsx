import {requireOwner} from '../owner';
import TeacherShell from '../shell';
import RemedialPanel from './remedial-panel';
import '../../remedial/remedial.css';
export const dynamic='force-dynamic';
export const metadata={title:'الخطط العلاجية | TeachCraft',robots:{index:false,follow:false}};
export default async function Page(){const owner=await requireOwner();return <TeacherShell username={owner.username} current="remedial"><RemedialPanel/></TeacherShell>;}
