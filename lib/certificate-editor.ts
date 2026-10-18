import {defaultCertificateCanvas,certificateCanvasValues,type CertificateCanvas,type CanvasElement} from './certificate-canvas';
import {certificateCopy,type CertificatePack,type CertificateStudent} from './certificates';
import type {CertificateField,CertificateFieldEdit} from './certificate-fields';
export function certificatePreviewStudent(pack:CertificatePack,index=0):CertificateStudent{
 return pack.students[index]||{id:'preview',name:pack.draftNames?.split(/\r?\n/).find(name=>name.trim())?.trim()||(pack.studentGender==='female'?'اسم الطالبة':'اسم الطالب'),design:pack.image?'custom':'gold',text:'creative',customText:'تقديراً لتميزك واجتهادك، متمنين لك دوام التوفيق والنجاح.',...pack.draftCertificate};
}
function draft(student:CertificateStudent){const {id,name,...settings}=student;return settings;}
export function changeCertificateStudent(pack:CertificatePack,index:number,all:boolean,patch:Partial<CertificateStudent>):CertificatePack{
 const apply=(student:CertificateStudent)=>{const next={...student,...patch,...(patch.design==='marbleEnglish'&&student.text==='creative'&&patch.text===undefined?{text:'englishAppreciation' as const}:{})};return patch.text!==undefined?applyCertificateCopy(pack,student,next,copyFields):patch.customText!==undefined?applyCertificateCopy(pack,student,next,['reason']):next;};
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

export const canvasValuesFor=(pack:CertificatePack,student:CertificateStudent)=>certificateCanvasValues(pack,student,certificateCopy(pack,student));
export const canvasFor=(pack:CertificatePack,student:CertificateStudent)=>student.canvas||defaultCertificateCanvas(pack,student,canvasValuesFor(pack,student),false);
const copyFields=['title','subtitle','intro','reason','wish'] as const;
// Recognize older canvases too, including preset text that was edited into a literal.
function copyField(element:CanvasElement):typeof copyFields[number]|undefined{
 if(element.kind!=='text')return;
 return copyFields.find(field=>element.presetField===field||element.binding===field||element.id==='field-'+field||({title:['عنوان الشهادة'],subtitle:['عنوان فرعي','العنوان الفرعي'],intro:['مقدمة الشهادة','عبارة التقديم'],reason:['نص التقدير','نص الشكر والتقدير'],wish:['عبارة ختامية','عبارة التمنّي']}[field]).includes(element.label));
}
/** Selecting ready wording updates the visible copy, including a previously blank canvas. */
function applyCertificateCopy(pack:CertificatePack,before:CertificateStudent,student:CertificateStudent,fields:readonly typeof copyFields[number][]):CertificateStudent{
 const edits={...student.edits};
 for(const field of fields){const edit=edits[field];if(edit){if(edit.size!==undefined)edits[field]={size:edit.size};else delete edits[field];}}
 const next={...student,edits},values=canvasValuesFor(pack,next),canvas=canvasFor(pack,before),defaults=defaultCertificateCanvas(pack,next,values,false);
 if(!canvas.elements.some(element=>element.kind==='text')){
  const elements=[...canvas.elements],ids=new Set(elements.map(e=>e.id));
  for(const element of defaults.elements){if(element.kind!=='text'&&elements.some(e=>e.kind===element.kind))continue;let id=element.id;while(ids.has(id))id+='-preset';ids.add(id);elements.push({...element,id});}
  return {...next,canvas:{...defaults,...canvas,elements}};
 }
 const previous=defaultCertificateCanvas(pack,before,canvasValuesFor(pack,before),false),seen=new Set<string>();
 const elements=canvas.elements.map(element=>{
  const field=copyField(element);if(!field||!fields.includes(field))return element;
  seen.add(field);
  const oldDefault=previous.elements.find(e=>e.binding===field),newDefault=defaults.elements.find(e=>e.binding===field);
  const placement=oldDefault&&newDefault&&(['x','y','width','height'] as const).every(key=>element[key]===oldDefault[key])?{x:newDefault.x,y:newDefault.y,width:newDefault.width,height:newDefault.height}:{};
  return {...element,...placement,presetField:field,binding:field,text:'',hidden:!values[field]};
 });
 const usedIds=new Set(elements.map(e=>e.id));
 for(const element of defaults.elements){const field=element.binding;if(!field||!fields.includes(field as typeof copyFields[number])||seen.has(field))continue;let id=element.id;while(usedIds.has(id))id+='-preset';usedIds.add(id);elements.push({...element,id});}
 if(elements.length>60)throw new Error('احذف بعض العناصر لإضافة النص الجاهز؛ الحد الأقصى 60 عنصرًا للشهادة.');
 return {...next,canvas:{...canvas,elements}};
}
export function changeCertificateCanvas(pack:CertificatePack,index:number,all:boolean,change:(canvas:CertificateCanvas)=>CertificateCanvas):CertificatePack{
 const apply=(student:CertificateStudent)=>({...student,canvas:change(canvasFor(pack,student))});
 return {...pack,draftCertificate:draft(apply(certificatePreviewStudent(pack,index))),students:pack.students.map((s,i)=>all||i===index?apply(s):s)};
}
export function chooseCertificateDesign(pack:CertificatePack,index:number,all:boolean,design:CertificateStudent['design']):CertificatePack{
 const next=changeCertificateStudent(pack,index,all,{design});
 return changeCertificateCanvas(next,index,all,()=>defaultCertificateCanvas(next,certificatePreviewStudent(next,index),canvasValuesFor(next,certificatePreviewStudent(next,index)),design==='marbleEnglish'));
}
export function upgradeCertificateCanvases(pack:CertificatePack):CertificatePack{
 const preview=certificatePreviewStudent(pack);
 return {...pack,draftCertificate:{...draft(preview),canvas:canvasFor(pack,preview)},students:pack.students.map(student=>({...student,canvas:canvasFor(pack,student)}))};
}
