// Public field definitions only; the personal content is read by owner-only APIs.
export const portfolioRequirements=[
 {id:'duties',title:'أداء الواجبات الوظيفية',hint:'مثل: الالتزام بالمهام، سجلات المتابعة، وتنفيذ المسؤوليات.'},
 {id:'community',title:'التفاعل مع المجتمع المهني',hint:'مثل: المجتمعات المهنية، تبادل الخبرات، والورش واللقاءات.'},
 {id:'parents',title:'التفاعل مع أولياء الأمور',hint:'مثل: التواصل والمتابعة والاجتماعات والتغذية الراجعة.'},
 {id:'strategies',title:'التنويع في استراتيجيات التدريس',hint:'مثل: استراتيجيات نفذتها، وخطط الدروس، ونماذج تطبيقها.'},
 {id:'outcomes',title:'تحسين نتائج المتعلمين',hint:'مثل: مقارنة النتائج، وخطط التحسين، وشواهد تقدم المتعلمين.'},
 {id:'learning-plan',title:'إعداد وتنفيذ خطة التعلم',hint:'مثل: الخطة الدراسية، وتوزيع المحتوى، ومتابعة التنفيذ.'},
 {id:'technology',title:'توظيف تقنيات ووسائل التعلم المناسبة',hint:'مثل: الدروس التفاعلية، والمنصات التعليمية، والوسائل التي وظفتها.'},
 {id:'environment',title:'تهيئة بيئة تعليمية',hint:'مثل: بيئة آمنة ومحفزة، وتنظيم التعلم، ومراعاة احتياجات المتعلمين.'},
 {id:'management',title:'الإدارة الصفية',hint:'مثل: إجراءات تنظيم الصف، والتحفيز، وإدارة الوقت والسلوك.'},
 {id:'analysis',title:'تحليل نتائج المتعلمين وتشخيص مستوياتهم',hint:'مثل: تحليل الاختبارات، والتشخيص، والفروق الفردية، والخطط العلاجية.'},
 {id:'assessment',title:'تنوع أساليب التقويم',hint:'مثل: التقويم التشخيصي والتكويني والختامي، وأدوات الرصد والتغذية الراجعة.'},
] as const;
export const portfolioProfileFields=[
 {key:'name',label:'الاسم',placeholder:'اسم المعلم / المعلمة',max:160},
 {key:'qualifications',label:'المؤهلات',placeholder:'المؤهل العلمي والدورات ذات الصلة',max:3000},
 {key:'experience',label:'الخبرات المهنية',placeholder:'خبراتك في التعليم وأبرز الأدوار التي توليتها',max:4000},
 {key:'teachingLoad',label:'نصاب الحصص',placeholder:'مثال: ١٨ حصة أسبوعيًا',max:300},
 {key:'specialization',label:'التخصص',placeholder:'مثال: اللغة الإنجليزية',max:1000},
 {key:'subjects',label:'مواد التدريس',placeholder:'المواد والصفوف التي تدرّسها',max:2000},
 {key:'contact',label:'بيانات التواصل',placeholder:'وسائل التواصل التي تريد الاحتفاظ بها في ملفك الخاص',max:2000},
] as const;
export type PortfolioProfile=Record<typeof portfolioProfileFields[number]['key'],string>;
export const emptyPortfolioProfile=():PortfolioProfile=>({name:'',qualifications:'',experience:'',teachingLoad:'',specialization:'',subjects:'',contact:''});
export type PortfolioSection={id:string;content:string;revision:number;created:string;updated:string};
export type PortfolioFile={id:string;section_id:string;file_name:string;file_size:number;description:string;created:string;completed:string};
export type PortfolioState={profile:PortfolioProfile;profileRevision:number;profileUpdated:string|null;sections:PortfolioSection[];files:PortfolioFile[]};
export const PORTFOLIO_FILE_LIMIT=250*1024*1024;
export const PORTFOLIO_CHUNK_SIZE=512*1024;
export const portfolioSectionId=(v:unknown):v is string=>typeof v==='string'&&portfolioRequirements.some(r=>r.id===v);
export const portfolioFileId=(v:unknown):v is string=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v);
export class PortfolioInputError extends Error{}
export function portfolioString(value:unknown,max:number){if(typeof value!=='string'||value.length>max||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value))throw new PortfolioInputError('راجع البيانات وطول النص المدخل.');return value.trim();}
export function validatePortfolioProfile(raw:unknown):PortfolioProfile{if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new PortfolioInputError('راجع البيانات العامة.');const profile=emptyPortfolioProfile();for(const f of portfolioProfileFields)profile[f.key]=portfolioString((raw as Record<string,unknown>)[f.key]??'',f.max);return profile;}
export const portfolioFileSize=(bytes:number)=>bytes>=1024*1024?(bytes/(1024*1024)).toFixed(1)+' MB':Math.max(1,Math.ceil(bytes/1024))+' KB';
