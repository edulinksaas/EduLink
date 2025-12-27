import api from './api';

export const parentService = {
  // 학부모 ID로 조회
  getById: (id) => api.get(`/parents/${id}`),
  
  // 전화번호로 학부모 조회
  getByPhone: (phone) => api.get('/parents/phone/search', { params: { phone } }),
  
  // parentsapp 가입 여부 확인
  checkRegistration: (phone) => api.get('/parents/phone/check-registration', { params: { phone } }),
  
  // 학부모별 자녀 목록 조회
  getChildren: (parentId) => api.get(`/parents/${parentId}/children`),
  
  // 학부모 생성
  create: (data) => api.post('/parents', data),
  
  // 학부모-학생 관계 생성
  createRelation: (parentId, studentId, data = {}) => 
    api.post(`/parents/${parentId}/children/${studentId}`, data),
  
  // 학부모-학생 관계 삭제
  deleteRelation: (parentId, studentId) => 
    api.delete(`/parents/${parentId}/children/${studentId}`),
};


