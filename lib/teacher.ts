import { cookies } from 'next/headers';
import { env } from 'cloudflare:workers';
import { database } from './database';

export const teacherCookie = '__Host-alwadani_teacher';
export const localTeacherCookie = 'alwadani_teacher_local';
export const sessionSeconds = 7 * 24 * 60 * 60;
const encoder = new TextEncoder();
const hex = (bytes: ArrayBuffer | Uint8Array) => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
export const randomToken = () => hex(crypto.getRandomValues(new Uint8Array(32)));
export async function tokenHash(token: string) {
  return hex(await crypto.subtle.digest('SHA-256', encoder.encode(token)));
}
export function setupKey() {
  const key = env.TEACHER_SETUP_KEY;
  return key && key.length >= 32 ? key : null;
}
export async function matchesSetupKey(candidate: string) {
  const key = setupKey();
  if (!key) return false;
  const expected = await tokenHash(key);
  const actual = await tokenHash(candidate);
  let difference = 0;
  for (let i = 0; i < expected.length; i++) difference |= expected.charCodeAt(i) ^ actual.charCodeAt(i);
  return difference === 0;
}
export type TeacherAccount = { id: number; username: string; password_hash: string; updated: number };
export function teacherAccount() {
  return database().prepare('SELECT * FROM teacher_account WHERE id=1').first<TeacherAccount>();
}
export async function teacherIdentity() {
  if (!setupKey()) return null;
  const jar = await cookies();
  // An insecure development cookie is never accepted on a deployed Worker.
  const token = jar.get(teacherCookie)?.value || (import.meta.env.DEV ? jar.get(localTeacherCookie)?.value : undefined);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return database().prepare('SELECT a.username FROM teacher_sessions s JOIN teacher_account a ON a.id=s.teacher WHERE s.token_hash=? AND s.expires>? AND s.created>=a.updated')
    .bind(await tokenHash(token), Date.now()).first<{ username: string }>();
}
export async function teacherAccess() { return !!await teacherIdentity(); }

async function passwordTag(password: string, salt: string) {
  const key = setupKey();
  if (!key) throw new Error('Teacher authentication is not configured');
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations: 100000 }, material, 256);
  // A server-only pepper prevents an exported database from being sufficient
  // for offline password guesses. Workers caps each PBKDF2 call at 100,000.
  const pepper = await crypto.subtle.importKey('raw', encoder.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  return { pepper, derived };
}
export async function hashPassword(password: string) {
  const salt = randomToken();
  const { pepper, derived } = await passwordTag(password, salt);
  const tag = hex(await crypto.subtle.sign('HMAC', pepper, derived));
  return `pbkdf2-sha256-hmac-v1:${salt}:${tag}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [version, salt, tag] = stored.split(':');
  if (version !== 'pbkdf2-sha256-hmac-v1' || !/^[a-f0-9]{64}$/.test(salt || '') || !/^[a-f0-9]{64}$/.test(tag || '')) return false;
  const { pepper, derived } = await passwordTag(password, salt);
  const signature = Uint8Array.from(tag.match(/../g)!, byte => parseInt(byte, 16));
  return crypto.subtle.verify('HMAC', pepper, signature, derived);
}
export function validCredentials(username: unknown, password: unknown) {
  return typeof username === 'string' && /^[\p{L}\p{N}_.@-]{3,64}$/u.test(username)
    && typeof password === 'string' && password.length >= 12 && password.length <= 128;
}
export function cookieFor(request: Request, token: string, remove = false) {
  const url = new URL(request.url);
  const local = import.meta.env.DEV && url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const name = local ? localTeacherCookie : teacherCookie;
  return `${name}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${remove ? 0 : sessionSeconds}${local ? '' : '; Secure'}`;
}
export async function createTeacherSession(accountUpdated: number) {
  const token = randomToken();
  const now = Math.max(Date.now(), accountUpdated);
  const results = await database().batch([
    database().prepare('DELETE FROM teacher_sessions WHERE expires<=?').bind(now),
    database().prepare('INSERT INTO teacher_sessions(token_hash,teacher,created,expires) SELECT ?,1,?,? FROM teacher_account WHERE id=1 AND updated=?').bind(await tokenHash(token), now, now + sessionSeconds * 1000, accountUpdated),
  ]);
  if (results[1].meta.changes !== 1) throw new Error('Account changed during login');
  return token;
}
export async function rateLimit(request: Request, purpose: string) {
  const now = Date.now();
  const windowEnd = now + 15 * 60 * 1000;
  const bucket = await tokenHash(`${purpose}:${request.headers.get('cf-connecting-ip') || 'local'}`);
  const result = await database().prepare('INSERT INTO teacher_attempts(bucket,count,expires) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN expires<=? THEN 1 ELSE count+1 END, expires=CASE WHEN expires<=? THEN ? ELSE expires END RETURNING count,expires')
    .bind(bucket, windowEnd, now, now, windowEnd).first<{ count: number; expires: number }>();
  return result && result.count <= 5;
}
