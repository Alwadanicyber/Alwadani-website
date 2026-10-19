import {requireOwner} from '../owner';
import TeacherShell from '../shell';
import DeviceAccess from './device-access';
export const dynamic='force-dynamic';
export default async function DeviceAccessPage(){
 const owner=await requireOwner();
 return <TeacherShell username={owner.username} current="device-access"><DeviceAccess/></TeacherShell>;
}
