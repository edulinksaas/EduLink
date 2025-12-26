import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 초기 로드 시 토큰 확인
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (err) {
        console.error('사용자 정보 복원 실패:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (academy_code, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 로그인 시도:', { academy_code: academy_code?.trim() });
      
      const response = await authService.login(academy_code, password);
      
      console.log('✅ 로그인 응답 받음:', response.data);
      
      const { token, user: userData } = response.data;
      
      if (!token || !userData) {
        throw new Error('서버 응답에 토큰 또는 사용자 정보가 없습니다.');
      }
      
      // 토큰 및 사용자 정보 저장
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      
      // 학원 정보가 응답에 포함되어 있으면 AcademyContext 업데이트
      if (userData?.academy_id && userData?.academy_name) {
        // AcademyContext의 updateAcademy를 호출하기 위해 이벤트 발생
        window.dispatchEvent(new CustomEvent('academyUpdated', {
          detail: {
            id: userData.academy_id,
            name: userData.academy_name,
            code: userData.academy_code,
            logo_url: null // 로그인 응답에 logo_url이 있으면 사용
          }
        }));
      }
      
      console.log('✅ 로그인 성공, 사용자 정보 저장됨');
      
      return { success: true, user: userData };
    } catch (err) {
      console.error('❌ 로그인 에러:', err);
      console.error('에러 상세:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        code: err.code
      });
      
      let errorMessage = '로그인에 실패했습니다.';
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMessage = '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요. (포트 3000)';
      } else if (err.response?.status === 401) {
        errorMessage = err.response?.data?.error || '학원 코드 또는 비밀번호가 올바르지 않습니다.';
      } else if (err.response?.status === 404) {
        const requestedUrl = err.config?.url || '알 수 없음';
        errorMessage = `API 엔드포인트를 찾을 수 없습니다. (404)\n요청 URL: ${requestedUrl}\n\n백엔드 서버가 실행 중인지 확인해주세요:\n1. 터미널에서 'cd saas/server && npm run dev' 실행\n2. http://localhost:3000/health 접속 확인`;
      } else if (err.response?.status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (registerData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('AuthContext: 회원가입 요청 시작');
      const response = await authService.register(registerData);
      console.log('AuthContext: 회원가입 응답 받음', response.data);
      
      const { token, user: userData, academy_code } = response.data;
      
      // 회원가입 성공 시 토큰은 저장하지 않고, 로그인 페이지로 이동하도록 함
      // 사용자가 직접 로그인하도록 유도
      
      console.log('AuthContext: 회원가입 성공');
      return { 
        success: true, 
        user: userData,
        academy_code: academy_code || userData?.academy_code // 저장된 학원 코드 반환
      };
    } catch (err) {
      console.error('AuthContext: 회원가입 에러:', err);
      console.error('AuthContext: 에러 응답:', err.response?.data);
      
      // 에러 메시지 추출 (객체인 경우 처리)
      let errorMessage = '회원가입에 실패했습니다.';
      if (err.response?.data?.error) {
        if (typeof err.response.data.error === 'string') {
          errorMessage = err.response.data.error;
        } else if (err.response.data.error?.message) {
          errorMessage = err.response.data.error.message;
        } else {
          errorMessage = JSON.stringify(err.response.data.error);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

