import api from './api';

export const classroomService = {
  getAll: (academyId) => api.get('/classrooms', { params: { academy_id: academyId } }),
  getById: (id) => api.get(`/classrooms/${id}`),
  create: (data) => api.post('/classrooms', data),
  update: (id, data) => api.put(`/classrooms/${id}`, data),
  delete: (id) => api.delete(`/classrooms/${id}`),
};

