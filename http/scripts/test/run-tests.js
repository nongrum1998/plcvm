#!/usr/bin/env node
/**
 * Regression tests for the Kulala.nvim HTTP scripts in ../.
 *
 * Kulala.nvim executes each external script by appending its source to a
 * prebuilt CommonJS bundle, writing that combined file to a temp directory,
 * and running it with plain `node` (cwd = the .http file's directory,
 * NODE_PATH = <http dir>/node_modules). Relative `require('./crypto')`
 * calls therefore fail with MODULE_NOT_FOUND because they resolve against
 * the temp file location, not against http/scripts/.
 *
 * This harness reproduces that execution model exactly, so a script that
 * depends on relative requires or on npm packages fails here (red) while a
 * fully self-contained script passes (green).
 *
 * Cryptographic cross-check: tokens produced by the inline node:crypto
 * implementation are validated against the reference CryptoJS
 * implementation in ../crypto.js, and vice-versa. This proves the inline
 * code uses the same Fernet wire format as
 * src/shared/lib/encryption/encryption.ts (0x80 | timestamp | iv |
 * AES-128-CBC/PKCS7 | HMAC-SHA256, URL-safe base64).
 *
 * Usage: node http/scripts/test/run-tests.js
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const SCRIPTS_DIR = path.join(__dirname, '..');
const HTTP_DIR = path.dirname(SCRIPTS_DIR);
const REFERENCE_CRYPTO = require('../crypto.js');

const TEST_KEY = Buffer.alloc(32, 7).toString('base64'); // deterministic 32-byte key

/**
 * Runs a script the way Kulala.nvim does: appends `userScript` to a fake
 * CJS bundle that defines the `client`/`request`/`response` globals, writes
 * the result to a temp file (NOT http/scripts/), and executes it with node.
 *
 * Stub shapes mirror Kulala's real bundle:
 * - request.environment.get(name) — function over an env key/value map
 * - request.body — either a raw string (JetBrains shape) or an accessor
 *   object { getRaw, tryGetSubstituted, getComputed } (Kulala shape)
 * - response.body — parsed JSON object
 *
 * @param {string} userScript Raw script source to append to the bundle.
 * @param {{
 *   env?: Record<string, unknown>,
 *   requestBody?: unknown,
 *   requestBodyAccessor?: { getRaw?: unknown, tryGetSubstituted?: unknown, getComputed?: unknown },
 *   responseBody?: unknown,
 * }} globals Data used to build the stub globals.
 * @returns {{ code: number | null, stdout: string, stderr: string }}
 */
function runAsKulala(userScript, globals) {
  const envEntries = Object.entries(globals.env ?? {})
    .map(([name, value]) => `${JSON.stringify(name)}: ${JSON.stringify(value)}`)
    .join(', ');
  let bodySrc = 'null';
  if (globals.requestBodyAccessor) {
    bodySrc = `{ getRaw: () => ${JSON.stringify(globals.requestBodyAccessor.getRaw)}, tryGetSubstituted: () => ${JSON.stringify(globals.requestBodyAccessor.tryGetSubstituted)}, getComputed: () => ${JSON.stringify(globals.requestBodyAccessor.getComputed)} }`;
  } else if (globals.requestBody !== undefined) {
    bodySrc = JSON.stringify(globals.requestBody);
  }

  const bundle = [
    "'use strict';",
    'const client = { log: (...args) => console.log(...args) };',
    `const request = { environment: { get: (name) => ({ ${envEntries} })[name] ?? null }, body: ${bodySrc} };`,
    globals.responseBody === undefined
      ? 'const response = undefined;'
      : `const response = { body: ${JSON.stringify(globals.responseBody)} };`,
    userScript,
  ].join('\n');

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kulala-sim-'));
  const scriptPath = path.join(tmpDir, 'script.js');
  fs.writeFileSync(scriptPath, bundle);

  const stdout = [];
  const stderr = [];
  let code = null;

  try {
    stdout.push(
      execFileSync(process.execPath, [scriptPath], {
        cwd: HTTP_DIR,
        env: { ...process.env, NODE_PATH: path.join(HTTP_DIR, 'node_modules') },
        encoding: 'utf8',
      })
    );
    code = 0;
  } catch (e) {
    code = e.status ?? 1;
    stderr.push(String(e.stderr ?? ''));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  return { code, stdout: stdout.join(''), stderr: stderr.join('') };
}

const results = [];

function test(name, fn) {
  try {
    fn();
    results.push({ name, ok: true });
    console.log(`PASS  ${name}`);
  } catch (e) {
    results.push({ name, ok: false });
    console.error(`FAIL  ${name}\n      ${e.message.split('\n').join('\n      ')}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// ---------------------------------------------------------------------------
// Decrypt response script (../dec-res.http.js)
// ---------------------------------------------------------------------------
const decScript = fs.readFileSync(path.join(SCRIPTS_DIR, 'dec-res.http.js'), 'utf8');

test('dec-res: decrypts a CryptoJS-produced token (cross-implementation)', () => {
  const plain = JSON.stringify({ ppo_no: 'MG/9999', pname: 'TEST' });
  const token = REFERENCE_CRYPTO.encryptText(plain, TEST_KEY);
  const run = runAsKulala(decScript, {
    env: { FERNET_KEY: TEST_KEY },
    responseBody: { data: token },
  });
  assert(run.code === 0, `script exited with ${run.code}:\n${run.stderr}`);
  assert(run.stdout.includes('"ppo_no": "MG/9999"'), `unexpected output: ${run.stdout}`);
});

test('dec-res: decrypts the real DECRYPT_PAYLOAD fixture when present', () => {
  let env;
  try {
    env = JSON.parse(fs.readFileSync(path.join(HTTP_DIR, 'http-client.env.json'), 'utf8'));
  } catch {
    return; // fixture absent — skip
  }
  const key = env.v2 && env.v2.FERNET_KEY;
  const token = env.$kulalaShared && env.$kulalaShared.DECRYPT_PAYLOAD;
  if (!key || !token) {
    return; // fixture incomplete — skip
  }
  // Sanity: the reference implementation can read this fixture too.
  const referencePlain = REFERENCE_CRYPTO.decryptText(token, key);
  assert(referencePlain.includes('ppo_no'), 'reference implementation failed on fixture');
  const run = runAsKulala(decScript, {
    env: { FERNET_KEY: key },
    responseBody: { data: token },
  });
  assert(run.code === 0, `script exited with ${run.code}:\n${run.stderr}`);
  assert(run.stdout.includes('"ppo_no"'), `unexpected output: ${run.stdout}`);
});

test('dec-res: bails silently when response has no data field', () => {
  const run = runAsKulala(decScript, {
    env: {},
    responseBody: { message: 'ok' },
  });
  assert(run.code === 0, `script should not throw, exited ${run.code}:\n${run.stderr}`);
  assert(!run.stdout.includes('DEC =>'), 'script should not have decrypted anything');
});

test('dec-res: throws a clear error when the key is missing', () => {
  const token = REFERENCE_CRYPTO.encryptText('{"a":1}', TEST_KEY);
  const run = runAsKulala(decScript, {
    env: {},
    responseBody: { data: token },
  });
  assert(run.code !== 0, 'script should have failed');
  assert(run.stderr.includes('FERNET_KEY is missing'), `unexpected stderr: ${run.stderr}`);
});

// ---------------------------------------------------------------------------
// Encrypt request script (../enc-req.http.js)
// ---------------------------------------------------------------------------
const encScript = fs.readFileSync(path.join(SCRIPTS_DIR, 'enc-req.http.js'), 'utf8');

test('enc-req: encrypts a string body readable by the reference implementation', () => {
  const body = JSON.stringify({ username: 'u1', password: 'p1' });
  const run = runAsKulala(encScript, {
    env: { FERNET_KEY: TEST_KEY },
    requestBody: body,
  });
  assert(run.code === 0, `script exited with ${run.code}:\n${run.stderr}`);
  const match = run.stdout.match(/"payload":"([A-Za-z0-9_=-]+)"/);
  assert(match, `could not find payload in output: ${run.stdout}`);
  const plain = REFERENCE_CRYPTO.decryptText(match[1], TEST_KEY);
  assert(plain === body, `round-trip mismatch: ${plain}`);
});

test("enc-req: reads the body through Kulala's accessor object", () => {
  const raw = JSON.stringify({ username: 'u1', password: 'p1' });
  const run = runAsKulala(encScript, {
    env: { FERNET_KEY: TEST_KEY },
    requestBodyAccessor: { getRaw: raw, tryGetSubstituted: raw, getComputed: raw },
  });
  assert(run.code === 0, `script exited with ${run.code}:\n${run.stderr}`);
  const match = run.stdout.match(/"payload":"([A-Za-z0-9_=-]+)"/);
  assert(match, `could not find payload in output: ${run.stdout}`);
  const plain = REFERENCE_CRYPTO.decryptText(match[1], TEST_KEY);
  assert(plain === raw, `round-trip mismatch: ${plain}`);
});

test('enc-req: throws a clear error when the key is missing', () => {
  const run = runAsKulala(encScript, {
    env: {},
    requestBody: '{}',
  });
  assert(run.code !== 0, 'script should have failed');
  assert(run.stderr.includes('FERNET_KEY is missing'), `unexpected stderr: ${run.stderr}`);
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} tests passed`);
if (failed.length > 0) {
  process.exitCode = 1;
}
