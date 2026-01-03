import api from './api';

export const userService = {
  // 현재 로그인한 사용자 정보 조회
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  // 사용자 정보 업데이트
  updateUser: (userId, updateData) => {
    return api.put(`/users/${userId}`, updateData);
  },

  // 사용자 정보 조회
  getUserById: (userId) => {
    return api.get(`/users/${userId}`);
  },
};

