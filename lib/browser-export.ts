import {recordHtml} from './record-export';
import {certificatesHtml,type CertificatePack,type CertificateStudent} from './certificates';
import {isSchoolBlank} from './manual-record';
import type {RecordContent} from './records';
import {ministryReferenceLogo,visionLogo} from './education-brand';
import {portraitRecord} from './record-layout';
import {centeredPageImage} from './export-page';
import {recordNameLines} from './record-name-layout';
export type ExportProgress=(message:string)=>void;
export function downloadBlob(blob:Blob,name:string){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
export type CapturedPage={data:string;width:number;height:number};
export const imageBytes=(data:string)=>Uint8Array.from(atob(data.split(',')[1]),char=>char.charCodeAt(0));
let logos:Promise<{ministry:Uint8Array;vision:Uint8Array}>|undefined;
export function wordLogos(){return logos??=new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{const canvas=document.createElement('canvas');canvas.width=400;canvas.height=202;const context=canvas.getContext('2d');if(!context){reject(new Error('تعذّر تجهيز الشعارات.'));return;}context.drawImage(image,0,0,400,202);resolve({ministry:imageBytes(ministryReferenceLogo),vision:imageBytes(canvas.toDataURL('image/png'))});};image.onerror=()=>{logos=undefined;reject(new Error('تعذّر تجهيز الشعارات.'));};image.src=visionLogo;});}
function paginateRecordPages(doc:Document,selector:string){
  if(!doc.body.classList.contains('record-output'))return;
  const initial=Array.from(doc.querySelectorAll<HTMLElement>(selector));
  for(let index=0;index<initial.length;index++){
    const page=initial[index];
    // The editable report has a separate metadata table before the results table.
    const rows=page.querySelector<HTMLTableSectionElement>('.record-data-table tbody,.manual-table tbody');if(!rows)continue;
    const bounds=page.getBoundingClientRect(),bottom=bounds.bottom-parseFloat(getComputedStyle(page).paddingBottom),footer=page.querySelector('footer');
    while(footer&&footer.getBoundingClientRect().bottom>bottom+1){
      if(rows.children.length<2)throw new Error('نص أحد الصفوف طويل جدًا لصفحة واحدة. اختصره أو استخدم Word.');
      let next=page.nextElementSibling as HTMLElement|null;
      if(!next||next.dataset.recordGroup!==page.dataset.recordGroup){
        next=page.cloneNode(true) as HTMLElement;next.querySelector<HTMLTableSectionElement>('.record-data-table tbody,.manual-table tbody')!.replaceChildren();
        next.querySelectorAll('.record-cliche,.record-cliche-details,.record-cliche-meta,.manual-header,.manual-meta').forEach(node=>node.remove());
        if(!next.querySelector('.record-continuation')){const label=doc.createElement('p');label.className='record-continuation';label.textContent='تتمة الكشف';next.insertBefore(label,next.firstChild);}
        page.parentElement!.insertBefore(next,page.nextSibling);initial.splice(index+1,0,next);
      }
      next.querySelector<HTMLTableSectionElement>('.record-data-table tbody,.manual-table tbody')!.insertBefore(rows.lastElementChild!,next.querySelector<HTMLTableSectionElement>('.record-data-table tbody,.manual-table tbody')!.firstChild);
    }
  }
  initial.forEach((page,i)=>{const counter=page.querySelector('.output-page-number');if(counter)counter.textContent='صفحة '+(i+1)+' من '+initial.length;const rows=page.querySelector('.manual-table tbody'),caption=page.querySelector('.manual-sr-only');if(rows&&caption){const first=rows.firstElementChild?.firstElementChild?.textContent,last=rows.lastElementChild?.firstElementChild?.textContent;caption.textContent=caption.textContent?.replace(/( — (?:الطلاب|الطالبات) ).*$/,'$1'+first+' إلى '+last)||'';}});
}
function captureRecordNames(doc:Document){
  if(!doc.body.classList.contains('record-output'))return;
  for(const cell of doc.querySelectorAll<HTMLElement>('.record-data-table tbody .student-name,.manual-table tbody .manual-name')){
    const name=cell.textContent?.trim();if(!name)continue;
    const style=doc.defaultView!.getComputedStyle(cell),fontSize=parseFloat(style.fontSize),width=Math.max(1,cell.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight));
    const canvas=doc.createElement('canvas'),context=canvas.getContext('2d');if(!context)throw new Error('تعذّر ضبط أسماء الكشف.');
    const font=style.fontWeight+' '+fontSize+'px '+style.fontFamily;context.font=font;context.direction='rtl';
    const lines=recordNameLines(name,width,text=>context.measureText(text).width),lineHeight=Math.max(fontSize*1.55,parseFloat(style.lineHeight)||0),height=lines.length*lineHeight;
    canvas.width=Math.ceil(width*3);canvas.height=Math.ceil(height*3);canvas.style.cssText='display:block;margin:0 auto;width:'+width+'px;height:'+height+'px';
    context.scale(3,3);context.font=font;context.fillStyle=style.color;context.direction='rtl';context.textAlign='center';context.textBaseline='alphabetic';
    lines.forEach((line,index)=>{const metrics=context.measureText(line),ascent=metrics.actualBoundingBoxAscent,descent=metrics.actualBoundingBoxDescent;context.fillText(line,width/2,(index+.5)*lineHeight+(ascent-descent)/2);});
    cell.replaceChildren(canvas);
  }
}
async function nativeRecordPage(doc:Document,page:HTMLElement){
  const bounds=page.getBoundingClientRect(),width=bounds.width,height=bounds.height;
  const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width',String(width));svg.setAttribute('height',String(height));svg.setAttribute('viewBox','0 0 '+width+' '+height);
  const foreign=doc.createElementNS('http://www.w3.org/2000/svg','foreignObject');foreign.setAttribute('width',String(width));foreign.setAttribute('height',String(height));
  const wrapper=doc.createElementNS('http://www.w3.org/1999/xhtml','div');wrapper.setAttribute('class','record-output');wrapper.setAttribute('dir','rtl');
  wrapper.setAttribute('style','width:'+width+'px;height:'+height+'px;margin:0!important;padding:0!important;background:#fff!important;');
  const style=doc.createElementNS('http://www.w3.org/1999/xhtml','style');style.textContent=Array.from(doc.querySelectorAll('style')).map(node=>node.textContent).join('\n');wrapper.appendChild(style);
  const clone=page.cloneNode(true) as HTMLElement;clone.style.setProperty('margin','0','important');
  // Canvas pixels are not included in XML. Embed each name image before serializing.
  const sources=Array.from(page.querySelectorAll('canvas'));
  clone.querySelectorAll('canvas').forEach((node,index)=>{const image=doc.createElement('img');image.src=sources[index].toDataURL('image/png');image.style.cssText=node.style.cssText;node.replaceWith(image);});
  wrapper.appendChild(clone);foreign.appendChild(wrapper);svg.appendChild(foreign);
  const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(svg));await image.decode();
  const canvas=doc.createElement('canvas');canvas.width=Math.ceil(width*2);canvas.height=Math.ceil(height*2);const context=canvas.getContext('2d');if(!context)throw new Error('تعذّر تجهيز صفحة الكشف.');
  context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.scale(2,2);context.drawImage(image,0,0,width,height);return canvas;
}
async function capturePages(html:string,selector:string,width:number,progress:ExportProgress,onPage:(page:CapturedPage,index:number,total:number)=>Promise<void>|void){
  const frame=document.createElement('iframe');frame.title='تجهيز ملف التنزيل';frame.setAttribute('aria-hidden','true');frame.setAttribute('sandbox','allow-same-origin');Object.assign(frame.style,{position:'fixed',left:'-20000px',top:'0',width:width+'px',height:'1200px',border:'0',pointerEvents:'none'});
  const loaded=new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('تعذّر تجهيز المعاينة. أعد المحاولة.')),20000);frame.onload=()=>{clearTimeout(timer);resolve();};});
  try{
    frame.srcdoc=html;document.body.appendChild(frame);await loaded;const doc=frame.contentDocument;if(!doc)throw new Error('تعذّر فتح المعاينة.');await doc.fonts.ready;
    const svgCache=new Map<string,string>();
    await Promise.all(Array.from(doc.images).map(async image=>{await image.decode();const source=image.src;if(source.startsWith('data:image/svg+xml')){let png=svgCache.get(source);if(!png){const canvas=doc.createElement('canvas');canvas.width=Math.max(400,image.naturalWidth*2);canvas.height=Math.round(canvas.width*image.naturalHeight/image.naturalWidth);const ctx=canvas.getContext('2d');if(!ctx)throw new Error('تعذّر تجهيز الرسم.');ctx.drawImage(image,0,0,canvas.width,canvas.height);png=canvas.toDataURL('image/png');svgCache.set(source,png);canvas.width=0;canvas.height=0;}image.src=png;await image.decode();}}));
    captureRecordNames(doc);paginateRecordPages(doc,selector);
    const {default:html2canvas}=await import('html2canvas'),pages=Array.from(doc.querySelectorAll<HTMLElement>(selector));if(!pages.length)throw new Error('لا توجد صفحات للتنزيل.');
    for(let i=0;i<pages.length;i++){
      progress('جارٍ تجهيز الصفحة '+(i+1)+' من '+pages.length+'…');
      const canvas=doc.body.classList.contains('record-output')?await nativeRecordPage(doc,pages[i]):await html2canvas(pages[i],{scale:2,backgroundColor:'#ffffff',logging:false,windowWidth:width,windowHeight:1200,scrollX:0,scrollY:0});
      await onPage({data:canvas.toDataURL('image/png'),width:canvas.width,height:canvas.height},i,pages.length);canvas.width=0;canvas.height=0;await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
    }
  }finally{frame.remove();}
}
async function pdfFromHtml(html:string,selector:string,portrait:boolean,progress:ExportProgress,fullPage=false){
  const {jsPDF}=await import('jspdf'),pdf=new jsPDF({orientation:portrait?'portrait':'landscape',unit:'mm',format:'a4',compress:true});
  await capturePages(html,selector,portrait?840:1160,progress,(page,index)=>{if(index)pdf.addPage();const box=centeredPageImage(page.width,page.height,pdf.internal.pageSize.getWidth(),pdf.internal.pageSize.getHeight(),fullPage?0:10);pdf.addImage(page.data,'PNG',box.x,box.y,box.width,box.height,undefined,'FAST');});
  return pdf.output('blob');
}
export const recordPdf=(record:RecordContent,progress:ExportProgress)=>pdfFromHtml(recordHtml(record),isSchoolBlank(record)?'.manual-sheet':'.record-print-page',portraitRecord(record),progress,true);
export const certificatesPdf=(pack:CertificatePack,students:CertificateStudent[],progress:ExportProgress)=>pdfFromHtml(certificatesHtml(pack,students),'.cert-paper',false,progress);
export async function certificatePng(pack:CertificatePack,student:CertificateStudent,progress:ExportProgress){let result:Blob|undefined;await capturePages(certificatesHtml(pack,[student]),'.cert-paper',1120,progress,async page=>{result=await(await fetch(page.data)).blob();});if(!result)throw new Error('تعذّر تجهيز الصورة.');return result;}
export async function certificateImages(pack:CertificatePack,students:CertificateStudent[],progress:ExportProgress){const images:CapturedPage[]=[];await capturePages(certificatesHtml(pack,students),'.cert-paper',1120,progress,page=>{images.push(page);});return images;}
