import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import { securityHeaders, validateEnvVars } from './middleware/security.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import apiRoutes from './routes/index.js';

dotenv.config();

// 환경 변수 검증 (서버 시작 전)
validateEnvVars();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS 설정 - 특정 origin만 허용
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : NODE_ENV === 'production' 
    ? [] // 프로덕션에서는 명시적으로 설정 필요
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'];

app.use(cors({
  origin: function (origin, callback) {
    // origin이 없는 요청 (같은 도메인, Postman 등)은 허용
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.length === 0) {
      callback(null, true);
    } else {
      callback(new Error('CORS 정책에 의해 차단되었습니다.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 보안 헤더 설정
app.use(securityHeaders);

// 로깅 설정 (프로덕션에서는 간소화)
if (NODE_ENV === 'production') {
  app.use(morgan('combined')); // 프로덕션: 더 자세한 로그
} else {
  app.use(morgan('dev')); // 개발: 간단한 로그
}

// Body parser 설정
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting 적용
app.use('/api', apiLimiter);

// Routes
app.use('/api', apiRoutes);

// Health check (민감한 정보 최소화)
app.get('/health', async (req, res) => {
  const { testSupabaseConnection } = await import('./config/supabase.js');
  const supabaseStatus = await testSupabaseConnection();
  
  // 프로덕션에서는 최소한의 정보만 제공
  if (NODE_ENV === 'production') {
    res.json({ 
      status: 'ok', 
      message: 'Server is running'
    });
  } else {
    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      supabase: supabaseStatus.success ? 'connected' : 'disconnected',
      supabaseError: supabaseStatus.success ? null : supabaseStatus.error
    });
  }
});

// Supabase 연결 상태 확인 (개발 환경에서만 상세 정보 제공)
app.get('/health/supabase', async (req, res) => {
  if (NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  
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

// 서버 시작 시 Supabase 연결 확인
const startServer = async () => {
  try {
    console.log('\n🚀 서버 시작 중...\n');
    
    // Supabase 설정 확인 (에러가 발생해도 서버는 계속 실행)
    try {
      const { supabase, testSupabaseConnection } = await import('./config/supabase.js');
      
      if (!supabase) {
        console.warn('⚠️  경고: Supabase 클라이언트가 초기화되지 않았습니다.');
        console.warn('   server/.env 파일에 Supabase 설정을 추가해주세요.');
        console.warn('   자세한 내용은 server/README_ENV.md 파일을 참고하세요.\n');
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
      console.warn('   server/.env 파일을 확인해주세요.\n');
    }
    
    // 포트 사용 중인지 확인
    app.listen(PORT, () => {
      console.log(`✅ 서버가 포트 ${PORT}에서 실행 중입니다.`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
      console.log(`   Supabase check: http://localhost:${PORT}/health/supabase\n`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ 포트 ${PORT}가 이미 사용 중입니다.`);
        console.error(`   다른 포트를 사용하거나, 포트를 사용하는 프로세스를 종료하세요.`);
        console.error(`   .env 파일에서 PORT=3001 등으로 변경할 수 있습니다.`);
      } else {
        console.error('❌ 서버 시작 중 에러:', err.message);
        console.error('에러 상세:', err.stack);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error.message);
    console.error('에러 타입:', error.constructor.name);
    console.error('에러 상세:', error.stack);
    
    // 일반적인 에러 원인 안내
    if (error.message.includes('Cannot find module')) {
      console.error('\n💡 해결 방법:');
      console.error('   npm install을 실행하여 패키지를 설치하세요.');
      console.error('   cd saas/server');
      console.error('   npm install');
    } else if (error.message.includes('ENOENT')) {
      console.error('\n💡 해결 방법:');
      console.error('   필요한 파일이 없습니다. 프로젝트 구조를 확인하세요.');
    }
    
    process.exit(1);
  }
};

startServer();

