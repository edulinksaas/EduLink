import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// 환경 변수에서 Supabase URL과 키 가져오기
// Expo에서는 EXPO_PUBLIC_ 접두사가 있는 환경 변수를 자동으로 로드합니다
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다.');
  console.warn('📝 app/.env 파일에 다음을 추가하세요:');
  console.warn('   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.warn('   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  
  // 개발 환경에서는 더미 클라이언트를 생성하거나 에러를 던질 수 있습니다
  // throw new Error('Supabase URL과 Anon Key를 설정해주세요. .env 파일을 확인하세요.');
}

// Supabase 클라이언트 생성 (AsyncStorage를 사용하여 세션 저장)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// Supabase 연결 확인 함수
export const checkSupabaseConnection = async () => {
  if (!supabase) {
    return { connected: false, error: 'Supabase 클라이언트가 초기화되지 않았습니다.' };
  }
  
  try {
    // 간단한 쿼리로 연결 확인
    const { data, error } = await supabase.from('_dummy').select('*').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116은 테이블이 없을 때 발생하는 에러
      return { connected: false, error: error.message };
    }
    return { connected: true };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};

