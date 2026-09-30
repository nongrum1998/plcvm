'use strict';

const nodeCrypto = require('crypto');

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

function decryptText(encryptedText, fernetKey) {
  if (typeof encryptedText !== 'string') {
    throw new TypeError(`decryptText expected string, got ${typeof encryptedText}`);
  }

  const { signingKey, encryptionKey } = splitFernetKey(fernetKey);
  const token = b64ToBuf(encryptedText);

  if (token.length < 73) {
    throw new Error('Invalid Fernet token length');
  }

  if (token[0] !== 0x80) {
    throw new Error(`Invalid Fernet version: 0x${token[0].toString(16)}`);
  }

  const payload = token.subarray(0, token.length - 32);
  const expectedHmac = token.subarray(token.length - 32);
  const calculatedHmac = nodeCrypto.createHmac('sha256', signingKey).update(payload).digest();

  if (!nodeCrypto.timingSafeEqual(calculatedHmac, expectedHmac)) {
    throw new Error('Fernet HMAC verification failed: invalid key or tampered payload');
  }

  const iv = token.subarray(9, 25);
  const ciphertext = token.subarray(25, token.length - 32);

  const decipher = nodeCrypto.createDecipheriv('aes-128-cbc', encryptionKey, iv);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  const result = decrypted.toString('utf8');

  if (!result) {
    throw new Error('Fernet decryption yielded empty string');
  }

  return result;
}

(function runPostScript() {
  const log = typeof client !== 'undefined' && client.log ? client.log : console.log;
  log('--- POST-SCRIPT EXECUTING ---');

  // 1. Resolve response body (handle both string and pre-parsed object)
  let body = response.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // Body is a plain string token
    }
  }

  if (!body) {
    log('POST-SCRIPT WARNING: Empty response body received.');
    return;
  }

  // 2. Extract encrypted token across data/payload fields
  const encrypted =
    typeof body === 'string'
      ? body
      : body.data ||
        body.payload ||
        (body.success && typeof body.data === 'string' ? body.data : null);

  if (!encrypted || typeof encrypted !== 'string') {
    log('POST-SCRIPT INFO: No encrypted :', JSON.stringify(body));
    return;
  }

  // 3. Obtain key from environment or global client state
  const key =
    (typeof request !== 'undefined' &&
      request.environment &&
      request.environment.get('FERNET_KEY')) ||
    (typeof client !== 'undefined' && client.global && client.global.get('FERNET_KEY'));

  if (!key) {
    throw new Error('POST-SCRIPT ERROR: FERNET_KEY is missing from environment and client.global');
  }

  // 4. Decrypt and output
  try {
    const decrypted = decryptText(encrypted, key);
    let parsedData;
    try {
      parsedData = JSON.parse(decrypted);
    } catch {
      parsedData = decrypted;
    }

    log('DEC =>', JSON.stringify(parsedData, null, 2));
  } catch (err) {
    log('POST-SCRIPT DECRYPTION ERROR:', err.message);
  }
})();

// Clear module cache to allow execution on every request
delete require.cache[require.resolve(__filename)];
