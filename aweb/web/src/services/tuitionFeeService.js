import api from './api';

export const tuitionFeeService = {
  async getAll(academyId) {
    const response = await api.get('/tuition-fees', {
      params: { academy_id: academyId }
    });
    return response.data;
  },

  async create(data) {
    const response = await api.post('/tuition-fees', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/tuition-fees/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/tuition-fees/${id}`);
    return response.data;
  }
};

