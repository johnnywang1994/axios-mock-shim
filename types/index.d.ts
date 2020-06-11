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
  anyReply?: any;
  beforeResponse?: Function;
  snakifyData?: boolean;
}

export {
  AxiosInstance,
  AxiosRequestConfig
} from './axios.d';
