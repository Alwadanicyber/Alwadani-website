// Runs on the owner's computer, authenticated to their own Cloudflare account.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { fileURLToPath } from 'node:url';
import { hostingConfig, placeholder, root } from './hosting-config.mjs';
import { deploy, run } from './deploy.mjs';

const cli = 'node_modules/wrangler/bin/wrangler.js';
const ownerKeyFile = new URL('.wrangler/owner-key.txt', root);
const questions = createInterface({ input: stdin, output: stdout });
try {
  console.log('سيُنشأ الموقع وقاعدة البيانات في حساب Cloudflare الذي تختاره عند تسجيل الدخول.');
  run(cli, ['login']);
  let config = hostingConfig();
  if (config.d1_databases[0].database_id === placeholder) {
    const account = (await questions.question('الصق Account ID من لوحة Cloudflare الخاصة بك: ')).trim();
    if (!/^[a-f0-9]{32}$/i.test(account)) throw new Error('معرف الحساب غير صالح. تجده في لوحة Cloudflare، وليس مفتاح API.');
    config.account_id = account;
    mkdirSync(new URL('.wrangler', root), { recursive: true });
    const provisioningConfig = new URL('.wrangler/provision.json', root);
    writeFileSync(provisioningConfig, JSON.stringify({ name: config.name, account_id: account, compatibility_date: config.compatibility_date }, null, 2));
    run(cli, ['d1', 'create', 'alwadani-learning', '--binding', 'DB', '--update-config', '--config', fileURLToPath(provisioningConfig)]);
    const provisioned = JSON.parse(readFileSync(provisioningConfig, 'utf8'));
    const binding = provisioned.d1_databases?.find(item => item.binding === 'DB');
    if (!binding?.database_id || binding.database_id === placeholder) throw new Error('لم يتم العثور على معرف القاعدة الجديدة.');
    config.d1_databases = [{ ...binding, migrations_dir: 'drizzle' }];
    writeFileSync(new URL('wrangler.json', root), JSON.stringify(config, null, 2) + '\n');
  }
  const choice = (await questions.question('هل تريد الآن نشر الموقع في هذا الحساب؟ اكتب نعم للمتابعة: ')).trim();
  if (!['نعم', 'yes'].includes(choice.toLowerCase())) { console.log('حُفظ ربط القاعدة. يمكنك النشر لاحقًا باستخدام pnpm deploy.'); }
  else {
    // Reuse a private local key and never silently replace a deployed key.
    mkdirSync(new URL('.wrangler', root), { recursive: true });
    deploy();
    let key;
    if (existsSync(ownerKeyFile)) key = readFileSync(ownerKeyFile, 'utf8').trim();
    else {
      const secrets = run(cli, ['secret', 'list', '--config', 'wrangler.json'], { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
      if (JSON.parse(secrets.stdout).some(secret => secret.name === 'TEACHER_SETUP_KEY')) throw new Error('مفتاح المالك موجود في الاستضافة، ولم يُعثر على نسخته المحلية. استخدم pnpm deploy لتحديث الموقع دون تغيير المفتاح.');
      key = randomBytes(32).toString('hex');
      writeFileSync(ownerKeyFile, key + '\n', { mode: 0o600 });
    }
    run(cli, ['secret', 'put', 'TEACHER_SETUP_KEY', '--config', 'wrangler.json'], { input: key + '\n', stdio: ['pipe', 'inherit', 'inherit'] });
    console.log('\nافتح رابط الموقع الذي ظهر أعلاه وأضف /teacher. أنشئ اسم مستخدم وكلمة مرور.');
    console.log('مفتاح المالك الخاص بك (احتفظ به في مدير كلمات المرور ولا ترفعه إلى GitHub):\n' + key);
    console.log('حُفظ المفتاح أيضًا في .wrangler/owner-key.txt على جهازك.');
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { questions.close(); }
