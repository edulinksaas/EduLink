import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { authService } from '../services/authService';

// Context 초기화 확인을 위한 기본값
const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  // undefined인 경우에만 에러 발생 (null은 유효한 값일 수 있음)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 초기 로드 시 Supabase 세션 확인
  useEffect(() => {
    if (!supabase) {
      console.warn('⚠️ Supabase 클라이언트가 없습니다. localStorage에서 사용자 정보 확인');
      // 기존 localStorage 토큰 확인 (하위 호환성)
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
      return;
    }

    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // 세션이 있으면 사용자 정보 로드
        loadUserData(session.user.email);
      } else {
        // 기존 localStorage 토큰 확인 (하위 호환성)
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
      }
      setLoading(false);
    }).catch((err) => {
      console.error('세션 확인 실패:', err);
      setLoading(false);
    });

    // 인증 상태 변경 리스너
    let subscription = null;
    try {
      const authStateChangeResult = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            await loadUserData(session.user.email);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      );
      
      // onAuthStateChange는 { data: { subscription } } 형태로 반환됨
      subscription = authStateChangeResult?.data?.subscription;
    } catch (err) {
      console.error('인증 상태 변경 리스너 설정 실패:', err);
    }

    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (err) {
          console.warn('리스너 해제 실패:', err);
        }
      }
    };
  }, []);

  // 사용자 데이터 로드 함수
  const loadUserData = async (email) => {
    if (!supabase) return;
    
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, academy_id, academy_code, role, email, name, phone, email_verified')
        .eq('email', email)
        .single();

      if (!userError && userData) {
        // 학원 정보 조회
        const { data: academyData } = await supabase
          .from('academies')
          .select('id, name, code')
          .eq('id', userData.academy_id)
          .single();

        const userInfo = {
          ...userData,
          academy_name: academyData?.name || null,
        };

        setUser(userInfo);
        localStorage.setItem('user', JSON.stringify(userInfo));
      }
    } catch (err) {
      console.error('사용자 데이터 로드 실패:', err);
    }
  };

  const login = useCallback(async (academy_code, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 로그인 시도:', { academy_code: academy_code?.trim() });
      
      // 백엔드 API로 로그인 (학원 코드 기반)
      const response = await authService.login(academy_code, password);
      
      console.log('✅ 로그인 응답 받음:', response.data);
      
      const { token, user: userData } = response.data;
      
      if (!token || !userData) {
        throw new Error('서버 응답에 토큰 또는 사용자 정보가 없습니다.');
      }
      
      // Supabase Auth로 이메일과 비밀번호로 로그인하여 세션 생성
      if (supabase && userData.email) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password: password,
        });

        if (authError) {
          console.warn('Supabase Auth 로그인 실패:', authError);
          // Supabase Auth 실패해도 백엔드 토큰은 유지
        } else if (authData.session) {
          console.log('✅ Supabase Auth 세션 생성됨');
        }
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
      
      // 백엔드 API로 회원가입 (학원 정보 등록 및 이메일 발송)
      // 참고: 백엔드에서 Supabase Auth 사용자 생성 및 기존 SMTP로 이메일 발송
      const response = await authService.register(registerData);
      console.log('AuthContext: 회원가입 응답 받음', response.data);
      
      const { token, user: userData, academy_code, requiresEmailVerification } = response.data;
      
      // 이메일 인증이 필요한 경우
      if (requiresEmailVerification) {
        return {
          success: true,
          requiresEmailVerification: true,
          message: '회원가입이 완료되었습니다. 이메일 인증을 완료해주세요.',
          email: userData?.email || registerData.email,
          academy_code: academy_code || userData?.academy_code
        };
      }
      
      if (!token || !userData) {
        throw new Error('서버 응답에 토큰 또는 사용자 정보가 없습니다.');
      }
      
      // 회원가입 성공 시 토큰 및 사용자 정보 저장 (자동 로그인)
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
            code: academy_code || userData.academy_code,
            logo_url: null // 회원가입 응답에 logo_url이 있으면 사용
          }
        }));
      }
      
      return { 
        success: true, 
        user: userData,
        academy_code: academy_code || userData?.academy_code // 서버에서 생성된 학원 코드 반환
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

  const logout = useCallback(async () => {
    // Supabase Auth 로그아웃
    if (supabase) {
      await supabase.auth.signOut();
    }
    
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

