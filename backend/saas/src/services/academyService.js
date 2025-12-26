import api from './api';

export const academyService = {
  getAll: () => api.get('/academies'),
  getById: (id) => api.get(`/academies/${id}`),
  create: (data) => api.post('/academies', data),
  update: (id, data) => api.put(`/academies/${id}`, data),
  delete: (id) => api.delete(`/academies/${id}`),
};

