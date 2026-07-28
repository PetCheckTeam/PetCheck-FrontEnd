import { apiRequest, tokenStorage } from './client';

const extractToken = (data) => (
  data?.accessToken ?? data?.access_token ?? data?.token
);

export const authApi = {
  signup: (values) => apiRequest('/api/v1/auth/signup', {
    method: 'POST',
    auth: false,
    body: {
      email: values.email,
      password: values.password,
      nickname: values.nickname,
    },
  }),

  async login(values) {
    let data;
    try {
      data = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        auth: false,
        body: values,
      });
    } catch (error) {
      if (error?.status === 401 || error?.status === 403) {
        error.message = '이메일 또는 비밀번호가 올바르지 않습니다.';
      }
      throw error;
    }

    const token = extractToken(data);
    if (!token) throw new Error('로그인 응답에 Access Token이 없습니다.');
    tokenStorage.set(token);
    return data;
  },

  logout: () => apiRequest('/api/v1/auth/logout', { method: 'POST' }),
  me: () => apiRequest('/api/v1/auth/me'),
};

export const usersApi = {
  me: () => apiRequest('/api/v1/users/me'),
  updateMe: (nickname) => apiRequest('/api/v1/users/me', {
    method: 'PATCH',
    body: { nickname },
  }),
  deleteMe: () => apiRequest('/api/v1/users/me', { method: 'DELETE' }),
};

export const petsApi = {
  create: (pet) => apiRequest('/api/v1/pets', {
    method: 'POST',
    body: pet,
  }),
  list: () => apiRequest('/api/v1/pets'),
  get: (petId) => apiRequest(`/api/v1/pets/${petId}`),
  update: (petId, pet) => apiRequest(`/api/v1/pets/${petId}`, {
    method: 'PATCH',
    body: pet,
  }),
  remove: (petId) => apiRequest(`/api/v1/pets/${petId}`, { method: 'DELETE' }),
  addAvoidIngredient: (petId, ingredientId) => apiRequest(
    `/api/v1/pets/${petId}/avoid-ingredients`,
    { method: 'POST', body: { ingredientId } },
  ),
  listAvoidIngredients: (petId) => apiRequest(
    `/api/v1/pets/${petId}/avoid-ingredients`,
  ),
  removeAvoidIngredient: (petId, ingredientId) => apiRequest(
    `/api/v1/pets/${petId}/avoid-ingredients/${ingredientId}`,
    { method: 'DELETE' },
  ),
};

export const analysesApi = {
  create({ petId, image, productName }) {
    const body = new FormData();

    const data = {
      petId: Number(petId),
      productName,
    };

    body.append(
      'data',
      new Blob([JSON.stringify(data)], {
        type: 'application/json',
      }),
    );

    body.append('image', image);

    return apiRequest('/api/v1/analyses', {
      method: 'POST',
      body,
    });
  },
  get: (analysisId) => apiRequest(`/api/v1/analyses/${analysisId}`),
  updateOcr: (analysisId, editedOcrResult) => apiRequest(
    `/api/v1/analyses/${analysisId}/ocr`,
    { method: 'PUT', body: { editedOcrResult } },
  ),
  confirm: (analysisId) => apiRequest(`/api/v1/analyses/${analysisId}/confirm`, {
    method: 'POST',
  }),
  retry: (analysisId, retryStep) => apiRequest(`/api/v1/analyses/${analysisId}/retry`, {
    method: 'POST',
    body: { retryStep },
  }),
  remove: (analysisId) => apiRequest(`/api/v1/analyses/${analysisId}`, {
    method: 'DELETE',
  }),
};

export { tokenStorage };
