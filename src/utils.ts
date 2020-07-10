function camelizeStr(str) {
  return str.replace(/[_.-](\w|$)/g, (_, x) => x.toUpperCase());
}

function snakifyStr(str) {
  return str.replace(/(?:^|\.?)([A-Z])/g, (_, x) => `_${x.toLowerCase()}`);
}

function convertCase(convertFunc) {
  function converter(thing) {
    if (thing instanceof Array) {
      return thing.map((i) => converter(i));
    }
    if (thing instanceof Object) {
      const newObj = {};
      Object.keys(thing).forEach((k) => {
        newObj[convertFunc(k)] = converter(thing[k]);
      });
      return newObj;
    }
    return thing;
  }
  return converter;
}

export const camelizeKeys = convertCase(camelizeStr);

export const snakifyKeys = convertCase(snakifyStr);

export function isFn(v) {
  return v !== null && typeof v === 'function';
}

export function isObject(v) {
  return v !== null && typeof v === 'object';
}

export function isArray(v) {
  return v !== null && Array.isArray(v);
}

export function firstUp(str: string): string {
  return str[0].toUpperCase() + str.slice(1);
}

export function stringify(configs) {
  return JSON.stringify(configs);
}

export function warn(msg, ...args) {
  console.error('[axios-mock-shim]: ' + msg, ...args);
}
