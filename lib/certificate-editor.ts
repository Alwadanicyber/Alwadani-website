import {certificateCopy,type CertificatePack,type CertificateStudent} from './certificates';
import type {CertificateField,CertificateFieldEdit} from './certificate-fields';
export function certificatePreviewStudent(pack:CertificatePack,index=0):CertificateStudent{
 return pack.students[index]||{id:'preview',name:pack.draftNames?.split(/\r?\n/).find(name=>name.trim())?.trim()||(pack.studentGender==='female'?'اسم الطالبة':'اسم الطالب'),design:pack.image?'custom':'gold',text:'creative',customText:'تقديراً لتميزك واجتهادك، متمنين لك دوام التوفيق والنجاح.',...pack.draftCertificate};
}
function draft(student:CertificateStudent){const {id,name,...settings}=student;return settings;}
export function changeCertificateStudent(pack:CertificatePack,index:number,all:boolean,patch:Partial<CertificateStudent>):CertificatePack{
 const apply=(student:CertificateStudent)=>({...student,...patch,...(patch.design==='marbleEnglish'&&student.text==='creative'&&patch.text===undefined?{text:'englishAppreciation' as const}:{})});
 return {...pack,draftCertificate:draft(apply(certificatePreviewStudent(pack,index))),students:pack.students.map((s,i)=>all||i===index?apply(s):s)};
}
export function changeCertificateField(pack:CertificatePack,index:number,all:boolean,field:CertificateField,patch:CertificateFieldEdit|null):CertificatePack{
 if(field==='name'&&patch?.text!==undefined){const name=patch.text;const students=pack.students.map((s,i)=>i===index?{...s,name}:s);return {...pack,students,draftNames:students.length?students.map(s=>s.name).join('\n'):name};}
 const apply=(s:CertificateStudent)=>{const edits={...s.edits};if(patch===null)delete edits[field];else edits[field]={...edits[field],...patch};return {...s,edits};};
 return {...pack,draftCertificate:draft(apply(certificatePreviewStudent(pack,index))),students:pack.students.map((s,i)=>all||i===index?apply(s):s)};
}
/** Regenerating a list retains each matching student's chosen background and edits. */
export function createCertificateStudents(pack:CertificatePack,names:string[],makeId:()=>string):CertificatePack{
 const used=new Set<string>(),preview=certificatePreviewStudent(pack),students=names.map((name,i)=>{const same=pack.students[i]?.name===name&&!used.has(pack.students[i].id)?pack.students[i]:pack.students.find(s=>s.name===name&&!used.has(s.id));if(same){used.add(same.id);return same;}const row=pack.students[i];if(row&&!used.has(row.id)&&!names.includes(row.name)){used.add(row.id);return {...row,name};}return {...preview,...pack.draftCertificate,id:makeId(),name};});
 return {...pack,students,draftNames:names.join('\n')};
}
export function certificateFieldValue(pack:CertificatePack,student:CertificateStudent,field:CertificateField){
 if(field==='name')return student.name;
 if(student.edits?.[field]?.text!==undefined)return student.edits[field]!.text!;
 const copy=certificateCopy(pack,student),english=copy.language==='en';
 const values={...copy,name:student.name,teacher:pack.teacher,principal:pack.principal,teacherRole:english&&student.design==='marbleEnglish'?'YOUR TEACHER':pack.teacherGender==='female'?'معلمة المادة':'معلم المادة',principalRole:english&&student.design==='marbleEnglish'?pack.principalGender==='female'?'THE HEADMISTRESS':'THE HEADMASTER':pack.principalGender==='female'?'مديرة المدرسة':'مدير المدرسة',grade:[pack.grade,pack.letter].filter(Boolean).join(' '),kicker:student.design==='joy'?'YOUR BRIGHT FUTURE':'WITH APPRECIATION'};
 return values[field]||'';
}
/** Position changes never select a different background. */
export function changeCertificatePlacement(pack:CertificatePack,patch:Partial<Pick<CertificatePack,'nameY'|'textY'|'signY'|'showTitle'>>):CertificatePack{return {...pack,...patch};}
