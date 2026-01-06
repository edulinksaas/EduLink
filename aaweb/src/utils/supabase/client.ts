import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase 클라이언트 생성 (프론트엔드에서 직접 사용하는 경우)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Supabase 연결 확인
export const checkSupabaseConnection = async () => {
  if (!supabase) {
    return {
      connected: false,
      error: 'Supabase 환경 변수가 설정되지 않았습니다.',
    };
  }

  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      return {
        connected: false,
        error: error.message,
      };
    }
    return {
      connected: true,
      error: null,
    };
  } catch (error: any) {
    return {
      connected: false,
      error: error.message || 'Supabase 연결 실패',
    };
  }
};

