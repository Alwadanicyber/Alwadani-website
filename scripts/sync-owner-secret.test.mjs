import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { syncOwnerSecret } from './sync-owner-secret.mjs';

const config = JSON.parse(readFileSync(new URL('../wrangler.json', import.meta.url), 'utf8'));
const syntheticKey = 'a'.repeat(64);
const production = { WORKERS_CI: '1', WORKERS_CI_BRANCH: 'main', TEACHER_SETUP_KEY: syntheticKey };

test('local, preview, and unconfigured builds cannot change production credentials', () => {
  for (const env of [{}, { ...production, WORKERS_CI: undefined }, { ...production, WORKERS_CI_BRANCH: 'preview' }, { ...production, WORKERS_CI_BRANCH: undefined }, { ...production, TEACHER_SETUP_KEY: undefined }]) {
    assert.equal(syncOwnerSecret({ env, run() { assert.fail('must not call Wrangler'); } }), 'skipped');
  }
});

test('invalid keys and a different account fail before any remote action', () => {
  for (const env of [{ ...production, TEACHER_SETUP_KEY: 'short' }, { ...production, TEACHER_SETUP_KEY: 'x'.repeat(257) }, { ...production, TEACHER_SETUP_KEY: syntheticKey + '\n' }, { ...production, CLOUDFLARE_ACCOUNT_ID: 'f'.repeat(32) }]) {
    assert.throws(() => syncOwnerSecret({ env, run() { assert.fail('must not call Wrangler'); } }));
  }
});

test('an existing owner key is never replaced or read', () => {
  let calls = 0;
  assert.equal(syncOwnerSecret({ env: production, log() {}, run(_node, args, options) {
    calls++;
    assert.equal(args[2], 'list');
    assert.equal(options.input, undefined);
    return { status: 0, stdout: JSON.stringify([{ name: 'TEACHER_SETUP_KEY', type: 'secret_text' }]) };
  } }), 'existing');
  assert.equal(calls, 1);
});

test('a missing key is sent only through stdin to the configured Worker', () => {
  const calls = [], logs = [];
  assert.equal(syncOwnerSecret({ env: production, log(message) { logs.push(message); }, run(_node, args, options) {
    calls.push({ args, options });
    return { status: 0, stdout: args[2] === 'list' ? '[]' : syntheticKey };
  } }), 'created');
  assert.equal(calls.length, 2);
  for (const { args, options } of calls) {
    assert.equal(args[args.indexOf('--name') + 1], config.name);
    assert.equal(options.env.CLOUDFLARE_ACCOUNT_ID, config.account_id);
    assert.equal(options.env.WRANGLER_WRITE_LOGS, 'false');
    assert.equal(options.env.WRANGLER_SEND_METRICS, 'false');
    assert.equal(options.env.TEACHER_SETUP_KEY, undefined);
    assert.equal(args.some(arg => arg.includes(syntheticKey)), false);
    assert.deepEqual(options.stdio, ['pipe', 'pipe', 'pipe']);
  }
  assert.equal(calls[0].options.input, undefined);
  assert.equal(calls[1].options.input, syntheticKey + '\n');
  assert.equal(logs.join('').includes(syntheticKey), false);
});

test('failed or malformed secret listings never trigger an overwrite or expose output', () => {
  for (const result of [{ status: 1, stdout: syntheticKey, stderr: syntheticKey }, { status: 0, stdout: syntheticKey }, { status: 0, stdout: '{}' }, { error: new Error(syntheticKey), status: null }]) {
    let calls = 0;
    assert.throws(() => syncOwnerSecret({ env: production, run() { calls++; return result; } }), error => !error.message.includes(syntheticKey));
    assert.equal(calls, 1);
  }
});

test('failed secret creation does not expose the key or child-process errors', () => {
  let calls = 0;
  assert.throws(() => syncOwnerSecret({ env: production, run() {
    calls++;
    return calls === 1 ? { status: 0, stdout: '[]' } : { status: 1, stdout: syntheticKey, stderr: syntheticKey, error: new Error(syntheticKey) };
  } }), error => !error.message.includes(syntheticKey));
});

test('unexpected subprocess exceptions cannot expose credential values', () => {
  assert.throws(() => syncOwnerSecret({ env: production, run() { throw new Error(syntheticKey); } }), error => !error.message.includes(syntheticKey));
});
