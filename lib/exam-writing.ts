import {database} from './database';
export async function ensureExamWriting(){await database().prepare('CREATE TABLE IF NOT EXISTS student_exam_writing(student TEXT NOT NULL REFERENCES students(id), attempt INTEGER NOT NULL, response TEXT NOT NULL, updated TEXT NOT NULL, PRIMARY KEY(student,attempt))').run();}
export function validWritingText(value:unknown){return typeof value==='string'&&value.trim().length>=1&&value.trim().length<=6000&&!/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value);}
