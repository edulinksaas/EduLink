import helmet from 'helmet';
import cors from 'cors';

/**
 * 보안 헤더 설정
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // 개발 환경에서 필요시 false
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

/**
 * CORS 설정 강화
 */
export const corsOptions = {
  origin: function (origin, callback) {
    // 개발 환경에서는 localhost 허용
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      process.env.FRONTEND_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    ].filter(Boolean);

    // origin이 없는 경우 (같은 origin 요청 또는 Postman 등)
    if (!origin) {
      return callback(null, true);
    }

    // 허용된 origin인지 확인
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS 차단: ${origin}은 허용되지 않은 origin입니다.`);
      callback(new Error('CORS 정책에 의해 차단되었습니다.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['RateLimit-Reset', 'RateLimit-Remaining'],
  maxAge: 86400, // 24시간
};

export const corsMiddleware = cors(corsOptions);

