import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchChildrenList } from '../lib/supabaseStudents';
import { fetchParentByPhone, fetchParentByEmail, upsertParent } from '../lib/supabaseParents';
import { supabase } from '../lib/supabase';
import { signInWithEmail, signUpWithEmail, signInWithPhone, signUpWithPhone, emailToPhone, getCurrentUser } from '../lib/supabaseAuth';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

const STORAGE_KEY = '@parent_app:phone';
const STORAGE_KEY_EMAIL = '@parent_app:email';
const STORAGE_KEY_LOGIN_TYPE = '@parent_app:login_type'; // 'phone' 또는 'email'

export const AppProvider = ({ children }) => {
  // 로그인 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // 개인 정보 (학부모 정보)
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '', // 이 연락처로 자녀 정보를 조회합니다
    address: '',
  });

  // 학습 기관 정보 (학원 정보)
  const [learningInstitution, setLearningInstitution] = useState({
    name: 'ABC 학원',
    type: '학원',
    address: '서울시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    floor: '',
  });

  // 자녀 목록
  const [childrenList, setChildrenList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 현재 선택된 자녀 (ID로 관리)
  const [selectedChild, setSelectedChild] = useState(null);

  // Supabase에서 자녀 목록 로드
  const loadChildrenFromSupabase = useCallback(async (parentContact) => {
    if (!parentContact) {
      console.warn('학부모 연락처가 없습니다.');
      setChildrenList([]);
      return;
    }

    if (!supabase) {
      console.error('Supabase가 초기화되지 않았습니다. .env 파일을 확인하세요.');
      setChildrenList([]);
      return;
    }

    setLoading(true);
    try {
      const children = await fetchChildrenList(parentContact);
      
      if (children && children.length > 0) {
        setChildrenList(children);
        // 첫 번째 자녀를 기본 선택
        if (!selectedChild) {
          setSelectedChild(children[0].id);
        }
      } else {
        // 데이터가 없으면 빈 배열
        console.warn('해당 연락처로 등록된 자녀 정보가 없습니다.');
        setChildrenList([]);
      }
    } catch (error) {
      console.error('자녀 목록 로드 오류:', error);
      setChildrenList([]);
    } finally {
      setLoading(false);
    }
  }, [selectedChild]);

  // Supabase에서 학부모 정보 로드
  const loadParentFromSupabase = useCallback(async (phone) => {
    if (!phone || !supabase) return;

    try {
      const parentData = await fetchParentByPhone(phone);
      if (parentData) {
        setPersonalInfo(prev => ({
          name: parentData.name || prev.name,
          email: parentData.email || prev.email,
          phone: parentData.phone || prev.phone,
          address: parentData.address || prev.address,
        }));
      }

      // 학습 기관 정보는 별도 테이블에서 로드
      const { fetchParentAcademy } = await import('../lib/supabaseParentAcademies');
      const academyData = await fetchParentAcademy(phone);
      if (academyData) {
        setLearningInstitution({
          name: academyData.name || '',
          type: academyData.type || '',
          address: academyData.address || '',
          phone: academyData.phone || '',
          floor: academyData.floor || '',
        });
      }
    } catch (error) {
      console.error('학부모 정보 로드 오류:', error);
    }
  }, []);

  // 학부모 정보 저장
  const saveParentToSupabase = async () => {
    if (!personalInfo.phone || !supabase) return;

    try {
      await upsertParent({
        name: personalInfo.name,
        phone: personalInfo.phone,
        email: personalInfo.email,
        address: personalInfo.address,
      });
    } catch (error) {
      console.error('학부모 정보 저장 오류:', error);
    }
  };

  // 전화번호 + 비밀번호 로그인 함수
  const loginWithPhone = useCallback(async (phoneNumber, password, isSignUp = false, metadata = {}) => {
    try {
      let result;
      
      if (isSignUp) {
        // 회원가입
        result = await signUpWithPhone(phoneNumber, password, metadata);
      } else {
        // 로그인
        result = await signInWithPhone(phoneNumber, password);
      }

      if (!result.success) {
        throw new Error(result.error || '로그인에 실패했습니다.');
      }

      const user = result.user;
      // Supabase Auth에서 전화번호 추출 (메타데이터 또는 이메일에서)
      const actualPhone = user.user_metadata?.phone || emailToPhone(user.email) || phoneNumber;
      
      // 전화번호 저장
      await AsyncStorage.setItem(STORAGE_KEY, actualPhone);
      await AsyncStorage.setItem(STORAGE_KEY_LOGIN_TYPE, 'phone');

      // 학부모 정보 확인 또는 생성
      let parentData = await fetchParentByPhone(actualPhone);
      
      if (!parentData) {
        // 학부모 정보가 없으면 생성
        parentData = await upsertParent({
          name: metadata.name || user.user_metadata?.name || '',
          phone: actualPhone,
          email: user.user_metadata?.email || '',
          address: metadata.address || '',
        });
      } else {
        // 기존 정보 업데이트
        const updateData = {};
        if (metadata.name && !parentData.name) updateData.name = metadata.name;
        if (Object.keys(updateData).length > 0) {
          parentData = await upsertParent({
            ...parentData,
            ...updateData,
          });
        }
      }

      // 학부모 정보 설정
      setPersonalInfo({
        name: parentData?.name || metadata.name || user.user_metadata?.name || '',
        email: parentData?.email || user.user_metadata?.email || '',
        phone: actualPhone,
        address: parentData?.address || metadata.address || '',
      });
      
      setIsLoggedIn(true);
      setIsLoadingAuth(false);
      
      // 학부모 정보 및 자녀 정보 로드
      await loadParentFromSupabase(actualPhone);
      await loadChildrenFromSupabase(actualPhone);
    } catch (error) {
      console.error('전화번호 로그인 오류:', error);
      setIsLoadingAuth(false);
      throw error;
    }
  }, [loadParentFromSupabase, loadChildrenFromSupabase]);

  // 전화번호 로그인 함수 (비밀번호 없이 - 하위 호환성 유지)
  const login = useCallback(async (phoneNumber, parentData) => {
    try {
      // 전화번호 저장
      await AsyncStorage.setItem(STORAGE_KEY, phoneNumber);
      await AsyncStorage.setItem(STORAGE_KEY_LOGIN_TYPE, 'phone');
      
      // 학부모 정보 설정
      if (parentData) {
        setPersonalInfo({
          name: parentData.name || '',
          email: parentData.email || '',
          phone: phoneNumber,
          address: parentData.address || '',
        });
      } else {
        // 신규 가입인 경우 기본 정보로 설정
        setPersonalInfo({
          name: '',
          email: '',
          phone: phoneNumber,
          address: '',
        });
        // 기본 정보로 학부모 생성
        await upsertParent({
          name: '',
          phone: phoneNumber,
          email: '',
          address: '',
        });
      }
      
      setIsLoggedIn(true);
      setIsLoadingAuth(false);
      
      // 학부모 정보 및 자녀 정보 로드
      await loadParentFromSupabase(phoneNumber);
      await loadChildrenFromSupabase(phoneNumber);
    } catch (error) {
      console.error('로그인 오류:', error);
      setIsLoadingAuth(false);
      throw error;
    }
  }, [loadParentFromSupabase, loadChildrenFromSupabase]);

  // 이메일 로그인 함수
  const loginWithEmail = useCallback(async (email, password, isSignUp = false, metadata = {}) => {
    try {
      let result;
      
      if (isSignUp) {
        // 회원가입
        result = await signUpWithEmail(email, password, metadata);
      } else {
        // 로그인
        result = await signInWithEmail(email, password);
      }

      if (!result.success) {
        throw new Error(result.error || '로그인에 실패했습니다.');
      }

      const user = result.user;
      const userEmail = user.email || email;
      
      // 이메일 저장
      await AsyncStorage.setItem(STORAGE_KEY_EMAIL, userEmail);
      await AsyncStorage.setItem(STORAGE_KEY_LOGIN_TYPE, 'email');

      // 학부모 정보 확인 또는 생성
      let parentData = await fetchParentByEmail(userEmail);
      
      if (!parentData) {
        // 학부모 정보가 없으면 생성
        parentData = await upsertParent({
          name: metadata.name || user.user_metadata?.name || '',
          phone: metadata.phone || user.user_metadata?.phone || '',
          email: userEmail,
          address: metadata.address || '',
        });
      } else {
        // 기존 정보 업데이트 (이메일 로그인 정보 반영)
        const updateData = {};
        if (metadata.name && !parentData.name) updateData.name = metadata.name;
        if (metadata.phone && !parentData.phone) updateData.phone = metadata.phone;
        if (Object.keys(updateData).length > 0) {
          parentData = await upsertParent({
            ...parentData,
            ...updateData,
          });
        }
      }

      // 학부모 정보 설정
      setPersonalInfo({
        name: parentData?.name || metadata.name || user.user_metadata?.name || '',
        email: userEmail,
        phone: parentData?.phone || metadata.phone || user.user_metadata?.phone || '',
        address: parentData?.address || metadata.address || '',
      });

      setIsLoggedIn(true);
      setIsLoadingAuth(false);

      // 학부모 정보 및 자녀 정보 로드
      const phoneToLoad = parentData?.phone || metadata.phone;
      if (phoneToLoad) {
        await loadParentFromSupabase(phoneToLoad);
        await loadChildrenFromSupabase(phoneToLoad);
      } else {
        // 전화번호가 없으면 이메일로만 로드 시도
        await loadParentFromSupabase(userEmail);
        // 자녀 정보는 전화번호가 필요하므로 로드하지 않음
      }
    } catch (error) {
      console.error('이메일 로그인 오류:', error);
      setIsLoadingAuth(false);
      throw error;
    }
  }, [loadParentFromSupabase, loadChildrenFromSupabase]);

  // 소셜 로그인 함수 - 주석 처리 (이메일 로그인 구현 전까지 비활성화)
  // const loginWithSocial = useCallback(async (user) => {
  //   try {
  //     if (!user) {
  //       throw new Error('사용자 정보가 없습니다.');
  //     }

  //     // Supabase 사용자 정보에서 이메일 또는 전화번호 추출
  //     const email = user.email || user.user_metadata?.email || '';
  //     const phone = user.phone || user.user_metadata?.phone || '';
  //     const name = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name || user.user_metadata?.nickname || '';
      
  //     // 소셜 로그인 사용자 ID 추출 (이메일/전화번호가 없을 때 사용)
  //     const providerId = user.user_metadata?.provider_id || user.id || '';
      
  //     // 식별자 결정: 전화번호 > 이메일 > 프로바이더 ID
  //     const identifier = phone || email || providerId;
      
  //     // 식별자가 없으면 오류
  //     if (!identifier) {
  //       throw new Error('사용자 식별 정보가 없습니다.');
  //     }
      
  //     // 식별자 저장 (전화번호 > 이메일 > 프로바이더 ID)
  //     await AsyncStorage.setItem(STORAGE_KEY, identifier);

  //     // 학부모 정보 확인 또는 생성
  //     let parentData = null;
  //     if (phone) {
  //       parentData = await fetchParentByPhone(phone);
  //     }

  //     // 학부모 정보가 없으면 생성
  //     if (!parentData) {
  //       parentData = await upsertParent({
  //         name: name || '',
  //         phone: phone || '',
  //         email: email || '',
  //         address: '',
  //       });
  //     } else {
  //       // 기존 정보 업데이트 (소셜 로그인 정보 반영)
  //       if (name && !parentData.name) {
  //         await upsertParent({
  //           name: name,
  //           phone: phone || parentData.phone,
  //           email: email || parentData.email,
  //           address: parentData.address || '',
  //         });
  //       }
  //     }

  //     // 학부모 정보 설정
  //     setPersonalInfo({
  //       name: parentData?.name || name || '',
  //       email: email || parentData?.email || '',
  //       phone: phone || parentData?.phone || '',
  //       address: parentData?.address || '',
  //     });

  //     setIsLoggedIn(true);
  //     setIsLoadingAuth(false);

  //     // 학부모 정보 및 자녀 정보 로드
  //     const phoneToLoad = phone || parentData?.phone;
  //     if (phoneToLoad) {
  //       await loadParentFromSupabase(phoneToLoad);
  //       await loadChildrenFromSupabase(phoneToLoad);
  //     }
  //   } catch (error) {
  //     console.error('소셜 로그인 오류:', error);
  //     setIsLoadingAuth(false);
  //     throw error;
  //   }
  // }, [loadParentFromSupabase, loadChildrenFromSupabase]);

  // 로그아웃 함수
  const logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(STORAGE_KEY_EMAIL);
      await AsyncStorage.removeItem(STORAGE_KEY_LOGIN_TYPE);
      
      // Supabase 세션도 로그아웃
      if (supabase) {
        await supabase.auth.signOut();
      }
      
      setIsLoggedIn(false);
      setPersonalInfo({
        name: '',
        email: '',
        phone: '',
        address: '',
      });
      setChildrenList([]);
      setSelectedChild(null);
      setLearningInstitution({
        name: '',
        type: '',
        address: '',
        phone: '',
        floor: '',
      });
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  // 저장된 로그인 정보 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Supabase 세션 확인 (전화번호 + 비밀번호 또는 이메일 로그인)
        if (supabase) {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (session && !sessionError) {
            // Supabase 세션이 있으면 로그인된 사용자
            const user = await getCurrentUser();
            if (user && user.email) {
              // 전화번호 형식인지 확인
              const phoneNumber = emailToPhone(user.email);
              if (phoneNumber && phoneNumber !== user.email) {
                // 전화번호 로그인 사용자
                const parentData = await fetchParentByPhone(phoneNumber);
                setPersonalInfo({
                  name: parentData?.name || user.user_metadata?.name || '',
                  email: parentData?.email || user.user_metadata?.email || '',
                  phone: phoneNumber,
                  address: parentData?.address || '',
                });
                
                setIsLoggedIn(true);
                setIsLoadingAuth(false);
                
                await loadParentFromSupabase(phoneNumber);
                await loadChildrenFromSupabase(phoneNumber);
                return;
              } else {
                // 이메일 로그인 사용자
                const parentData = await fetchParentByEmail(user.email);
                setPersonalInfo({
                  name: parentData?.name || user.user_metadata?.name || '',
                  email: user.email,
                  phone: parentData?.phone || user.user_metadata?.phone || '',
                  address: parentData?.address || '',
                });
                
                setIsLoggedIn(true);
                setIsLoadingAuth(false);
                
                const phoneToLoad = parentData?.phone;
                if (phoneToLoad) {
                  await loadParentFromSupabase(phoneToLoad);
                  await loadChildrenFromSupabase(phoneToLoad);
                }
                return;
              }
            }
          }
        }

        // 전화번호 로그인 확인 (비밀번호 없이 - 하위 호환성)
        const savedPhone = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedPhone) {
          // 저장된 전화번호로 자동 로그인 (비밀번호 없이)
          const parentData = await fetchParentByPhone(savedPhone);
          await login(savedPhone, parentData);
        } else {
          setIsLoadingAuth(false);
        }
      } catch (error) {
        console.error('인증 확인 오류:', error);
        setIsLoadingAuth(false);
      }
    };
    
    checkAuth();
  }, [login, loadParentFromSupabase, loadChildrenFromSupabase]);

  // 로그인 후 학부모 정보 및 자녀 정보 가져오기
  useEffect(() => {
    if (isLoggedIn && personalInfo.phone) {
      // 학부모 정보 로드
      loadParentFromSupabase(personalInfo.phone);
      // 자녀 정보 로드
      loadChildrenFromSupabase(personalInfo.phone);
    }
  }, [isLoggedIn, personalInfo.phone, loadParentFromSupabase, loadChildrenFromSupabase]);

  // 개인 정보 업데이트
  const updatePersonalInfo = async (newInfo) => {
    setPersonalInfo(newInfo);
    
    // Supabase에 저장
    if (newInfo.phone) {
      await upsertParent({
        name: newInfo.name,
        phone: newInfo.phone,
        email: newInfo.email,
        address: newInfo.address,
      });
    }
    
    // 연락처가 변경되면 자녀 목록 다시 로드
    if (newInfo.phone && newInfo.phone !== personalInfo.phone) {
      loadChildrenFromSupabase(newInfo.phone);
      loadParentFromSupabase(newInfo.phone);
    }
  };

  // 학습 기관 정보 업데이트
  const updateLearningInstitution = async (newInfo) => {
    setLearningInstitution(newInfo);
    
      // 별도 테이블(un_academies)에 저장
    if (personalInfo.phone) {
      try {
        const { upsertParentAcademy } = await import('../lib/supabaseParentAcademies');
        await upsertParentAcademy(personalInfo.phone, {
          name: newInfo.name || '',
          type: newInfo.type || '',
          address: newInfo.address || '',
          phone: newInfo.phone || '',
          floor: newInfo.floor || null,
        });
      } catch (error) {
        console.error('학습 기관 정보 저장 오류:', error);
      }
    }
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
    // ID로 찾기
    const child = childrenList.find(child => child.id === selectedChild);
    if (child) return child;
    
    // 이름으로 찾기 (하위 호환성)
    const childByName = childrenList.find(child => child.name === selectedChild);
    if (childByName) return childByName;
    
    return childrenList[0] || null;
  };

  const value = {
    personalInfo,
    learningInstitution,
    childrenList,
    selectedChild,
    loading,
    isLoggedIn,
    isLoadingAuth,
    login,
    loginWithPhone,
    loginWithEmail,
    // loginWithSocial, // 소셜 로그인 주석 처리
    logout,
    updatePersonalInfo,
    updateLearningInstitution,
    updateChildrenList,
    setSelectedChild,
    getSelectedChildInfo,
    refreshChildrenList,
    loadChildrenFromSupabase,
    loadParentFromSupabase,
    saveParentToSupabase,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
