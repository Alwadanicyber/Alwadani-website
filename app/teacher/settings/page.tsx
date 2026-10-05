import {requireOwner} from '../owner';
import TeacherShell from '../shell';
import Settings from './settings';
export const dynamic='force-dynamic';
export default async function SettingsPage(){const owner=await requireOwner();return <TeacherShell username={owner.username} current="settings"><Settings/></TeacherShell>;}
