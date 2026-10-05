import {grades} from './grades';

export const MAX_STUDENTS=150;
export const MAX_TASKS=40;
export type TaskType='performance'|'performance-score'|'homework'|'exam'|'custom';
export type RecordTask={id:string;title:string;type:TaskType;maxScore:number;mode?:'number'|'check'|'status';positiveLabel?:string;negativeLabel?:string};
export const isNumberTask=(task:Pick<RecordTask,'type'|'mode'>)=>task.type==='exam'||(task.type==='custom'&&task.mode==='number');
export type RecordStudent={id:string;name:string};
export type RecordMark=null|'done'|'missing'|'absent'|number;
export const recordDesigns={white:'أبيض رسمي',green:'أخضر هادئ',blue:'أزرق أنيق',gold:'إطار ذهبي'};
export type RecordContent={title:string;grade:string;className:string;classLabel?:string;schoolName?:string;subjectName?:string;design?:keyof typeof recordDesigns;teacherName:string;principalName:string;students:RecordStudent[];tasks:RecordTask[];marks:Record<string,Record<string,RecordMark>>};
export type TeacherRecord=RecordContent&{id:string;version:number;created:string;updated:string};
export type RecordSummary={id:string;title:string;grade:string;className:string;teacherName:string;studentCount:number;taskCount:number;version:number;updated:string};
export const taskLabels:Record<TaskType,string>={performance:'مهمة أدائية','performance-score':'مهمة أدائية +',homework:'واجب',exam:'اختبار',custom:'مخصص'};
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
  const title=text(value.title,'عنوان الكشف',120,true),className=text(value.className,'حرف الفصل',80),classLabel=text(value.classLabel??'','اسم الصف الظاهر',120),teacherName=text(value.teacherName,'اسم المعلم',120),principalName=text(value.principalName,'اسم المدير',120);
  const design=value.design??'white';if(typeof design!=='string'||!Object.hasOwn(recordDesigns,design))throw new Error('اختر خلفية صحيحة.');
  if(typeof value.grade!=='string'||!grades.some(g=>g.id===value.grade))throw new Error('اختر صفًا صحيحًا.');
  if(!Array.isArray(value.students)||value.students.length<1||value.students.length>MAX_STUDENTS)throw new Error('عدد الطلاب من 1 إلى '+MAX_STUDENTS+'.');
  if(!Array.isArray(value.tasks)||value.tasks.length<1||value.tasks.length>MAX_TASKS)throw new Error('أضف من 1 إلى '+MAX_TASKS+' عملًا.');
  const studentIds=new Set<string>(),taskIds=new Set<string>();
  const students=value.students.map(item=>{
    if(!plainObject(item)||!validRecordId(item.id)||studentIds.has(item.id))throw new Error('بيانات الطلاب غير صالحة.');
    studentIds.add(item.id);return {id:item.id,name:text(item.name,'اسم الطالب',120)};
  });
  const tasks=value.tasks.map(item=>{
    if(!plainObject(item)||!validRecordId(item.id)||taskIds.has(item.id)||!Object.hasOwn(taskLabels,String(item.type)))throw new Error('بيانات الأعمال غير صالحة.');
    taskIds.add(item.id);
    if(typeof item.maxScore!=='number'||!Number.isFinite(item.maxScore)||item.maxScore<=0||item.maxScore>1000)throw new Error('الدرجة الكاملة من أكثر من صفر إلى 1000.');
    let custom:Pick<RecordTask,'mode'|'positiveLabel'|'negativeLabel'>={};
    if(item.type==='custom'){
      const mode=item.mode??'status';if(!['number','check','status'].includes(String(mode)))throw new Error('اختر طريقة رصد العمل المخصص.');
      custom={mode:mode as RecordTask['mode'],positiveLabel:text(item.positiveLabel??'أنجز','عبارة الإنجاز',60,true),negativeLabel:text(item.negativeLabel??'لم ينجز','عبارة عدم الإنجاز',60,true)};
    }
    return {id:item.id,title:text(item.title,'اسم العمل',120,true),type:item.type as TaskType,maxScore:item.type==='performance-score'?5:item.maxScore,...custom};
  });
  if(!plainObject(value.marks))throw new Error('الرصد غير صالح.');
  const marks:RecordContent['marks']={};
  for(const [studentId,row] of Object.entries(value.marks)){
    if(!studentIds.has(studentId)||!plainObject(row))throw new Error('الرصد لا يطابق أسماء الطلاب.');
    marks[studentId]={};
    for(const [taskId,mark] of Object.entries(row)){
      const task=tasks.find(t=>t.id===taskId);if(!task)throw new Error('الرصد لا يطابق الأعمال.');
      const valid=mark===null||(task.type==='performance-score'?(typeof mark==='number'&&Number.isInteger(mark)&&mark>=1&&mark<=5):isNumberTask(task)?((task.type==='exam'&&mark==='absent')||(typeof mark==='number'&&Number.isFinite(mark)&&mark>=0&&mark<=task.maxScore)):(mark==='done'||mark==='missing'));
      if(!valid)throw new Error('راجع الدرجة أو حالة الرصد في '+task.title+'.');
      marks[studentId][taskId]=mark as RecordMark;
    }
  }
  return {title,grade:value.grade,className,classLabel,schoolName:text(value.schoolName??'','اسم المدرسة',120),subjectName:text(value.subjectName??'','المادة',120),design:design as RecordContent['design'],teacherName,principalName,students,tasks,marks};
}
export function markLabel(task:RecordTask,mark:RecordMark|undefined){
  if(mark===undefined||mark===null)return 'لم يُرصد';
  if(mark==='absent')return 'غائب';
  if(typeof mark==='number')return String(mark)+' / '+task.maxScore;
  if(task.type==='custom')return mark==='done'?(task.positiveLabel||'أنجز'):(task.negativeLabel||'لم ينجز');
  if(task.type==='homework')return mark==='done'?'حل الواجب':'لم يحل';
  return mark==='done'?'أنجز المهمة':'لم ينجز';
}
export function markClass(mark:RecordMark|undefined){return mark==='done'?'mark-done':mark==='missing'||mark==='absent'?'mark-missing':typeof mark==='number'?'mark-score':'mark-empty';}
export function completionCount(record:RecordContent){return record.students.reduce((total,s)=>total+record.tasks.filter(t=>record.marks[s.id]?.[t.id]!==undefined&&record.marks[s.id]?.[t.id]!==null).length,0);}
