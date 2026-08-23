/**
 * Centralized API Client with Live Request Inspector Interceptor
 */

const BASE = (import.meta.env.VITE_API_BASE_URL || 'https://playground.nileslabs.com/api').replace(/\/+$/, '');

// Listeners for Live API Inspector
const listeners = new Set();

export const subscribeToApiLogs = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export const getBaseUrl = () => `${BASE}/v1`;

export const getEndpointUrl = (path = '') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}/v1${cleanPath}`;
};

export async function apiRequest(path, options = {}) {
  const url = getEndpointUrl(path);
  const method = options.method || 'GET';
  const startTime = performance.now();
  const timestamp = new Date().toLocaleTimeString();
  const id = Math.random().toString(36).substring(2, 9);

  // Headers
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  // Session Token fallback
  const sessionToken = localStorage.getItem('pg_identity');
  if (sessionToken && !headers.has('X-Playground-Identity')) {
    headers.set('X-Playground-Identity', sessionToken);
  }

  // Auth Bearer token if logged in
  const authToken = localStorage.getItem('access_token');
  if (authToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  // Simulated Delay if set
  const simulatedDelay = localStorage.getItem('playground_simulated_delay');
  if (simulatedDelay && simulatedDelay !== '0') {
    headers.set('X-Simulate-Delay', simulatedDelay);
  }

  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include',
  };

  let responseData = null;
  let status = 0;
  let errorMsg = '';

  try {
    const res = await fetch(url, fetchOptions);
    status = res.status;

    // Check if server set a new session token in headers
    const returnedToken = res.headers.get('x-playground-identity');
    if (returnedToken) {
      localStorage.setItem('pg_identity', returnedToken);
    }

    if (status === 204) {
      responseData = null;
    } else {
      const text = await res.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = text;
      }
    }

    if (!res.ok) {
      const err = new Error(responseData?.message || `HTTP ${status} – ${res.statusText}`);
      err.status = status;
      err.data = responseData;
      throw err;
    }

    return responseData;
  } catch (err) {
    errorMsg = err.message;
    throw err;
  } finally {
    const timeMs = Math.round(performance.now() - startTime);

    let parsedReqBody = undefined;
    if (options.body && typeof options.body === 'string') {
      try {
        parsedReqBody = JSON.parse(options.body);
      } catch {
        parsedReqBody = options.body;
      }
    }

    const log = {
      id,
      timestamp,
      method,
      url,
      status,
      timeMs,
      requestBody: parsedReqBody,
      responseBody: responseData,
      error: errorMsg || undefined,
    };

    listeners.forEach((cb) => {
      try {
        cb(log);
      } catch (e) {
        console.error('Error logging api request', e);
      }
    });
  }
}
