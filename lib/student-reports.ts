export const reportCategories=[{id:'grades',label:'تقارير الدرجات'},{id:'homework',label:'تقارير الواجبات'},{id:'pledge',label:'التعهدات'},{id:'referral',label:'إحالات لوكيل المدرسة'},{id:'behaviour',label:'تقارير السلوك'}] as const;
export const reportViolations=['عدم أداء الواجب','عدم إحضار الأدوات','التأخر عن الحصة','الغياب عن الحصة','مقاطعة الشرح','إزعاج الزملاء','عدم اتباع تعليمات المعلم','إتلاف الممتلكات','أخرى'];
export type ReportCategory=string;
export type StudentReport={id:string;category:ReportCategory;title:string;grade:string;studentName:string;violation:string;notes:string;fileName:string;fileType:string;fileSize:number;fileUploadedAt:string|null;created:string;updated:string;archived:number};
export const reportNeedsStudent=(category:string)=>['pledge','referral','behaviour'].includes(category);
export const validReportId=(value:unknown):value is string=>typeof value==='string'&&/^[a-f0-9-]{36}$/.test(value);
export const REPORT_FILE_LIMIT=250*1024*1024;
export type CustomReportCategory={id:string;label:string;mode:string};
export function validateStudentReport(raw:Record<string,unknown>,custom:CustomReportCategory[]=[]){
 const field=(key:string,max:number)=>{const v=raw[key]??'';if(typeof v!=='string'||v.trim().length>max)throw new Error('راجع بيانات التقرير.');return v.trim();};
 const category=field('category',64) as ReportCategory,title=field('title',160),grade=field('grade',100),studentName=field('studentName',100),violation=field('violation',300),notes=field('notes',15000);
 const extra=custom.find(c=>c.id===category);const needsName=reportNeedsStudent(category)||!!extra&&extra.mode!=='grade';const needsViolation=reportNeedsStudent(category)||extra?.mode==='violation';
 if((!reportCategories.some(c=>c.id===category)&&!extra)||!title)throw new Error('اختر نوع التقرير واكتب عنوانه.');
 if(needsName&&(!studentName||needsViolation&&!violation))throw new Error('أدخل اسم الطالب وحدد المخالفة أو الملاحظة.');
 if(!needsName&&!grade)throw new Error('اختر الصف الذي يخصه التقرير.');
 return {category,title,grade:needsName?'':grade,studentName:needsName?studentName:'',violation:needsViolation?violation:'',notes};
}
