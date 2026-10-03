import { readFileSync } from 'node:fs';
export const root = new URL('../', import.meta.url);
export const placeholder = '00000000-0000-4000-8000-000000000000';
export function hostingConfig() { return JSON.parse(readFileSync(new URL('wrangler.json', root), 'utf8')); }
export function requireProductionDatabase(config = hostingConfig()) {
  const bindings = config.d1_databases || [];
  const binding = bindings.find(item => item.binding === 'DB');
  if (bindings.filter(item => item.binding === 'DB').length !== 1 || !binding || binding.database_id === placeholder || !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(binding.database_id)) {
    throw new Error('لم تُربط قاعدة بيانات الإنتاج بعد. شغّل pnpm setup:hosting في حساب Cloudflare الخاص بك أولًا.');
  }
  return config;
}
