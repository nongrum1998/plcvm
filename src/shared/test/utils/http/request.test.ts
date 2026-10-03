/**
 * @file Tests for the Axios request interceptor that encrypts request bodies.
 *
 * The interceptor has to *await* `encryptFields` now that encryption is
 * asynchronous. A missing `await` would not throw — it would silently send a
 * pending promise as the request body — so the body assertions below resolve
 * the value and compare, which is what catches that mistake.
 */

import { encryptReqBody } from '@utils/http/request';
import { encryptFields } from '@lib/encryption/transform';
import type { InternalAxiosRequestConfig } from 'axios';

const mockEncryptFields = encryptFields as jest.Mock;

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// `request.ts` imports `{ encryptFields } from '@lib/encryption/transform'`, so the
// barrel is the correct mock target here.
jest.mock('@lib/encryption/transform', () => ({
  encryptFields: jest.fn(async (value: unknown) => ({
    ...(value as Record<string, unknown>),
    encrypted: true,
  })),
  decryptFields: jest.fn((value: unknown) => value),
}));

beforeEach(() => jest.clearAllMocks());

function configWith(data: unknown): InternalAxiosRequestConfig {
  return { data } as InternalAxiosRequestConfig;
}

describe('encryptReqBody', () => {
  it('resolves the encrypted body before handing the config on', async () => {
    const interceptor = encryptReqBody();

    const result = await interceptor(configWith({ username: 'pensioner' }));

    expect(result.data).toEqual({
      payload: '{"username":"pensioner"}',
      encrypted: true,
    });
  });

  it('wraps the serialized body in a payload envelope', async () => {
    const interceptor = encryptReqBody();

    await interceptor(configWith({ a: 1 }));

    expect(mockEncryptFields).toHaveBeenCalledWith({ payload: '{"a":1}' });
  });

  it('passes an absent body straight through', async () => {
    const interceptor = encryptReqBody();

    const result = await interceptor(configWith(undefined));

    expect(result.data).toBeUndefined();
    expect(mockEncryptFields).not.toHaveBeenCalled();
  });

  it('leaves FormData untouched so uploads are not encrypted', async () => {
    const interceptor = encryptReqBody();
    const form = new FormData();

    const result = await interceptor(configWith(form));

    expect(result.data).toBe(form);
    expect(mockEncryptFields).not.toHaveBeenCalled();
  });

  it('leaves URLSearchParams untouched so form-encoded requests keep their wire format', async () => {
    const interceptor = encryptReqBody();
    const params = new URLSearchParams({ a: '1' });

    const result = await interceptor(configWith(params));

    expect(result.data).toBe(params);
    expect(mockEncryptFields).not.toHaveBeenCalled();
  });

  it('propagates an encryption failure to the request pipeline', async () => {
    mockEncryptFields.mockRejectedValueOnce(new Error('Fernet key missing'));

    const interceptor = encryptReqBody();

    await expect(interceptor(configWith({ a: 1 }))).rejects.toThrow('Fernet key missing');
  });
});
