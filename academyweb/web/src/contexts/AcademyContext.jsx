import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { academyService } from '../services/academyService';

const AcademyContext = createContext();

export const useAcademy = () => {
  const context = useContext(AcademyContext);
  if (!context) {
    throw new Error('useAcademy must be used within an AcademyProvider');
  }
  return context;
};

export const AcademyProvider = ({ children }) => {
  const [academy, setAcademy] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * 학원 정보 로드 함수
   * 로그인 통합 시: 로그인된 사용자의 학원 정보 사용
   * 로그인 없이: 첫 번째 학원을 자동 선택
   */
  const loadAcademy = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. 로그인된 사용자 정보에서 학원 정보 확인 (로그인 통합 시 사용)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.academy_id && userData.academy_name) {
            // 로그인된 사용자의 학원 정보 사용
            const academyData = {
              id: userData.academy_id,
              name: userData.academy_name,
              code: userData.academy_code,
              logo_url: userData.academy_logo_url || null
            };
            setAcademy(academyData);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('사용자 정보 파싱 실패:', e);
        }
      }
      
      // 2. 사용자 정보가 없으면 API로 학원 정보 가져오기 (로그인 없이 사용)
      const response = await academyService.getAll();
      const academies = response.data.academies || [];
      if (academies.length > 0) {
        // 첫 번째 학원을 자동 선택
        setAcademy(academies[0]);
        console.log('✅ 학원 자동 선택:', academies[0].name);
      } else {
        setAcademy(null);
        console.warn('⚠️ 등록된 학원이 없습니다.');
      }
    } catch (error) {
      console.error('학원 정보 로드 실패:', error);
      setAcademy(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 학원 정보 업데이트 함수
   * 로그인 성공 시 또는 학원 정보 변경 시 호출
   */
  const updateAcademy = useCallback((academyData) => {
    setAcademy(academyData);
  }, []);

  /**
   * 현재 선택된 학원 ID 반환
   * 로그인 통합 시: academy.id 사용
   * 로그인 없이: academy.id 사용 (동일)
   */
  const getAcademyId = useCallback(() => {
    return academy?.id || null;
  }, [academy]);

  useEffect(() => {
    loadAcademy();
    
    // 로그인 시 학원 정보 업데이트 이벤트 리스너
    const handleAcademyUpdate = (event) => {
      const academyData = event.detail;
      console.log('📢 학원 정보 업데이트 이벤트:', academyData);
      setAcademy(academyData);
    };
    
    window.addEventListener('academyUpdated', handleAcademyUpdate);
    
    return () => {
      window.removeEventListener('academyUpdated', handleAcademyUpdate);
    };
  }, [loadAcademy]);

  return (
    <AcademyContext.Provider 
      value={{ 
        academy, 
        loading, 
        loadAcademy, 
        updateAcademy,
        getAcademyId,
        // 편의를 위한 별칭
        academyId: academy?.id || null,
        academyName: academy?.name || null,
        academyCode: academy?.code || null
      }}
    >
      {children}
    </AcademyContext.Provider>
  );
};

