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
  mock: Function,
  mockOnce: Function,
  run: Function,
  runOnce: Function
}

export interface IAxiosRequest {
  "constructor"(
    $options: Object,
    $instance: Function,
    $adapter: Object | null,
    ReplyCache: Map<String, Function>,
    runBuilder: Function
  ): void;
  $options: Object,
  $instance: Function,
  $adapter: Object | null,
  ReplyCache: Object,
  runBuilder: Function,
  init: Function,
  use: Function,
  _mock: Function,
  _useMockRequest: Function,
  _normalRequest: Function
}

export interface IConfigHandlerInputs {
  methodUp: String,
  beforeRequest: Function,
  data: any
}

export * from 'axios';
