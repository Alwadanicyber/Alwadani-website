import type {Metadata} from 'next';
import {requireOwner} from '../owner';
import TeacherShell from '../shell';
import Portfolio from './portfolio';
import './portfolio.css';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'ملف إنجاز المعلم | TeachCraft',robots:{index:false,follow:false}};
export default async function Page(){const owner=await requireOwner();return <TeacherShell username={owner.username} current="portfolio"><Portfolio/></TeacherShell>;}
