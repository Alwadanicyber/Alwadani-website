import {grades} from './grades';
import {audienceWords,validateAudience,type AudienceSettings,type Gender} from './audience';

export const MAX_STUDENTS=150;
export const MAX_TASKS=40;
export const MAX_COMMENT_OPTIONS=30;
export const recordFormats={electronic:'كشف إلكتروني',blank:'كشف فارغ للتعبئة اليدوية'};
export type TaskType='performance'|'performance-score'|'homework'|'exam'|'custom';
export type CommentChoice={id:string;label:string;tone:'positive'|'negative'|'neutral'};
export type RecordTask={id:string;title:string;type:TaskType;maxScore:number;mode?:'number'|'check'|'status'|'comments';positiveLabel?:string;negativeLabel?:string;choices?:CommentChoice[];manualGroup?:string;manualCells?:number};
export const isNumberTask=(task:Pick<RecordTask,'type'|'mode'>)=>task.type==='exam'||(task.type==='custom'&&task.mode==='number');
export type RecordStudent={id:string;name:string};
export type RecordMark=null|'done'|'missing'|'absent'|number|`choice:${string}`;
export const recordDesigns={white:'أبيض رسمي',green:'أخضر هادئ',blue:'أزرق أنيق',gold:'إطار ذهبي'};
export type RecordContent=AudienceSettings&{title:string;format?:keyof typeof recordFormats;blankLayout?:'simple'|'school';grade:string;className:string;classLabel?:string;schoolName?:string;subjectName?:string;design?:keyof typeof recordDesigns;educationArea?:string;educationOffice?:string;schoolYear?:string;academicTerm?:string;teacherName:string;principalName:string;students:RecordStudent[];tasks:RecordTask[];marks:Record<string,Record<string,RecordMark>>};
export type TeacherRecord=RecordContent&{id:string;version:number;created:string;updated:string};
export type RecordSummary=AudienceSettings&{id:string;title:string;format?:RecordContent['format'];grade:string;className:string;teacherName:string;studentCount:number;taskCount:number;version:number;updated:string};
export const taskLabels:Record<TaskType,string>={performance:'مهمة أدائية','performance-score':'مهمة أدائية +',homework:'واجب',exam:'اختبار',custom:'مخصص'};
export const validRecordId=(id:unknown):id is string=>typeof id==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id);

function plainObject(value:unknown):value is Record<string,unknown>{return !!value&&typeof value==='object'&&!Array.isArray(value);}
function text(value:unknown,label:string,max:number,required=false){
  if(typeof value!=='string')throw new Error('راجع '+label+'.');
  const clean=value.trim();
  if(clean.length>max||(required&&!clean))throw new Error('راجع '+label+'.');
  return clean;
}
export function validateCommentChoices(value:unknown):CommentChoice[]{
  if(!Array.isArray(value)||value.length<1||value.length>MAX_COMMENT_OPTIONS)throw new Error('أضف تعليقاتك ثم اضغط «اعتماد التعليقات».');
  const ids=new Set<string>(),labels=new Set<string>();
  return value.map(item=>{
    if(!plainObject(item)||!validRecordId(item.id)||ids.has(item.id)||!['positive','negative','neutral'].includes(String(item.tone)))throw new Error('راجع التعليقات وألوانها.');
    const label=text(item.label,'نص التعليق',120,true);if(labels.has(label))throw new Error('اكتب تعليقًا مختلفًا في كل خانة.');
    ids.add(item.id);labels.add(label);return {id:item.id,label,tone:item.tone as CommentChoice['tone']};
  });
}
export function validateRecord(value:unknown):RecordContent{
  if(!plainObject(value))throw new Error('محتوى الكشف غير صالح.');
  const title=text(value.title,'عنوان الكشف',120,true),className=text(value.className,'حرف الفصل',80),classLabel=text(value.classLabel??'','اسم الصف الظاهر',120),teacherName=text(value.teacherName,'اسم المعلم',120),principalName=text(value.principalName,'اسم المدير',120);
  const design=value.design??'white';if(typeof design!=='string'||!Object.hasOwn(recordDesigns,design))throw new Error('اختر خلفية صحيحة.');
  const format=value.format??'electronic';if(typeof format!=='string'||!Object.hasOwn(recordFormats,format))throw new Error('اختر نوع كشف صحيحًا.');
  const blankLayout=value.blankLayout??'simple';if(typeof blankLayout!=='string'||!['simple','school'].includes(blankLayout)||(format!=='blank'&&blankLayout==='school'))throw new Error('اختر نموذج كشف يدوي صحيحًا.');
  if(typeof value.grade!=='string'||!grades.some(g=>g.id===value.grade))throw new Error('اختر صفًا صحيحًا.');
  if(!Array.isArray(value.students)||value.students.length<1||value.students.length>MAX_STUDENTS)throw new Error('عدد الأسماء من 1 إلى '+MAX_STUDENTS+'.');
  if(!Array.isArray(value.tasks)||value.tasks.length<1||value.tasks.length>MAX_TASKS)throw new Error('أضف من 1 إلى '+MAX_TASKS+' عملًا.');
  const studentIds=new Set<string>(),taskIds=new Set<string>();
  const students=value.students.map(item=>{
    if(!plainObject(item)||!validRecordId(item.id)||studentIds.has(item.id))throw new Error('بيانات الأسماء غير صالحة.');
    studentIds.add(item.id);return {id:item.id,name:text(item.name,'اسم الطالب',120)};
  });
  const tasks=value.tasks.map(item=>{
    if(!plainObject(item)||!validRecordId(item.id)||taskIds.has(item.id)||!Object.hasOwn(taskLabels,String(item.type)))throw new Error('بيانات الأعمال غير صالحة.');
    taskIds.add(item.id);
    if(typeof item.maxScore!=='number'||!Number.isFinite(item.maxScore)||item.maxScore<=0||item.maxScore>1000)throw new Error('الدرجة الكاملة من أكثر من صفر إلى 1000.');
    let custom:Pick<RecordTask,'mode'|'positiveLabel'|'negativeLabel'|'choices'>={};
    if(item.type==='custom'){
      const mode=item.mode??'status';if(!['number','check','status','comments'].includes(String(mode)))throw new Error('اختر طريقة رصد العمل المخصص.');
      custom={mode:mode as RecordTask['mode'],positiveLabel:text(item.positiveLabel??'أنجز','عبارة الإنجاز',60,true),negativeLabel:text(item.negativeLabel??'لم ينجز','عبارة عدم الإنجاز',60,true)};
      if(mode==='comments')custom.choices=validateCommentChoices(item.choices);
    }
    const manual:Pick<RecordTask,'manualGroup'|'manualCells'>={};
    if(item.manualGroup!==undefined)manual.manualGroup=text(item.manualGroup,'اسم مجموعة المهام',120);
    if(item.manualCells!==undefined){if(typeof item.manualCells!=='number'||!Number.isInteger(item.manualCells)||item.manualCells<1||item.manualCells>20)throw new Error('عدد مربعات المهمة من 1 إلى 20.');manual.manualCells=item.manualCells;}
    return {id:item.id,title:text(item.title,'اسم العمل',120,true),type:item.type as TaskType,maxScore:item.type==='performance-score'?5:item.maxScore,...custom,...manual};
  });
  if(!plainObject(value.marks))throw new Error('الرصد غير صالح.');
  const marks:RecordContent['marks']={};
  for(const [studentId,row] of Object.entries(value.marks)){
    if(!studentIds.has(studentId)||!plainObject(row))throw new Error('الرصد لا يطابق الأسماء.');
    marks[studentId]={};
    for(const [taskId,mark] of Object.entries(row)){
      const task=tasks.find(t=>t.id===taskId);if(!task)throw new Error('الرصد لا يطابق الأعمال.');
      if(format==='blank'&&mark!==null)throw new Error('الكشف الفارغ للتعبئة اليدوية؛ لا يحتوي على نتائج إلكترونية.');
      const valid=mark===null||(task.type==='performance-score'?(typeof mark==='number'&&Number.isInteger(mark)&&mark>=1&&mark<=5):isNumberTask(task)?((task.type==='exam'&&mark==='absent')||(typeof mark==='number'&&Number.isFinite(mark)&&mark>=0&&mark<=task.maxScore)):task.type==='custom'&&task.mode==='comments'?(typeof mark==='string'&&task.choices?.some(choice=>mark==='choice:'+choice.id)):(mark==='done'||mark==='missing'));
      if(!valid)throw new Error('راجع الدرجة أو حالة الرصد في '+task.title+'.');
      marks[studentId][taskId]=mark as RecordMark;
    }
  }
  return {...validateAudience(value),title,format:format as RecordContent['format'],...(format==='blank'?{blankLayout:blankLayout as RecordContent['blankLayout']}:{}),grade:value.grade,className,classLabel,schoolName:text(value.schoolName??'','اسم المدرسة',120),subjectName:text(value.subjectName??'','المادة',120),design:design as RecordContent['design'],educationArea:text(value.educationArea??'','منطقة التعليم',120),educationOffice:text(value.educationOffice??'','مكتب التعليم',120),schoolYear:text(value.schoolYear??'','العام الدراسي',60),academicTerm:text(value.academicTerm??'','الفصل الدراسي',60),teacherName,principalName,students,tasks,marks};
}
// Reserved rows after the last named student keep their IDs and any existing marks.
export function nextStudentSlot(record:Pick<RecordContent,'students'>){
  let lastNamed=-1;record.students.forEach((student,index)=>{if(student.name.trim())lastNamed=index;});
  return lastNamed+1<record.students.length?lastNamed+1:-1;
}
export function addRecordStudent(record:RecordContent,name:string,id=crypto.randomUUID()):RecordContent{
  const clean=text(name,'اسم الطالب',120),candidate=structuredClone(record),slot=clean?nextStudentSlot(record):-1;
  if(slot>=0)candidate.students[slot].name=clean;
  else{if(candidate.students.length>=MAX_STUDENTS)throw new Error('بلغ الكشف الحد الأقصى: '+MAX_STUDENTS+' اسمًا. اكتب الاسم في صف فارغ موجود.');candidate.students.push({id,name:clean});}
  return validateRecord(candidate);
}
export function markLabel(task:RecordTask,mark:RecordMark|undefined,studentGender?:Gender){
  const words=audienceWords({studentGender});
  if(mark===undefined||mark===null)return 'لم يُرصد';
  if(mark==='absent')return words.absent;
  if(typeof mark==='number')return String(mark)+' / '+task.maxScore;
  if(task.type==='custom'&&task.mode==='comments')return task.choices?.find(choice=>mark==='choice:'+choice.id)?.label||'لم يُرصد';
  if(task.type==='custom')return mark==='done'?(task.positiveLabel||'أنجز'):(task.negativeLabel||'لم ينجز');
  if(task.type==='homework')return mark==='done'?words.homeworkDone:words.homeworkMissing;
  return mark==='done'?words.done:words.missing;
}
export function markClass(mark:RecordMark|undefined,task?:RecordTask){if(typeof mark==='string'&&mark.startsWith('choice:')){const tone=task?.choices?.find(choice=>mark==='choice:'+choice.id)?.tone;return tone==='positive'?'mark-done':tone==='negative'?'mark-missing':'mark-note';}return mark==='done'?'mark-done':mark==='missing'||mark==='absent'?'mark-missing':typeof mark==='number'?'mark-score':'mark-empty';}
export function applyRecordTaskSettings(record:RecordContent,taskId:string,patch:Partial<RecordTask>):RecordContent{
  const candidate=structuredClone(record),task=candidate.tasks.find(item=>item.id===taskId);if(!task)throw new Error('الخانة غير موجودة.');
  if(patch.mode==='comments'&&task.type==='custom'&&task.mode!=='comments'&&task.mode!=='number'&&patch.choices?.length===2){
    for(const row of Object.values(candidate.marks)){if(row[taskId]==='done')row[taskId]=`choice:${patch.choices[0].id}`;else if(row[taskId]==='missing')row[taskId]=`choice:${patch.choices[1].id}`;}
  }
  Object.assign(task,patch);return validateRecord(candidate);
}
export function completionCount(record:RecordContent){return record.students.reduce((total,s)=>total+record.tasks.filter(t=>record.marks[s.id]?.[t.id]!==undefined&&record.marks[s.id]?.[t.id]!==null).length,0);}
