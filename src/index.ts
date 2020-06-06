/* eslint-disable */
const axios = require('axios');

/* tools & config */
import { isObject, isFn, warn } from './utils';
import { axiosDefaultConfig } from './config';
import { AxiosRequest } from './request';

/* declare */
import {
  ICreateAPIOptions,
  AxiosInstance,
  AxiosRequestConfig
} from '../types/index.d';

/**
 * Create Axios instance
 * 
 * @param config [optional]: Axios instance configuration
 */
export function createAxios(
  config: AxiosRequestConfig = {},
): AxiosInstance | void {
  if (!isObject(config)) return warn('Config invalid', config);
  return axios.create((Object as any).assign(
    axiosDefaultConfig,
    config,
  ));
}

/**
 * Interface for user to create axios request
 * 
 * @param instance [required]: Axios intance
 * @param options [required]: shim configuration
 */
export function createAPIHandler(
  instance: AxiosInstance,
  options: ICreateAPIOptions,
) {
  if (!isFn(instance)) return warn('instance invalid', instance);
  if (!isObject(options)) return warn('options invalid', options);
  return new AxiosRequest(instance, options);
}
