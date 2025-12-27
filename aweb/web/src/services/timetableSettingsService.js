import api from './api';

export const timetableSettingsService = {
  async get(academyId) {
    const response = await api.get('/timetable-settings', {
      params: { academy_id: academyId }
    });
    return response.data;
  },

  async save(data) {
    const response = await api.post('/timetable-settings', data);
    return response.data;
  },

  async update(data) {
    const response = await api.put('/timetable-settings', data);
    return response.data;
  }
};

