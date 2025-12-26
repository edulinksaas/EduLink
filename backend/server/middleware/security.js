import helmet from 'helmet';

// 보안 헤더 설정
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
  crossOriginEmbedderPolicy: false, // Supabase와의 호환성을 위해 false
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// 환경 변수 검증
export const validateEnvVars = () => {
  const requiredVars = ['JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missingVars = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    console.error('❌ 필수 환경 변수가 설정되지 않았습니다:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n⚠️  보안을 위해 서버를 시작할 수 없습니다.');
    console.error('   .env 파일에 필수 환경 변수를 설정해주세요.\n');
    process.exit(1);
  }

  // JWT_SECRET이 기본값인지 확인
  if (process.env.JWT_SECRET === 'your-secret-key-change-in-production') {
    console.error('❌ JWT_SECRET이 기본값으로 설정되어 있습니다.');
    console.error('   보안을 위해 강력한 비밀키로 변경해주세요.\n');
    process.exit(1);
  }

  // JWT_SECRET 길이 검증 (최소 32자)
  if (process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET이 너무 짧습니다. 최소 32자 이상을 권장합니다.');
  }
};

