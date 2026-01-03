import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 환경 변수 체크 및 상세 로깅
const isProduction = import.meta.env.MODE === 'production' || import.meta.env.PROD;
const isVercel = typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname.includes('vercel.app');

// 안전한 로깅 (에러 발생 시에도 모듈 로드 계속)
try {
  console.log('🔍 Supabase 환경 변수 체크:', {
    environment: import.meta.env.MODE,
    isProduction,
    isVercel,
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseAnonKey?.length || 0,
    urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined',
    keyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined'
  });
} catch (e) {
  // 로깅 실패해도 계속 진행
  console.warn('Supabase 환경 변수 체크 로깅 실패:', e);
}

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');
  
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error(`   누락된 변수: ${missingVars.join(', ')}`);
  
  if (isProduction || isVercel) {
    console.error('⚠️ 배포 환경에서 환경 변수가 누락되었습니다!');
    console.error('   Vercel 환경 변수 미주입 + redeploy 필요');
    console.error('   Vercel 대시보드 > Settings > Environment Variables에서 확인:');
    console.error('   - VITE_SUPABASE_URL');
    console.error('   - VITE_SUPABASE_ANON_KEY');
    console.error('   환경 변수 추가 후 재배포가 필요합니다.');
  } else {
    console.error('   로컬 개발 환경: .env 파일에 다음을 설정해주세요:');
    console.error('   VITE_SUPABASE_URL=https://your-project.supabase.co');
    console.error('   VITE_SUPABASE_ANON_KEY=your-anon-key');
  }
}

// Supabase 클라이언트 생성 및 REST 요청 인터셉터 설정
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        fetch: async (url, options = {}) => {
          // REST API 요청인지 확인 (/rest/v1/ 경로)
          const isRestApi = url.toString().includes('/rest/v1/');
          
          if (isRestApi) {
            const headers = options.headers || {};
            const apikey = headers['apikey'] || supabaseAnonKey;
            let authorization = headers['Authorization'] || headers['authorization'] || `Bearer ${supabaseAnonKey}`;
            
            // 세션 토큰이 있으면 Authorization 헤더에 추가
            // localStorage에서 직접 세션 가져오기 (순환 참조 방지)
            try {
              const sessionData = localStorage.getItem(`sb-${supabaseUrl.split('//')[1]?.split('.')[0]}-auth-token`);
              if (sessionData) {
                try {
                  const parsed = JSON.parse(sessionData);
                  if (parsed?.access_token) {
                    authorization = `Bearer ${parsed.access_token}`;
                  }
                } catch (e) {
                  // 파싱 실패 시 기본값 유지
                }
              }
            } catch (e) {
              // 세션 가져오기 실패해도 계속 진행
            }
            
            // 최종 헤더 설정
            const finalHeaders = {
              ...headers,
              'apikey': apikey,
              'Authorization': authorization,
              'Content-Type': headers['Content-Type'] || 'application/json'
            };
            
            // 네트워크 검증을 위한 로깅
            console.log('🌐 Supabase REST API 요청:', {
              url: url.toString(),
              method: options.method || 'GET',
              hasApikey: !!finalHeaders['apikey'],
              hasAuthorization: !!finalHeaders['Authorization'],
              apikeyLength: finalHeaders['apikey']?.length || 0,
              authLength: finalHeaders['Authorization']?.length || 0,
              authPreview: finalHeaders['Authorization'] ? `${finalHeaders['Authorization'].substring(0, 30)}...` : '없음'
            });
            
            // 실제 요청 실행
            const response = await fetch(url, {
              ...options,
              headers: finalHeaders
            });
            
            // 응답 로깅
            if (!response.ok) {
              console.error('❌ Supabase REST API 응답 오류:', {
                url: url.toString(),
                status: response.status,
                statusText: response.statusText,
                hasApikey: !!finalHeaders['apikey'],
                hasAuthorization: !!finalHeaders['Authorization']
              });
            }
            
            return response;
          }
          
          // REST API가 아닌 경우 기본 fetch 사용
          return fetch(url, options);
        }
      }
    })
  : null;

export default supabase;

