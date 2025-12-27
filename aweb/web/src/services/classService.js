import api from './api';

export const classService = {
  getAll: (academyId) => api.get('/classes', { params: { academy_id: academyId } }),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
};

