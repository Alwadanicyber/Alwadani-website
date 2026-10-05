import {grades} from './grades';

export const MAX_STUDENTS=150;
export const MAX_TASKS=40;
export type TaskType='performance'|'homework'|'exam';
export type RecordTask={id:string;title:string;type:TaskType;maxScore:number};
export type RecordStudent={id:string;name:string};
export type RecordMark=null|'done'|'missing'|'absent'|number;
export type RecordContent={title:string;grade:string;className:string;teacherName:string;principalName:string;students:RecordStudent[];tasks:RecordTask[];marks:Record<string,Record<string,RecordMark>>};
export type TeacherRecord=RecordContent&{id:string;version:number;created:string;updated:string};
export type RecordSummary={id:string;title:string;grade:string;className:string;teacherName:string;studentCount:number;taskCount:number;version:number;updated:string};
export const taskLabels:Record<TaskType,string>={performance:'مهمة أدائية',homework:'واجب',exam:'اختبار'};
export const validRecordId=(id:unknown):id is string=>typeof id==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id);

function plainObject(value:unknown):value is Record<string,unknown>{return !!value&&typeof value==='object'&&!Array.isArray(value);}
function text(value:unknown,label:string,max:number,required=false){
  if(typeof value!=='string')throw new Error('راجع '+label+'.');
  const clean=value.trim();
  if(clean.length>max||(required&&!clean))throw new Error('راجع '+label+'.');
  return clean;
}
export function validateRecord(value:unknown):RecordContent{
  if(!plainObject(value))throw new Error('محتوى الكشف غير صالح.');
  const title=text(value.title,'عنوان الكشف',120,true),className=text(value.className,'الشعبة',80),teacherName=text(value.teacherName,'اسم المعلم',120),principalName=text(value.principalName,'اسم المدير',120);
  if(typeof value.grade!=='string'||!grades.some(g=>g.id===value.grade))throw new Error('اختر صفًا صحيحًا.');
  if(!Array.isArray(value.students)||value.students.length<1||value.students.length>MAX_STUDENTS)throw new Error('عدد الطلاب من 1 إلى '+MAX_STUDENTS+'.');
  if(!Array.isArray(value.tasks)||value.tasks.length<1||value.tasks.length>MAX_TASKS)throw new Error('أضف من 1 إلى '+MAX_TASKS+' عملًا.');
  const studentIds=new Set<string>(),taskIds=new Set<string>();
  const students=value.students.map(item=>{
    if(!plainObject(item)||!validRecordId(item.id)||studentIds.has(item.id))throw new Error('بيانات الطلاب غير صالحة.');
    studentIds.add(item.id);return {id:item.id,name:text(item.name,'اسم الطالب',120)};
  });
  const tasks=value.tasks.map(item=>{
    if(!plainObject(item)||!validRecordId(item.id)||taskIds.has(item.id)||!['performance','homework','exam'].includes(String(item.type)))throw new Error('بيانات الأعمال غير صالحة.');
    taskIds.add(item.id);
    if(typeof item.maxScore!=='number'||!Number.isFinite(item.maxScore)||item.maxScore<=0||item.maxScore>1000)throw new Error('الدرجة الكاملة من أكثر من صفر إلى 1000.');
    return {id:item.id,title:text(item.title,'اسم العمل',120,true),type:item.type as TaskType,maxScore:item.maxScore};
  });
  if(!plainObject(value.marks))throw new Error('الرصد غير صالح.');
  const marks:RecordContent['marks']={};
  for(const [studentId,row] of Object.entries(value.marks)){
    if(!studentIds.has(studentId)||!plainObject(row))throw new Error('الرصد لا يطابق أسماء الطلاب.');
    marks[studentId]={};
    for(const [taskId,mark] of Object.entries(row)){
      const task=tasks.find(t=>t.id===taskId);if(!task)throw new Error('الرصد لا يطابق الأعمال.');
      const valid=mark===null||(task.type==='exam'?(mark==='absent'||(typeof mark==='number'&&Number.isFinite(mark)&&mark>=0&&mark<=task.maxScore)):(mark==='done'||mark==='missing'));
      if(!valid)throw new Error('راجع الدرجة أو حالة الرصد في '+task.title+'.');
      marks[studentId][taskId]=mark as RecordMark;
    }
  }
  return {title,grade:value.grade,className,teacherName,principalName,students,tasks,marks};
}
export function markLabel(task:RecordTask,mark:RecordMark|undefined){
  if(mark===undefined||mark===null)return 'لم يُرصد';
  if(mark==='absent')return 'غائب';
  if(typeof mark==='number')return String(mark)+' / '+task.maxScore;
  if(task.type==='homework')return mark==='done'?'حل الواجب':'لم يحل';
  return mark==='done'?'أنجز المهمة':'لم ينجز';
}
export function markClass(mark:RecordMark|undefined){return mark==='done'?'mark-done':mark==='missing'||mark==='absent'?'mark-missing':typeof mark==='number'?'mark-score':'mark-empty';}
export function completionCount(record:RecordContent){return record.students.reduce((total,s)=>total+record.tasks.filter(t=>record.marks[s.id]?.[t.id]!==undefined&&record.marks[s.id]?.[t.id]!==null).length,0);}
