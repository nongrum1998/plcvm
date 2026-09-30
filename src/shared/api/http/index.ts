import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { handleAxiosError, handleResponse } from './handle-res';
import { ApiResponse } from '@sharedTypes';

export function createHttp(client: AxiosInstance) {
  const request = async <T>(executor: () => Promise<AxiosResponse<T>>): Promise<ApiResponse<T>> => {
    try {
      return handleResponse<T>(await executor());
    } catch (e) {
      return handleAxiosError(e);
    }
  };

  return {
    get: <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
      request(() => client.get<T>(url, config)),

    post: <T>(
      url: string,
      data?: object | string,
      config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> => request(() => client.post<T>(url, data, config)),

    put: <T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
      request(() => client.put<T>(url, data, config)),

    delete: <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
      request(() => client.delete<T>(url, config)),
  };
}
