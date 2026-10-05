import {validateRecord,validRecordId,type TeacherRecord,type RecordContent,type RecordSummary} from './records';
const key='alwadani-public-records-v1';
function read():TeacherRecord[]{
  const raw=localStorage.getItem(key);if(!raw)return [];
  const data=JSON.parse(raw);if(!Array.isArray(data))throw new Error('تعذّر قراءة الكشوف المحفوظة في المتصفح.');
  return data.map(value=>{if(!validRecordId(value.id)||!Number.isInteger(value.version)||value.version<1||typeof value.created!=='string'||typeof value.updated!=='string')throw new Error('نسخة الكشف المحفوظة غير صالحة.');return {...validateRecord(value),id:value.id,version:value.version,created:value.created,updated:value.updated};});
}
export function localList():RecordSummary[]{return read().map(r=>({id:r.id,title:r.title,format:r.format,grade:r.grade,className:r.classLabel||r.className,teacherName:r.teacherName,studentCount:r.students.length,taskCount:r.tasks.length,version:r.version,updated:r.updated}));}
export function localFind(id:string){const record=read().find(r=>r.id===id);if(!record)throw new Error('لم يُعثر على الكشف في هذا المتصفح.');return record;}
export function localDelete(id:string,version:number){const list=read(),record=list.find(r=>r.id===id);if(!record||record.version!==version)throw new Error('تغيّر الكشف من نافذة أخرى. حدّث القائمة قبل حذفه.');localStorage.setItem(key,JSON.stringify(list.filter(r=>r.id!==id)));}
export function localSave(content:RecordContent,previous?:TeacherRecord):TeacherRecord{
  const list=read(),clean=validateRecord(content),existing=previous?list.find(r=>r.id===previous.id):undefined;
  if(previous&&(!existing||existing.version!==previous.version))throw new Error('تغيّر الكشف في نافذة أخرى. احفظ تعديلاتك كنسخة جديدة.');
  const now=new Date().toISOString(),record={...clean,id:previous?.id||crypto.randomUUID(),version:(previous?.version||0)+1,created:existing?.created||now,updated:now};
  try{localStorage.setItem(key,JSON.stringify(previous?list.map(r=>r.id===record.id?record:r):[record,...list]));}catch{throw new Error('تعذّر الحفظ في المتصفح. نزّل نسخة قابلة للتعديل للاحتفاظ بعملك.');}
  return record;
}
