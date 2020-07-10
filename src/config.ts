import {
  MockAdapterOptions,
  AxiosRequestConfig
} from '../types/index.d';

export const mockDefaultConfig: MockAdapterOptions = {
  delayResponse: 500,
  onNoMatch: "passthrough",
}

export const axiosDefaultConfig: AxiosRequestConfig = {
  baseURL: '/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
  withCredentials: true,
}

export const httpMethodList = new Set([
  'GET',
  'POST',
  'PUT',
  'HEAD',
  'DELETE',
  'PATCH',
  'OPTIONS',
]);

export const useDataMethodList = new Set([
  'POST',
  'PUT',
  'PATCH',
]);
