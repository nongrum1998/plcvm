// The IV is drawn from `expo-crypto` rather than `CryptoJS.lib.WordArray.random()`.
//
// `WordArray.random()` reads `globalThis.crypto.getRandomValues`, which on
// React Native 0.86 only exists via the `react-native-get-random-values`
// polyfill. That polyfill reaches its native module through a *synchronous*
// call, which a bridgeless runtime does not support — so it throws, and
// crypto-js swallows that and reports "Native crypto module could not be used
// to get secure random number." instead, breaking every encrypted request
// including login.
//
// `expo-crypto` exposes the same randomness through a native call that works
// on every runtime, so the IV is built explicitly here and `encryptText` is
// asynchronous as a result.
//
// Deliberately, nothing in this app installs `globalThis.crypto` any more — the
// `react-native-get-random-values` import is gone from the root layout, and
// `encryption.test.ts` asserts that encrypting still works with no host
// `getRandomValues` present. Re-adding the polyfill to "fix" a crypto-js
// complaint would reintroduce the synchronous native call that caused this.
import * as Crypto from 'expo-crypto';
import CryptoJS from 'crypto-js';

const FERNET_KEY = process.env.EXPO_PUBLIC_FERNET_KEY || '';

function base64ToUrlSafe(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_');
}

function urlSafeToBase64(base64: string): string {
  let result = base64.replace(/-/g, '+').replace(/_/g, '/');

  while (result.length % 4 !== 0) {
    result += '=';
  }

  return result;
}

function getFernetKeys(keyBase64: string) {
  const rawKey = CryptoJS.enc.Base64.parse(urlSafeToBase64(keyBase64));

  return {
    signingKey: CryptoJS.lib.WordArray.create(rawKey.words.slice(0, 4), 16),

    encryptionKey: CryptoJS.lib.WordArray.create(rawKey.words.slice(4, 8), 16),
  };
}

/** Fernet IV length in bytes, fixed by the spec. */
const IV_BYTE_LENGTH = 16;

/**
 * Packs raw bytes into the 32-bit word layout crypto-js expects.
 *
 * `CryptoJS.enc.Hex` reads element `i` as `words[i >>> 2] >>> (24 - (i % 4) *
 * 8)`, i.e. most-significant byte first — the same convention its own
 * `Hex.parse` writes with. Mirroring that here means
 * `WordArray.create(bytesToWordArray(b)).toString(Hex)` yields `b` back
 * unchanged, so the IV the backend reads out of the token is byte-identical to
 * the bytes `getRandomBytesAsync` produced. Packing little-endian instead
 * would reverse every 4-byte group and silently corrupt the IV.
 *
 * @param bytes - Raw bytes to pack. Length must be a multiple of 4.
 * @returns A WordArray carrying exactly the same bytes.
 */
function bytesToWordArray(bytes: Uint8Array): CryptoJS.lib.WordArray {
  const words: number[] = [];

  for (let i = 0; i < bytes.length; i += 4) {
    words[i / 4] =
      ((bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3]) >>> 0;
  }

  return CryptoJS.lib.WordArray.create(words, bytes.length);
}

/**
 * Encrypts a plaintext string into a Fernet token.
 *
 * The token is laid out per the Fernet spec: version byte `0x80`, an 8-byte
 * timestamp, a random 16-byte IV, the AES-128-CBC ciphertext, then an
 * HMAC-SHA256 over everything preceding it.
 *
 * The IV is drawn from `expo-crypto`, which is what makes this asynchronous —
 * see the note at the top of this file.
 *
 * @param plainText - Value to encrypt, usually a JSON-stringified body.
 * @returns A promise resolving to the token encoded as urlsafe base64.
 * @throws {Error} `Fernet key missing` when `EXPO_PUBLIC_FERNET_KEY` is unset.
 *
 * @example
 * ```ts
 * const token = await encryptText(JSON.stringify({ username, password }));
 * ```
 */
export async function encryptText(plainText: string): Promise<string> {
  if (!FERNET_KEY) {
    throw new Error('Fernet key missing');
  }

  const { signingKey, encryptionKey } = getFernetKeys(FERNET_KEY);

  const versionHex = '80';

  const timestampHex = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(16, '0');

  const iv = bytesToWordArray(await Crypto.getRandomBytesAsync(IV_BYTE_LENGTH));

  const encrypted = CryptoJS.AES.encrypt(plainText, encryptionKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const payloadHex =
    versionHex +
    timestampHex +
    iv.toString(CryptoJS.enc.Hex) +
    encrypted.ciphertext.toString(CryptoJS.enc.Hex);

  const payload = CryptoJS.enc.Hex.parse(payloadHex);

  const hmac = CryptoJS.HmacSHA256(payload, signingKey);

  const token = payload.clone().concat(hmac);

  return base64ToUrlSafe(token.toString(CryptoJS.enc.Base64));
}

/**
 * Decrypts a Fernet token produced by {@link encryptText}.
 *
 * The HMAC is verified before any decryption is attempted, so a tampered
 * token or an incorrect key fails loudly instead of yielding garbage.
 *
 * @param encryptedText - Fernet token encoded as urlsafe base64.
 * @returns The original plaintext.
 * @throws {Error} `Fernet key missing` when `EXPO_PUBLIC_FERNET_KEY` is unset.
 * @throws {Error} `Invalid Fernet token length` when the token is too short to
 *   hold a payload plus HMAC.
 * @throws {Error} `Fernet HMAC verification failed: ...` when the token was
 *   tampered with or the key is wrong.
 * @throws {Error} `Invalid Fernet version: ...` when the leading version byte
 *   is not `0x80`.
 * @throws {Error} `Fernet decryption failed` when the ciphertext does not
 *   decode to valid UTF-8.
 */
export function decryptText(encryptedText: string): string {
  if (!FERNET_KEY) {
    throw new Error('Fernet key missing');
  }

  const { signingKey, encryptionKey } = getFernetKeys(FERNET_KEY);

  const tokenBytes = CryptoJS.enc.Base64.parse(urlSafeToBase64(encryptedText));

  const tokenHex = tokenBytes.toString(CryptoJS.enc.Hex);

  if (tokenHex.length < 146) {
    throw new Error('Invalid Fernet token length');
  }

  const payloadHexLength = tokenHex.length - 64;

  const payloadHex = tokenHex.substring(0, payloadHexLength);

  const expectedHmacHex = tokenHex.substring(payloadHexLength);

  const calculatedHmacHex = CryptoJS.HmacSHA256(
    CryptoJS.enc.Hex.parse(payloadHex),
    signingKey
  ).toString(CryptoJS.enc.Hex);

  if (calculatedHmacHex.toLowerCase() !== expectedHmacHex.toLowerCase()) {
    throw new Error('Fernet HMAC verification failed: invalid key or tampered payload');
  }

  const version = tokenHex.substring(0, 2);

  if (version !== '80') {
    throw new Error(`Invalid Fernet version: ${version}`);
  }

  const ivHex = tokenHex.substring(18, 50);

  const ciphertextHex = tokenHex.substring(50, payloadHexLength);

  const decrypted = CryptoJS.AES.decrypt(
    CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Hex.parse(ciphertextHex),
    }),
    encryptionKey,
    {
      iv: CryptoJS.enc.Hex.parse(ivHex),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  const result = decrypted.toString(CryptoJS.enc.Utf8);

  if (!result) {
    throw new Error('Fernet decryption failed');
  }

  return result;
}

/**
 * Hashes a string with SHA-256 and returns the digest as lowercase hex.
 *
 * @param value - Value to hash.
 * @returns A 64-character hex digest.
 */
export const sha256 = (value: string): string => {
  return CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex);
};
