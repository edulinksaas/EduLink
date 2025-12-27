import axios from 'axios';

/**
 * Google reCAPTCHA v3 검증
 * @param {string} token - 클라이언트에서 받은 reCAPTCHA 토큰
 * @param {string} remoteip - 클라이언트 IP 주소 (선택사항)
 * @returns {Promise<{success: boolean, score?: number, error?: string}>}
 */
export const verifyRecaptcha = async (token, remoteip = null) => {
  const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
  
  // 개발 환경에서 CAPTCHA 비활성화 옵션
  if (process.env.NODE_ENV === 'development' && process.env.DISABLE_CAPTCHA === 'true') {
    console.warn('⚠️ CAPTCHA 검증이 개발 모드에서 비활성화되었습니다.');
    return { success: true, score: 1.0 };
  }
  
  if (!RECAPTCHA_SECRET_KEY) {
    console.warn('⚠️ RECAPTCHA_SECRET_KEY가 설정되지 않았습니다. CAPTCHA 검증을 건너뜁니다.');
    return { success: true, score: 1.0 };
  }
  
  if (!token) {
    return { success: false, error: 'CAPTCHA 토큰이 없습니다.' };
  }
  
  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET_KEY,
          response: token,
          remoteip: remoteip
        }
      }
    );
    
    const { success, score, challenge_ts, hostname, 'error-codes': errorCodes } = response.data;
    
    if (!success) {
      return {
        success: false,
        error: errorCodes?.join(', ') || 'CAPTCHA 검증 실패'
      };
    }
    
    // reCAPTCHA v3는 점수 기반 (0.0 ~ 1.0)
    // 0.5 이상이면 통과로 간주 (조정 가능)
    const MIN_SCORE = parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5');
    
    if (score < MIN_SCORE) {
      return {
        success: false,
        score: score,
        error: `CAPTCHA 점수가 너무 낮습니다. (${score.toFixed(2)})`
      };
    }
    
    return {
      success: true,
      score: score,
      challenge_ts: challenge_ts,
      hostname: hostname
    };
  } catch (error) {
    console.error('reCAPTCHA 검증 오류:', error);
    return {
      success: false,
      error: error.message || 'CAPTCHA 검증 중 오류가 발생했습니다.'
    };
  }
};

