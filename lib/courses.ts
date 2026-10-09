import {database} from './database';
import {grades} from './grades';
import {lessons,questions} from './course';
import {grading} from './grading';
import {choresCourse} from './chores-course';
import type {TeacherCourse,Definition,PublicCourse} from './course-types';
import {COURSE_TRASHED} from './course-types';
export const originalDefinition:Definition={lessons,questions:questions.map(q=>({...q,...grading[q.id]}))};
export const originalCourse:TeacherCourse={id:'life-stories',grade:'grade-9',title:'حكايات الماضي · Life Stories',description:'الماضي البسيط، الحديث عن الميلاد، المبني للمجهول في الماضي، وعادات الماضي.',published:1,definition:originalDefinition,updated:'2026-10-03'};
export const builtInCourses:TeacherCourse[]=[originalCourse,choresCourse];
export const builtInCourse=(id:string)=>builtInCourses.find(c=>c.id===id);
function parse(row:any):TeacherCourse{return {...row,definition:JSON.parse(row.definition)};}
export async function getCourse(id:string,teacher=false){const row=await database().prepare('SELECT * FROM courses WHERE id=?').bind(id).first();const course=row?parse(row):builtInCourse(id);return course&&course.published!==COURSE_TRASHED&&(teacher||course.published===1)?course:null;}
export async function listCourses(teacher=false,includeDeleted=false){const rows=(await database().prepare('SELECT c.*, (SELECT COUNT(*) FROM students s WHERE s.course=c.id) AS students FROM courses c ORDER BY updated DESC').all()).results;const items=rows.map(parse);for(const course of builtInCourses){if(!items.some(c=>c.id===course.id)){const count=await database().prepare('SELECT COUNT(*) AS n FROM students WHERE course=?').bind(course.id).first<{n:number}>();items.push({...course,students:count?.n||0});}}return teacher?items.filter(c=>includeDeleted||c.published!==COURSE_TRASHED):items.filter(c=>c.published===1);}
export function publicCourse(c:TeacherCourse):PublicCourse{return {id:c.id,grade:c.grade||'general',title:c.title,description:c.description,lessons:c.definition.lessons,questions:c.definition.questions.map(({answer,reason,...q})=>q)};}
export function validateCourse(raw:any):Pick<TeacherCourse,'title'|'description'|'definition'|'published'|'grade'>{
function string(v:unknown,label:string,max=3000){if(typeof v!=='string'||v.trim().length>max)throw new Error(`راجع ${label}.`);return v.trim();}
const grade=raw.grade===undefined?'general':raw.grade;if(!grades.some(g=>g.id===grade))throw new Error('اختر صفًا صحيحًا.');
const title=string(raw.title,'عنوان الدرس',120);if(title.length<2)throw new Error('أدخل عنوانًا للدرس.');const description=string(raw.description,'وصف الدرس',500);
if(!Array.isArray(raw.definition?.lessons)||raw.definition.lessons.length<1||raw.definition.lessons.length>40)throw new Error('أضف من محطة واحدة إلى ٤٠ محطة.');
const ls=raw.definition.lessons.map((l:any,i:number)=>{const title=string(l.title,'عنوان المحطة',120),intro=string(l.intro,'الشرح');if(raw.published===1&&(!title||!intro))throw new Error('كل محطة تحتاج عنوانًا وشرحًا.');if(!Array.isArray(l.rules)||l.rules.length>15)throw new Error('راجع فقرات الشرح.');const rules=l.rules.map((r:any)=>{if(!Array.isArray(r)||r.length!==3)throw new Error('فقرة شرح غير صالحة.');return r.map((v:any)=>string(v,'فقرة الشرح'));});return {title,en:string(l.en,'العنوان الإنجليزي',120),tag:String(i+1).padStart(2,'0'),intro,formula:string(l.formula,'تركيب الجملة',240),rules,note:string(l.note,'الملاحظة'),example:string(l.example,'المثال',800),translation:string(l.translation,'الترجمة',800)};});
if(!Array.isArray(raw.definition.questions)||raw.definition.questions.length<1||raw.definition.questions.length>200)throw new Error('أضف من سؤال واحد إلى ٢٠٠ سؤال.');
const qs=raw.definition.questions.map((q:any)=>{if(!Number.isInteger(q.lesson)||!ls[q.lesson])throw new Error('اربط كل سؤال بمحطة صحيحة.');const prompt=string(q.prompt,'السؤال',1200),reason=string(q.reason,'سبب التصحيح',2000);if(raw.published===1&&(!prompt||!reason))throw new Error('اكتب السؤال وسبب الإجابة الصحيحة.');if(!Array.isArray(q.options)||q.options.length<2||q.options.length>6)throw new Error('كل سؤال يحتاج ٢ إلى ٦ خيارات.');const options=q.options.map((o:any)=>string(o,'خيار الإجابة',500));if(raw.published===1&&(options.some((o:string)=>!o)||new Set(options).size!==options.length))throw new Error('أدخل خيارات مختلفة وغير فارغة.');if(!Number.isInteger(q.answer)||q.answer<0||q.answer>=options.length)throw new Error('حدد الإجابة الصحيحة لكل سؤال.');return {id:0,lesson:q.lesson,prompt,options,answer:q.answer,reason,...(q.picture===undefined?{}:{picture:string(q.picture,'الرسم التوضيحي',80)})};}).sort((a:any,b:any)=>a.lesson-b.lesson).map((q:any,i:number)=>({...q,id:i+1}));
if(raw.published===1&&ls.some((_:unknown,i:number)=>!qs.some((q:any)=>q.lesson===i)))throw new Error('أضف سؤالًا واحدًا على الأقل لكل محطة.');return {title,description,grade,definition:{lessons:ls,questions:qs},published:raw.published===1?1:0};
}
