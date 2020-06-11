/* eslint-disable */
const MockAdapter = require('axios-mock-adapter');

import {
  firstUp,
  isArray,
  isFn,
  stringify,
  warn
} from './utils';
import { mockDefaultConfig, httpMethodList } from './config';

/* declare */
import {
  MockAdapterOptions,
  IMockHandlerParams,
  ICreateAPIOptions,
  AxiosInstance
} from '../types/index.d';

// Cache for whole page
const RequestCache = new Set();


/**
 * Create mock adapter instance
 * 
 * @param instance [required]: Axios instance
 * @param config [optional]: Mock instance options
 */
function createMock(
  instance: AxiosInstance,
  config: MockAdapterOptions = {},
) {
  return new MockAdapter(instance, (Object as any).assign(
    mockDefaultConfig,
    config,
  ));
}

/**
 * Define mock api with given mockData
 * 
 * @param this [required]: mock instance
 * @param param1 [required]: api params
 * @param mockData [required]: mock data list
 */
function mockHandler(
  this: any,
  { method, svc, data }: IMockHandlerParams,
  mockReply,
): void {
  const mock = this;
  let handler: Function | any[];
  if (isFn(mockReply)) {
    handler = function mockReplyHandler(config) {
      return new Promise(
        (resolve, reject) => mockReply(resolve, reject, config)
      );
    };
  } else {
    handler = mockReply;
  }
  mock
    [`on${firstUp(method)}`](svc, data)
    .reply.apply(mock, isFn(handler) ? [handler] : handler);
}

/**
 * Class of AxiosRequest
 * user can create & manipulate with this object
 * 
 * @param instance [required]: Axios intance
 * @param options [required]: shim configuration
 */
export function AxiosRequest(
  instance: AxiosInstance,
  options: ICreateAPIOptions,
) {
  this.$options = options;
  this.$instance = instance;
  this.$adapter = null;
  this.ReplyCache = new Map();
  this.runBuilder = () => {};
  this.init();
}

AxiosRequest.prototype = {

  init() {
    const { $instance } = this;
    const { useMock } = this.$options;
    if (useMock) {
      this.$adapter = createMock($instance);
    }
    // runBuilder return the correct method for run
    this.runBuilder = useMock
      ? (...args) => () => this.useMockRequest(...args)
      : (...args) => () => this.normalRequest(...args);
  },

  use(method, svc, data = {}) {
    const parent = this;
    const { ReplyCache } = this;
    const cacheToken = stringify(method, svc, data);

    // Return an object to define mock data & calling
    return {
      with(fn: Function | any[]) {
        const invalid = !isFn(fn) && !isArray(fn);
        if (invalid) return warn(
          'reply invalid, should be type Function or Array',
          fn,
        );
        ReplyCache.set(cacheToken, fn);
        return this;
      },
      run: parent.runBuilder.apply(parent, [method, svc, data]),
    };
  },


  useMockRequest(method, svc, data = {}) {
    const { normalRequest, $adapter, ReplyCache } = this;
    const cacheToken = stringify(method, svc, data);

    // with mockReply defined & not yet cached
    const hasCache = RequestCache.has(cacheToken);
    if (!hasCache) {
      RequestCache.add(cacheToken);
      // check if cache has the mock data
      if (ReplyCache.has(cacheToken)) {
        mockHandler.call(
          $adapter,
          { method, svc, data },
          ReplyCache.get(cacheToken),
        );
      } else {
        const { anyReply } = this.$options;
        anyReply && mockHandler.call(
          $adapter,
          { method, svc, data },
          anyReply,
        );
      }
    }

    // Important!! Don't remove this return
    // This return stays for Promise mechanism
    return normalRequest.call(this, method, svc, data);
  },


  normalRequest(method, svc, data) {
    const { $instance, $options } = this;
    const { beforeResponse } = $options;
    if (!httpMethodList.has(method.toUpperCase())) return warn(
      'Invalid http method',
      method,
    );
    return $instance({
      method,
      url: svc,
      [method.toUpperCase() === 'GET'
        ? 'params'
        : 'data'
      ]: data,
    }).then(beforeResponse ? beforeResponse : (res) => res);
  },
}
