#!/usr/bin/env node
/**
 * @file Seeds the external PLCVM echo API from `../mock-responses.json`,
 * then reads every route back and decrypts it to prove the round trip works.
 *
 * The echo API is a mock server that holds canned responses keyed by path:
 *
 *   DELETE {base}/api/echo            -> drop every stored entry
 *   POST   {base}/api/echo            -> { url, status_code, data }
 *   GET    {base}/api/echo{url}       -> the stored entry for `url`
 *
 * Every route is namespaced under {@link ROUTE_PREFIX} on **both** the write
 * and the read, so a seeded `/user` fixture is stored as `/plcvm/user` and
 * fetched from `/api/echo/plcvm/user`.
 *
 * The `data` field is a single Fernet token wrapping `JSON.stringify(data)`.
 * That is exactly what the app expects: `decryptRequestResponse` in
 * `src/shared/utils/http/decrypt-response.ts` bails out unless
 * `response.data.data` is a string, then decrypts it and `JSON.parse`s the
 * result. Values *inside* the token stay plaintext.
 *
 * Reuses `crypto.js` for the Fernet wire format so there is one source of
 * truth, cross-checked against the app by `test/run-tests.js`.
 *
 * Usage:
 *   node http/scripts/seed-echo.js [--base-url http://host:port]
 *
 * Configuration:
 *   --base-url   Overrides the server. Falls back to `ECHO_BASE_URL`, then
 *                to {@link DEFAULT_BASE_URL}.
 *   FERNET_KEY   The payload encryption key. Falls back to the `FERNET_KEY`
 *                entry in `http/http-client.env.json`. Never printed.
 *
 * Exits 0 when every route verifies, 1 otherwise.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { decryptText, encryptText } = require('./crypto.js');

/** The `http/` scratch-client directory holding the fixture files. */
const HTTP_DIR = path.join(__dirname, '..');

/** Fixture map of route key -> `{ success, message, status, data }`. */
const MOCK_RESPONSES_PATH = path.join(HTTP_DIR, 'mock-responses.json');

/** HTTP-client env file; supplies `FERNET_KEY` when the shell does not. */
const ENV_FILE_PATH = path.join(HTTP_DIR, 'http-client.env.json');

/** Root path of the echo API on the mock server. */
const ECHO_ROOT = '/api/echo';

/** Namespace applied to every route on write and on read. */
const ROUTE_PREFIX = '/plcvm';

/** Server used when neither `--base-url` nor `ECHO_BASE_URL` is set. */
const DEFAULT_BASE_URL = 'http://192.168.1.9:3000';

/**
 * Parses command-line arguments.
 *
 * Supports `--base-url <value>` and `--base-url=<value>`, plus `--help`.
 *
 * @param {string[]} argv Arguments after the node binary and script path.
 * @returns {{ baseUrl: string | null, help: boolean }} Parsed flags. `baseUrl`
 *   is null when the flag was absent.
 * @throws {Error} If a flag is unknown or `--base-url` has no value.
 *
 * @example
 * ```js
 * parseArgs(['--base-url', 'http://127.0.0.1:8080']);
 * // => { baseUrl: 'http://127.0.0.1:8080', help: false }
 * ```
 */
function parseArgs(argv) {
  const parsed = { baseUrl: null, help: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else if (arg === '--base-url') {
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        throw new Error('--base-url requires a value, e.g. --base-url http://127.0.0.1:3000');
      }
      parsed.baseUrl = value;
      i += 1;
    } else if (arg.startsWith('--base-url=')) {
      parsed.baseUrl = arg.slice('--base-url='.length);
    } else {
      throw new Error(`Unknown argument "${arg}". Try --help.`);
    }
  }

  return parsed;
}

/**
 * Resolves the echo server origin, highest precedence first.
 *
 * @param {string | null} flagValue Value from `--base-url`, or null.
 * @returns {string} Origin with no trailing slash, e.g. `http://10.0.0.5:3000`.
 * @throws {Error} If the result is not an http(s) URL.
 */
function resolveBaseUrl(flagValue) {
  const raw = flagValue ?? process.env.ECHO_BASE_URL ?? DEFAULT_BASE_URL;
  const trimmed = String(raw).trim().replace(/\/+$/, '');

  if (!/^https?:\/\/[^/]+/i.test(trimmed)) {
    throw new Error(`Base URL must look like http://host:port, got "${raw}"`);
  }

  return trimmed;
}

/**
 * Reads `http-client.env.json`, tolerating an absent or malformed file.
 *
 * @returns {Record<string, unknown>} Parsed env object, or `{}`.
 */
function readEnvFile() {
  try {
    const parsed = JSON.parse(fs.readFileSync(ENV_FILE_PATH, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Resolves the Fernet key from the shell, falling back to the env file.
 *
 * @returns {string} A 32-byte Fernet key in standard base64.
 * @throws {Error} If no key is available in either location.
 */
function resolveFernetKey() {
  const fromShell = (process.env.FERNET_KEY ?? '').trim();
  if (fromShell) {
    return fromShell;
  }

  const env = readEnvFile();
  const fromFile = env.default?.FERNET_KEY ?? env.$shared?.FERNET_KEY ?? env.v1?.FERNET_KEY;
  if (typeof fromFile === 'string' && fromFile.trim()) {
    return fromFile.trim();
  }

  throw new Error(
    'No Fernet key found. Set FERNET_KEY in the environment, or add a FERNET_KEY ' +
      'entry to http/http-client.env.json.'
  );
}

/**
 * Namespaces a fixture key under {@link ROUTE_PREFIX}.
 *
 * @param {string} key Fixture key such as `/user` or `/api/validate_token/`.
 * @returns {string} Prefixed route such as `/plcvm/user`. Trailing slashes in
 *   the source key are preserved, since the server keys on the exact path.
 *
 * @example
 * ```js
 * buildRoute('/user'); // => '/plcvm/user'
 * ```
 */
function buildRoute(key) {
  const withLeadingSlash = String(key).startsWith('/') ? String(key) : `/${key}`;
  return `${ROUTE_PREFIX}${withLeadingSlash}`;
}

/**
 * Builds the full GET URL for a route.
 *
 * @param {string} baseUrl Origin from {@link resolveBaseUrl}.
 * @param {string} route Prefixed route from {@link buildRoute}.
 * @returns {string} Absolute URL, e.g. `http://host:3000/api/echo/plcvm/user`.
 */
function echoUrl(baseUrl, route) {
  return `${baseUrl}${ECHO_ROOT}${route}`;
}

/**
 * Builds the POST body for one fixture entry.
 *
 * The `data` field is the whole fixture `data` object serialised and
 * Fernet-encrypted, matching what the app's response interceptor expects.
 *
 * @param {{ route: string, status?: unknown, data: unknown }} entry Normalised
 *   fixture entry.
 * @param {string} key Fernet key from {@link resolveFernetKey}.
 * @returns {{ url: string, status_code: number, data: string }} POST body.
 *
 * @example
 * ```js
 * buildPayload({ route: '/plcvm/user', status: 200, data: { a: 1 } }, key);
 * // => { url: '/plcvm/user', status_code: 200, data: 'gAAAAA...' }
 * ```
 */
function buildPayload(entry, key) {
  return {
    url: entry.route,
    status_code: typeof entry.status === 'number' ? entry.status : 200,
    data: encryptText(JSON.stringify(entry.data ?? {}), key),
  };
}

/**
 * Loads `mock-responses.json` and normalises it into seedable entries.
 *
 * @returns {Array<{ sourceKey: string, route: string, status: unknown, data: unknown }>}
 *   One entry per fixture key, each already prefixed with `/plcvm`.
 * @throws {Error} If the file is missing, is not JSON, or is not an object.
 */
function loadEntries() {
  let raw;
  try {
    raw = fs.readFileSync(MOCK_RESPONSES_PATH, 'utf8');
  } catch (cause) {
    throw new Error(`Cannot read ${MOCK_RESPONSES_PATH}: ${cause.message}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (cause) {
    throw new Error(`${MOCK_RESPONSES_PATH} is not valid JSON: ${cause.message}`);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`${MOCK_RESPONSES_PATH} must be a JSON object keyed by route`);
  }

  return Object.entries(parsed).map(([sourceKey, value]) => ({
    sourceKey,
    route: buildRoute(sourceKey),
    status: value?.status,
    data: value?.data ?? {},
  }));
}

/**
 * Compares two JSON-shaped values by their serialised form.
 *
 * Used instead of a deep-equal so that key ordering differences introduced by
 * the server's round trip are not reported as failures.
 *
 * @param {unknown} a First value.
 * @param {unknown} b Second value.
 * @returns {boolean} True when both serialise identically.
 */
function sameJson(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Performs one JSON HTTP request against the echo API.
 *
 * @param {string} method HTTP verb.
 * @param {string} url Absolute URL.
 * @param {unknown} [body] Value to send as a JSON body; omit for no body.
 * @returns {Promise<{ ok: boolean, status: number, body: any, raw: string }>}
 *   Status and parsed body. `body` is null when the response was not JSON.
 * @throws {Error} If the request could not be made at all, e.g. the server is
 *   down or the host is unreachable. The message names the URL and the
 *   underlying cause.
 */
async function requestJson(method, url, body) {
  const hasBody = body !== undefined;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
      body: hasBody ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    throw new Error(`Echo server unreachable at ${url} (${method}) - ${reason}`);
  }

  const raw = await response.text();
  let parsed = null;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  }

  return { ok: response.ok, status: response.status, body: parsed, raw };
}

/**
 * Drops every entry currently held by the echo API.
 *
 * Runs before seeding so repeated invocations do not accumulate duplicates.
 *
 * @param {string} baseUrl Origin from {@link resolveBaseUrl}.
 * @returns {Promise<void>} Resolves once the store is empty.
 * @throws {Error} If the server rejects or cannot service the reset.
 */
async function resetStore(baseUrl) {
  const url = `${baseUrl}${ECHO_ROOT}`;
  const result = await requestJson('DELETE', url);

  if (!result.ok) {
    throw new Error(`Reset failed: DELETE ${url} returned ${result.status}`);
  }
}

/**
 * Registers one fixture entry with the echo API.
 *
 * @param {string} baseUrl Origin from {@link resolveBaseUrl}.
 * @param {{ route: string, status: unknown, data: unknown }} entry Normalised
 *   fixture entry.
 * @param {string} key Fernet key.
 * @returns {Promise<void>} Resolves once the entry is stored.
 * @throws {Error} If the server rejects the entry.
 */
async function seedEntry(baseUrl, entry, key) {
  const result = await requestJson('POST', `${baseUrl}${ECHO_ROOT}`, buildPayload(entry, key));

  if (!result.ok) {
    throw new Error(`seed rejected: POST returned ${result.status} ${result.raw}`.trim());
  }
}

/**
 * Reads one route back, decrypts it, and compares it to the source fixture.
 *
 * This is the check that proves the app will be able to consume the entry:
 * the token must decrypt to exactly the object the fixture declared.
 *
 * @param {string} baseUrl Origin from {@link resolveBaseUrl}.
 * @param {{ route: string, data: unknown }} entry Normalised fixture entry.
 * @param {string} key Fernet key.
 * @returns {Promise<void>} Resolves when the round trip matches.
 * @throws {Error} If the read fails, the response carries no token, the token
 *   will not decrypt, or the plaintext does not match the fixture.
 */
async function verifyEntry(baseUrl, entry, key) {
  const url = echoUrl(baseUrl, entry.route);
  const result = await requestJson('GET', url);

  if (!result.ok) {
    throw new Error(`read failed: GET returned ${result.status}`);
  }

  const token = result.body?.data;
  if (typeof token !== 'string') {
    throw new Error(`response.data is ${typeof token}, expected a Fernet token string`);
  }

  let plaintext;
  try {
    plaintext = decryptText(token, key);
  } catch (cause) {
    throw new Error(`decrypt failed: ${cause.message}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(plaintext);
  } catch (cause) {
    throw new Error(`decrypted payload is not valid JSON: ${cause.message}`);
  }

  if (!sameJson(parsed, entry.data ?? {})) {
    throw new Error('round-trip mismatch: decrypted data does not match the fixture');
  }
}

/**
 * Prints command-line usage.
 *
 * @returns {void}
 */
function printUsage() {
  console.log(
    [
      'Seeds the PLCVM echo API from mock-responses.json and verifies every route.',
      '',
      'Usage:',
      '  node http/scripts/seed-echo.js [--base-url http://host:port]',
      '',
      'Options:',
      '  --base-url <url>   Echo server origin.',
      '                     Default: $ECHO_BASE_URL, else ' + DEFAULT_BASE_URL,
      '  -h, --help         Show this message.',
      '',
      'Environment:',
      '  FERNET_KEY         Payload encryption key.',
      '                     Default: FERNET_KEY from http/http-client.env.json',
    ].join('\n')
  );
}

/**
 * Runs the seed-and-verify flow.
 *
 * @returns {Promise<number>} Process exit code: 0 when every route verified,
 *   1 when any route failed or the server was unreachable.
 */
async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    return 0;
  }

  const baseUrl = resolveBaseUrl(args.baseUrl);
  const key = resolveFernetKey();
  const entries = loadEntries();

  console.log(`Echo API : ${baseUrl}${ECHO_ROOT}`);
  console.log(`Prefix   : ${ROUTE_PREFIX}`);
  console.log(`Fixtures : ${entries.length} from ${path.basename(MOCK_RESPONSES_PATH)}`);
  console.log('');

  try {
    await resetStore(baseUrl);
    console.log('reset    -> store cleared');
  } catch (cause) {
    console.error(`FATAL: ${cause.message}`);
    return 1;
  }

  console.log('');
  let verified = 0;

  for (const entry of entries) {
    try {
      await seedEntry(baseUrl, entry, key);
      await verifyEntry(baseUrl, entry, key);
      verified += 1;
      console.log(`  ok     ${entry.route}   <- ${entry.sourceKey}`);
    } catch (cause) {
      console.log(`  FAIL   ${entry.route}   - ${cause.message}`);
    }
  }

  console.log('');
  console.log(`${verified}/${entries.length} routes verified`);

  if (verified !== entries.length) {
    console.error(`${entries.length - verified} route(s) failed - see the FAIL lines above.`);
    return 1;
  }

  return 0;
}

if (require.main === module) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((cause) => {
      console.error(`FATAL: ${cause.message}`);
      process.exitCode = 1;
    });
}

module.exports = {
  buildPayload,
  buildRoute,
  echoUrl,
  parseArgs,
  resolveBaseUrl,
  sameJson,
};
