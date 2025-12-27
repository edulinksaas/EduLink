import api from './api';

export const requestService = {
  getAll: () => api.get('/requests'),
  getById: (id) => api.get(`/requests/${id}`),
  approve: (id) => api.post(`/requests/${id}/approve`),
  reject: (id) => api.post(`/requests/${id}/reject`),
  processAbsence: (id) => api.post(`/requests/${id}/process-absence`),
  processSupplementary: (id) => api.post(`/requests/${id}/process-supplementary`),
  processChange: (id) => api.post(`/requests/${id}/process-change`),
  processDefer: (id) => api.post(`/requests/${id}/process-defer`),
};

