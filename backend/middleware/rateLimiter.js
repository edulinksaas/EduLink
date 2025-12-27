import rateLimit from 'express-rate-limit';

// 개발 환경 여부 확인
const isDevelopment = process.env.NODE_ENV !== 'production';

// IP 추출 헬퍼 함수 (IPv4/IPv6 모두 지원)
const getClientIp = (req) => {
  // 프록시를 통한 요청인 경우
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = forwarded.split(',');
    return ips[0].trim();
  }
  
  // 직접 연결인 경우
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
};

// 일반 API 요청 제한
// 개발 환경: 제한 완화 (15분에 1000개), 프로덕션: 완화 (15분에 500개)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: isDevelopment ? 1000 : 500, // 개발: 1000개, 프로덕션: 500개 (100개에서 증가)
  message: {
    error: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.'
  },
  standardHeaders: true, // `RateLimit-*` 헤더 반환
  legacyHeaders: false, // `X-RateLimit-*` 헤더 비활성화
  skipSuccessfulRequests: false, // 성공한 요청도 카운트 (보안을 위해)
  // express-rate-limit v8은 기본적으로 IP를 사용하므로 keyGenerator 불필요
});

// 로그인/회원가입 엔드포인트에 대한 더 엄격한 제한
// 개발 환경: 제한 완화 (15분에 50번), 프로덕션: 기존 제한 유지 (15분에 5번)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: isDevelopment ? 50 : 5, // 개발: 50번, 프로덕션: 5번
  message: {
    error: '너무 많은 인증 시도를 했습니다. 15분 후 다시 시도해주세요.'
  },
  skipSuccessfulRequests: true, // 성공한 요청은 카운트에서 제외
  standardHeaders: true,
  legacyHeaders: false,
  // IP 기반 추적 (express-rate-limit v8은 기본적으로 IP 사용)
  keyGenerator: (req) => getClientIp(req),
});

// 비밀번호 재설정/변경에 대한 제한
// 개발 환경: 제한 완화 (1시간에 20번), 프로덕션: 기존 제한 유지 (1시간에 3번)
export const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: isDevelopment ? 20 : 3, // 개발: 20번, 프로덕션: 3번
  message: {
    error: '너무 많은 비밀번호 변경 시도를 했습니다. 1시간 후 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // IP 기반 추적 (express-rate-limit v8은 기본적으로 IP 사용)
  keyGenerator: (req) => getClientIp(req),
});

