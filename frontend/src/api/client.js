const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const ACCESS_TOKEN_KEY = 'petcheck-access-token';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const tokenStorage = {
  get: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  set: (token) => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  clear: () => localStorage.removeItem(ACCESS_TOKEN_KEY),
};

const readResponse = async (response) => {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) return response.json();

  const text = await response.text();
  return text || null;
};

export const unwrapData = (payload) => (
  payload?.data ?? payload?.result ?? payload
);

export async function apiRequest(path, options = {}) {
  const {
    auth = true,
    body,
    headers: customHeaders,
    ...requestOptions
  } = options;
  const headers = new Headers(customHeaders);
  const token = tokenStorage.get();
  const isFormData = body instanceof FormData;

  if (body != null && !isFormData) headers.set('Content-Type', 'application/json');
  if (auth && token) headers.set('Authorization', `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers,
      body: body == null || isFormData ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.', 0);
  }

  const payload = await readResponse(response);
  if (!response.ok) {
    const message =
      payload?.message
      ?? payload?.error?.message
      ?? payload?.error
      ?? `요청 처리에 실패했습니다. (${response.status})`;
    throw new ApiError(message, response.status, payload);
  }

  return unwrapData(payload);
}
