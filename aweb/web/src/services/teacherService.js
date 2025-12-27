import api from './api';

export const teacherService = {
  getAll: (academyId) => api.get('/teachers', { params: { academy_id: academyId } }),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
};

