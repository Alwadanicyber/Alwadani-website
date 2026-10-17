export const certificateFieldLabels={title:'عنوان الشهادة',subtitle:'العنوان الفرعي',intro:'عبارة التقديم',name:'اسم الطالب / الطالبة',reason:'نص التقدير',wish:'عبارة التمنّي',teacherRole:'صفة المعلم / المعلمة',teacher:'اسم المعلم / المعلمة',principalRole:'صفة المدير / المديرة',principal:'اسم المدير / المديرة',grade:'الصف',kicker:'العبارة العلوية'};
export type CertificateField=keyof typeof certificateFieldLabels;
export type CertificateFieldEdit={text?:string;size?:number};
export type CertificateFieldEdits=Partial<Record<CertificateField,CertificateFieldEdit>>;
export const isCertificateField=(value:string):value is CertificateField=>Object.hasOwn(certificateFieldLabels,value);
export function validateCertificateEdits(value:unknown):CertificateFieldEdits|undefined{
 if(value===undefined)return undefined;
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('تعديلات نصوص الشهادة غير صالحة.');
 const edits:CertificateFieldEdits={};
 for(const [key,raw] of Object.entries(value)){
  if(!isCertificateField(key)||!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('تعديلات نصوص الشهادة غير صالحة.');
  const edit=raw as Record<string,unknown>,max=['reason','wish'].includes(key)?1500:120;
  if(edit.text!==undefined&&(key==='name'||typeof edit.text!=='string'||edit.text.length>max))throw new Error('نص الشهادة طويل أو غير صالح.');
  if(edit.size!==undefined&&(typeof edit.size!=='number'||!Number.isFinite(edit.size)||edit.size<50||edit.size>200))throw new Error('حجم نص الشهادة غير صالح.');
  edits[key]={...(edit.text!==undefined?{text:edit.text as string}:{}),...(edit.size!==undefined?{size:edit.size as number}:{})};
 }
 return edits;
}
const escape=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function certificateFieldHtml(edits:CertificateFieldEdits|undefined,field:CertificateField,fallback:string){
 const edit=edits?.[field],text=field==='name'?fallback:edit?.text??fallback;
 return '<span data-cert-field="'+field+'"'+(edit?.size!==undefined?' style="font-size:'+edit.size+'%"':'')+'>'+escape(text)+'</span>';
}
/** Interactivity belongs only to the editor; printed and downloaded copies stay plain. */
export function interactiveCertificateHtml(html:string){return html.replace(/<span data-cert-field="(\w+)"/g,(match,field)=>match+' role="button" tabindex="0" aria-label="تعديل '+certificateFieldLabels[field as CertificateField]+'"');}
