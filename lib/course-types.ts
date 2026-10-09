// Course publication states: -1 in trash, 0 private draft, 1 published.
export const COURSE_TRASHED=-1;
export type Lesson={title:string;en:string;tag:string;intro:string;formula:string;rules:string[][];note:string;example:string;translation:string};
export type QuizQuestion={id:number;lesson:number;prompt:string;options:string[];answer:number;reason:string;picture?:string};
export type Definition={lessons:Lesson[];questions:QuizQuestion[]};
export type PublicCourse={id:string;grade?:string;title:string;description:string;lessons:Lesson[];questions:Omit<QuizQuestion,'answer'|'reason'>[]};
export type TeacherCourse={id:string;grade?:string;title:string;description:string;published:number;definition:Definition;updated:string;students?:number};
