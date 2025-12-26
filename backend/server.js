import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { errorHandler } from './middleware/errorHandler.js';
import { securityHeaders, corsMiddleware } from './middleware/security.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { validateEnv } from './utils/envValidator.js';
import apiRoutes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env 파일을 프로젝트 루트에서 찾도록 설정
// 먼저 프로젝트 루트에서 시도, 없으면 현재 디렉토리에서 시도
const rootEnvPath = join(__dirname, '..', '.env');
const currentEnvPath = join(__dirname, '.env');

let envResult = dotenv.config({ path: rootEnvPath });
if (envResult.error) {
  // 프로젝트 루트에 없으면 현재 디렉토리에서 시도
  envResult = dotenv.config({ path: currentEnvPath });
}

// .env 파일 로드 확인
if (envResult.error) {
  console.warn(`⚠️ .env 파일 로드 실패: ${envResult.error.message}`);
  console.warn(`   시도한 경로: ${rootEnvPath}, ${currentEnvPath}`);
  console.warn(`   개발 환경에서는 기본값을 사용합니다.\n`);
} else {
  const loadedPath = envResult.parsed ? (envResult.parsed.SUPABASE_URL ? rootEnvPath : currentEnvPath) : rootEnvPath;
  console.log(`✅ .env 파일 로드 성공: ${loadedPath}\n`);
}

// 환경 변수 검증
const envCheck = validateEnv();
if (!envCheck.isValid && process.env.NODE_ENV === 'production') {
  console.error('❌ 환경 변수 검증 실패. 서버를 시작할 수 없습니다.');
  process.exit(1);
} else if (!envCheck.isValid) {
  // 개발 환경에서는 경고만 출력하고 계속 진행
  console.warn('⚠️ 일부 환경 변수가 설정되지 않았지만 개발 환경이므로 계속 진행합니다.\n');
}

const app = express();
const PORT = process.env.PORT || 3000;

// 보안 미들웨어 (가장 먼저 적용)
app.use(securityHeaders);
app.use(corsMiddleware);

// 로깅
app.use(morgan('dev'));

// Body parser (크기 제한 설정)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 모든 API 라우트에 Rate Limiting 적용
app.use('/api', apiLimiter);

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', async (req, res) => {
  const { testSupabaseConnection } = await import('./config/supabase.js');
  const supabaseStatus = await testSupabaseConnection();
  
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    supabase: supabaseStatus.success ? 'connected' : 'disconnected',
    supabaseError: supabaseStatus.success ? null : supabaseStatus.error
  });
});

// Supabase 연결 상태 확인
app.get('/health/supabase', async (req, res) => {
  const { testSupabaseConnection } = await import('./config/supabase.js');
  const result = await testSupabaseConnection();
  if (result.success) {
    res.json({ status: 'ok', message: 'Supabase connection is working' });
  } else {
    res.status(500).json({ status: 'error', message: result.error });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// 서버 인스턴스 저장 (nodemon 재시작 시 이전 서버 종료용)
let server = null;

// 서버 시작 시 Supabase 연결 확인
const startServer = async () => {
  try {
    // 이전 서버가 있으면 종료
    if (server) {
      console.log('🛑 이전 서버 인스턴스 종료 중...');
      server.close(() => {
        console.log('✅ 이전 서버 종료 완료\n');
      });
      server = null;
      // 서버 종료를 기다리기 위해 짧은 지연
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🚀 서버 시작 중...\n');
    
    // 보안 설정 확인
    console.log('🔒 보안 설정:');
    console.log('   ✅ Helmet 보안 헤더 활성화');
    console.log('   ✅ CORS 설정 적용');
    console.log('   ✅ Rate Limiting 적용');
    console.log('   ✅ 입력 검증 미들웨어 준비 완료');
    if (envCheck.warnings && envCheck.warnings.length > 0) {
      console.log('   ⚠️  환경 변수 경고 있음 (위 로그 확인)');
    }
    console.log('');
    
    // Supabase 설정 확인 (에러가 발생해도 서버는 계속 실행)
    try {
      const { supabase, testSupabaseConnection } = await import('./config/supabase.js');
      
      if (!supabase) {
        console.warn('⚠️  경고: Supabase 클라이언트가 초기화되지 않았습니다.');
        console.warn('   backend/.env 파일에 Supabase 설정을 추가해주세요.');
        console.warn('   자세한 내용은 backend/README_ENV.md 파일을 참고하세요.\n');
      } else {
        console.log('🔍 Supabase 연결 테스트 중...');
        try {
          const result = await testSupabaseConnection();
          if (result.success) {
            console.log('✅ Supabase 연결 성공!\n');
          } else {
            console.warn('⚠️  Supabase 연결 실패:', result.error);
            console.warn('   로그인 기능이 정상적으로 작동하지 않을 수 있습니다.\n');
          }
        } catch (testError) {
          console.warn('⚠️  Supabase 연결 테스트 중 에러:', testError.message);
          console.warn('   서버는 계속 실행되지만 로그인 기능이 작동하지 않을 수 있습니다.\n');
        }
      }
    } catch (supabaseError) {
      console.warn('⚠️  Supabase 모듈 로드 중 에러:', supabaseError.message);
      console.warn('   에러 상세:', supabaseError.stack);
      console.warn('   backend/.env 파일을 확인해주세요.\n');
    }
    
    // 서버 시작
    server = app.listen(PORT, () => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`✅ 서버가 포트 ${PORT}에서 실행 중입니다.`);
      console.log(`${'='.repeat(60)}\n`);
      console.log('📡 API 엔드포인트:');
      console.log(`   Base URL: http://localhost:${PORT}/api`);
      console.log(`\n🔍 헬스 체크:`);
      console.log(`   http://localhost:${PORT}/health`);
      console.log(`   http://localhost:${PORT}/health/supabase`);
      console.log(`\n🔐 인증 API:`);
      console.log(`   POST   http://localhost:${PORT}/api/auth/register`);
      console.log(`   POST   http://localhost:${PORT}/api/auth/login`);
      console.log(`   POST   http://localhost:${PORT}/api/auth/logout`);
      console.log(`\n👥 주요 API:`);
      console.log(`   GET    http://localhost:${PORT}/api/users`);
      console.log(`   GET    http://localhost:${PORT}/api/academies`);
      console.log(`   GET    http://localhost:${PORT}/api/students`);
      console.log(`   GET    http://localhost:${PORT}/api/teachers`);
      console.log(`   GET    http://localhost:${PORT}/api/classes`);
      console.log(`\n${'='.repeat(60)}\n`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ 포트 ${PORT}가 이미 사용 중입니다.`);
        console.error(`   잠시 후 다시 시도하거나, 포트를 사용하는 프로세스를 종료하세요.`);
        console.error(`   .env 파일에서 PORT=3001 등으로 변경할 수 있습니다.`);
        // nodemon이 재시작을 계속 시도하도록 하지 않고 종료
        setTimeout(() => process.exit(1), 1000);
      } else {
        console.error('❌ 서버 시작 중 에러:', err.message);
        console.error('에러 상세:', err.stack);
        setTimeout(() => process.exit(1), 1000);
      }
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error.message);
    console.error('에러 타입:', error.constructor.name);
    console.error('에러 상세:', error.stack);
    
    // 일반적인 에러 원인 안내
    if (error.message.includes('Cannot find module')) {
      console.error('\n💡 해결 방법:');
      console.error('   npm install을 실행하여 패키지를 설치하세요.');
      console.error('   cd backend');
      console.error('   npm install');
    } else if (error.message.includes('ENOENT')) {
      console.error('\n💡 해결 방법:');
      console.error('   필요한 파일이 없습니다. 프로젝트 구조를 확인하세요.');
    }
    
    setTimeout(() => process.exit(1), 1000);
  }
};

// 프로세스 종료 시 서버 정리
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM 신호 수신, 서버 종료 중...');
  if (server) {
    server.close(() => {
      console.log('✅ 서버 종료 완료');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT 신호 수신, 서버 종료 중...');
  if (server) {
    server.close(() => {
      console.log('✅ 서버 종료 완료');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

startServer();
