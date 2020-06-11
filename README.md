# Axios Mock Shim

A plugin build for easily using axios-mock-adapter with axios.

Be sure to install `axios` & `axios-mock-adapter` before using this plugin.


## Install

```bash
npm i axios-mock-shim
// or
yarn add axios-mock-shim
```


## Usage


### Step 1.

Import the plugin with two methods `createAxios`, `createAPIHandler`

```js
import { createAxios, createAPIHandler } from './axios-mock-shim';
```

- **createAxios(axiosConfig)**

Create Axios instance by given config.（default config or your custom config）

```js
const instance = createAxios();
```

- **createAPIHandler(axiosInstance, shimOptions)**

Create an `AxiosRequest` object, which you can then use to define & call the api with specific mock data.

> Note: Here must provide the `shimOptions` with at least `useMock` property to tell the plugin whether using the mock-adapter.

```js
// Create an AxiosRequest with mock-adapter feature
const api = createAPIHandler(instance, { useMock: true });

// If you would like to use pure axios for production
// You can set the option as below
const api = createAPIHandler(instance, {
  useMock: process.env.NODE_ENV !== 'production'
});
```


### Step 2.

Define your api logic & mock data with your `AxiosRequest` object

method list: `use`, `with`, `run`


- **use(method, svc, data)**

Define the api setting

  1. method: http method  
    **required**  
    - type: `string` 

  2. svc: url path  
    **required**  
    - type: `string`  
    (note => without baseURL in axios instance)

  3. data: params or data  
    **optional**  
    - type: `object`


- **with(replyHandler)**

Define the mock reply data.

> If your set `useMock` to `false`, then no need to call this method.

> Even you call this method with `useMock` set by `false`, it will still skip the mock feature automatically.

  1. replyHandler: handler send to mock-adapter's `reply` method
    **required**
    - type: `function(resolve, reject, config)` | `array[statusCode: number, data]`
    > function will get three arguments, when using function type reply, please wrap your data into the first `resolve` method in order to tell the plugin fullfill the Promise.


- **run()**

Execute the `AxiosRequest`


```js
export default {

  // array type reply
  getProfile() {
    return api.use('get', 'solo/config').with([200, {
      data: {
        number: 10,
      }
    }]).run();
  },

  // function type reply
  getSoloConfig() {
    return api.use('get', 'profile').with((resolve, reject, config) => {
      console.log(config); // mock-adapter's config
      res([
        200,
        {
          data: {
            name: 'Johnny',
            money: 1000,
          },
        }
      ]);
    }).run();
  },

  // If no need for mock
  getNoMock() {
    return api.use('get', 'nomock').run();
  },
};
```

## Options

### useMock

Required to set whether using mock-adapter. no default value.


### beforeResponse

You can specify what to do before getting the response, eg.

```js
const api = createAPIHandler(instance, {
  useMock: true,
  beforeResponse(res) {
    return camelizeKeys(res.data);
  },
});
```


### anyReply

If you need to mock every request which without using `with` to set its mock data, this property could that you define a fallback reply which will be used for all unhandled request.

> This could only used with `useMock` set by `true`;

```js
const api = createAPIHandler(instance, {
  useMock: process.env.NODE_ENV !== 'production',
  anyReply: [200, {
    error: 'Unhandled request',
  }],
  // or
  anyReply(resolve, reject, config) {
    if (Math.random() > 0.1) return reject([404]);
    return resolve([200, {
      error: 'Unhandled request'
    }]);
  },
});
```


## Default setting

### Mock Adapter Config

```js
const mockDefaultConfig = {
  delayResponse: 500,
  onNoMatch: "passthrough",
}
```

### Axios Config

```js
const axiosDefaultConfig = {
  baseURL: '/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
  withCredentials: true,
}
```


## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2020-present, Johnny Wang