export type Gender='male'|'female';
export type AudienceSettings={studentGender?:Gender;teacherGender?:Gender;principalGender?:Gender};
export function validateGender(value:unknown):Gender{
  if(value===undefined)return 'male';
  if(value!=='male'&&value!=='female')throw new Error('اختر صيغة صحيحة للطلاب والتوقيعات.');
  return value;
}
export function validateAudience(value:Record<string,unknown>):AudienceSettings{
  return {studentGender:validateGender(value.studentGender),teacherGender:validateGender(value.teacherGender),principalGender:validateGender(value.principalGender)};
}
export function audienceWords(value:AudienceSettings){
  const female=value.studentGender==='female';
  return {recipient:female?'للطالبة':'للطالب',student:female?'الطالبة':'الطالب',students:female?'الطالبات':'الطلاب',noun:female?'طالبة':'طالب',plural:female?'طالبات':'طلاب',newStudent:female?'طالبة جديدة':'طالب جديد',teacher:value.teacherGender==='female'?'المعلمة':'المعلم',teacherRole:value.teacherGender==='female'?'معلمة المادة':'معلم المادة',principal:value.principalGender==='female'?'المديرة':'المدير',principalRole:value.principalGender==='female'?'مديرة المدرسة':'مدير المدرسة',absent:female?'غائبة':'غائب',done:female?'أنجزت المهمة':'أنجز المهمة',missing:female?'لم تنجز المهمة':'لم ينجز المهمة',homeworkDone:female?'حلّت الواجب':'حل الواجب',homeworkMissing:female?'لم تحل':'لم يحل'};
}
