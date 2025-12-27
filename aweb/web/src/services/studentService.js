import api from './api';

export const studentService = {
  getAll: (academyId) => api.get('/students', { params: { academy_id: academyId } }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

