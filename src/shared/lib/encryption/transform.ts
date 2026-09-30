import { decryptText, encryptText } from './encryption';

/**
 * Recursively encrypts every string in a value.
 *
 * Asynchronous because {@link encryptText} draws its IV from a native random
 * source. Objects and arrays are walked concurrently, so a wide payload costs
 * one round of native calls rather than one per leaf.
 *
 * @param value - Any JSON-shaped value. Non-string leaves pass through.
 * @returns A promise resolving to a new value with the same shape, encrypted.
 * @throws Whatever `encryptText` throws, propagated as a rejection.
 *
 * @example
 * ```ts
 * const body = await encryptFields({ payload: JSON.stringify(data) });
 * ```
 */
export async function encryptFields<T>(value: T): Promise<T> {
  return (await transformAsync(value, encryptText)) as T;
}

export async function ecryptObject<T>(value: T): Promise<T> {
  return (await encryptText(JSON.stringify(value))) as T;
}

/**
 * Recursively decrypts every string in a value.
 *
 * Stays synchronous: decryption reads the IV back out of the token, so it
 * needs no random source and no native call.
 *
 * @param value - Any JSON-shaped value. Non-string leaves pass through.
 * @returns A new value with the same shape, decrypted.
 */
export function decryptFields<T>(value: T): T {
  return transform(value, decryptText) as T;
}

type StringMapper = (value: string) => string;

/**
 * The async and sync walks are kept separate on purpose.
 *
 * Unifying them behind a mapper that may or may not return a promise would
 * force every string through a promise allocation and would lose the static
 * types that let `decryptFields` stay synchronous. The duplication is ~15
 * lines of structure and buys both properties back.
 */
async function transformAsync(
  value: unknown,
  transformString: (value: string) => Promise<string>
): Promise<unknown> {
  // String → encrypt/decrypt it
  if (typeof value === 'string') {
    return transformString(value);
  }

  // Array → recursively transform every item
  if (Array.isArray(value)) {
    return Promise.all(value.map((item) => transformAsync(item, transformString)));
  }

  // Object → recursively transform every property
  if (value !== null && typeof value === 'object') {
    const entries = await Promise.all(
      Object.entries(value).map(
        async ([key, currentValue]) =>
          [key, await transformAsync(currentValue, transformString)] as const
      )
    );

    return Object.fromEntries(entries);
  }

  // number, boolean, null, undefined → unchanged
  return value;
}

function transform(value: unknown, transformString: StringMapper): unknown {
  // String → encrypt/decrypt it
  if (typeof value === 'string') {
    return transformString(value);
  }

  // Array → recursively transform every item
  if (Array.isArray(value)) {
    return value.map((item) => transform(item, transformString));
  }

  // Object → recursively transform every property
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};

    for (const [key, currentValue] of Object.entries(value)) {
      result[key] = transform(currentValue, transformString);
    }

    return result;
  }

  // number, boolean, null, undefined → unchanged
  return value;
}
