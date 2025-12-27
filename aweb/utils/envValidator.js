/**
 * 환경 변수 검증
 */
export const validateEnv = () => {
  const requiredEnvVars = [
    'JWT_SECRET',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missingVars = [];
  const warnings = [];

  // 필수 환경 변수 확인
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  // JWT_SECRET 기본값 경고
  if (process.env.JWT_SECRET === 'your-secret-key-change-in-production') {
    warnings.push('⚠️ JWT_SECRET이 기본값으로 설정되어 있습니다. 프로덕션 환경에서는 반드시 변경하세요!');
  }

  // SUPABASE_URL 형식 확인
  if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.startsWith('https://')) {
    warnings.push('⚠️ SUPABASE_URL은 https://로 시작해야 합니다.');
  }

  // 경고 출력
  if (warnings.length > 0) {
    console.warn('\n🔔 환경 변수 경고:');
    warnings.forEach(warning => console.warn(`  ${warning}`));
    console.warn('');
  }

  // 필수 환경 변수 누락 시 경고 (개발 환경) 또는 에러 (프로덕션)
  if (missingVars.length > 0) {
    if (process.env.NODE_ENV === 'production') {
      console.error('\n❌ 필수 환경 변수가 설정되지 않았습니다:');
      missingVars.forEach(varName => console.error(`  - ${varName}`));
      console.error('\n.env 파일을 확인하고 필요한 환경 변수를 설정해주세요.\n');
      throw new Error('프로덕션 환경에서는 모든 필수 환경 변수가 설정되어야 합니다.');
    } else {
      // 개발 환경에서는 경고만 출력
      console.warn('\n⚠️ 필수 환경 변수가 설정되지 않았습니다:');
      missingVars.forEach(varName => console.warn(`  - ${varName}`));
      console.warn('   개발 환경에서는 기본값을 사용합니다.');
      console.warn('   .env 파일을 확인하고 필요한 환경 변수를 설정해주세요.\n');
    }
  }

  return {
    isValid: missingVars.length === 0,
    missing: missingVars,
    warnings: warnings
  };
};

