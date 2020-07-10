export interface MockAdapterOptions {
  delayResponse?: number;
  onNoMatch?: 'passthrough';
}

export interface IMockHandlerParams {
  method: string;
  svc: string;
  data?: Object;
  config?: Array<any>;
}

export interface ICreateAPIOptions {
  useMock: boolean;
  anyReply?: any;
  beforeRequest?: Function;
  beforeResponse?: Function;
  snakifyData?: boolean;
}

export interface IUseObject {
  with: Function,
  run: Function,
}

export {
  AxiosInstance,
  AxiosRequestConfig
} from './axios.d';
