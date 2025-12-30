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
        }
      }
    })
  : null;

if (supabaseServiceKey) {
  console.log('✅ Supabase Service Role Key 사용 중 (RLS 우회)');
} else if (supabaseAnonKey) {
  console.log('⚠️ Supabase Anon Key 사용 중 (RLS 정책 적용됨)');
}

// 연결 테스트 함수
export const testSupabaseConnection = async () => {
  if (!supabase) {
    console.error('❌ Supabase 클라이언트가 초기화되지 않았습니다.');
    console.error('   SUPABASE_URL:', process.env.SUPABASE_URL ? '설정됨' : '없음');
    console.error('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '설정됨' : '없음');
    return { success: false, error: 'Supabase 클라이언트가 초기화되지 않았습니다.' };
  }
  
  try {
    console.log('🔍 Supabase 연결 테스트 중...');
    console.log('   URL:', supabaseUrl);
    
    // 간단한 쿼리로 테스트 (에러 발생 시 더 안전한 방법 사용)
    const { data, error } = await supabase
      .from('academies')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase 쿼리 에러:', error);
      console.error('   에러 코드:', error.code);
      console.error('   에러 메시지:', error.message);
      console.error('   에러 상세:', error.details);
      console.error('   에러 힌트:', error.hint);
      return { success: false, error: error.message || 'Supabase 쿼리 실패' };
    }
    
    console.log('✅ Supabase 연결 성공');
    return { success: true };
  } catch (error) {
    console.error('❌ Supabase 연결 예외:', error);
    console.error('   에러 메시지:', error.message);
    console.error('   에러 스택:', error.stack);
    return { success: false, error: error.message || 'Supabase 연결 실패' };
  }
};

export default supabase;

