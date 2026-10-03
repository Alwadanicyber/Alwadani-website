'use client';
import { useState, type FormEvent } from 'react';
import { GraduationCap, LockKeyhole } from 'lucide-react';

export default function TeacherLogin({ mode }: { mode: 'login' | 'setup' | 'unconfigured' }) {
  const [recover, setRecover] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const creating = mode === 'setup' || recover;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (creating && data.get('password') !== data.get('confirmPassword')) { setError('كلمتا المرور غير متطابقتين.'); return; }
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/teacher/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: recover ? 'recover' : mode, username: data.get('username'), password: data.get('password'), ...(creating ? { setupKey: data.get('setupKey') } : {}) }) });
      const result = await response.json() as {error?:string};
      if (!response.ok) throw new Error(result.error || 'تعذر تسجيل الدخول.');
      window.location.replace('/teacher');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر الاتصال. حاول مجددًا.'); }
    finally { setBusy(false); }
  }
  return <div dir="rtl"><header className="topbar"><a className="brand" href="/"><span className="brand-mark">A<span>✦</span></span><span className="wordmark">ALWADANI<small>LEARNING STUDIO</small></span></a><a className="secondary" href="/">صفحة الطلاب</a></header><main className="teacher-login"><section className="standalone"><div className="login-icon"><GraduationCap size={30} /></div><div className="eyebrow">مساحة المعلم</div><h1>{mode === 'unconfigured' ? 'إعداد مساحة المعلم' : recover ? 'استعادة حسابك' : creating ? 'أنشئ حسابك الخاص' : 'مرحبًا بعودتك'}</h1><p>{mode === 'unconfigured' ? 'لم يكتمل إعداد الاستضافة بعد. أكمل خطوات إعداد الموقع، ثم عد إلى هذه الصفحة.' : creating ? 'اختر اسم المستخدم وكلمة المرور اللذين ستستخدمهما لإدارة دروسك.' : 'ادخل بحسابك لإضافة الدروس وتعديلها ونشرها للطلاب.'}</p>
    {mode !== 'unconfigured' && <form onSubmit={submit}><fieldset disabled={busy}>{creating && <label className="field">مفتاح المالك<input name="setupKey" type="password" autoComplete="off" required minLength={32} maxLength={256} /><small>المفتاح الخاص الذي حصلت عليه عند إعداد الاستضافة. استخدمه لإنشاء الحساب أو استعادته، واحتفظ به لديك.</small></label>}<label className="field">اسم المستخدم<input name="username" dir="auto" autoComplete="username" required minLength={3} maxLength={64} placeholder="مثال: alwadani" /></label><label className="field">كلمة المرور<input name="password" type="password" autoComplete={creating ? 'new-password' : 'current-password'} required minLength={12} maxLength={128} /><small>١٢ حرفًا على الأقل.</small></label>{creating && <label className="field">تأكيد كلمة المرور<input name="confirmPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={128} /></label>}{error && <div className="error-banner" role="alert">{error}</div>}<button className="primary login-submit" type="submit"><LockKeyhole size={18} />{busy ? 'جارٍ التحقق…' : recover ? 'حفظ الحساب الجديد' : creating ? 'إنشاء الحساب' : 'تسجيل الدخول'}</button></fieldset></form>}
    {mode === 'login' && <button className="login-recover" onClick={() => { setRecover(!recover); setError(''); }}>{recover ? 'العودة إلى تسجيل الدخول' : 'نسيت بيانات الدخول؟'}</button>}<p className="field-help">الطلاب يدخلون من الصفحة الرئيسية بأسمائهم فقط.</p></section></main></div>;
}
