import api from './api';

export const paymentService = {
  getByStudent: (studentId) =>
    api.get('/payments', {
      params: { student_id: studentId },
    }),

  create: (data) => api.post('/payments', data),
};


