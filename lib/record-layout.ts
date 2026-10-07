import type {Gender} from './audience';
import {isNumberTask,markLabel,type RecordContent,type RecordTask,type RecordMark} from './records';
export const portraitRecord=(record:RecordContent)=>record.blankLayout==='school'||record.tasks.length<=3;
export function recordRows(record:RecordContent){
  const ranges:{start:number;end:number}[]=[];
  for(let start=0;start<record.students.length;){const count=record.blankLayout==='school'?25:portraitRecord(record)?(start?32:24):(start?22:14);const end=Math.min(start+count,record.students.length);ranges.push({start,end});start=end;}
  return ranges;
}
export const recordResult=(task:RecordTask,mark:RecordMark|undefined,studentGender?:Gender)=>typeof mark==='number'?String(mark):markLabel(task,mark,studentGender);
export const numericTask=(task:RecordTask)=>isNumberTask(task)||task.type==='performance-score';
export function recordPageStyles(record:RecordContent){
  const portrait=portraitRecord(record),width=portrait?210:297,height=portrait?297:210;
  const scope=':is(.record-output,.record-print-pages)';
  const rules=`
${scope} :is(.record-print-page,.manual-sheet){box-sizing:border-box;width:${width}mm!important;max-width:none!important;min-width:0!important;min-height:${height}mm;padding:12mm!important;margin:0 auto!important;border:0!important;box-shadow:none!important;background:#fff;position:relative;color:#173b35;font:12px/1.4 Tahoma,Arial,sans-serif;direction:rtl;break-after:page}
${scope} :is(.record-print-page,.manual-sheet):last-child{break-after:auto}
.record-output{margin:0!important;padding:0!important;background:#e8eeeb!important}.record-output :is(.record-print-page,.manual-sheet){height:${height}mm;margin-bottom:20px!important}
${scope} .record-cliche{padding:4mm 5mm 6mm!important;border-top-width:1.5mm!important;border-radius:0 0 10px 10px;margin:0 0 6mm!important}
${scope} .record-cliche-brand{gap:12px;flex-wrap:nowrap}${scope} .record-ministry-logo{width:110px;height:58px}${scope} .record-vision-logo{width:100px;height:51px}${scope} .record-school strong{font-size:17px}${scope} .record-school span{font-size:12px}
${scope} .record-cliche h1{font-size:17px!important;line-height:1.4!important;top:10px;padding:5px 25px;margin:0 auto -24px!important}
${scope} .record-cliche-details{font-size:11px;line-height:1.4;margin:2mm 0 3mm}${scope} .record-cliche-details strong{font-size:11px}
${scope} .record-cliche-meta{margin:0 0 4mm}${scope} .record-cliche-meta :is(th,td){font-size:11px!important;line-height:1.4!important;padding:4px!important}
${scope} .record-range{margin:2mm 0;font-size:10px}${scope} .record-continuation{font-size:12px;font-weight:600;margin:0 0 4mm}
${scope} .record-data-table{width:100%;border-collapse:collapse;table-layout:fixed;margin:3mm 0 0}
${scope} .record-data-table :is(th,td){font-size:11.5px;line-height:1.55;padding:4px 6px;border:1px solid #b8c9bf;overflow-wrap:anywhere;text-align:center;vertical-align:middle;height:auto}
${scope} .record-data-table thead th{background:#e7efeb;font-weight:700;padding:6px 4px}${scope} .record-data-table tr{break-inside:avoid}${scope} .record-data-table tbody tr{height:6.2mm}
${scope} .record-data-table .student-name{width:30%;text-align:right}${scope} .record-data-table .record-index{width:5%}${scope} .record-result{font-weight:600;font-size:12px}
${scope} .record-data-table tbody .student-name{direction:rtl;text-align:center;font-weight:500;vertical-align:middle}
${scope} .record-legend{font-size:9px;line-height:1.4;margin:3mm 0;color:#63736e}
${scope} .record-signatures{display:flex;justify-content:space-between;gap:10mm;font-size:11px;border:0;padding:0;margin-top:4mm}${scope} .record-signatures p{min-width:0;max-width:48%}
${scope} footer{display:flex!important;justify-content:space-between;font-size:9px;color:#6e8076;padding:0;border:0;margin:4mm 0 0}
${scope} .manual-header{min-height:23mm;padding:10px 12px;border-radius:0}${scope} .manual-heading img{width:82px;height:42px}${scope} .manual-heading h1{font-size:16px}${scope} .manual-meta{margin:3mm 0;font-size:10px}
${scope} .manual-table{margin:2mm 0}${scope} .manual-table tbody tr{height:6.2mm}${scope} .manual-table thead th{font-size:10px;padding:5px 3px}${scope} .manual-table .manual-name{font-size:11px;line-height:1.55;direction:rtl;text-align:center;vertical-align:middle;padding:4px 6px}
${scope} .manual-signatures{margin-top:4mm;font-size:11px}${scope} .manual-footer{margin-top:4mm}
`;
  return rules+`@media print{@page{size:A4 ${portrait?'portrait':'landscape'};margin:0}body{padding:0!important;margin:0!important;background:#fff!important}${scope} :is(.record-print-page,.manual-sheet){height:auto;margin:0!important}${scope} .record-data-table thead{display:table-header-group}${scope} :is(.record-print-page,.manual-sheet) *{-webkit-print-color-adjust:exact;print-color-adjust:exact}}`;
}
