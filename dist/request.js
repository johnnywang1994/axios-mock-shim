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
function mockHandler({ method, svc, config }, mockReply, once) {
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
    mock[`on${firstUp(method)}`](svc, config[0])[once ? 'replyOnce' : 'reply'].apply(mock, isFn(handler) ? [handler] : handler);
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
            ? (...args) => () => this._useMockRequest(...args)
            : (...args) => () => this._normalRequest(...args);
    },
    use(method, svc, data = {}) {
        const parent = this;
        const { _mock, ReplyCache, $options } = this;
        const { snakifyData, beforeRequest } = $options;
        const methodUp = method.toUpperCase();
        data = snakifyData ? snakifyKeys(data) : data;
        let configs = {
            method,
            svc,
            data,
            config: configHandler({ methodUp, beforeRequest, data }),
        };
        const cacheToken = stringify(configs);
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
            mock() {
                const { useMock } = parent.$options;
                if (!useMock)
                    return this; // if dont use mock, return this.
                _mock.call(parent, configs, false);
                return this;
            },
            mockOnce() {
                const { useMock } = parent.$options;
                if (!useMock)
                    return this; // if dont use mock, return this.
                _mock.call(parent, configs, true);
                return this;
            },
            // pass configs to runBuilder
            // "run" will become a function, eg. "() => this._useMockRequest()"
            run: parent.runBuilder.call(parent, configs, false),
            runOnce: parent.runBuilder.call(parent, configs, true)
        };
    },
    _mock(configs, once) {
        const { $adapter, ReplyCache, $options } = this;
        const { anyReply } = $options;
        const cacheToken = stringify(configs);
        const hasCache = RequestCache.has(cacheToken);
        // check cache, avoid duplicate mocked
        if (!hasCache) {
            !once ? RequestCache.add(cacheToken) : false;
            // check if cache has the mock data
            if (ReplyCache.has(cacheToken)) {
                mockHandler.call($adapter, configs, ReplyCache.get(cacheToken), once);
            }
            else {
                anyReply && mockHandler.call($adapter, configs, anyReply, once);
            }
        }
    },
    _useMockRequest(configs, once) {
        const { _mock, _normalRequest } = this;
        // mock api
        _mock.call(this, configs, once);
        // Important!! Don't remove this return
        // This return stays for Promise mechanism
        return _normalRequest.call(this, configs);
    },
    _normalRequest({ method, svc, config }) {
        const { $instance, $options } = this;
        const { beforeResponse } = $options;
        if (!httpMethodList.has(method.toUpperCase()))
            return warn('Invalid http method', method);
        return $instance[method.toLowerCase()](svc, ...config).then(beforeResponse ? beforeResponse : (res) => res);
    },
};
