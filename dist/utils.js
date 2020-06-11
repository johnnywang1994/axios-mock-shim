export function isFn(v) {
    return v !== null && typeof v === 'function';
}
export function isObject(v) {
    return v !== null && typeof v === 'object';
}
export function isArray(v) {
    return v !== null && Array.isArray(v);
}
export function firstUp(str) {
    return str[0].toUpperCase() + str.slice(1);
}
export function stringify(method, svc, data) {
    return JSON.stringify({
        method,
        svc,
        data
    });
}
export function warn(msg, ...args) {
    console.error('[axios-mock-shim]: ' + msg, ...args);
}
