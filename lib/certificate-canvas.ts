import type {CertificatePack,CertificateStudent} from './certificates';
import {isCertificateField,type CertificateField} from './certificate-fields';
import {marbleCertificateArt} from './certificate-marble-art';
import {editableMarbleArt} from './certificate-marble-editable-art';
import {ornamentLabels,ornamentImages,type CertificateOrnament} from './certificate-ornaments';
import {visionLogo} from './education-brand';
import {ministryTransparentLogo} from './ministry-logo';
export const canvasFonts=['Tahoma','Arial','Georgia','Times New Roman'] as const;
export type CanvasElement={id:string;kind:'text'|'ministry'|'vision'|CertificateOrnament;label:string;text:string;binding?:CertificateField;presetField?:CertificateField;x:number;y:number;width:number;height:number;fontSize:number;font:typeof canvasFonts[number];color:string;align:'right'|'center'|'left';bold:boolean;italic:boolean;underline:boolean;rotation:number;autoFit:boolean;hidden:boolean};
export type CertificateCanvas={version:1;height:number;marbleSeparated?:boolean;elements:CanvasElement[]};
export type CanvasValues=Record<CertificateField,string>;
export function certificateCanvasValues(pack:CertificatePack,student:CertificateStudent,copy:{title:string;intro:string;reason:string;wish:string;subtitle?:string;language?:string}):CanvasValues{
 const english=copy.language==='en'&&student.design==='marbleEnglish';
 const values:CanvasValues={title:copy.title,subtitle:copy.subtitle||'',intro:copy.intro,reason:copy.reason,wish:copy.wish,name:student.name,teacher:pack.teacher,principal:pack.principal,teacherRole:english?'YOUR TEACHER':pack.teacherGender==='female'?'معلمة المادة':'معلم المادة',principalRole:english?pack.principalGender==='female'?'THE HEADMISTRESS':'THE HEADMASTER':pack.principalGender==='female'?'مديرة المدرسة':'مدير المدرسة',grade:[pack.grade,pack.letter].filter(Boolean).join(' '),kicker:student.design==='joy'?'YOUR BRIGHT FUTURE':'WITH APPRECIATION'};
 for(const [field,edit] of Object.entries(student.edits||{}))if(field!=='name'&&edit.text!==undefined)values[field as CertificateField]=edit.text;
 return values;
}
export const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));
export function validateCertificateCanvas(value:unknown):CertificateCanvas|undefined{
 if(value===undefined)return undefined;
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('تصميم الشهادة غير صالح.');
 const c=value as Record<string,unknown>;
 if(c.version!==1||typeof c.height!=='number'||!Number.isFinite(c.height)||c.height<100||c.height>10500||!Array.isArray(c.elements)||c.elements.length>60)throw new Error('راجع مقاس الشهادة أو عدد العناصر.');
 const ids=new Set<string>();
 const elements=c.elements.map((raw:unknown)=>{
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('عنصر شهادة غير صالح.');
  const e=raw as Record<string,unknown>;
  for(const [key,min,max] of [['x',0,100],['y',0,100],['width',4,100],['height',2,100],['fontSize',8,120],['rotation',-180,180]] as const)if(typeof e[key]!=='number'||!Number.isFinite(e[key])||e[key]<min||e[key]>max)throw new Error('موضع العنصر أو حجمه غير صالح.');
  if(typeof e.id!=='string'||!e.id||e.id.length>80||ids.has(e.id)||!['text','ministry','vision',...Object.keys(ornamentLabels)].includes(e.kind as string)||typeof e.text!=='string'||e.text.length>1500||typeof e.label!=='string'||e.label.length>120||!canvasFonts.includes(e.font as typeof canvasFonts[number])||typeof e.color!=='string'||!/^#[0-9a-f]{6}$/i.test(e.color)||!['left','right','center'].includes(e.align as string)||['bold','italic','underline','autoFit','hidden'].some(key=>typeof e[key]!=='boolean')||(e.binding!==undefined&&(typeof e.binding!=='string'||!isCertificateField(e.binding)))||(e.x as number)+(e.width as number)>100.01||(e.y as number)+(e.height as number)>100.01)throw new Error('راجع بيانات عنصر الشهادة.');
  ids.add(e.id);
  if(e.presetField!==undefined&&(typeof e.presetField!=='string'||!isCertificateField(e.presetField)))throw new Error('حقل النص الجاهز غير صالح.');
  return {id:e.id,kind:e.kind,label:e.label,text:e.text,binding:e.binding,presetField:e.presetField,x:e.x,y:e.y,width:e.width,height:e.height,fontSize:e.fontSize,font:e.font,color:e.color,align:e.align,bold:e.bold,italic:e.italic,underline:e.underline,rotation:e.rotation,autoFit:e.autoFit,hidden:e.hidden} as CanvasElement;
 });
 if(c.marbleSeparated!==undefined&&typeof c.marbleSeparated!=='boolean')throw new Error('إعداد زخارف الرخام غير صالح.');
 return {version:1,height:c.height,...(c.marbleSeparated!==undefined?{marbleSeparated:c.marbleSeparated}:{}),elements};
}
export function newCanvasElement(id:string,kind:CanvasElement['kind']='text',binding?:CertificateField):CanvasElement{
 return {id,kind,label:kind==='ministry'?'شعار وزارة التعليم':kind==='vision'?'شعار رؤية 2030':kind in ornamentLabels?ornamentLabels[kind as CertificateOrnament]:binding==='name'?'اسم الطالب / الطالبة':'نص جديد',text:'',binding,presetField:binding,x:12,y:25,width:48,height:14,fontSize:32,font:'Tahoma',color:'#223c39',align:'center',bold:false,italic:false,underline:false,rotation:0,autoFit:true,hidden:false};
}
/** Textarea and inspector use the same plain-text update, keeping per-student names bound. */
export function editCanvasText(element:CanvasElement,text:string):CanvasElement{
 return element.kind==='text'&&element.binding!=='name'?{...element,text:text.slice(0,1500),binding:undefined}:element;
}
export function separateMarbleOrnaments(canvas:CertificateCanvas):CertificateCanvas{
 if(canvas.marbleSeparated)return canvas;
 if(canvas.elements.length>58)throw new Error('اترك مكانًا لعنصرين قبل فصل زخارف الخلفية.');
 const ids=new Set(canvas.elements.map(e=>e.id));
 const make=(kind:'medal'|'diploma',x:number,y:number,width:number,height:number)=>{let id='marble-'+kind;while(ids.has(id))id+='-copy';ids.add(id);return {...newCanvasElement(id,kind),x,y,width,height};};
 return {...canvas,marbleSeparated:true,elements:[make('medal',57,11,13,24),make('diploma',66,24,26,34),...canvas.elements]};
}
export const canvasElementText=(element:CanvasElement,values:CanvasValues)=>element.binding?values[element.binding]:element.text;
export function moveCanvasElement(element:CanvasElement,dx:number,dy:number,resize=false):CanvasElement{
 return resize?{...element,width:clamp(element.width+dx,4,100-element.x),height:clamp(element.height+dy,2,100-element.y)}:{...element,x:clamp(element.x+dx,0,100-element.width),y:clamp(element.y+dy,0,100-element.height)};
}
const fieldLabels:Partial<Record<CertificateField,string>>={title:'عنوان الشهادة',subtitle:'عنوان فرعي',intro:'مقدمة الشهادة',reason:'نص الشكر والتقدير',wish:'عبارة ختامية',name:'اسم الطالب / الطالبة',teacherRole:'صفة المعلم / المعلمة',teacher:'اسم المعلم / المعلمة',principalRole:'صفة المدير / المديرة',principal:'اسم المدير / المديرة',grade:'الصف'};
export function defaultCertificateCanvas(pack:CertificatePack,student:CertificateStudent,values:CanvasValues,blankMarble=true):CertificateCanvas{
 const marble=student.design==='marbleEnglish',custom=student.design==='custom',height=marble?742:custom?Math.round(1050/(pack.imageRatio??1.6)):700,canvas:CertificateCanvas={version:1,height,elements:[]};
 if(marble&&blankMarble)return canvas;
 const x=marble?7:10,width=marble?51:80;
 const add=(field:CertificateField,y:number,h:number,size:number,color='#223c39',left=x,w=width)=>{if(!values[field]&&field!=='name')return;canvas.elements.push({...newCanvasElement('field-'+field,'text',field),label:fieldLabels[field]||field,x:left,y,width:w,height:h,fontSize:clamp(size*(student.edits?.[field]?.size??100)/100,8,120),color,bold:['title','name','subtitle','teacherRole','principalRole'].includes(field),font:marble&&field==='title'?'Georgia':'Tahoma'});};
 if(!custom){canvas.elements.push({...newCanvasElement('logo-ministry','ministry'),x:marble?44:79,y:3,width:marble?12:11,height:11},{...newCanvasElement('logo-vision','vision'),x:7,y:3,width:13,height:11});}
 add('title',19,12,marble?52:42,marble?'#454934':'#24725e');
 if(values.subtitle)add('subtitle',31,5,22,'#dc63ae');
 add('intro',values.subtitle?36:33,7,21,marble?'#159a9a':'#42534c');
 add('name',43,11,38,'#5468db');
 add('reason',57,18,24);
 add('wish',76,7,20);
 add('teacherRole',86,4,17,'#7653ba',marble?37:57,marble?24:30);add('teacher',91,5,18,'#168b87',marble?37:57,marble?24:30);
 add('principalRole',86,4,17,'#7653ba',marble?8:13,marble?24:30);add('principal',91,5,18,'#168b87',marble?8:13,marble?24:30);
 return canvas;
}
/** Fit long text within its own rectangle rather than colliding with another element. */
export function canvasFontSize(element:CanvasElement,text:string,canvasHeight:number){
 if(!element.autoFit)return element.fontSize;
 const width=element.width*10.5-8,height=canvasHeight*element.height/100-6;
 function lines(size:number){let total=0;for(const line of text.split('\n')){let advance=0;for(const char of line)advance+=(/[\u0600-\u06ff]/.test(char)?.66:/[A-ZMW@]/.test(char)?.7:.56)*size;total+=Math.max(1,Math.ceil(advance/Math.max(1,width)));}return total;}
 let size=element.fontSize;while(size>4&&lines(size)*size*1.5>height)size-=.5;return Math.max(4,size);
}
const escape=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function canvasElementStyle(element:CanvasElement,text:string,height:number){return 'left:'+element.x+'%;top:'+element.y+'%;width:'+element.width+'%;height:'+element.height+'%;transform:rotate('+element.rotation+'deg);font-size:'+(canvasFontSize(element,text,height)/10.5)+'cqw;font-family:'+element.font+';color:'+element.color+';text-align:'+element.align+';font-weight:'+(element.bold?700:400)+';font-style:'+(element.italic?'italic':'normal')+';text-decoration:'+(element.underline?'underline':'none');}
export function certificateCanvasBackground(pack:CertificatePack,student:CertificateStudent){
 let background:string;
 if(student.design==='marbleEnglish')background=pack.ornaments===false?'':'<img class="cert-canvas-art" src="'+(student.canvas?.marbleSeparated?editableMarbleArt:marbleCertificateArt)+'" alt="">';
 else if(student.design==='custom')background=pack.image?'<img class="cert-canvas-art" src="'+pack.image+'" alt="">':'';
 else background='<div class="cert-canvas-background canvas-'+student.design+'"></div>';
 // A blank marble canvas stays free of automatically inserted wording.
 if(pack.decorate&&student.design!=='marbleEnglish')background+='<div class="cert-motifs" aria-hidden="true">'+(pack.subject==='english'?['A','B','Read','Learn','ABC']:pack.subject==='math'?['π','√','×','1 + 2']:['علم','نجاح','تميز']).map((text,i)=>'<span style="left:'+([5,84,12,72,45][i])+'%;top:'+([15,18,73,76,9][i])+'%">'+text+'</span>').join('')+'</div>';
 return background;
}
export const canvasImage=(kind:CanvasElement['kind'])=>kind==='ministry'?ministryTransparentLogo:kind==='vision'?visionLogo:kind in ornamentImages?ornamentImages[kind as CertificateOrnament]:'';
export function certificateCanvasBody(pack:CertificatePack,student:CertificateStudent,values:CanvasValues){
 const canvas=student.canvas!;
 return '<article class="cert-paper cert-canvas" style="aspect-ratio:1050/'+canvas.height+'">'+certificateCanvasBackground(pack,student)+canvas.elements.filter(element=>!element.hidden).map(element=>{const text=canvasElementText(element,values);return '<div class="cert-canvas-element" style="'+canvasElementStyle(element,text,canvas.height)+'">'+(element.kind==='text'?'<div class="cert-canvas-text" dir="auto">'+escape(text)+'</div>':'<img src="'+canvasImage(element.kind)+'" alt="'+escape(element.label)+'">')+'</div>';}).join('')+'</article>';
}
export const certificateCanvasCss=`
.cert-paper.cert-canvas{display:block;position:relative;container-type:inline-size;isolation:isolate;min-height:0!important;width:100%;padding:0!important;background:#fffdf7;border:0;border-radius:0;direction:ltr;overflow:hidden;font-family:Tahoma,Arial,sans-serif}
.cert-canvas-art,.cert-canvas-background{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;pointer-events:none;z-index:-1}.cert-canvas-element{position:absolute;box-sizing:border-box;line-height:1.5;transform-origin:center;display:flex;align-items:center;overflow:hidden;padding:3px 4px}.cert-canvas-text{width:100%;max-height:100%;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.5;font:inherit;text-decoration:inherit}.cert-canvas-element>img{width:100%;height:100%;object-fit:contain}.canvas-gold{background:radial-gradient(ellipse at center,#fff 30%,#faf0d8);border:8px double #b8964b}.canvas-blue{border-bottom:10px solid #19375e;background:linear-gradient(100deg,#182f53 0 5%,#fff 5% 100%)}.canvas-green{border-top:12px solid #237d65;background:linear-gradient(140deg,#fff 65%,#dceee1)}.canvas-joy{background:radial-gradient(ellipse at top left,#ffe6b4,transparent 35%),radial-gradient(ellipse at bottom right,#bddfd5,transparent 45%),#fffdfa}.canvas-schoolBlue{--canvas-color:#208cf0;background:#eff8ff}.canvas-schoolGreen{--canvas-color:#16816c;background:#f0faf5}.canvas-schoolViolet{--canvas-color:#7653ba;background:#f7f2ff}.cert-canvas-background[class*=canvas-school]:after{content:'';position:absolute;bottom:-13%;left:-8%;width:116%;height:24%;background:var(--canvas-color);border-radius:50% 50% 0 0;opacity:.85}.cert-canvas-background[class*=canvas-school]{border:2px solid var(--canvas-color)}
@media print{.cert-paper.cert-canvas{min-height:0!important;width:100%;padding:0!important;break-inside:avoid}.cert-canvas *{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
`;
