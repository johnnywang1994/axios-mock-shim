export const mockDefaultConfig = {
    delayResponse: 500,
    onNoMatch: "passthrough",
};
export const axiosDefaultConfig = {
    baseURL: '/api/',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000,
    withCredentials: true,
};
export const httpMethodList = new Set([
    'GET',
    'POST',
    'PUT',
    'HEAD',
    'DELETE',
    'PATCH',
    'OPTIONS',
]);
