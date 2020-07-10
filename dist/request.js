/* eslint-disable */
const MockAdapter = require('axios-mock-adapter');
import { snakifyKeys, firstUp, isArray, isFn, stringify, warn } from './utils';
import { mockDefaultConfig, httpMethodList, useDataMethodList } from './config';
// Cache for whole page
const RequestCache = new Set();
/**
 * Create config for real axios request
 *
 * @param instance
 * @param config
 */
function configHandler({ methodUp, beforeRequest, data }) {
    const config = [];
    if (useDataMethodList.has(methodUp)) {
        config[0] = data;
        beforeRequest
            ? config[1] = beforeRequest({})
            : false;
    }
    else {
        config[0] = beforeRequest ? beforeRequest(data) : data;
    }
    return config;
}
/**
 * Create mock adapter instance
 *
 * @param instance [required]: Axios instance
 * @param config [optional]: Mock instance options
 */
function createMock(instance, config = {}) {
    return new MockAdapter(instance, Object.assign(mockDefaultConfig, config));
}
/**
 * Define mock api with given mockData
 *
 * @param this [required]: mock instance
 * @param param1 [required]: api params
 * @param mockData [required]: mock data list
 */
function mockHandler({ method, svc, config }, mockReply) {
    const mock = this;
    // handler choose
    let handler;
    if (isFn(mockReply)) {
        handler = function mockReplyHandler(mockConfig) {
            return new Promise((resolve, reject) => mockReply(resolve, reject, mockConfig));
        };
    }
    else {
        handler = mockReply;
    }
    // config handling
    mock[`on${firstUp(method)}`](svc, ...config)
        .reply.apply(mock, isFn(handler) ? [handler] : handler);
}
/**
 * Class of AxiosRequest
 * user can create & manipulate with this object
 *
 * @param instance [required]: Axios intance
 * @param options [required]: shim configuration
 */
export function AxiosRequest(instance, options) {
    this.$options = options;
    this.$instance = instance;
    this.$adapter = null;
    this.ReplyCache = new Map();
    this.runBuilder = () => { };
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
            with(fn) {
                const { useMock } = parent.$options;
                if (!useMock)
                    return this;
                const invalid = !isFn(fn) && !isArray(fn);
                if (invalid)
                    return warn('reply invalid, should be type Function or Array', fn);
                ReplyCache.set(cacheToken, fn);
                return this;
            },
            run: parent.runBuilder.apply(parent, [method, svc, data]),
        };
    },
    useMockRequest(method, svc, data = {}) {
        const { normalRequest, $adapter, ReplyCache, $options } = this;
        const { snakifyData, anyReply, beforeRequest } = $options;
        const methodUp = method.toUpperCase();
        const cacheToken = stringify(method, svc, data);
        data = snakifyData ? snakifyKeys(data) : data;
        let configs = {
            method,
            svc,
            config: configHandler({ methodUp, beforeRequest, data }),
        };
        // with mockReply defined & not yet cached
        const hasCache = RequestCache.has(cacheToken);
        if (!hasCache) {
            RequestCache.add(cacheToken);
            // check if cache has the mock data
            if (ReplyCache.has(cacheToken)) {
                mockHandler.call($adapter, configs, ReplyCache.get(cacheToken));
            }
            else {
                anyReply && mockHandler.call($adapter, configs, anyReply);
            }
        }
        // Important!! Don't remove this return
        // This return stays for Promise mechanism
        return normalRequest.call(this, configs);
    },
    normalRequest({ method, svc, config }) {
        const { $instance, $options } = this;
        const { beforeResponse } = $options;
        const methodUp = method.toUpperCase();
        if (!httpMethodList.has(methodUp))
            return warn('Invalid http method', method);
        return $instance[method.toLowerCase()](svc, ...config).then(beforeResponse ? beforeResponse : (res) => res);
    },
};
