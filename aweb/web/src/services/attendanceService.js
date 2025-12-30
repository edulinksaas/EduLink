import api from './api';

export const attendanceService = {
  getByStudent: (studentId, month) =>
    api.get('/attendance', {
      params: {
        student_id: studentId,
        month,
      },
    }),

  markPresent: ({ academyId, studentId, classId, date, note }) =>
    api.post('/attendance', {
      academy_id: academyId,
      student_id: studentId,
      class_id: classId,
      date,
      status: 'present',
      note,
    }),

  markAbsent: ({ academyId, studentId, classId, date, note }) =>
    api.post('/attendance', {
      academy_id: academyId,
      student_id: studentId,
      class_id: classId,
      date,
      status: 'absent',
      note,
    }),

  create: ({ academyId, studentId, classId, date, status, note }) =>
    api.post('/attendance', {
      academy_id: academyId,
      student_id: studentId,
      class_id: classId,
      date,
      status,
      note: note || '',
    }),

  update: (attendanceId, { status, note }) =>
    api.put(`/attendance/${attendanceId}`, {
      status,
      note: note || '',
    }),

  delete: (attendanceId) =>
    api.delete(`/attendance/${attendanceId}`),
};


