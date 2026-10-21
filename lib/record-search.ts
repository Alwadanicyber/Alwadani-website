import {grades,gradeLabel} from './grades';
import {normalizeStudentName,recordFormats,type RecordSummary} from './records';

export function normalizeRecordSearch(value:string){
 return normalizeStudentName(value).replace(/ة/g,'ه').replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/(\p{L})(\p{N})/gu,'$1 $2').replace(/(\p{N})(\p{L})/gu,'$1 $2').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();
}

export function recordMatchesSearch(record:RecordSummary,query:string){
 const grade=grades.find(g=>g.id===record.grade),number=Number(record.grade.replace('grade-',''));
 // Grade 9 is the third middle year; both "ثالث متوسط" and "٣ متوسط" work.
 const year=number>=10?number-9:number>=7?number-6:number;
 const text=normalizeRecordSearch([record.title,gradeLabel(record.grade),grade?.stage,record.className&&'الفصل '+record.className,record.classLabel,record.subjectName&&'المادة '+record.subjectName,record.schoolName&&'المدرسة '+record.schoolName,record.teacherName&&'المعلم '+record.teacherName,recordFormats[record.format||'electronic'],Number.isFinite(number)?String(number):'',Number.isFinite(year)?String(year):''].filter(Boolean).join(' ')),words=new Set(text.split(' '));
 return normalizeRecordSearch(query).split(' ').filter(Boolean).every(word=>(word.length===1||/^\d+$/.test(word))?words.has(word):text.includes(word));
}
