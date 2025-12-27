import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

console.log('🌐 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30초 타임아웃 (이메일 발송 시간 고려)
});

// Request interceptor - 토큰 추가 및 로깅
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 로그인 요청만 로깅 (비밀번호는 제외)
    if (config.url?.includes('/auth/login')) {
      console.log('📤 로그인 API 요청:', {
        url: `${config.baseURL}${config.url}`,
        academy_code: config.data?.academy_code
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ API 요청 설정 오류:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - 에러 처리 및 로깅
api.interceptors.response.use(
  (response) => {
    // 로그인 응답만 로깅
    if (response.config.url?.includes('/auth/login')) {
      console.log('📥 로그인 API 응답:', {
        status: response.status,
        hasToken: !!response.data?.token,
        hasUser: !!response.data?.user
      });
    }
    return response;
  },
  (error) => {
    console.error('❌ API 응답 오류:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      code: error.code,
      responseData: error.response?.data
    });
    
    if (error.code === 'ECONNABORTED') {
      error.message = '요청 시간이 초과되었습니다. 서버가 응답하지 않습니다.';
    } else if (error.code === 'ERR_NETWORK') {
      error.message = '네트워크 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해주세요.';
    }
    
    if (error.response?.status === 401) {
      // 인증 실패 시 토큰 제거 및 로그인 페이지로 리다이렉트
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

