import apiClient from './apiClient';

export const authApi = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }).then((r) => r.data),

  register: (pseudo, email, password) =>
    apiClient.post('/auth/register', { pseudo, email, password }).then((r) => r.data),

  getMe: () =>
    apiClient.get('/auth/me').then((r) => r.data),
};
