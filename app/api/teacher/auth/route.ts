import { cookies } from 'next/headers';
import { database } from '@/lib/database';
import { cookieFor, createTeacherSession, hashPassword, localTeacherCookie, matchesSetupKey, rateLimit, setupKey, teacherAccount, teacherCookie, tokenHash, validCredentials, verifyPassword } from '@/lib/teacher';

export const dynamic = 'force-dynamic';
const reply = (body: unknown, status = 200, cookie?: string) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...(cookie ? { 'Set-Cookie': cookie } : {}) } });
export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ error: 'طلب غير صالح. افتح لوحة المعلم من رابط الموقع نفسه.' }, 403);
  if (!setupKey()) return reply({ error: 'لم يكتمل إعداد حساب المعلم في الاستضافة.' }, 503);
  try {
    const text = await request.text();
    if (text.length > 4096) return reply({ error: 'الطلب كبير جدًا.' }, 400);
    const body = JSON.parse(text);
    if (!body || typeof body !== 'object') return reply({ error: 'طلب غير صالح.' }, 400);
    if (body.action === 'logout') {
      const jar = await cookies();
      const token = jar.get(teacherCookie)?.value || (import.meta.env.DEV ? jar.get(localTeacherCookie)?.value : undefined);
      if (token) await database().prepare('DELETE FROM teacher_sessions WHERE token_hash=?').bind(await tokenHash(token)).run();
      return reply({ ok: true }, 200, cookieFor(request, '', true));
    }
    if (!['setup', 'login', 'recover'].includes(body.action)) return reply({ error: 'طلب غير صالح.' }, 400);
    if (!await rateLimit(request, body.action)) return reply({ error: 'محاولات كثيرة. حاول مجددًا بعد ١٥ دقيقة.' }, 429);
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    if (!validCredentials(username, body.password)) return reply({ error: 'اسم المستخدم من ٣ إلى ٦٤ حرفًا دون مسافات، وكلمة المرور من ١٢ إلى ١٢٨ حرفًا.' }, 400);
    const account = await teacherAccount();
    let accountUpdated = account?.updated || 0;
    if (body.action === 'login') {
      if (!account) return reply({ error: 'أنشئ حساب المعلم أولًا باستخدام مفتاح المالك.' }, 409);
      const correct = await verifyPassword(body.password, account.password_hash);
      if (!correct || account.username !== username) return reply({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' }, 401);
    } else {
      if (typeof body.setupKey !== 'string' || !await matchesSetupKey(body.setupKey)) return reply({ error: 'مفتاح المالك غير صحيح.' }, 403);
      if (body.action === 'setup' && account) return reply({ error: 'حساب المعلم موجود بالفعل. استخدم تسجيل الدخول أو استعادة الحساب.' }, 409);
      if (body.action === 'recover' && !account) return reply({ error: 'أنشئ حساب المعلم أولًا.' }, 409);
      const passwordHash = await hashPassword(body.password);
      const updated = Math.max(Date.now(), (account?.updated || 0) + 1);
      accountUpdated = updated;
      if (body.action === 'setup') {
        const inserted = await database().prepare('INSERT OR IGNORE INTO teacher_account(id,username,password_hash,updated) VALUES(1,?,?,?)').bind(username, passwordHash, updated).run();
        if (inserted.meta.changes !== 1) return reply({ error: 'تم إنشاء حساب المعلم بالفعل.' }, 409);
      } else {
        await database().batch([
          database().prepare('UPDATE teacher_account SET username=?,password_hash=?,updated=? WHERE id=1').bind(username, passwordHash, updated),
          database().prepare('DELETE FROM teacher_sessions'),
        ]);
      }
    }
    return reply({ ok: true }, 200, cookieFor(request, await createTeacherSession(accountUpdated)));
  } catch (error) {
    console.error('Teacher authentication request failed', error instanceof SyntaxError ? 'invalid JSON' : 'database or crypto error');
    return reply({ error: 'تعذّر إتمام الدخول. تأكد من إعداد القاعدة في الاستضافة ثم حاول مجددًا.' }, 503);
  }
}
