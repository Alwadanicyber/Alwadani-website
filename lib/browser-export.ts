import {recordHtml} from './record-export';
import {certificatesHtml,type CertificatePack,type CertificateStudent} from './certificates';
import {isSchoolBlank} from './manual-record';
import type {RecordContent} from './records';
import {ministryReferenceLogo,visionLogo} from './education-brand';
export type ExportProgress=(message:string)=>void;
export function downloadBlob(blob:Blob,name:string){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
export type CapturedPage={data:string;width:number;height:number};
export const imageBytes=(data:string)=>Uint8Array.from(atob(data.split(',')[1]),char=>char.charCodeAt(0));
let logos:Promise<{ministry:Uint8Array;vision:Uint8Array}>|undefined;
export function wordLogos(){return logos??=new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{const canvas=document.createElement('canvas');canvas.width=400;canvas.height=202;const context=canvas.getContext('2d');if(!context){reject(new Error('تعذّر تجهيز الشعارات.'));return;}context.drawImage(image,0,0,400,202);resolve({ministry:imageBytes(ministryReferenceLogo),vision:imageBytes(canvas.toDataURL('image/png'))});};image.onerror=()=>{logos=undefined;reject(new Error('تعذّر تجهيز الشعارات.'));};image.src=visionLogo;});}
async function capturePages(html:string,selector:string,width:number,progress:ExportProgress,onPage:(page:CapturedPage,index:number,total:number)=>Promise<void>|void){
  const frame=document.createElement('iframe');frame.title='تجهيز ملف التنزيل';frame.setAttribute('aria-hidden','true');frame.setAttribute('sandbox','allow-same-origin');Object.assign(frame.style,{position:'fixed',left:'-20000px',top:'0',width:width+'px',height:'1200px',border:'0',pointerEvents:'none'});
  const loaded=new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('تعذّر تجهيز المعاينة. أعد المحاولة.')),20000);frame.onload=()=>{clearTimeout(timer);resolve();};});
  try{
    frame.srcdoc=html;document.body.appendChild(frame);await loaded;const doc=frame.contentDocument;if(!doc)throw new Error('تعذّر فتح المعاينة.');await doc.fonts.ready;
    await Promise.all(Array.from(doc.images).map(image=>image.decode()));
    const {default:html2canvas}=await import('html2canvas'),pages=Array.from(doc.querySelectorAll<HTMLElement>(selector));if(!pages.length)throw new Error('لا توجد صفحات للتنزيل.');
    for(let i=0;i<pages.length;i++){
      progress('جارٍ تجهيز الصفحة '+(i+1)+' من '+pages.length+'…');
      const canvas=await html2canvas(pages[i],{scale:2,backgroundColor:'#ffffff',logging:false,windowWidth:width,windowHeight:1200,scrollX:0,scrollY:0});
      await onPage({data:canvas.toDataURL('image/png'),width:canvas.width,height:canvas.height},i,pages.length);canvas.width=0;canvas.height=0;await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
    }
  }finally{frame.remove();}
}
async function pdfFromHtml(html:string,selector:string,portrait:boolean,progress:ExportProgress){
  const {jsPDF}=await import('jspdf'),pdf=new jsPDF({orientation:portrait?'portrait':'landscape',unit:'mm',format:'a4',compress:true});
  await capturePages(html,selector,portrait?840:1120,progress,(page,index)=>{if(index)pdf.addPage();const pageWidth=pdf.internal.pageSize.getWidth(),pageHeight=pdf.internal.pageSize.getHeight(),width=pageWidth-20,height=page.height*width/page.width,ratio=Math.min(1,(pageHeight-20)/height);pdf.addImage(page.data,'PNG',10,10,width*ratio,height*ratio,undefined,'FAST');});
  return pdf.output('blob');
}
export const recordPdf=(record:RecordContent,progress:ExportProgress)=>pdfFromHtml(recordHtml(record),isSchoolBlank(record)?'.manual-sheet':'.record-print-page',isSchoolBlank(record),progress);
export const certificatesPdf=(pack:CertificatePack,students:CertificateStudent[],progress:ExportProgress)=>pdfFromHtml(certificatesHtml(pack,students),'.cert-paper',false,progress);
export async function certificatePng(pack:CertificatePack,student:CertificateStudent,progress:ExportProgress){let result:Blob|undefined;await capturePages(certificatesHtml(pack,[student]),'.cert-paper',1120,progress,async page=>{result=await(await fetch(page.data)).blob();});if(!result)throw new Error('تعذّر تجهيز الصورة.');return result;}
export async function certificateImages(pack:CertificatePack,students:CertificateStudent[],progress:ExportProgress){const images:CapturedPage[]=[];await capturePages(certificatesHtml(pack,students),'.cert-paper',1120,progress,page=>{images.push(page);});return images;}
