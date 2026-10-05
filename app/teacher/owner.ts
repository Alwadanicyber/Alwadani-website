import {teacherIdentity} from '@/lib/teacher';
import {redirect} from 'next/navigation';
export async function requireOwner(){const owner=await teacherIdentity();if(!owner)redirect('/teacher');return owner;}
