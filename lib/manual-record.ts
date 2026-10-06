import {ministryReferenceLogo,visionLogo} from './education-brand';
import {gradeLabel} from './grades';
import type {RecordContent,RecordTask} from './records';

export const isSchoolBlank=(record:RecordContent)=>record.format==='blank'&&record.blankLayout==='school';
export function defaultManualTasks():Omit<RecordTask,'id'>[]{
  return [
    {title:'واجبات',manualGroup:'الواجب',maxScore:10,manualCells:10},
    {title:'بحوث ومشروعات',manualGroup:'المهام الأدائية',maxScore:20,manualCells:1},
    {title:'المهارات الحياتية والأنشطة الصفية',manualGroup:'المشاركة والتفاعل',maxScore:5,manualCells:5},
    {title:'المشاركة',manualGroup:'المشاركة والتفاعل',maxScore:5,manualCells:5},
    {title:'اختبارات تحريرية',manualGroup:'الاختبارات القصيرة',maxScore:20,manualCells:1},
  ].map(task=>({...task,type:'custom',mode:'number'}));
}
const escape=(value:unknown)=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
const cells=(task:RecordTask)=>task.manualCells??1;
export const manualTotal=(tasks:Pick<RecordTask,'maxScore'>[])=>Number(tasks.reduce((sum,task)=>sum+task.maxScore,0).toFixed(6));
function taskPages(tasks:RecordTask[]){
  const pages:RecordTask[][]=[];let page:RecordTask[]=[],count=0;
  for(const task of tasks){const size=cells(task);if(page.length&&(page.length>=6||count+size>30)){pages.push(page);page=[];count=0;}page.push(task);count+=size;}
  if(page.length)pages.push(page);return pages;
}
function groups(tasks:RecordTask[]){
  const result:{name:string;tasks:RecordTask[]}[]=[];
  for(const task of tasks){const name=task.manualGroup?.trim()||task.title,previous=result.at(-1);if(previous?.name===name)previous.tasks.push(task);else result.push({name,tasks:[task]});}
  return result;
}
const field=(label:string,value:string|undefined)=>'<span><b>'+label+':</b> <i>'+escape(value||'........................')+'</i></span>';
function header(record:RecordContent){
  const classroom=record.classLabel||gradeLabel(record.grade)+(record.className?' '+record.className:'');
  return '<header class="manual-header"><div class="manual-school-fields">'+field('الإدارة العامة للتعليم',record.educationArea)+field('مكتب التعليم',record.educationOffice)+field('المدرسة',record.schoolName)+'</div><div class="manual-ministry"><img src="'+ministryReferenceLogo+'" alt="وزارة التعليم"><small>المملكة العربية السعودية · وزارة التعليم</small></div><div class="manual-heading"><img src="'+visionLogo+'" alt="رؤية السعودية 2030"><h1>'+escape(record.title)+'</h1></div></header><div class="manual-meta">'+field('الصف',classroom)+field('المادة',record.subjectName)+field('العام الدراسي',record.schoolYear)+field('الفصل الدراسي',record.academicTerm)+'</div>';
}
export function manualRecordBody(record:RecordContent){
  const pages:string[]=[],columns=taskPages(record.tasks);let taskStart=0;
  for(const tasks of columns){
    const units=tasks.reduce((sum,t)=>sum+(cells(t)===1?3:cells(t)),0),colgroup='<colgroup><col style="width:7mm"><col style="width:42mm">'+tasks.map(task=>Array.from({length:cells(task)},()=>'<col style="width:calc((100% - 64mm) * '+(cells(task)===1?3:1)+' / '+units+')">').join('')).join('')+'<col style="width:15mm"></colgroup>';
    const total=manualTotal(tasks),groupHeaders=groups(tasks).map(group=>'<th scope="colgroup" class="manual-task-end" colspan="'+group.tasks.reduce((sum,t)=>sum+cells(t),0)+'">'+escape(group.name)+'<small>'+manualTotal(group.tasks)+' درجة</small></th>').join('');
    const head='<thead><tr><th rowspan="2" scope="col">م</th><th rowspan="2" scope="col">اسم الطالب</th>'+groupHeaders+'<th rowspan="2" scope="col">'+(columns.length===1?'المجموع':'مجموع هذه الصفحة')+'<small>'+total+' درجة</small></th></tr><tr>'+tasks.map(task=>'<th class="manual-task-end" scope="colgroup" colspan="'+cells(task)+'">'+escape(task.title)+'<small>'+task.maxScore+' درجة</small></th>').join('')+'</tr></thead>';
    for(let rowStart=0;rowStart<record.students.length;rowStart+=25){
      const rows=record.students.slice(rowStart,rowStart+25).map((student,i)=>'<tr><td class="manual-index">'+(rowStart+i+1)+'</td><th scope="row" class="manual-name">'+escape(student.name)+'</th>'+tasks.map(task=>Array.from({length:cells(task)},(_,cell)=>'<td class="manual-empty'+(cell===cells(task)-1?' manual-task-end':'')+'"></td>').join('')).join('')+'<td class="manual-empty manual-total"></td></tr>').join('');
      pages.push('<section class="manual-sheet manual-design-'+(record.design||'white')+'">'+header(record)+(columns.length>1?'<p class="manual-range">المهام '+(taskStart+1)+'–'+(taskStart+tasks.length)+' من '+record.tasks.length+' · مجموع جميع المهام '+manualTotal(record.tasks)+' درجة</p>':'')+'<table class="manual-table"><caption class="manual-sr-only">'+escape(record.title)+' — الطلاب '+(rowStart+1)+' إلى '+Math.min(rowStart+25,record.students.length)+'</caption>'+colgroup+head+'<tbody>'+rows+'</tbody></table><div class="manual-signatures">'+field('معلم المادة',record.teacherName)+field('مدير المدرسة',record.principalName)+'</div><footer class="manual-footer"><span>كشف فارغ للتعبئة اليدوية · ALWADANI</span><span>صفحة '+(pages.length+1)+'</span></footer></section>');
    }
    taskStart+=tasks.length;
  }
  return pages.join('');
}
export const manualRecordCss=`
.manual-sheet,.manual-sheet *{box-sizing:border-box}.manual-sheet{direction:rtl;color:#16353e;background:white;width:100%;min-width:720px;max-width:840px;margin:0 auto 24px;padding:14px;border:1px solid #cbd7da;font:12px/1.6 Tahoma,Arial,sans-serif;box-shadow:0 10px 30px #14373a12}
.manual-header{display:grid;grid-template-columns:1.1fr .9fr 1fr;align-items:center;gap:12px;background:#152c43;color:white;border-bottom:7px solid #53b4aa;padding:14px 16px;border-radius:6px 6px 0 0;min-height:100px;margin:0}
.manual-school-fields{display:grid;gap:4px;font-size:10px}.manual-school-fields span{display:block}.manual-school-fields i{font-style:normal;overflow-wrap:anywhere}.manual-school-fields b{font-weight:500}
.manual-ministry{text-align:center}.manual-ministry img{display:block;object-fit:contain;width:130px;height:48px;margin:auto;background:white;border-radius:4px}.manual-ministry small{display:block;font-size:8px;margin-top:6px}
.manual-heading{text-align:center}.manual-heading img{width:58px;height:30px;object-fit:contain;background:white;border-radius:3px;padding:2px}.manual-heading h1{color:white;font-size:19px;line-height:1.5;margin:6px 0 0;overflow-wrap:anywhere}
.manual-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px 25px;padding:12px 5px;font-size:12px}.manual-meta span,.manual-signatures span{display:flex;gap:6px}.manual-meta i,.manual-signatures i{flex:1;font-style:normal;border-bottom:1px dotted #526969;overflow-wrap:anywhere}.manual-meta b{white-space:nowrap}
.manual-table{direction:rtl;table-layout:fixed;border-collapse:collapse;width:100%;margin:0;border:1px solid #294a50}.manual-table th,.manual-table td{border:1px solid #45666a;padding:2px;text-align:center;overflow-wrap:anywhere;vertical-align:middle}.manual-table thead{display:table-header-group}.manual-table thead th{background:#63bbb0;color:#092f34;font-size:11px;font-weight:700;padding:6px 3px}.manual-table thead small{display:block;font-size:10px;font-weight:500;margin-top:4px;white-space:nowrap}.manual-table tbody tr{height:6.5mm;break-inside:avoid}.manual-table tbody th{background:white}.manual-table .manual-name{text-align:right;padding:3px 6px;font-size:11px;font-weight:400}.manual-table .manual-index{font-size:10px}.manual-table .manual-empty{background:white;padding:0}.manual-table .manual-task-end{border-left:3px solid #54b3a6}.manual-table .manual-total{border-right:2px solid #294a50}
.manual-signatures{display:flex;justify-content:space-between;gap:25px;margin-top:18px;font-size:11px}.manual-signatures>span{width:48%}.manual-footer{display:flex;justify-content:space-between;color:#6a7c7c;margin-top:14px;font-size:9px}.manual-range{margin:0 0 8px;font-size:10px}.manual-sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}
.manual-design-green{border-color:#86b39d}.manual-design-blue{border-color:#41618c}.manual-design-gold{border:2px solid #b9954b}.manual-sheet+.manual-sheet{break-before:page}
@media print{.manual-sheet{min-width:0;max-width:none;width:100%;margin:0;padding:0;border:0;box-shadow:none;break-after:page}.manual-sheet:last-child{break-after:auto}.manual-sheet *{-webkit-print-color-adjust:exact;print-color-adjust:exact}.manual-sheet .manual-header{border-radius:0;margin:0;padding:14px 16px;border-bottom:7px solid #53b4aa}.manual-sheet .manual-heading h1{font-size:17px;color:white}.manual-sheet .manual-table{margin:0}.manual-sheet .manual-table th,.manual-sheet .manual-table td{height:auto;padding:2px;border:1px solid #45666a}.manual-sheet .manual-table .manual-task-end{border-left:3px solid #54b3a6}.manual-sheet .manual-table thead th{font-size:10px;background:#63bbb0;color:#092f34;padding:6px 3px}.manual-sheet .manual-table .manual-name{padding:3px 6px;text-align:right;background:white}.manual-sheet .manual-footer{display:flex!important;margin-top:14px;font-size:9px}.manual-sheet+.manual-sheet{margin-top:0}}
`;
export const manualPageCss='@media print{@page{size:A4 portrait;margin:10mm}body{padding:0}}';
