import api from './api';

export const memoService = {
  getByStudent: (studentId) =>
    api.get('/memos', {
      params: { student_id: studentId },
    }),

  create: (data) => api.post('/memos', data),
};


