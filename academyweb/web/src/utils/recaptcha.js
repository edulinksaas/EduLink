/**
 * Google reCAPTCHA v3 유틸리티
 */

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

/**
 * reCAPTCHA 토큰 생성
 * @param {string} action - 액션 이름 (예: 'register', 'login')
 * @returns {Promise<string|null>} reCAPTCHA 토큰 또는 null
 */
export const executeRecaptcha = async (action = 'submit') => {
  // 개발 환경에서 CAPTCHA 비활성화 옵션
  if (import.meta.env.DEV && import.meta.env.VITE_DISABLE_CAPTCHA === 'true') {
    console.warn('⚠️ CAPTCHA가 개발 모드에서 비활성화되었습니다.');
    return null;
  }
  
  if (!RECAPTCHA_SITE_KEY) {
    console.warn('⚠️ VITE_RECAPTCHA_SITE_KEY가 설정되지 않았습니다.');
    return null;
  }
  
  if (typeof window === 'undefined' || !window.grecaptcha) {
    console.warn('⚠️ reCAPTCHA가 로드되지 않았습니다.');
    return null;
  }
  
  try {
    const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
    return token;
  } catch (error) {
    console.error('reCAPTCHA 실행 오류:', error);
    return null;
  }
};

/**
 * reCAPTCHA 스크립트 동적 로드
 */
export const loadRecaptcha = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('window 객체가 없습니다.'));
      return;
    }
    
    if (window.grecaptcha) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.grecaptcha) {
        resolve();
      } else {
        reject(new Error('reCAPTCHA 로드 실패'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('reCAPTCHA 스크립트 로드 실패'));
    };
    
    document.head.appendChild(script);
  });
};

