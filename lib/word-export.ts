import {audienceWords} from './audience';
import {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,ImageRun,AlignmentType,WidthType,TableLayoutType,VerticalAlign,HeightRule,BorderStyle,PageOrientation,SectionType,Footer,PageNumber,type ISectionOptions} from 'docx';
import {portraitRecord,recordRows,recordResult} from './record-layout';
import {gradeLabel} from './grades';
import {isSchoolBlank,manualTaskPages,manualTotal} from './manual-record';
import {markClass,isNumberTask,type RecordContent,type RecordTask} from './records';

type Logos={ministry:Uint8Array;vision:Uint8Array};
const border={style:BorderStyle.SINGLE,size:5,color:'689C98'};
const borders={top:border,bottom:border,left:border,right:border,insideHorizontal:border,insideVertical:border};
const none={style:BorderStyle.NONE,size:0,color:'FFFFFF'};
const noBorders={top:none,bottom:none,left:none,right:none,insideHorizontal:none,insideVertical:none};
const palette:Record<string,[string,string]>={'mark-done':['DDF1E5','145C38'],'mark-missing':['FBE1DF','952D28'],'mark-score':['EDF3FB','285077'],'mark-ungraded':['DBEAFE','1D4ED8'],'mark-note':['FFF4D7','765615']};
function text(value:string,size=19,bold=false,color='173B35',alignment:typeof AlignmentType[keyof typeof AlignmentType]=AlignmentType.CENTER){return new Paragraph({bidirectional:!/^\d[\d.]*\s*\/\s*\d[\d.]*$/.test(value),alignment,spacing:{before:0,after:0,line:240},children:value.split('\n').map((line,i)=>new TextRun({text:line,break:i?1:undefined,font:'Arial',size,sizeComplexScript:size,bold,boldComplexScript:bold,color,rightToLeft:!/^\d[\d.]*\s*\/\s*\d[\d.]*$/.test(value)}))});}
function cell(value:string,width:number,options:{fill?:string;color?:string;bold?:boolean;span?:number;rowSpan?:number;size?:number;align?:typeof AlignmentType[keyof typeof AlignmentType]}={}){return new TableCell({width:{size:width,type:WidthType.DXA},columnSpan:options.span,rowSpan:options.rowSpan,verticalAlign:VerticalAlign.CENTER,shading:{fill:options.fill||'FFFFFF'},margins:{top:45,bottom:45,left:45,right:45},children:[text(value,options.size||18,options.bold,options.color||'173B35',options.align)]});}
function row(children:TableCell[],header=false){return new TableRow({tableHeader:header,cantSplit:true,height:{value:header?430:320,rule:HeightRule.ATLEAST},children});}
function table(rows:TableRow[],widths:number[],plain=false){return new Table({visuallyRightToLeft:true,layout:TableLayoutType.FIXED,width:{size:widths.reduce((a,b)=>a+b,0),type:WidthType.DXA},columnWidths:widths,borders:plain?noBorders:borders,rows});}
function header(record:RecordContent,width:number,logos:Logos){
  const image=(data:Uint8Array,w:number,h:number)=>new Paragraph({alignment:AlignmentType.CENTER,children:[new ImageRun({type:'png',data,transformation:{width:w,height:h}})]});
  const logoCell=(data:Uint8Array)=>new TableCell({width:{size:2100,type:WidthType.DXA},verticalAlign:VerticalAlign.CENTER,shading:{fill:'0A3845'},margins:{top:100,bottom:100,left:60,right:60},children:[image(data,124,64)]});
  const brand=table([new TableRow({children:[logoCell(logos.ministry),new TableCell({width:{size:width-4200,type:WidthType.DXA},verticalAlign:VerticalAlign.CENTER,shading:{fill:'0A3845'},children:[text('المملكة العربية السعودية',20,true,'FFFFFF'),text('وزارة التعليم',24,true,'FFFFFF'),text(record.educationArea||'',16,false,'C1E6DC'),text(record.educationOffice||'',16,false,'C1E6DC')]}),logoCell(logos.vision)]})],[2100,width-4200,2100],true);
  const className=record.classLabel||gradeLabel(record.grade)+(record.className?' '+record.className:'');
  return [brand,new Paragraph({spacing:{after:70},children:[]}),text(record.title,28,true,'173B35'),text('المدرسة: '+(record.schoolName||'________________')+'     الصف: '+className,19,true),text('المادة: '+(record.subjectName||'________________')+'     العام الدراسي: '+(record.schoolYear||'________')+'     الفصل الدراسي: '+(record.academicTerm||'________'),18),new Paragraph({spacing:{after:100},children:[]})];
}
function manualTable(record:RecordContent,tasks:RecordTask[],start:number,end:number,width:number){
  const weighted=tasks.reduce((total,t)=>total+(t.manualCells===1||!t.manualCells?5:t.manualCells),0);
  const indexWidth=Math.round(width*.04),nameWidth=Math.round(width*.23),totalWidth=Math.round(width*.08),available=width-indexWidth-nameWidth-totalWidth;
  const taskWidths=tasks.flatMap(t=>Array.from({length:t.manualCells||1},()=>Math.round(available/weighted*((t.manualCells||1)===1?5:1))));
  // Keep the exact table width after rounding every writing box.
  taskWidths[taskWidths.length-1]+=available-taskWidths.reduce((a,b)=>a+b,0);
  const widths=[indexWidth,nameWidth,...taskWidths,totalWidth],groups:{name:string;count:number;width:number}[]=[];let offset=0;
  for(const task of tasks){const count=task.manualCells||1,name=task.manualGroup?.trim()||task.title,groupWidth=taskWidths.slice(offset,offset+count).reduce((a,b)=>a+b,0),last=groups.at(-1);if(last?.name===name){last.count+=count;last.width+=groupWidth;}else groups.push({name,count,width:groupWidth});offset+=count;}
  const h={fill:'63BBB0',bold:true,size:17};
  const first=row([cell('م',indexWidth,{...h,rowSpan:2}),cell('اسم '+audienceWords(record).student,nameWidth,{...h,rowSpan:2}),...groups.map(g=>cell(g.name,g.width,{...h,span:g.count})),cell('المجموع\n'+manualTotal(tasks),totalWidth,{...h,rowSpan:2})],true);
  offset=0;
  const second=row(tasks.map(t=>{const count=t.manualCells||1,w=taskWidths.slice(offset,offset+count).reduce((a,b)=>a+b,0);offset+=count;return cell(t.title+'\nمن '+t.maxScore,w,{...h,span:count,size:16});}),true);
  const body=record.students.slice(start,end).map((student,i)=>row([cell(String(start+i+1),indexWidth,{size:16}),cell(student.name,nameWidth,{align:AlignmentType.RIGHT}),...taskWidths.map(w=>cell('',w)),cell('',totalWidth)]));
  return table([first,second,...body],widths);
}
function electronicTable(record:RecordContent,tasks:RecordTask[],start:number,end:number,width:number){
  const indexWidth=Math.round(width*.05),nameWidth=Math.round(width*.30),taskWidth=Math.floor((width-indexWidth-nameWidth)/tasks.length),widths=[indexWidth,nameWidth,...tasks.map(()=>taskWidth)];widths[widths.length-1]+=width-widths.reduce((a,b)=>a+b,0);
  const blank=record.format==='blank',h={fill:'E7EFEB',bold:true};
  const heads=row([cell('م',indexWidth,h),cell('اسم '+audienceWords(record).student,nameWidth,h),...tasks.map((t,i)=>cell(t.title+((isNumberTask(t)||t.type==='performance-score')?'\nمن '+t.maxScore:''),widths[i+2],h))],true);
  const rows=record.students.slice(start,end).map((s,i)=>row([cell(String(start+i+1),indexWidth),cell(s.name,nameWidth,{align:AlignmentType.RIGHT}),...tasks.map((t,j)=>{const mark=record.marks[s.id]?.[t.id],colors=palette[markClass(mark,t)];return cell(blank?'':recordResult(t,mark,record.studentGender),widths[j+2],blank?{}:{fill:colors?.[0],color:colors?.[1]});})]));
  return table([heads,...rows],widths);
}
const page=(portrait:boolean)=>({size:{width:11906,height:16838,orientation:portrait?PageOrientation.PORTRAIT:PageOrientation.LANDSCAPE},margin:{top:567,bottom:567,left:567,right:567}});
export async function recordWord(record:RecordContent,logos:Logos){
  const school=isSchoolBlank(record),portrait=portraitRecord(record),width=portrait?10772:15704,sections:ISectionOptions[]=[],pages=school?manualTaskPages(record.tasks):Array.from({length:Math.ceil(record.tasks.length/6)},(_,i)=>record.tasks.slice(i*6,i*6+6));
  for(const tasks of pages)for(const {start,end} of recordRows(record)){
    const signatures=new Footer({children:[new Paragraph({bidirectional:true,alignment:AlignmentType.CENTER,spacing:{after:0},children:[new TextRun({text:audienceWords(record).teacher+': '+(record.teacherName||'________________')+'      '+audienceWords(record).principalRole+': '+(record.principalName||'________________')+'      صفحة ',font:'Arial',size:16,sizeComplexScript:16,rightToLeft:true}),new TextRun({children:[PageNumber.CURRENT],font:'Arial',size:16})]})]});
    sections.push({properties:{type:SectionType.NEXT_PAGE,page:page(portrait)},footers:{default:signatures},children:[...(sections.length===0?header(record,width,logos):[text('تتمة الكشف',21,true),new Paragraph({spacing:{after:100},children:[]})]),school?manualTable(record,tasks,start,end,width):electronicTable(record,tasks,start,end,width)]});
  }
  return Packer.toBlob(new Document({creator:'Alwadani Teaching Tools',title:record.title,styles:{default:{document:{run:{font:'Arial',size:18,sizeComplexScript:18},paragraph:{spacing:{before:0,after:0}}}}},sections}));
}
// Each certificate remains a complete page with its selected artwork and Arabic text.
export async function certificatesWord(images:{data:Uint8Array;width:number;height:number}[]){
  const sections:ISectionOptions[]=images.map(image=>{const scale=Math.min(1040/image.width,695/image.height);return {properties:{type:SectionType.NEXT_PAGE,page:page(false)},children:[new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:0},children:[new ImageRun({type:'png',data:image.data,transformation:{width:Math.round(image.width*scale),height:Math.round(image.height*scale)}})]})]};});
  return Packer.toBlob(new Document({creator:'Alwadani Teaching Tools',title:'شهادات الطلاب',sections}));
}
