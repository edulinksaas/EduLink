import api from './api';

export const subjectService = {
  getAll: (academyId) => api.get('/subjects', { params: { academy_id: academyId } }),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

