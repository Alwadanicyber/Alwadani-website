export type StudentAccess='single'|'shared';
type CourseAccess={id?:string;studentAccess?:StudentAccess;definition?:{studentAccess?:StudentAccess}};
export function courseStudentAccess(course:CourseAccess):StudentAccess{
 return course.studentAccess??course.definition?.studentAccess??(course.id==='life-stories-time-place-grade-9'?'single':'shared');
}
export function validateStudentAccess(value:unknown,fallback:StudentAccess):StudentAccess{
 if(value===undefined)return fallback;
 if(value!=='single'&&value!=='shared')throw new Error('اختر طالبًا واحدًا أو عدة طلاب على المتصفح نفسه.');
 return value;
}
