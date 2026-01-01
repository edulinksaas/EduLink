import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env 파일을 프로젝트 루트에서 찾도록 설정
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
// Service Role Key를 우선 사용 (RLS 우회), 없으면 Anon Key 사용
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('   server/.env 파일에 다음을 설정해주세요:');
  console.error('   SUPABASE_URL=https://your-project.supabase.co');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (권장, RLS 우회)');
  console.error('   또는 SUPABASE_ANON_KEY=your-anon-key');
  console.error('   PORT=3000');
}

// 환경 변수 값 검증 및 정리
const cleanSupabaseUrl = supabaseUrl?.trim();
const cleanSupabaseKey = supabaseKey?.trim();

// 키에 잘못된 문자가 있는지 확인
if (cleanSupabaseKey && /[^\x00-\x7F]/.test(cleanSupabaseKey)) {
  console.error('❌ Supabase 키에 잘못된 문자가 포함되어 있습니다.');
  console.error('   키는 ASCII 문자만 포함해야 합니다.');
}

export const supabase = cleanSupabaseUrl && cleanSupabaseKey
  ? createClient(cleanSupabaseUrl, cleanSupabaseKey, {
      auth: {
        persistSession: false
      },
      global: {
        headers: {
          'Content-Type': 'application/json',
        },
        // 타임아웃 및 재시도 설정
        fetch: async (url, options = {}) => {
          const timeout = 30000; // 30초 타임아웃
          
          // AbortController를 사용한 타임아웃 (호환성 좋음)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          
          try {
            const response = await fetch(url, {
              ...options,
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
          } catch (error) {
            clearTimeout(timeoutId);
            
            // ECONNRESET 등의 네트워크 오류를 더 명확하게 처리
            if (error.name === 'AbortError' || error.message?.includes('timeout')) {
              const timeoutError = new Error('Supabase 연결 타임아웃: 서버 응답이 없습니다.');
              timeoutError.code = 'ETIMEDOUT';
              throw timeoutError;
            }
            if (error.code === 'ECONNRESET' || error.message?.includes('ECONNRESET')) {
              const resetError = new Error('Supabase 연결이 리셋되었습니다. 네트워크 연결을 확인해주세요.');
              resetError.code = 'ECONNRESET';
              throw resetError;
            }
            throw error;
          }
        }
      }
    })
  : null;

if (supabaseServiceKey) {
  console.log('✅ Supabase Service Role Key 사용 중 (RLS 우회)');
} else if (supabaseAnonKey) {
  console.log('⚠️ Supabase Anon Key 사용 중 (RLS 정책 적용됨)');
}

// 연결 테스트 함수 (재시도 로직 포함)
export const testSupabaseConnection = async (maxRetries = 3, retryDelay = 1000) => {
  if (!supabase) {
    console.error('❌ Supabase 클라이언트가 초기화되지 않았습니다.');
    console.error('   SUPABASE_URL:', process.env.SUPABASE_URL ? '설정됨' : '없음');
    console.error('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '설정됨' : '없음');
    return { success: false, error: 'Supabase 클라이언트가 초기화되지 않았습니다.' };
  }
  
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`🔄 Supabase 연결 재시도 중... (${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      } else {
        console.log('🔍 Supabase 연결 테스트 중...');
      }
      console.log('   URL:', supabaseUrl);
      
      // 간단한 쿼리로 테스트 (에러 발생 시 더 안전한 방법 사용)
      const { data, error } = await supabase
        .from('academies')
        .select('id')
        .limit(1);
      
      if (error) {
        // 일시적인 네트워크 오류인 경우 재시도
        if (error.message?.includes('fetch failed') || 
            error.message?.includes('ECONNRESET') ||
            error.message?.includes('timeout') ||
            error.code === 'ECONNRESET') {
          lastError = error;
          if (attempt < maxRetries) {
            console.warn(`⚠️  일시적인 네트워크 오류 감지, 재시도 예정... (${attempt}/${maxRetries})`);
            continue;
          }
        }
        
        console.error('❌ Supabase 쿼리 에러:', error);
        console.error('   에러 코드:', error.code);
        console.error('   에러 메시지:', error.message);
        console.error('   에러 상세:', error.details);
        console.error('   에러 힌트:', error.hint);
        return { success: false, error: error.message || 'Supabase 쿼리 실패' };
      }
      
      if (attempt > 1) {
        console.log(`✅ Supabase 연결 성공 (재시도 ${attempt}회차)`);
      } else {
        console.log('✅ Supabase 연결 성공');
      }
      return { success: true };
    } catch (error) {
      lastError = error;
      
      // 일시적인 네트워크 오류인 경우 재시도
      if (error.message?.includes('fetch failed') || 
          error.message?.includes('ECONNRESET') ||
          error.message?.includes('timeout') ||
          error.code === 'ECONNRESET') {
        if (attempt < maxRetries) {
          console.warn(`⚠️  네트워크 오류 감지, 재시도 예정... (${attempt}/${maxRetries})`);
          console.warn('   에러:', error.message);
          continue;
        }
      }
      
      console.error('❌ Supabase 연결 예외:', error);
      console.error('   에러 메시지:', error.message);
      if (attempt === maxRetries) {
        console.error('   에러 스택:', error.stack);
      }
      
      // 마지막 시도가 아니면 계속
      if (attempt < maxRetries) {
        continue;
      }
    }
  }
  
  // 모든 재시도 실패
  const finalError = lastError?.message || 'Supabase 연결 실패';
  console.error(`❌ Supabase 연결 실패 (${maxRetries}회 시도 후)`);
  console.error('   최종 에러:', finalError);
  return { success: false, error: finalError };
};

export default supabase;

