import { AxiosInstance, AxiosInterceptorOptions } from 'axios';

export interface ApiInterceptors {
  request?: {
    onFulfilled?: Parameters<AxiosInstance['interceptors']['request']['use']>[0];
    onRejected?: Parameters<AxiosInstance['interceptors']['request']['use']>[1];
    options?: AxiosInterceptorOptions;
  }[];

  response?: {
    onFulfilled?: Parameters<AxiosInstance['interceptors']['response']['use']>[0];
    onRejected?: Parameters<AxiosInstance['interceptors']['response']['use']>[1];
    options?: AxiosInterceptorOptions;
  }[];
}
