import { AxiosInstance, AxiosInterceptorOptions } from 'axios';

export interface ApiInterceptors {
  request?: Array<{
    onFulfilled?: Parameters<AxiosInstance['interceptors']['request']['use']>[0];
    onRejected?: Parameters<AxiosInstance['interceptors']['request']['use']>[1];
    options?: AxiosInterceptorOptions;
  }>;

  response?: Array<{
    onFulfilled?: Parameters<AxiosInstance['interceptors']['response']['use']>[0];
    onRejected?: Parameters<AxiosInstance['interceptors']['response']['use']>[1];
    options?: AxiosInterceptorOptions;
  }>;
}
