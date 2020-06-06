export interface MockAdapterOptions {
  delayResponse?: number;
  onNoMatch?: 'passthrough';
}

export interface IMockHandlerParams {
  method: string;
  svc: string;
  data?: Object;
}

export interface ICreateAPIOptions {
  useMock: boolean;
}

export {
  AxiosInstance,
  AxiosRequestConfig
} from './axios.d';
