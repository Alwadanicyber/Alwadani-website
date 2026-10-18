import {emptyPack,type CertificatePack,type CertificateStudent,type CertificatePreset} from './certificates';
export const certificatePreset=(student:CertificateStudent,pack:CertificatePack):CertificatePreset=>student.design==='custom'?student.previousDesign||pack.previousDesign||'gold':student.design;
/** The uploaded background is shared by all custom certificates in a pack. */
export function removeCertificateImage(pack:CertificatePack):CertificatePack{
 const draft=pack.draftCertificate;
 return {...pack,draftCertificate:draft?.design==='custom'?{...draft,design:draft.previousDesign||pack.previousDesign||'gold',canvas:draft.canvas?{...draft.canvas,height:(draft.previousDesign||pack.previousDesign)==='marbleEnglish'?742:700}:undefined,previousDesign:undefined}:draft,image:'',imageRatio:undefined,previousDesign:undefined,nameY:emptyPack.nameY,textY:emptyPack.textY,signY:emptyPack.signY,showTitle:emptyPack.showTitle,students:pack.students.map(student=>student.design==='custom'?{...student,design:certificatePreset(student,pack),canvas:student.canvas?{...student.canvas,height:certificatePreset(student,pack)==='marbleEnglish'?742:700}:undefined,previousDesign:undefined}:student)};
}
