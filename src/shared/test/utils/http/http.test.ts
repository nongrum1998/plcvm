import { AxiosError } from 'axios';
import { http } from '@utils/http';
import apiClient from '@utils/http/client';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@lib/encryption', () => ({
  encryptFields: jest.fn((v: unknown) => v),
  decryptFields: jest.fn((v: unknown) => v),
}));

jest.mock('axios', () => {
  const actual = jest.requireActual('axios') as typeof import('axios');
  const request = jest.fn().mockRejectedValue(new Error('not implemented'));
  const client = {
    get: request,
    post: request,
    put: request,
    delete: request,
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  const create = jest.fn(() => client);

  return {
    ...actual,
    create,
    default: {
      ...(actual.default as object),
      create,
    },
  };
});

const mockClient = apiClient as jest.Mocked<typeof apiClient>;
const okResponse = { status: 200, data: { id: 1 }, headers: {}, config: {} } as any;

beforeEach(() => jest.clearAllMocks());

describe('http wrapper', () => {
  it('maps GET success to an ApiResponse success', async () => {
    (mockClient.get as jest.Mock).mockResolvedValue(okResponse);
    const res = await http.get<{ id: number }>('/user');
    expect(res).toMatchObject({ success: true, status: 200, data: { id: 1 } });
  });

  it('forwards url, data and config to POST and maps success', async () => {
    (mockClient.post as jest.Mock).mockResolvedValue(okResponse);
    const res = await http.post('/user', { a: 1 }, { timeout: 5 });
    expect(mockClient.post).toHaveBeenCalledWith('/user', { a: 1 }, { timeout: 5 });
    expect(res.success).toBe(true);
  });

  it('maps PUT and DELETE success to ApiResponse success', async () => {
    (mockClient.put as jest.Mock).mockResolvedValue(okResponse);
    (mockClient.delete as jest.Mock).mockResolvedValue(okResponse);
    expect((await http.put('/profile', {})).success).toBe(true);
    expect((await http.delete('/user')).success).toBe(true);
  });

  it('maps server error responses to failure with the backend message', async () => {
    (mockClient.get as jest.Mock).mockRejectedValue(
      new AxiosError('fail', 'ERR_BAD_REQUEST', {} as any, {}, {
        status: 400,
        data: { message: 'Invalid PPO' },
        headers: {},
        config: {},
      } as any)
    );
    const res = await http.get('/api/verify/');
    expect(res).toMatchObject({ success: false, status: 400, message: 'Invalid PPO' });
  });

  it('returns a network message when the request reached no server', async () => {
    (mockClient.post as jest.Mock).mockRejectedValue(
      new AxiosError('Network Error', 'ERR_NETWORK', {} as any, {})
    );
    const res = await http.post('/login', {});
    expect(res).toMatchObject({
      success: false,
      message: 'Please check your internet connection.',
    });
  });

  it('falls back to the error message for generic errors', async () => {
    (mockClient.get as jest.Mock).mockRejectedValue(new Error('boom'));
    const res = await http.get('/user');
    expect(res).toMatchObject({ success: false, message: 'boom' });
  });
});
