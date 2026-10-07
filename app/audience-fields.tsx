'use client';
import type {AudienceSettings,Gender} from '@/lib/audience';
export default function AudienceFields({value,onChange}:{value:AudienceSettings;onChange:(patch:AudienceSettings)=>void}){
  return <><label>فئة الأسماء<select value={value.studentGender||'male'} onChange={e=>onChange({studentGender:e.target.value as Gender})}><option value="male">طلاب</option><option value="female">طالبات</option></select></label><label>صفة معلم المادة<select value={value.teacherGender||'male'} onChange={e=>onChange({teacherGender:e.target.value as Gender})}><option value="male">معلم</option><option value="female">معلمة</option></select></label><label>صفة مدير المدرسة<select value={value.principalGender||'male'} onChange={e=>onChange({principalGender:e.target.value as Gender})}><option value="male">مدير</option><option value="female">مديرة</option></select></label></>;
}
