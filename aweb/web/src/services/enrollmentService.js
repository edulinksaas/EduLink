import api from './api';

export const enrollmentService = {
  getAll: (classId = null, studentId = null) => {
    const params = {};
    if (classId) params.class_id = classId;
    if (studentId) params.student_id = studentId;
    return api.get('/enrollments', { params });
  },
  getById: (id) => api.get(`/enrollments/${id}`),
  create: (data) => api.post('/enrollments', data),
  update: (id, data) => api.put(`/enrollments/${id}`, data),
  delete: (id) => api.delete(`/enrollments/${id}`),
};

