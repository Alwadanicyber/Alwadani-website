import type {CertificatePack,CertificateStudent} from './certificates';
import {certificatePageSize} from './export-page';
export function certificatePrintSize(pack:CertificatePack,student:CertificateStudent){
 const height=student.canvas?.height??(student.design==='marbleEnglish'?1050*1054/1492:student.design==='custom'?1050/(pack.imageRatio??1.6):700);
 return certificatePageSize(1050,height);
}
/** Named pages preserve each certificate's own dimensions, including mixed batches. */
export function certificatePrintStyle(pack:CertificatePack,students:CertificateStudent[]){
 return '@page{size:A4 landscape;margin:0}'+students.map((student,i)=>{const {width,height}=certificatePrintSize(pack,student);return '@page certificate-page-'+i+'{size:'+width+'mm '+height+'mm;margin:0}';}).join('')+`@media print{
 html,body{margin:0!important;padding:0!important;min-width:0!important;width:auto!important;height:auto!important;background:#fff!important}
 .teacher-workspace,.workspace-layout,.workspace-content,.workspace-content main.certificate-studio{display:block!important;margin:0!important;padding:0!important;border:0!important;max-width:none!important;width:auto!important;min-height:0!important;box-shadow:none!important;overflow:visible!important}
 .teacher-topbar,.workspace-sidebar,.workspace-nav-backdrop{display:none!important}
 .cert-print-pages{display:block!important;margin:0!important;padding:0!important;border:0!important}
 .cert-print-break{display:block!important;box-sizing:border-box;width:var(--certificate-page-width)!important;height:var(--certificate-page-height)!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important;break-before:auto!important;break-after:page;break-inside:avoid}
 .cert-print-break:last-child{break-after:auto}
 .cert-print-break>.cert-paper{box-sizing:border-box;width:100%!important;max-width:none!important;height:100%!important;min-height:0!important;margin:0!important;box-shadow:none!important;border-radius:0!important}
 .cert-print-break>.cert-canvas{padding:0!important;border:0!important}
 .cert-print-break *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
 }`;
}
export function certificatePrintSection(pack:CertificatePack,student:CertificateStudent,index:number,body:string){
 const {width,height}=certificatePrintSize(pack,student);
 return '<section class="cert-print-break" style="page:certificate-page-'+index+';--certificate-page-width:'+width+'mm;--certificate-page-height:'+height+'mm">'+body+'</section>';
}
