import api from './api';

export const authService = {
  login: (academy_code, password) => api.post('/auth/login', { academy_code, password }),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  resetPassword: (academy_code, new_password) => api.post('/auth/reset-password', { academy_code, new_password }),
  changePassword: (current_password, new_password) => api.post('/auth/change-password', { current_password, new_password }),
};

