'use strict';

const nodeCrypto = require('crypto');

function urlSafeB64(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
}

function b64ToBuf(value) {
  return Buffer.from(String(value).replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function splitFernetKey(keyBase64) {
  const raw = b64ToBuf(keyBase64);

  if (raw.length !== 32) {
    throw new Error(`Invalid Fernet key length: expected 32 bytes, got ${raw.length}`);
  }

  return {
    signingKey: raw.subarray(0, 16),
    encryptionKey: raw.subarray(16, 32),
  };
}

function encryptText(plainText, fernetKey) {
  if (typeof plainText !== 'string') {
    throw new TypeError(`encryptText expected string plaintext, got ${typeof plainText}`);
  }

  const { signingKey, encryptionKey } = splitFernetKey(fernetKey);

  const version = Buffer.from([0x80]);
  const timestamp = Buffer.alloc(8);
  timestamp.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 1000)));

  const iv = nodeCrypto.randomBytes(16);
  const cipher = nodeCrypto.createCipheriv('aes-128-cbc', encryptionKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);

  const payload = Buffer.concat([version, timestamp, iv, ciphertext]);
  const hmac = nodeCrypto.createHmac('sha256', signingKey).update(payload).digest();

  return urlSafeB64(Buffer.concat([payload, hmac]));
}

(function runPreScript() {
  const log = typeof client !== 'undefined' && client.log ? client.log : console.log;
  log('--- PRE-SCRIPT EXECUTING ---');

  // 1. Obtain key from environment or global client state
  const key =
    (typeof request !== 'undefined' &&
      request.environment &&
      request.environment.get('FERNET_KEY')) ||
    (typeof client !== 'undefined' && client.global && client.global.get('FERNET_KEY'));

  if (!key) {
    throw new Error('PRE-SCRIPT ERROR: FERNET_KEY is missing from environment and client.global');
  }

  // 2. Resolve raw payload to encrypt (reads RAW_BODY variable or request.body)
  let rawData =
    typeof request !== 'undefined' && request.variables ? request.variables.get('RAW_BODY') : null;

  if (!rawData) {
    const body =
      typeof request !== 'undefined' &&
      typeof request.body === 'object' &&
      typeof request.body.getComputed === 'function'
        ? request.body.getComputed() || request.body.tryGetSubstituted() || request.body.getRaw()
        : request.body;

    rawData = typeof body === 'string' ? body : JSON.stringify(body || {});
  }

  if (typeof rawData !== 'string') {
    rawData = JSON.stringify(rawData);
  }

  log('--- Body ---');
  log(rawData);
  log('------------');
  // 3. Encrypt payload
  const encrypted = encryptText(rawData, key);

  // 4. Store encrypted result in request variables and client global
  if (typeof request !== 'undefined' && request.variables) {
    request.variables.set('ENC_PAYLOAD', encrypted);
  }
  if (typeof client !== 'undefined' && client.global) {
    client.global.set('ENC_PAYLOAD', encrypted);
  }

  log('ENC PAYLOAD =>', encrypted);
})();

// Clear module cache to allow execution on every request
delete require.cache[require.resolve(__filename)];
