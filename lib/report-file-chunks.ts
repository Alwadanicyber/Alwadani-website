import {studentReportsReady} from './student-report-store';
export const REPORT_CHUNK_SIZE=512*1024;
export const REPORT_UPLOAD_TABLE_SQL='CREATE TABLE IF NOT EXISTS teacher_report_file_uploads(id TEXT PRIMARY KEY,report_id TEXT NOT NULL REFERENCES teacher_student_reports(id),file_name TEXT NOT NULL,file_type TEXT NOT NULL,file_size INTEGER NOT NULL,received_size INTEGER NOT NULL DEFAULT 0,created TEXT NOT NULL,completed TEXT)';
export const REPORT_CHUNK_TABLE_SQL='CREATE TABLE IF NOT EXISTS teacher_report_file_chunks(upload_id TEXT NOT NULL REFERENCES teacher_report_file_uploads(id),part INTEGER NOT NULL,bytes BLOB NOT NULL,hash TEXT NOT NULL,PRIMARY KEY(upload_id,part))';
export const REPORT_CURRENT_TABLE_SQL='CREATE TABLE IF NOT EXISTS teacher_report_current_files(report_id TEXT PRIMARY KEY REFERENCES teacher_student_reports(id),upload_id TEXT NOT NULL REFERENCES teacher_report_file_uploads(id))';
const ready=new WeakMap<object,Promise<void>>();
export async function reportFileChunksReady(){const db=await studentReportsReady();let p=ready.get(db);if(!p){p=db.batch([db.prepare(REPORT_UPLOAD_TABLE_SQL),db.prepare(REPORT_CHUNK_TABLE_SQL),db.prepare(REPORT_CURRENT_TABLE_SQL)]).then(()=>{}).catch(e=>{ready.delete(db);throw e;});ready.set(db,p);}await p;return db;}
export type ReportFileUpload={id:string;report_id:string;file_name:string;file_type:string;file_size:number;received_size:number;created:string;completed:string|null};
