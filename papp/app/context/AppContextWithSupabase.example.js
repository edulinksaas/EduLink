/**
 * Supabase 연동 예제 - AppContext
 * 
 * 이 파일은 예제입니다. 실제 사용하려면:
 * 1. AppContext.js를 이 파일의 내용으로 업데이트하거나
 * 2. 필요한 부분만 복사하여 AppContext.js에 통합하세요
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { fetchChildrenList } from '../lib/supabaseStudents';
import { supabase } from '../lib/supabase';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // 개인 정보 (학부모 정보)
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '', // 이 연락처로 자녀 정보를 조회합니다
    address: '',
  });

  // 학습 기관 정보 (학원 정보)
  const [learningInstitution, setLearningInstitution] = useState(null);

  // 자녀 목록
  const [childrenList, setChildrenList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 현재 선택된 자녀
  const [selectedChild, setSelectedChild] = useState(null);

  // Supabase에서 자녀 목록 로드
  const loadChildrenFromSupabase = async (parentContact) => {
    if (!parentContact) {
      console.warn('학부모 연락처가 없습니다.');
      return;
    }

    setLoading(true);
    try {
      const children = await fetchChildrenList(parentContact);
      setChildrenList(children);
      
      // 첫 번째 자녀를 기본 선택
      if (children.length > 0 && !selectedChild) {
        setSelectedChild(children[0].id);
      }
    } catch (error) {
      console.error('자녀 목록 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드 시 자녀 정보 가져오기
  useEffect(() => {
    // TODO: 실제로는 로그인한 사용자의 연락처를 사용해야 합니다
    // 예: localStorage에서 가져오거나, Supabase Auth에서 가져오기
    const savedPhone = localStorage.getItem('parent_phone');
    if (savedPhone) {
      setPersonalInfo(prev => ({ ...prev, phone: savedPhone }));
      loadChildrenFromSupabase(savedPhone);
    }
  }, []);

  // 개인 정보 업데이트
  const updatePersonalInfo = (newInfo) => {
    setPersonalInfo(newInfo);
    
    // 연락처가 변경되면 자녀 목록 다시 로드
    if (newInfo.phone && newInfo.phone !== personalInfo.phone) {
      loadChildrenFromSupabase(newInfo.phone);
    }
  };

  // 학습 기관 정보 업데이트
  const updateLearningInstitution = (newInfo) => {
    setLearningInstitution(newInfo);
  };

  // 자녀 목록 업데이트
  const updateChildrenList = (newList) => {
    setChildrenList(newList);
  };

  // 자녀 목록 새로고침
  const refreshChildrenList = async () => {
    if (personalInfo.phone) {
      await loadChildrenFromSupabase(personalInfo.phone);
    }
  };

  // 현재 선택된 자녀 정보 가져오기
  const getSelectedChildInfo = () => {
    if (!selectedChild) {
      return childrenList[0] || null;
    }
    return childrenList.find(child => child.id === selectedChild) || childrenList[0] || null;
  };

  const value = {
    personalInfo,
    learningInstitution,
    childrenList,
    selectedChild,
    loading,
    updatePersonalInfo,
    updateLearningInstitution,
    updateChildrenList,
    setSelectedChild,
    getSelectedChildInfo,
    refreshChildrenList,
    loadChildrenFromSupabase,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
