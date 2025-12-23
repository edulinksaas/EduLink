import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';

// WebBrowser 세션 완료 처리
WebBrowser.maybeCompleteAuthSession();

/**
 * 소셜 로그인 함수 - 주석 처리 (이메일 로그인 구현 전까지 비활성화)
 * @param {string} provider - 'google'
 * @returns {Promise<{success: boolean, error?: string, user?: object}>}
 */
// export const signInWithSocial = async (provider) => {
//   if (!supabase) {
//     return { success: false, error: 'Supabase가 초기화되지 않았습니다.' };
//   }

//   try {
//     // 리다이렉트 URI 생성 (앱의 deep link)
//     const redirectUrl = Linking.createURL('auth/callback');
//     console.log('생성된 Redirect URL:', redirectUrl);

//     // Supabase OAuth 로그인 시작
//     const options = {
//       redirectTo: redirectUrl,
//       skipBrowserRedirect: false, // false로 설정하여 Supabase가 리디렉션 처리
//     };

//     const { data, error } = await supabase.auth.signInWithOAuth({
//       provider: provider,
//       options: options,
//     });

//     if (error) {
//       console.error(`${provider} 로그인 오류:`, error);
//       console.error('에러 상세:', JSON.stringify(error, null, 2));
//       return { success: false, error: error.message };
//     }
    
//     // 디버깅을 위한 로그 추가
//     console.log(`${provider} OAuth URL 생성 성공:`, data?.url);
//     console.log(`Redirect URL:`, redirectUrl);

//     if (!data?.url) {
//       return { success: false, error: '로그인 URL을 가져올 수 없습니다.' };
//     }

//     // 웹 브라우저로 인증 페이지 열기
//     const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

//     console.log('OAuth 결과:', result.type);
//     console.log('리다이렉트 URL:', result.url);

//     if (result.type === 'success') {
//       // URL에서 토큰 추출 (Supabase 권장 방식)
//       const urlString = result.url;
//       console.log('콜백 URL:', urlString);
      
//       try {
//         // URL 파싱
//         const parsedUrl = Linking.parse(urlString);
//         console.log('파싱된 URL:', parsedUrl);
        
//         // URL의 hash나 queryParams에서 토큰 추출
//         const hashParams = parsedUrl.queryParams || {};
//         const accessToken = hashParams.access_token || hashParams['#access_token'];
//         const refreshToken = hashParams.refresh_token || hashParams['#refresh_token'];
        
//         console.log('추출된 토큰:', { accessToken: !!accessToken, refreshToken: !!refreshToken });

//         if (accessToken && refreshToken) {
//           // 세션 설정
//           const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
//             access_token: accessToken,
//             refresh_token: refreshToken,
//           });

//           if (sessionError) {
//             console.error('세션 설정 오류:', sessionError);
//             console.error('세션 에러 상세:', JSON.stringify(sessionError, null, 2));
//             return { success: false, error: sessionError.message || '세션 설정에 실패했습니다.' };
//           }

//           // 사용자 정보 가져오기
//           const { data: { user }, error: userError } = await supabase.auth.getUser();

//           if (userError || !user) {
//             console.error('사용자 정보 조회 오류:', userError);
//             return { success: false, error: userError?.message || '사용자 정보를 가져올 수 없습니다.' };
//           }

//           console.log('로그인 성공:', user.id);
//           return { success: true, user };
//         } else {
//           // URL에서 토큰을 찾지 못한 경우, Supabase 세션 확인
//           console.log('URL에서 토큰을 찾지 못함, 세션 확인 시도');
//           const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
//           if (sessionError || !session) {
//             console.error('세션 확인 오류:', sessionError);
//             return { success: false, error: '인증 세션을 가져올 수 없습니다. URL: ' + urlString };
//           }

//           const { data: { user }, error: userError } = await supabase.auth.getUser();

//           if (userError || !user) {
//             console.error('사용자 정보 조회 오류:', userError);
//             return { success: false, error: '사용자 정보를 가져올 수 없습니다.' };
//           }

//           console.log('세션에서 사용자 정보 가져오기 성공:', user.id);
//           return { success: true, user };
//         }
//       } catch (urlError) {
//         console.error('URL 파싱 오류:', urlError);
//         console.error('URL:', urlString);
//         return { success: false, error: 'URL 파싱 중 오류가 발생했습니다: ' + urlError.message };
//       }
//     } else if (result.type === 'cancel') {
//       return { success: false, error: '로그인이 취소되었습니다.' };
//     } else {
//       return { success: false, error: '로그인에 실패했습니다.' };
//     }
//   } catch (error) {
//     console.error(`${provider} 로그인 예외:`, error);
//     return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' };
//   }
// };

// /**
//  * 구글 로그인
//  */
// export const signInWithGoogle = () => signInWithSocial('google');

/**
 * 이메일/비밀번호로 회원가입
 * @param {string} email - 이메일 주소
 * @param {string} password - 비밀번호
 * @param {Object} metadata - 추가 메타데이터 (이름, 전화번호 등)
 * @returns {Promise<{success: boolean, error?: string, user?: object}>}
 */
export const signUpWithEmail = async (email, password, metadata = {}) => {
  if (!supabase) {
    return { success: false, error: 'Supabase가 초기화되지 않았습니다.' };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // 사용자 메타데이터 (이름, 전화번호 등)
      },
    });

    if (error) {
      console.error('회원가입 오류:', error);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: '사용자 정보를 가져올 수 없습니다.' };
    }

    console.log('회원가입 성공:', data.user.id);
    return { success: true, user: data.user };
  } catch (error) {
    console.error('회원가입 예외:', error);
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' };
  }
};

/**
 * 전화번호를 이메일 형식으로 변환 (Supabase Auth 호환)
 * @param {string} phoneNumber - 전화번호 (하이픈 제거된 숫자만)
 * @returns {string} 이메일 형식의 전화번호
 */
export const phoneToEmail = (phoneNumber) => {
  const numbers = phoneNumber.replace(/[^0-9]/g, '');
  // Supabase가 인식할 수 있는 유효한 이메일 형식 사용
  return `${numbers}@phone.app`;
};

/**
 * 이메일 형식의 전화번호를 실제 전화번호로 변환
 * @param {string} email - 이메일 형식의 전화번호
 * @returns {string} 전화번호
 */
export const emailToPhone = (email) => {
  if (email && email.endsWith('@phone.app')) {
    return email.replace('@phone.app', '');
  }
  return email;
};

/**
 * 전화번호/비밀번호로 회원가입
 * @param {string} phoneNumber - 전화번호
 * @param {string} password - 비밀번호
 * @param {Object} metadata - 추가 메타데이터 (이름 등)
 * @returns {Promise<{success: boolean, error?: string, user?: object}>}
 */
export const signUpWithPhone = async (phoneNumber, password, metadata = {}) => {
  if (!supabase) {
    return { success: false, error: 'Supabase가 초기화되지 않았습니다.' };
  }

  try {
    const phoneEmail = phoneToEmail(phoneNumber);
    const { data, error } = await supabase.auth.signUp({
      email: phoneEmail,
      password,
      options: {
        emailRedirectTo: undefined, // 이메일 확인 리다이렉트 비활성화
        data: {
          ...metadata,
          phone: phoneNumber, // 실제 전화번호를 메타데이터에 저장
        },
      },
    });

    if (error) {
      console.error('회원가입 오류:', error);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: '사용자 정보를 가져올 수 없습니다.' };
    }

    console.log('전화번호 회원가입 성공:', data.user.id);
    return { success: true, user: data.user };
  } catch (error) {
    console.error('회원가입 예외:', error);
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' };
  }
};

/**
 * 전화번호/비밀번호로 로그인
 * @param {string} phoneNumber - 전화번호
 * @param {string} password - 비밀번호
 * @returns {Promise<{success: boolean, error?: string, user?: object, session?: object}>}
 */
export const signInWithPhone = async (phoneNumber, password) => {
  if (!supabase) {
    return { success: false, error: 'Supabase가 초기화되지 않았습니다.' };
  }

  try {
    const phoneEmail = phoneToEmail(phoneNumber);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: phoneEmail,
      password,
    });

    if (error) {
      console.error('로그인 오류:', error);
      
      // 이메일 확인 오류인 경우 더 친절한 메시지 제공
      if (error.message && error.message.includes('Email not confirmed')) {
        return { 
          success: false, 
          error: '이메일 확인이 필요합니다. Supabase 설정에서 이메일 확인을 비활성화해주세요.' 
        };
      }
      
      return { success: false, error: error.message };
    }

    if (!data.user || !data.session) {
      return { success: false, error: '로그인 정보를 가져올 수 없습니다.' };
    }

    console.log('전화번호 로그인 성공:', data.user.id);
    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    console.error('로그인 예외:', error);
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' };
  }
};

/**
 * 이메일/비밀번호로 로그인
 * @param {string} email - 이메일 주소
 * @param {string} password - 비밀번호
 * @returns {Promise<{success: boolean, error?: string, user?: object, session?: object}>}
 */
export const signInWithEmail = async (email, password) => {
  if (!supabase) {
    return { success: false, error: 'Supabase가 초기화되지 않았습니다.' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('로그인 오류:', error);
      return { success: false, error: error.message };
    }

    if (!data.user || !data.session) {
      return { success: false, error: '로그인 정보를 가져올 수 없습니다.' };
    }

    console.log('이메일 로그인 성공:', data.user.id);
    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    console.error('로그인 예외:', error);
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' };
  }
};

/**
 * 비밀번호 재설정 이메일 전송
 * @param {string} email - 이메일 주소
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const resetPassword = async (email) => {
  if (!supabase) {
    return { success: false, error: 'Supabase가 초기화되지 않았습니다.' };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'parentapp://reset-password', // 앱의 deep link
    });

    if (error) {
      console.error('비밀번호 재설정 이메일 전송 오류:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('비밀번호 재설정 예외:', error);
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' };
  }
};

/**
 * 현재 로그인된 사용자 정보 가져오기
 */
export const getCurrentUser = async () => {
  if (!supabase) {
    return null;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('사용자 정보 조회 오류:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('사용자 정보 조회 예외:', error);
    return null;
  }
};

/**
 * 로그아웃
 */
export const signOut = async () => {
  if (!supabase) {
    return { success: false, error: 'Supabase가 초기화되지 않았습니다.' };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('로그아웃 오류:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    console.error('로그아웃 예외:', error);
    return { success: false, error: error.message };
  }
};
